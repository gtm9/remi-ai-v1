import AudioNameModal from '@/components/AudioNameModal';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import VoiceCard from '@/components/VoiceCard';
import { AudioModule, PermissionResponse, RecordingPresets, useAudioRecorder } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Mic, StopCircle, Upload } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, UIManager, View } from 'react-native';
import Animated, { FadeOut, Layout, SlideInRight } from 'react-native-reanimated';

// Import types from your shared types file
import { AudioFileItem, AudioFileType } from '@/types/audio';
import { useAudioFilesStore } from '../store/audioFileStore';
// Import your Zustand store


interface TempAudioFile {
    uri: string;
    originalName: string;
    fileType: AudioFileType;
    defaultCustomName: string; // Used to pre-fill the modal
    duration: number;
}

export default function VoicesScreen() {
    // --- Use Zustand Store for audioFiles and related states ---
    const audioFiles = useAudioFilesStore((state) => state.audioFiles);
    const isLoadingFiles = useAudioFilesStore((state) => state.isLoadingFiles);
    const deletingId = useAudioFilesStore((state) => state.deletingId);
    const fetchAudioFiles = useAudioFilesStore((state) => state.fetchAudioFiles);

    const addAudioFile = useAudioFilesStore((state) => state.addAudioFile);
    const removeAudioFile = useAudioFilesStore((state) => state.removeAudioFile);
    const setDeletingId = useAudioFilesStore((state) => state.setDeletingId);

    // Existing local states that are not part of the global audio file management
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0); // in ms
    const [uploading, setUploading] = useState(false); // Local to the upload process

    // --- STATE FOR MODAL ---
    const [isNameModalVisible, setIsNameModalVisible] = useState(false);
    const [tempAudioFileData, setTempAudioFileData] = useState<TempAudioFile | null>(null);

    // --- API Endpoints ---
    const CLOUDFLARE_DELETE_API_ENDPOINT = 'https://myportal-api.src.xyz/api/v1.1/R2/Delete';
    const R2_BUCKET_NAME_FOR_API = 'REMI_AI_VOICE_AUDIO_BUCKET';
    const CLOUDFARE_UPLOAD_API_ENDPOINT ='https://myportal-api.src.xyz/api/v1.1/R2/Upload';
    const CLOUDFARE_GET_AUDIO_API_ENDPOINT_PREFIX="https://remi-r2.src.xyz/"

    // This line is crucial for LayoutAnimation to work on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    // Initialize permissionResponse with null to indicate no response yet
    const [permissionResponse, setPermissionResponse] = useState<PermissionResponse | null>(null);
    const recordingTimer = useRef<number | null>(null); // Ref to hold the interval ID

    // This useEffect handles initial setup: permissions and fetching Cloudflare files
    useEffect(() => {
        const initializeScreen = async () => {
            await getRecordPermision();
            await fetchAudioFiles();
        };
        initializeScreen();
        return () => { // Cleanup function for the effect
            if (recordingTimer.current) clearInterval(recordingTimer.current);
        };
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

    // --- Function to upload audio to your backend ---
    const uploadAudio = async (fileUri: string, originalName: string, fileType: AudioFileType, customName: string) => {
        setUploading(true); // Set local uploading state
        try {
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (!fileInfo.exists) {
                throw new Error('File does not exist at the provided URI.');
            }
            
            const formData = new FormData();
            formData.append('file', {
                id: `uploaded_${Date.now()}`,
                uri: fileUri,
                name: originalName,
                type: fileType === 'recorded' ? 'audio/m4a' : 'audio/mpeg',
            } as any);

            const url = new URL(CLOUDFARE_UPLOAD_API_ENDPOINT);
            url.searchParams.append('selectR2Bucket', 'REMI_AI_VOICE_AUDIO_BUCKET');
            url.searchParams.append('filePath', 'audio_sources');
            url.searchParams.append('name', originalName);
            url.searchParams.append('id', `uploaded_${Date.now()}`);
            url.searchParams.append('type', fileType === 'recorded' ? 'audio/m4a' : 'audio/mpeg');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    accept: '*/*',
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
            }

            const responseData = await response.json();
            console.log('Upload successful:', responseData);

            const newAudioFile: AudioFileItem = {
                id: responseData.id || `uploaded_${Date.now()}`,
                name: responseData.name || customName,
                uri: CLOUDFARE_GET_AUDIO_API_ENDPOINT_PREFIX+responseData.fileKey,
                type: 'uploaded',
                duration: recordingDuration
            };
            // --- Use Zustand's addAudioFile action ---
            addAudioFile(newAudioFile);
            Alert.alert('Upload Success', `"${customName}" has been uploaded!`);
            
        } catch (error: any) {
            console.error('Error during upload:', error);
            Alert.alert('Upload Failed', `Could not upload audio: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false); // Reset local uploading state
        }
    };

    // --- Handle submission from the modal ---
    const handleModalSubmit = async (customName: string) => {
        if (tempAudioFileData) {
            setIsNameModalVisible(false);
            await uploadAudio(
                tempAudioFileData.uri,
                tempAudioFileData.originalName,
                tempAudioFileData.fileType,
                customName
            );
            setTempAudioFileData(null);
        }
    };

    // --- Handle modal close ---
    const handleModalClose = () => {
        setIsNameModalVisible(false);
        setTempAudioFileData(null);
    };

    console.log("Audio Recorder State:", audioRecorder);

    // --- Recording Duration Timer (local state) ---
    useEffect(() => {
        if (isRecording) {
            recordingTimer.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1000);
            }, 1000);
        } else if (recordingTimer.current) {
            clearInterval(recordingTimer.current);
            recordingTimer.current = null;
            setRecordingDuration(0);
        }
        return () => {
            if (recordingTimer.current) clearInterval(recordingTimer.current);
        };
    }, [isRecording]);

    // Helper to format milliseconds to MM:SS
    const formatMillis = (millis: number) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (parseInt(seconds) < 10 ? '0' : '') + seconds;
    };

    // --- Audio Recording Functions ---
    const startRecording = async () => {
        if (permissionResponse?.status !== 'granted') {
            Alert.alert(
                'Microphone Access Required',
                'Please grant microphone permission in your device settings to start recording.'
            );
            return;
        }

        setIsRecording(true);
        try {
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
        } catch (error) {
            console.error('Error starting recording:', error);
            Alert.alert('Recording Failed', 'Could not start recording. Please try again.');
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        try {
            await audioRecorder.stop();
            const recordedUri = audioRecorder.uri;

            if (recordedUri) {
                const defaultName = `Recording_${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-')}_${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/:/g, '-')}`;
                setTempAudioFileData({
                    uri: recordedUri,
                    originalName: defaultName + '.m4a',
                    fileType: 'recorded',
                    defaultCustomName: defaultName,
                    duration: audioRecorder.currentTime
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
            setRecordingDuration(0);
        }
    };

    // --- Audio Upload Functions ---
    const pickAudioFile = async () => {
        try {    
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const defaultName = asset.name.split('.').slice(0, -1).join('.') || `picked_audio_${Date.now()}`;
                // NEED TO BE REVISITED
                setTempAudioFileData({
                    uri: asset.uri,
                    originalName: asset.name,
                    fileType: 'uploaded',
                    defaultCustomName: defaultName,
                    duration: 2
                });
                setIsNameModalVisible(true);
            } else {
                console.log('Document picking cancelled or no asset selected.');
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Upload Error', 'Could not pick audio file.');
        } finally {
            // No need to setUploading(false) here, it's handled by uploadAudio's finally block
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
                        // Use Zustand's deletingId state
                        if (deletingId === id) {
                            console.log('Deletion already in progress for this item.');
                            return;
                        }

                        setDeletingId(id); // Set the ID of the item currently being deleted
                        try {
                            const deleteUrl = new URL(CLOUDFLARE_DELETE_API_ENDPOINT);
                            deleteUrl.searchParams.append('selectR2Bucket', R2_BUCKET_NAME_FOR_API);
                            deleteUrl.searchParams.append('key', id);

                            const headers = { 'accept': '*/*' };

                            const response = await fetch(deleteUrl.toString(), {
                                method: 'DELETE',
                                headers: headers,
                            });

                            if (!response.ok) {
                                const errorText = await response.text();
                                let errorMessage = errorText;
                                try {
                                    const errorJson = JSON.parse(errorText);
                                    errorMessage = errorJson.message || errorText;
                                } catch (e) {
                                    // Not JSON, use raw text
                                }
                                throw new Error(`Deletion failed: ${response.status} - ${errorMessage}`);
                            }

                            // --- Use Zustand's removeAudioFile action ---
                            removeAudioFile(id);
                            Alert.alert('Success', 'Audio file deleted from the cloud.');

                        } catch (error: any) {
                            console.error('Error during deletion:', error);
                            Alert.alert('Deletion Failed', `Could not delete file from cloud: ${error.message}`);
                        } finally {
                            setDeletingId(null); // Clear the deletion state
                        }
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-0 pb-100">
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
                        disabled={uploading}
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
                        disabled={permissionResponse?.status === 'denied' && !permissionResponse?.canAskAgain}
                    >
                        <>
                            <Icon
                                as={isRecording ? StopCircle : Mic}
                                size="xl"
                                className={`mb-1 ${isRecording ? 'text-red-600' : 'text-blue-600'}`}
                            />
                            <Text className={`text-sm ${isRecording ? 'text-red-700' : 'text-blue-700'}`}>
                                {isRecording ? `Recording ${formatMillis(recordingDuration)}` : 'Record Audio'}
                            </Text>
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
            <ScrollView className="flex-1 pb-500">
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
            
            {/* --- Audio Name Input Modal --- */}
            {tempAudioFileData && (
                <AudioNameModal
                    visible={isNameModalVisible}
                    defaultName={tempAudioFileData.defaultCustomName}
                    onClose={handleModalClose}
                    onSubmit={handleModalSubmit}
                    isUploading={uploading}
                />
            )}
        </SafeAreaView>
    );
}
