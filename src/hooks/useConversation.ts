import { useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useRecorder } from '@/hooks/useRecorder';
import { speechToText } from '@/services/sarvamSTT';
import { askAgent } from '@/services/lyzrService';
import { splitIntoChunks, synthesizeChunk } from '@/services/sarvamTTS';
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

        // 3+4) Text to speech + speak, pipelined so audio starts fast.
        // Synthesize the first chunk, start playing it, and synthesize the
        // next chunk while the current one is still speaking. This makes the
        // avatar start talking after only the FIRST small chunk is ready,
        // instead of waiting for the whole answer to be synthesized.
        setStatus('Preparing the answer…');
        const chunks = splitIntoChunks(answer);
        let next = synthesizeChunk(chunks[0], language);

        for (let i = 0; i < chunks.length; i++) {
          const blobs = await next;
          // Kick off the next chunk's synthesis before playing this one.
          if (i + 1 < chunks.length) {
            next = synthesizeChunk(chunks[i + 1], language);
          }
          if (i === 0) {
            setAvatarState('speaking');
            setStatus('');
          }
          for (const blob of blobs) {
            await play(blob);
          }
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
