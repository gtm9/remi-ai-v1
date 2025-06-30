import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Assuming you have an Icon component from lucide-react-native and your UI library
import { Icon } from '@/components/ui/icon'; // Adjust path as per your setup
import { X } from 'lucide-react-native';

interface AudioNameModalProps {
  visible: boolean;
  defaultName: string;
  onClose: () => void;
  onSubmit: (customName: string) => void;
  isUploading: boolean; // Prop to indicate if an upload is in progress
}

export default function AudioNameModal({
  visible,
  defaultName,
  onClose,
  onSubmit,
  isUploading,
}: AudioNameModalProps) {
  const [customName, setCustomName] = useState(defaultName);

  // Update internal state when defaultName prop changes (e.g., for new file)
  useEffect(() => {
    setCustomName(defaultName);
  }, [defaultName]);

  const handleSubmit = () => {
    if (customName.trim() === '') {
      // Optional: Show an alert if name is empty
      // Alert.alert('Name Required', 'Please enter a name for your audio file.');
      onSubmit(defaultName); // Or handle as per your requirement if empty
    } else {
      onSubmit(customName.trim());
    }
  };

  return (
    <Modal
      animationType="fade" // Or "slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // For Android back button
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View className="bg-white rounded-lg p-6 shadow-xl w-4/5 mx-auto">
          {/* Header with Close Button */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-typography-800">Name Your Audio</Text>
            <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
              <Icon as={X} size="lg" className="text-gray-500" />
            </TouchableOpacity>
          </View>

          <Text className="text-base text-typography-700 mb-2">Enter a custom name:</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 text-lg text-typography-900 mb-4"
            placeholder="e.g., My Voice Memo"
            value={customName}
            onChangeText={setCustomName}
            maxLength={60} // Optional: Limit length
            autoFocus // Automatically focus the input when modal opens
            selectionColor="#007bff" // Customize cursor color
          />

          {/* Action Buttons */}
          <View className="flex-row justify-end">
            <TouchableOpacity
              onPress={onClose}
              className="px-4 py-2 rounded-md mr-2 bg-gray-200"
              disabled={isUploading}
            >
              <Text className="text-gray-800 text-base font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className={`px-6 py-2 rounded-md ${isUploading ? 'bg-blue-300' : 'bg-blue-600'}`}
              disabled={isUploading} // Disable while uploading
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">Upload</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
  },
});