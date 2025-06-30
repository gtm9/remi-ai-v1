import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { AudioModule, PermissionResponse, RecordingPresets, useAudioRecorder } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker'; // For uploading files
import * as FileSystem from 'expo-file-system';
import { Mic, StopCircle, Upload } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, LayoutAnimation, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, UIManager, View } from 'react-native';
import Animated, { FadeOut, Layout, SlideInRight } from 'react-native-reanimated';
import AudioNameModal from '../components/AudioNameModal';
import VoiceCard from '../components/VoiceCard'; // Removed { AudioFileItem } from here as we'll define it globally or pass it


// Define the AudioFileItem type to include 'remote' for Cloudflare files
// Ensure this definition is accessible by VoiceCard component as well.
// You might want to move this type definition to a shared types file (e.g., types/audio.ts)
export type AudioFileType = 'recorded' | 'uploaded' | 'remote';

export interface AudioFileItem {
  id: string;
  name: string;
  uri: string; // Local URI for the audio file
  type: 'recorded' | 'uploaded';
  duration?: number; // Optional: duration in milliseconds, useful for recorded audio
}

export interface CloudFareAudioFileItem {
    checksumAlgorithm: string,
    eTag: string,
    bucketName: string,
    key: string,
    lastModified: string,
    owner: string,
    restoreStatus: string,
    size: number,
    checksumType: string
    // Add any other metadata you expect from your Cloudflare API, e.g., size, uploadDate
}

interface TempAudioFile {
    uri: string;
    originalName: string;
    fileType: AudioFileType;
    defaultCustomName: string; // Used to pre-fill the modal
}

export default function VoicesScreen() {
    const [audioFiles, setAudioFiles] = useState<AudioFileItem[]>([]);
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0); // in ms
    const [uploading, setUploading] = useState(false);

    // --- STATE FOR MODAL ---
    const [isNameModalVisible, setIsNameModalVisible] = useState(false);
    const [tempAudioFileData, setTempAudioFileData] = useState<TempAudioFile | null>(null);
    // --- STATE FOR DELETION LOADING ---
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // --- API Endpoints ---
    const CLOUDFLARE_DELETE_API_ENDPOINT = 'https://myportal-api.src.xyz/api/v1.1/R2/Delete'; // Your Delete API Endpoint
    const R2_BUCKET_NAME_FOR_API = 'REMI_AI_VOICE_AUDIO_BUCKET'; // This bucket name comes from your curl example
    const CLOUDFLARE_GETLIST_API_ENDPOINT = 'https://myportal-api.src.xyz/api/v1.1/R2/GetList?selectR2Bucket=REMI_AI_VOICE_AUDIO_BUCKET';
    const CLOUDFLARE_UPLOAD_API_ENDPOINT ='https://myportal-api.src.xyz/api/v1.1/R2/Upload?selectR2Bucket=REMI_AI_VOICE_AUDIO_BUCKET&filePath=audio_sources%2F';

    // This line is crucial for LayoutAnimation to work on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }


    // Initialize permissionResponse with null to indicate no response yet
    const [permissionResponse, setPermissionResponse] = useState<PermissionResponse | null>(null);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true); // New state for loading Cloudflare files
    const recordingTimer = useRef<number | null>(null); // Ref to hold the interval ID

    // This useEffect handles initial setup: permissions and fetching Cloudflare files
    useEffect(() => {
        const initializeScreen = async () => {
            await getRecordPermision();
            await fetchAudioFilesFromCloudflare();
        };
        initializeScreen();
        // The recording duration timer has its own useEffect below, so no cleanup here for it.
    }, []); // Empty dependency array means it runs once on mount

    const getRecordPermision = async () => {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        setPermissionResponse(status); // Store the permission status
        if (!status.granted) {
            Alert.alert(
                'Microphone Permission Denied',
                'Permission to access your microphone was denied. You will not be able to record audio unless you enable it in your device settings.'
            );
        }
    };

    // **IMPORTANT**: Replace 'YOUR_CLOUDFLARE_BUCKET_LISTING_API_ENDPOINT' with your actual API endpoint.
    // If your Cloudflare files are private or user-specific,
    // it's highly recommended to proxy this API call through your own backend for security.
    // Your backend would then handle authentication with Cloudflare and return only the user's allowed files.

    // --- New: Function to upload audio to your backend ---
    const uploadAudio = async (fileUri: string, originalName: string, fileType: AudioFileType, customName: string) => {
        setUploading(true); // Set global uploading state
        try {
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (!fileInfo.exists) {
                throw new Error('File does not exist at the provided URI.');
            }
            
            // Create FormData to send the file
            const formData = new FormData();
            formData.append('file', {
                customMetadata: {
                    id: `uploaded_${Date.now()}`, // Backend should return an ID
                    name: customName, // Backend should return the name
                    type: 'uploaded', // Now it's a remote file
                },
                uri: fileUri,
                name: originalName,
                // Ensure the type is correct for your backend to process
                type: fileType === 'recorded' ? 'audio/m4a' : 'audio/mpeg',
            } as any); // Type assertion needed for FileSystem URI in FormData for RN

            formData.append('customName', customName); // Send custom name as a separate form field

            // IMPORTANT: Include your user's authentication token here
            // This token should be obtained after user login and used to identify the user on your backend.
            // Example (replace with your actual auth token retrieval):
            // const userAuthToken = await getAuthToken();
            // if (!userAuthToken) throw new Error('User not authenticated.');

            const response = await fetch(CLOUDFLARE_UPLOAD_API_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: {
                    "x-amz-meta-customname": customName,
                    "x-amz-meta-uploadedby": "user123"  
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
            }

            const responseData = await response.json(); // Assuming your backend returns JSON (e.g., success message, Cloudflare URL)
            console.log('Upload successful:', responseData);

            // Add the uploaded file to the local state, using the URL provided by your backend
            const newAudioFile: AudioFileItem = {
                id: responseData.id || `uploaded_${Date.now()}`, // Backend should return an ID
                name: responseData.name || customName, // Backend should return the name
                uri: responseData.uri, // Backend MUST return the public URL of the file in Cloudflare R2
                type: 'uploaded', // Now it's a remote file
            };
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setAudioFiles(prev => [...prev, newAudioFile]);
            Alert.alert('Upload Success', `"${customName}" has been uploaded!`);

            
        } catch (error: any) {
            console.error('Error during upload:', error);
            Alert.alert('Upload Failed', `Could not upload audio: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false); // Reset uploading state
        }
    };

    const fetchAudioFilesFromCloudflare = async () => {
        setIsLoadingFiles(true); // Start loading
        try {
            // Example response structure from your Cloudflare API:
            // [{ id: 'file_uuid_1', name: 'VoiceMemo1.mp3', uri: 'https://your.r2.bucket.link/VoiceMemo1.mp3' }, ...]
            const response = await fetch(CLOUDFLARE_GETLIST_API_ENDPOINT);
            // 2. Parse the response body as JSON
            const data = await response.json();
            // Now 'data' contains the actual JSON object from your Cloudflare API
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Map the fetched data to your AudioFileItem format
            const fetchedFiles: AudioFileItem[] = data["s3Objects"].map((file: CloudFareAudioFileItem) => ({
                id: file.key, // Use a unique ID from your API or fallback to file name
                name: file.key,
                uri: "https://pub-1075dcde11af4427bc47c49e86b83ff9.r2.dev/" + file.key, // This should be the direct, playable URL of the audio file
                type: 'remote', // Indicate that this file comes from a remote source
            }));

            setAudioFiles(fetchedFiles);
        } catch (error) {
            console.error('Failed to fetch audio files from Cloudflare:', error);
            Alert.alert(
                'Error Loading Audio',
                'Could not load your existing audio files. Please check your internet connection and try again.'
            );
            setAudioFiles([]); // Clear existing files on error or handle as appropriate
        } finally {
            setIsLoadingFiles(false); // End loading, regardless of success or failure
        }
    };

        // --- NEW: Handle submission from the modal ---
    const handleModalSubmit = async (customName: string) => {
        if (tempAudioFileData) {
            setIsNameModalVisible(false); // Hide modal immediately
            await uploadAudio(
                tempAudioFileData.uri,
                tempAudioFileData.originalName,
                tempAudioFileData.fileType,
                customName
            );
            setTempAudioFileData(null); // Clear temporary data
        }
    };

    // --- NEW: Handle modal close ---
    const handleModalClose = () => {
        setIsNameModalVisible(false);
        setTempAudioFileData(null); // Clear temporary data if user cancels
        // You might want to stop recording or clear the picked file if user cancels
    };

    console.log("Audio Recorder State:", audioRecorder); // Keep console.log for debugging useAudioRecorder

    // --- Recording Duration Timer ---
    useEffect(() => {
        if (isRecording) {
            recordingTimer.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1000); // Increment every second
            }, 1000);
        } else if (recordingTimer.current) {
            clearInterval(recordingTimer.current); // Stop the timer
            recordingTimer.current = null;
            setRecordingDuration(0); // Reset duration when recording stops
        }
        // Cleanup function for the effect
        return () => {
            if (recordingTimer.current) clearInterval(recordingTimer.current);
        };
    }, [isRecording]); // Re-run effect when isRecording changes

    // Helper to format milliseconds to MM:SS
    const formatMillis = (millis: number) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (parseInt(seconds) < 10 ? '0' : '') + seconds;
    };

    // --- Audio Recording Functions ---
    const startRecording = async () => {
        // Check permission status before attempting to record
        if (permissionResponse?.status !== 'granted') {
            Alert.alert(
                'Microphone Access Required',
                'Please grant microphone permission in your device settings to start recording.'
            );
            return; // Prevent recording if permission not granted
        }

        setIsRecording(true);
        try {
            await audioRecorder.prepareToRecordAsync();
            await audioRecorder.record();
        } catch (error) {
            console.error('Error starting recording:', error);
            Alert.alert('Recording Failed', 'Could not start recording. Please try again.');
            setIsRecording(false); // Reset state if starting failed
        }
    };

    const stopRecording = async () => {
        setIsRecording(false); // Update UI immediately to show stop state
        try {
            await audioRecorder.stop();
            const recordedUri = audioRecorder.uri; // Get the URI of the recorded file

            if (recordedUri) {
                const defaultName = `Recording_${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-')}_${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/:/g, '-')}`;
                // --- NEW: Store data and show modal ---
                setTempAudioFileData({
                    uri: recordedUri,
                    originalName: defaultName + '.m4a',
                    fileType: 'recorded',
                    defaultCustomName: defaultName,
                });
                setIsNameModalVisible(true);
            } else {
                console.warn('Recording URI was null after stopping.');
                Alert.alert('Recording Issue', 'Recording finished but no file URI was captured.');
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
            Alert.alert('Recording Save Error', 'Could not stop recording or save the file.');
        } finally {
            setRecordingDuration(0); // Reset duration after successful or failed stop
        }
    };

    // --- Audio Upload Functions ---
    const pickAudioFile = async () => {
        try {    
            // `uploading` state is managed by the `uploadAudio` function now
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*', // More general type for various audio formats
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const defaultName = asset.name.split('.').slice(0, -1).join('.') || `picked_audio_${Date.now()}`;
                // --- NEW: Store data and show modal ---
                setTempAudioFileData({
                    uri: asset.uri,
                    originalName: asset.name,
                    fileType: 'uploaded',
                    defaultCustomName: defaultName,
                });
                setIsNameModalVisible(true);
            } else {
                console.log('Document picking cancelled or no asset selected.');
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Upload Error', 'Could not pick audio file.');
        } finally {
            setUploading(false);
        }
    };

    // --- handleDeleteAudio method ---
    const handleDeleteAudio = (id: string) => {
        Alert.alert(
            'Delete File',
            'Are you sure you want to delete this file permanently from the cloud?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        // Prevent multiple deletion attempts for the same item
                        if (deletingId === id) {
                            console.log('Deletion already in progress for this item.');
                            return;
                        }

                        setDeletingId(id); // Set the ID of the item currently being deleted
                        try {
                            const deleteUrl = new URL(CLOUDFLARE_DELETE_API_ENDPOINT);
                            deleteUrl.searchParams.append('selectR2Bucket', R2_BUCKET_NAME_FOR_API);
                            deleteUrl.searchParams.append('key', id); // The 'id' of AudioFileItem is the R2 object key

                            // TODO: If your API requires an authentication token, add it here:
                            // const userAuthToken = await getAuthToken(); // e.g., from your auth context
                            // const headers = {
                            //     'accept': '*/*',
                            //     'Authorization': `Bearer ${userAuthToken}`,
                            // };
                            // Otherwise, if no auth:
                            const headers = { 'accept': '*/*' };


                            const response = await fetch(deleteUrl.toString(), {
                                method: 'DELETE',
                                headers: headers,
                            });

                            if (!response.ok) {
                                const errorText = await response.text();
                                // Try to parse JSON error if available, fallback to text
                                let errorMessage = errorText;
                                try {
                                    const errorJson = JSON.parse(errorText);
                                    errorMessage = errorJson.message || errorText;
                                } catch (e) {
                                    // Not JSON, use raw text
                                }
                                throw new Error(`Deletion failed: ${response.status} - ${errorMessage}`);
                            }

                            // If the API call is successful, update the local state
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setAudioFiles(prev => prev.filter(file => file.id !== id));
                            Alert.alert('Success', 'Audio file deleted from the cloud.');

                        } catch (error: any) {
                            console.error('Error during deletion:', error);
                            Alert.alert('Deletion Failed', `Could not delete file from cloud: ${error.message}`);
                        } finally {
                            setDeletingId(null); // Clear the deletion state regardless of success/failure
                        }
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-0">
            {/* Page Header */}
            <View className="py-4 px-5 flex-row items-center justify-between w-full">
                <Heading className="mb-2 xl:mb-[18px] text-4xl lg:text-5xl xl:text-[56px]">
                    Voices
                </Heading>
            </View>

            {/* Upload/Record Section */}
            <View className="px-5 mb-6">
                <Text className="text-lg font-semibold text-typography-800 mb-3">Upload or Record Audio</Text>
                <View className="flex-row items-center justify-around bg-gray-100 p-4 rounded-lg shadow-sm">
                    {/* Upload MP3 Button */}
                    <TouchableOpacity
                        onPress={pickAudioFile}
                        className="items-center p-3 rounded-md bg-green-100"
                        disabled={uploading} // Disable while an upload is in progress
                    >
                        {uploading ? (
                            <ActivityIndicator size="small" color="#22C55E" />
                        ) : (
                            <>
                                <Icon as={Upload} size="xl" className="text-green-600 mb-1" />
                                <Text className="text-green-700 text-sm">Upload MP3</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Separator */}
                    <View className="w-px h-12 bg-gray-300 mx-4" />

                    {/* Record Audio Button */}
                    <TouchableOpacity
                        onPress={isRecording ? stopRecording : startRecording}
                        className={`items-center p-3 rounded-md ${isRecording ? 'bg-red-100' : 'bg-blue-100'}`}
                        // Disable if permission is not granted AND we can't ask again (i.e., permanently denied)
                        disabled={permissionResponse?.status === 'denied' && !permissionResponse?.canAskAgain}
                    >
                        <>
                            <Icon
                                as={isRecording ? StopCircle : Mic} // Show stop icon when recording
                                size="xl"
                                className={`mb-1 ${isRecording ? 'text-red-600' : 'text-blue-600'}`}
                            />
                            <Text className={`text-sm ${isRecording ? 'text-red-700' : 'text-blue-700'}`}>
                                {isRecording ? `Recording ${formatMillis(recordingDuration)}` : 'Record Audio'}
                            </Text>
                            {/* Conditional messages for permission status */}
                            {permissionResponse?.status === 'undetermined' && (
                                <Text className="text-gray-500 text-xs mt-1 text-center">Tap to request mic access.</Text>
                            )}
                            {permissionResponse?.status === 'denied' && (
                                <Text className="text-red-500 text-xs mt-1 text-center">Perm. Denied. Go to settings.</Text>
                            )}
                        </>
                    </TouchableOpacity>
                </View>
            </View>

            <Text className="text-lg font-semibold text-typography-800 px-5 mb-3">Your Audio Files</Text>

            {/* Display Loading Indicator or Audio Files List */}
            <ScrollView className="flex-1 pb-20">
                {isLoadingFiles ? (
                    <ActivityIndicator size="large" color="#0000ff" className="mt-10" />
                ) : audioFiles.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">No audio files yet. Upload or record one!</Text>
                ) : (
                    audioFiles.map(file => (
                        <Animated.View
                            key={file.id}
                            layout={Layout.duration(300)}
                            exiting={FadeOut.duration(300)}
                            entering={SlideInRight.duration(300)}
                        >
                            <VoiceCard key={file.id} audioFile={file} onDelete={handleDeleteAudio} />
                        </Animated.View>

                    ))
                )}
            </ScrollView>
            
            {/* --- NEW: Audio Name Input Modal --- */}
            {tempAudioFileData && ( // Only render if there's data to process
                <AudioNameModal
                    visible={isNameModalVisible}
                    defaultName={tempAudioFileData.defaultCustomName}
                    onClose={handleModalClose}
                    onSubmit={handleModalSubmit}
                    isUploading={uploading} // Pass the global uploading state
                />
            )}
        </SafeAreaView>
    );
}
