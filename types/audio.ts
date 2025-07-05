export type AudioFileType = 'recorded' | 'uploaded' | 'remote';

export interface AudioFileItem {
  id: string;
  name: string;
  audioText?: string;
  uri: string; // Local or remote URI for the audio file
  type: AudioFileType;
  duration?: number; // Optional: duration in milliseconds, useful for recorded audio
  // Add any other properties you might need, like size, uploadDate, etc.
}

export interface CloudFareAudioFileItem {
    checksumAlgorithm: string;
    eTag: string;
    bucketName: string;
    key: string;
    lastModified: string;
    owner: string;
    restoreStatus: string;
    size: number;
    checksumType: string;
    // Add any other metadata you expect from your Cloudflare API
}
