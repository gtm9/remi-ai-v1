// src/utils/callApi.ts
import { ReminderItem } from '@/app/store/reminderStore';
import { Alert } from 'react-native';

// --- IMPORTANT: Configure your backend URL ---
// Use the same backend URL as your Gradio prediction calls.
// Choose the appropriate URL based on how your backend is running:
// 1. Localhost (iOS Simulator):
//    const BACKEND_BASE_URL = "http://localhost:3000";
// 2. Android Emulator (accessing host machine's localhost):
//    const BACKEND_BASE_URL = "http://10.0.2.2:3000"; // If your server is on port 3000
// 3. Physical Device (on same Wi-Fi as your computer):
//    const BACKEND_BASE_URL = "http://YOUR_COMPUTER_LOCAL_IP:3000"; // e.g., "http://192.168.1.100:3000"
// 4. ngrok / Cloudflare Tunnel (public URL for testing anywhere):
//    const BACKEND_BASE_URL = "https://your-ngrok-subdomain.ngrok-free.app";

const BACKEND_BASE_URL = "https://8fed9ad1a857.ngrok-free.app"; // <--- REMEMBER TO SET THIS CORRECTLY!

/**
 * Initiates a phone call via the backend SignalWire endpoint.
 * This function makes a simple GET request.
 *
 * @returns {Promise<any>} A promise that resolves with the backend's response, or rejects on error.
 */
export const makeCallViaBackend = async (generatedAudioUrl: string,reminder: ReminderItem): Promise<any> => {
    try {
        console.log("-----------------------------------------");
        console.log("Initiating call via backend...");
        console.log("Target URL:", `${BACKEND_BASE_URL}/make-call`);

        const form = new FormData();
        form.append('generatedAudioUrl', generatedAudioUrl); // Add any necessary parameters if required by your backend

        const response = await fetch(`${BACKEND_BASE_URL}/make-call`, {
            method: 'POST', // It's a GET request, no body needed
            headers: {
                'Accept': 'application/json', // Indicate we prefer JSON response,
                'Content-Type': 'application/json', // Specify content type as JSON
            },
            body: JSON.stringify({ generatedAudioUrl:generatedAudioUrl,reminder: reminder  }), // Send the form data
         
        });
        // Check if the HTTP response was successful
        if (!response.ok) {
            const errorBody = await response.text(); // Read error response as text
            console.error(`Backend /make-call error status: ${response.status}, body: ${errorBody}`);
            Alert.alert(
                'Call Failed',
                `Backend error: ${response.status}. Details: ${errorBody.substring(0, 200)}...`
            );
            throw new Error(`Backend call request failed: ${response.status} - ${errorBody}`);
        }

        const result = await response.json(); // Parse the JSON response
        console.log('Backend /make-call response:', result);
        Alert.alert('Call Initiated', result.message || 'Call is being processed.');

        return result; // Return the backend's response

    } catch (error: any) {
        console.error('Error making call via backend:', error);
        Alert.alert('Call Error', `Could not initiate call: ${error.message || 'Unknown error'}`);
        throw error; // Re-throw for further handling if needed
    } finally {
        console.log("Call initiation request finished.");
    }
};
