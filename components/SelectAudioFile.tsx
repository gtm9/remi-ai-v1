// src/components/AudioFileSelect.tsx
import { useAudioFilesStore } from '@/app/store/audioFileStore';
import React, { useEffect } from 'react';
import { FormControl, FormControlLabel, FormControlLabelText } from './ui/form-control';
import { ChevronDownIcon, Icon } from './ui/icon';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger
} from './ui/select'; // Ensure you import all necessary Gluestack components

interface AudioFileSelectProps {
  label?: string; // Optional label for the form control
  placeholder?: string; // Placeholder text for the select input
  selectedValue: string | null; // The currently selected audio file ID
  onValueChange: (value: string) => void; // Callback when a new value is selected
  isDisabled?: boolean; // Optional: disable the select
}

export const AudioFileSelect: React.FC<AudioFileSelectProps> = ({
  label = 'Choose Audio File', // Default label
  placeholder = 'Select an audio file', // Default placeholder
  selectedValue,
  onValueChange,
  isDisabled = false,
}) => {
  const audioFiles = useAudioFilesStore((state) => state.audioFiles);
  const fetchAudioFiles = useAudioFilesStore((state) => state.fetchAudioFiles);
  const isLoadingFiles = useAudioFilesStore((state) => state.isLoadingFiles); // Get loading state

  // Fetch audio files when the component mounts or if they need to be refreshed
  useEffect(() => {
    // Only fetch if audioFiles are not already loaded and not currently loading
    if (audioFiles.length === 0 && !isLoadingFiles) {
      fetchAudioFiles();
    }
  }, [audioFiles.length, fetchAudioFiles, isLoadingFiles]);

  return (
    <FormControl className="mb-4" isDisabled={isDisabled}>
      {label && (
        <FormControlLabel className="mb-2">
          <FormControlLabelText>{label}</FormControlLabelText>
        </FormControlLabel>
      )}
      <Select
        selectedValue={selectedValue || ''} // Ensure it's a string, default to empty
        onValueChange={onValueChange}
        isDisabled={isDisabled || isLoadingFiles} // Disable if loading
      >
        <SelectTrigger variant="outline" size="md">
          <SelectInput placeholder={isLoadingFiles ? "Loading audio files..." : placeholder} />
          <SelectIcon className='mr-3'>
            <Icon as={ChevronDownIcon} />
          </SelectIcon>
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {isLoadingFiles ? (
              <SelectItem label="Loading audio files..." value="" isDisabled />
            ) : audioFiles.length === 0 ? (
              <SelectItem label="No audio files found." value="" isDisabled />
            ) : (
              audioFiles.map((file) => (
                <SelectItem key={file.id} label={file.name} value={file.id} />
              ))
            )}
          </SelectContent>
        </SelectPortal>
      </Select>
    </FormControl>
  );
};