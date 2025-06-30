// components/VoiceCard.tsx
import { Card } from '@/components/ui/card'; // Assuming you have a Card component
import { Icon } from '@/components/ui/icon';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pause, Play, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

const mp3 = "/Users/goutamchapalamadugu/Desktop/pegasus1.mp3"

// Define the structure for an audio file item
export interface AudioFileItem {
  id: string;
  name: string;
  uri: string; // Local URI for the audio file
  type: 'recorded' | 'uploaded';
  duration?: number; // Optional: duration in milliseconds, useful for recorded audio
}

interface VoiceCardProps {
  audioFile: AudioFileItem;
  onDelete: (id: string) => void;
}

export default function VoiceCard({ audioFile, onDelete }: VoiceCardProps) {
    const player = useAudioPlayer(audioFile);
    const playerStatus = useAudioPlayerStatus(player)
    // const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playbackPosition, setPlaybackPosition] = useState(0); // in ms
    const [playbackDuration, setPlaybackDuration] = useState(audioFile.duration || 0); // in ms

    // Helper to format milliseconds into MM:SS
    const formatMillis = (millis: number | undefined) => {
        if (millis === undefined || isNaN(millis)) return '0:00';
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Effect to load the sound when component mounts or URI changes
    useEffect(() => {
        const loadSound = async () => {
            setIsLoading(true);
            try {
                // Update initial duration if available after loading
                if (playerStatus.isLoaded) {
                setPlaybackDuration(playerStatus.duration || 0);
                }
                // Set a callback to update playback status in real-time
                if (playerStatus.isLoaded) {
                    setPlaybackPosition(playerStatus.currentTime);
                    setIsPlaying(playerStatus.playing);
                    if (playerStatus.didJustFinish) {
                        setIsPlaying(false);
                        player.seekTo(0)
                    }
                    // Update duration just in case it wasn't available on initial load
                    setPlaybackDuration(playerStatus.duration || 0);
                }
                setIsLoading(!playerStatus.isLoaded && !playerStatus.isBuffering);
            } catch (error) {
                console.error('Error loading sound:', error);
                Alert.alert("Error", "Could not load audio file.");
            } finally {
                setIsLoading(false);
            }
        };
        loadSound();
    }, [audioFile.uri]);

    // Handler for play/pause button
    const handlePlayPause = async () => {
        // if (!sound) {
        // Alert.alert("Error", "Audio not loaded yet.");
        // return;
        // }

        // if (isPlaying) {
        //     await sound.pauseAsync();
        // } else {
        //     // If finished, restart from beginning
        //     if (playbackPosition >= playbackDuration && playbackDuration > 0) {
        //         await sound.setPositionAsync(0);
        //     }
        //     await sound.playAsync();
        // }
        player.seekTo(0);
        player.play();
    };

    // Calculate progress for the bar
    const progressWidth = playbackDuration > 0 ? (playbackPosition / playbackDuration) * 100 : 0;

    return (
        <Card size="md" variant="elevated" className="m-3 p-4 flex-row items-center justify-between rounded-lg shadow-md">
            <View className="flex-1 mr-4">
                <Text className="text-lg font-bold mb-1 text-typography-900">{audioFile.name}</Text>
                <Text className="text-sm text-gray-500 mb-2">
                {audioFile.type === 'recorded' ? 'Recorded Audio' : 'Uploaded File'}
                </Text>

                {/* Playback Progress Bar */}
                <View className="w-full h-1 bg-gray-200 rounded-full my-1">
                <View className="h-full bg-blue-500 rounded-full" style={{ width: `${progressWidth}%` }} />
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                {formatMillis(playbackPosition)} / {formatMillis(playbackDuration)}
                </Text>
            </View>

            <View className="flex-row items-center">
                {isLoading && !isPlaying ? (
                <ActivityIndicator size="small" color="#3B82F6" className="mr-2" />
                ) : (
                <TouchableOpacity
                    onPress={handlePlayPause}
                    className="p-3 rounded-full bg-blue-100 mr-2"
                    disabled={isLoading} // Disable while loading
                >
                    <Icon as={isPlaying ? Pause : Play} size="lg" className="text-blue-600" />
                </TouchableOpacity>
                )}

                <TouchableOpacity
                onPress={() => onDelete(audioFile.id)}
                className="p-2 rounded-full bg-red-100"
                >
                <Icon as={X} size="md" className="text-red-600" />
                </TouchableOpacity>
            </View>
        </Card>
    );
}