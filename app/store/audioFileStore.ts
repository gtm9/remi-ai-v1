import { AudioFileItem, CloudFareAudioFileItem } from '@/types/audio'; // Adjust path as needed
import { Alert, LayoutAnimation } from 'react-native'; // Import Alert for error messages
import { create } from 'zustand';

// Define your API Endpoints within the store or pass them as parameters if they vary
// For simplicity, we'll define them here, assuming they are constant for the store's purpose.
// If these need to be dynamic per user or environment, you might fetch them from config.
const CLOUDFLARE_GETLIST_API_ENDPOINT = 'https://myportal-api.src.xyz/api/v1.1/R2/GetList?selectR2Bucket=REMI_AI_VOICE_AUDIO_BUCKET&prefix=audio_sources';
export const R2_PUBLIC_BASE_URL = 'https://pub-1075dcde11af4427bc47c49e86b83ff9.r2.dev/';

// Define the type for a generated audio item
export interface GeneratedAudioItem {
  id: string; // A unique ID for this generated audio
  url: string; // The URL to the predicted audio file from Gradio
  generatedAt: string; // ISO string timestamp of generation
  promptText: string; // The text used as input for generation
  // Add other properties if your Gradio output includes them (e.g., duration, other data)
  // rawGradioResult?: any; // Optional: Store the full raw result for debugging/advanced use
}

interface GeneratedAudioState {
  generatedAudios: GeneratedAudioItem[];
  addGeneratedAudio: (audio: GeneratedAudioItem) => void;
  removeGeneratedAudio: (id: string) => void;
  // You might add a 'clearGeneratedAudios' action, etc.
}

interface AudioFilesState {
  audioFiles: AudioFileItem[];
  isLoadingFiles: boolean;
  deletingId: string | null;
  
  addAudioFile: (file: AudioFileItem) => void;
  removeAudioFile: (id: string) => void;
  updateAudioFile: (id: string, updates: Partial<AudioFileItem>) => void;
  setAudioFiles: (files: AudioFileItem[]) => void; // Keep this for direct setting if needed
  setIsLoadingFiles: (isLoading: boolean) => void; // Keep this for external control
  setDeletingId: (id: string | null) => void;

  // --- NEW: General reusable fetch function ---
  fetchAudioFiles: () => Promise<void>;
}

export const useGeneratedAudioStore = create<GeneratedAudioState>((set) => ({
  generatedAudios: [],

  addGeneratedAudio: (audio) => {
    set((state) => ({
      generatedAudios: [...state.generatedAudios, audio],
    }));
    console.log('Generated audio added to store:', audio.url);
  },

  removeGeneratedAudio: (id) => {
    set((state) => ({
      generatedAudios: state.generatedAudios.filter((item) => item.id !== id),
    }));
    console.log('Generated audio removed from store:', id);
  },
}));

export const useAudioFilesStore = create<AudioFilesState>((set, get) => ({
  audioFiles: [],
  isLoadingFiles: true, // Initial state for loading
  deletingId: null,      // Initial state for deletion
  
  addAudioFile: (file) => {
    set((state) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return { audioFiles: [...state.audioFiles, file] };
    });
  },

  removeAudioFile: (id) => {
    set((state) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return {
        audioFiles: state.audioFiles.filter((file) => file.id !== id),
      };
    });
  },

  updateAudioFile: (id, updates) => {
    set((state) => ({
      audioFiles: state.audioFiles.map((file) =>
        file.id === id ? { ...file, ...updates } : file
      ),
    }));
  },

  setAudioFiles: (files) => { // This is a raw setter, useful if you need to completely replace the array
    set({ audioFiles: files });
  },

  setIsLoadingFiles: (isLoading) => { // This is a raw setter, useful if you need external control
    set({ isLoadingFiles: isLoading });
  },

  setDeletingId: (id) => {
    set({ deletingId: id });
  },

  // --- NEW: Implementation of the fetchAudioFiles action ---
  fetchAudioFiles: async () => {
    set({ isLoadingFiles: true }); // Set loading state
    try {
        const response = await fetch(CLOUDFLARE_GETLIST_API_ENDPOINT);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fetchedFiles: AudioFileItem[] = data["s3Objects"].map((file: CloudFareAudioFileItem) => ({
            id: file.key,
            name: file.key,
            uri: R2_PUBLIC_BASE_URL + file.key, // Use the constant base URL
            type: 'remote',
        }));
        console.log("120 fetchedFiles",fetchedFiles)
        set({ audioFiles: fetchedFiles }); // Update audio files in the store
    } catch (error: any) {
        console.error('Failed to fetch audio files from Cloudflare:', error);
        Alert.alert( // Alert is still useful for immediate user feedback
            'Error Loading Audio',
            `Could not load your existing audio files: ${error.message || 'Unknown error'}. Please check your internet connection and try again.`
        );
        set({ audioFiles: [] }); // Clear files on error
    } finally {
        set({ isLoadingFiles: false }); // Always clear loading state
    }
  },
}));
