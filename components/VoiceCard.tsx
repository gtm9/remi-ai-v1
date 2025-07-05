// components/VoiceCard.tsx
import { Card } from '@/components/ui/card'; // Assuming you have a Card component
import { Icon } from '@/components/ui/icon';
import { AudioFileItem } from '@/types/audio';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pause, Play, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
interface VoiceCardProps {
  audioFile: AudioFileItem;
  onDelete: (id: string) => void;
}

export default function VoiceCard({ audioFile, onDelete }: VoiceCardProps) {
    const player = useAudioPlayer(audioFile.uri);
    const playerStatus = useAudioPlayerStatus(player);

    // Derived states
    const isPlaying = playerStatus.playing;
    const isLoaded = playerStatus.isLoaded;
    const isBuffering = playerStatus.isBuffering;

    // Define what constitutes a "critical" error that prevents playback
    const hasCriticalError = playerStatus.reasonForWaitingToPlay && playerStatus.reasonForWaitingToPlay !== "unknown" && playerStatus.isLoaded === false; // Error + NOT loaded + not 'unknown'

    // Condition to show the ActivityIndicator (true loading/buffering state)
    const showActivityIndicator = !isLoaded && isBuffering && !hasCriticalError;
    
    // Condition to show the Play/Pause button (ready for playback)
    const isReadyForPlayback = isLoaded && !isBuffering && !hasCriticalError;


    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [playbackDuration, setPlaybackDuration] = useState(0);

    // Helper to format milliseconds into MM:SS
    const formatMillis = (millis: number | undefined) => {
        if (millis === undefined || isNaN(millis)) return '0:00';
        // Assuming durationMillis and positionMillis are indeed in milliseconds
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    useEffect(() => {
        if (isLoaded) { // Only update if sound is loaded
            setPlaybackPosition(playerStatus.duration || 0);
            if (playerStatus.duration && playerStatus.duration !== playbackDuration) {
                 setPlaybackDuration(playerStatus.duration);
            }

            // If it just finished playing, reset position to 0
            if (playerStatus.didJustFinish) {
                player.seekTo(0);
                setPlaybackPosition(0);
            }
        }
        
        // Comprehensive log for debugging
        console.log(`VoiceCard Status for ${audioFile.name} (${audioFile.uri}):`, {
            isLoaded: playerStatus.isLoaded,
            isPlaying: playerStatus.playing,
            isBuffering: playerStatus.isBuffering,
            error: playerStatus.reasonForWaitingToPlay, // Raw error value
            hasCriticalError: hasCriticalError, // Our derived critical error state
            duration: playerStatus.duration,
            position: playerStatus.currentTime
        });

        // Alert only for critical, unhandled errors that prevent loading
        if (playerStatus.reasonForWaitingToPlay && playerStatus.reasonForWaitingToPlay !== "unknown" && !playerStatus.isLoaded) {
            Alert.alert("Audio Load Error", `Could not load audio for ${audioFile.name}: ${playerStatus.reasonForWaitingToPlay || playerStatus.reasonForWaitingToPlay}`);
            console.error("Audio player critical error:", playerStatus.reasonForWaitingToPlay);
        }

    }, [playerStatus, isLoaded, hasCriticalError]); // Depend on playerStatus and derived states

    const handlePlayPause = async () => {
        if (!isReadyForPlayback) { // Use the consolidated readiness check
            Alert.alert("Error", "Audio is not ready for playback.");
            return;
        }

        if (isPlaying) {
            console.log("Pausing audio...");
            await player.pause();
        } else {
            console.log("Playing audio...");
            // If at the end or just finished, seek to start before playing
            if (playerStatus.didJustFinish || (playerStatus.currentTime >= playerStatus.duration && playerStatus.duration > 0)) {
                await player.seekTo(0);
            }
            await player.play();
        }
    };

    const progressWidth = playbackDuration > 0 ? (playbackPosition / playbackDuration) * 100 : 0;

    return (
        <Card size="md" variant="elevated" className="m-3 p-4 flex-row items-center justify-between rounded-lg shadow-md">
            <View className="flex-1 mr-4">
                <Text className="text-lg font-bold mb-1 text-typography-900">{audioFile.name}</Text>
                <Text className="text-sm text-gray-500 mb-2">
                    {audioFile.type === 'recorded' ? 'Recorded Audio' : (audioFile.type === 'uploaded' ? 'Uploaded File' : 'Generated Voice')}
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
                {showActivityIndicator ? ( // Show spinner only when truly loading/buffering and no critical error
                    <ActivityIndicator size="small" color="#3B82F6" className="mr-2" />
                ) : hasCriticalError ? ( // Show X icon only for critical errors that prevent loading
                    <Icon as={X} size="lg" className="text-red-600 mr-2" />
                ) : ( // Show play/pause button when ready for playback
                    <TouchableOpacity
                        onPress={handlePlayPause}
                        className="p-3 rounded-full bg-blue-100 mr-2"
                        disabled={!isReadyForPlayback} // Button is enabled only when ready
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
