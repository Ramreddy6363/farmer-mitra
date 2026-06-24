import { useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useRecorder } from '@/hooks/useRecorder';
import { speechToText } from '@/services/sarvamSTT';
import { askAgent } from '@/services/lyzrService';
import { textToSpeech } from '@/services/sarvamTTS';
import { play } from '@/utils/audioBus';

/**
 * Ties the whole pipeline together:
 * record → STT → Lyzr agent → TTS → avatar speaks.
 */
export function useConversation() {
  const recorder = useRecorder();
  const {
    language,
    addMessage,
    setAvatarState,
    setStatus,
    setError,
  } = useStore();

  const runPipeline = useCallback(
    async (audio: Blob) => {
      try {
        // 1) Speech to text
        setAvatarState('thinking');
        setStatus('Listening to your question…');
        const { transcript } = await speechToText(audio, language);
        if (!transcript) {
          setError("Sorry, I didn't catch that. Please try again.");
          setAvatarState('idle');
          setStatus('');
          return;
        }
        addMessage('user', transcript);

        // 2) Ask the agent
        setStatus('Thinking…');
        const answer = await askAgent(transcript);
        addMessage('assistant', answer);

        // 3) Text to speech
        setStatus('Preparing the answer…');
        const clips = await textToSpeech(answer, language);

        // 4) Speak (mouth lip-syncs via audioBus level)
        setAvatarState('speaking');
        setStatus('');
        for (const clip of clips) {
          await play(clip);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setAvatarState('idle');
        setStatus('');
      }
    },
    [language, addMessage, setAvatarState, setStatus, setError],
  );

  const toggleRecording = useCallback(async () => {
    setError(null);
    if (recorder.isRecording) {
      const blob = await recorder.stop();
      setAvatarState('idle');
      if (blob) await runPipeline(blob);
    } else {
      await recorder.start();
      setAvatarState('listening');
      setStatus('Recording… tap again to send.');
    }
  }, [recorder, runPipeline, setAvatarState, setStatus, setError]);

  return {
    isRecording: recorder.isRecording,
    recorderError: recorder.error,
    toggleRecording,
  };
}
