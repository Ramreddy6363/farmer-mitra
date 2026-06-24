import { useCallback, useRef, useState } from 'react';
import { unlockAudio } from '@/utils/audioBus';

interface RecorderState {
  isRecording: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
}

/**
 * Microphone recorder built on MediaRecorder.
 * Returns the captured audio as a Blob when stopped.
 */
export function useRecorder(): RecorderState {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    setError(null);
    // Mic click is a user gesture — unlock the audio context for later playback.
    unlockAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError(
        'Microphone access denied. Please allow mic permission and try again.',
      );
    }
  }, []);

  const stop = useCallback(async (): Promise<Blob | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return null;

    return new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType,
        });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setIsRecording(false);
        resolve(blob.size > 0 ? blob : null);
      };
      recorder.stop();
    });
  }, []);

  return { isRecording, error, start, stop };
}
