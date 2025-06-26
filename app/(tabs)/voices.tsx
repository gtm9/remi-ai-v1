import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
// import { Audio } from 'expo-av';
import { AudioModule, PermissionResponse, RecordingPresets, useAudioRecorder } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker'; // For uploading files
import { Mic, StopCircle, Upload } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import VoiceCard, { AudioFileItem } from '../components/VoiceCard';

export default function VoicesScreen() {
    const [audioFiles, setAudioFiles] = useState<AudioFileItem[]>([]);
    // const [hasRecordingPermission, setHasRecordingPermission] = useState<PermissionResponse>();
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

    const [isRecording, setIsRecording] = useState(false);
    
    const [recordingDuration, setRecordingDuration] = useState(0); // in ms
    const [uploading, setUploading] = useState(false);
    // Use Audio.usePermissions() for a modern way to request mic permissions
    const [permissionResponse, setPermissionResponse] = useState<PermissionResponse>();

    const recordingTimer = useRef<number | null>(null); // Ref to hold the interval ID

    // useEffect(() => {
    //     // Check microphone permission on component mount
    //     (async () => {
    //         const status = await AudioModule.getRecordingPermissionsAsync();
    //         setPermissionResponse(status);
    //         if (!status.granted) {
    //             Alert.alert(
    //             'Permission Denied',
    //             'Microphone access is required to record audio.'
    //             );
    //         }
    //     })();
    // }, [isRecording]);

    // useEffect(() => {
    //     (async () => {
    //         const status = await AudioModule.requestRecordingPermissionsAsync();
    //         setPermissionResponse(status);
    //         if (!status.granted) {
    //             Alert.alert('Permission to access microphone was denied');
    //         }
    //     })();
    // }, [isRecording]);

    useEffect(() => {
        // (async () => {
        // const status = await AudioModule.requestRecordingPermissionsAsync();
        // setPermissionResponse(status);
        // if (!status.granted) {
        //     Alert.alert('Permission to access microphone was denied');
        // }
        // })();
        getRecordPermision()
    }, []);

    const getRecordPermision = async () => {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
            Alert.alert('Permission to access microphone was denied');
        }
    }

    console.log(audioRecorder)

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
        // try {
        //     // Check permissions again just before starting, in case they were revoked
        //     if (permissionResponse?.status !== 'granted') {
        //         const { status } = await requestPermission();
        //         if (status !== 'granted') {
        //         Alert.alert('Permission Denied', 'Cannot record without microphone permission.');
        //         return;
        //         }
        //     }

        //     await Audio.setAudioModeAsync({
        //         allowsRecordingIOS: true,
        //         playsInSilentModeIOS: true,
        //         staysActiveInBackground: false, // Prevents app from staying active in background solely for recording
        //         shouldDuckAndroid: true, // Audio from other apps will duck (lower volume)
        //         playThroughEarpieceAndroid: false, // Play through speaker on Android
        //     });

        //     const { recording: newRecording } = await Audio.Recording.createAsync(
        //         Audio.RecordingOptionsPresets.HIGH_QUALITY // You can choose other presets
        //     );
        //     setRecording(newRecording);
        //     setIsRecording(true);
        //     setRecordingDuration(0); // Start duration from 0
        //     console.log('Recording started');
        //     } catch (err) {
        //     console.error('Failed to start recording', err);
        //     Alert.alert('Recording Error', 'Could not start recording.');
        //     setIsRecording(false);
        // }
        setIsRecording(true);
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
    };

    const stopRecording = async () => {
        setIsRecording(false); // Stop the UI indicator immediately
        // if (!recording) return; // If no recording object, nothing to stop

        try {
            // await recording.stopAndUnloadAsync(); // Stop and free up resources
            // const uri = recording.getURI(); // Get the URI of the recorded file
            // if (uri) {
            //     // Create a unique name for the recorded file
            //     const name = `Recording ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
            //     const newAudioFile: AudioFileItem = {
            //     id: Date.now().toString(), // Simple unique ID
            //     name: name,
            //     uri: uri,
            //     type: 'recorded',
            //     duration: recordingDuration // Store the recorded duration
            //     };
            //     setAudioFiles(prev => [...prev, newAudioFile]); // Add to the list
            //     console.log('Recording stopped and saved to', uri);
            // } else {
            //     console.warn('Recording URI is null after stopping.');
            // }
            
            // The recording will be available on `audioRecorder.uri`.
            await audioRecorder.stop();
            setIsRecording(false);
            const newAudioFile: AudioFileItem = {
                id: Date.now().toString(), // Simple unique ID
                name: "asset.name",
                uri: "asset.uri",
                type: 'recorded',
            };
            setAudioFiles(prev => [...prev, newAudioFile]);
        } catch (error) {
            console.error('Error stopping recording', error);
            Alert.alert('Recording Error', 'Could not stop recording or save file.');
        } finally {
            // setRecording(null); // Clear the recording object
        }
    };

    // --- Audio Upload Functions ---
    const pickAudioFile = async () => {
        try {
        setUploading(true); // Indicate uploading in UI
        const result = await DocumentPicker.getDocumentAsync({
            type: 'audio/mpeg', // Specifically filter for MP3 files (can be 'audio/*' for all audio)
            copyToCacheDirectory: true, // Copy selected file to app's cache for consistent access
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const newAudioFile: AudioFileItem = {
                id: Date.now().toString(), // Simple unique ID
                name: asset.name,
                uri: asset.uri,
                type: 'uploaded',
            };
            setAudioFiles(prev => [...prev, newAudioFile]);
            console.log('Audio file uploaded:', asset.name, asset.uri);
        } else {
            console.log('Document picking cancelled or no asset selected.');
        }
        } catch (error) {
        console.error('Error picking document:', error);
        Alert.alert('Upload Error', 'Could not pick audio file.');
        } finally {
        setUploading(false); // End uploading indication
        }
    };

    // --- Delete Audio File ---
    const handleDeleteAudio = (id: string) => {
        setAudioFiles(prev => prev.filter(file => file.id !== id));
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
                // Disable if microphone permission is not granted
                disabled={permissionResponse?.status !== 'granted' && permissionResponse?.canAskAgain}
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
                {permissionResponse?.status !== 'granted' && !permissionResponse?.canAskAgain && (
                    <Text className="text-red-500 text-xs mt-1 text-center">Perm. Denied. Go to settings.</Text>
                )}
                </>
            </TouchableOpacity>
            </View>
        </View>

        {/* List of Audio Files */}
        <Text className="text-lg font-semibold text-typography-800 px-5 mb-3">Your Audio Files</Text>
        <ScrollView className="flex-1 pb-20">
            {audioFiles.length === 0 ? (
                <Text className="text-center text-gray-500 mt-10">No audio files yet. Upload or record one!</Text>
            ) : (
                audioFiles.map(file => (
                    <VoiceCard key={file.id} audioFile={file} onDelete={handleDeleteAudio} />
                ))
            )}
        </ScrollView>
        </SafeAreaView>
    );
}
