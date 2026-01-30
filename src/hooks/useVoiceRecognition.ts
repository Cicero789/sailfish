import { useState, useEffect, useRef, useCallback } from 'react';

export function useVoiceRecognition(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [availableMicrophones, setAvailableMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  // Get available microphones
  const getMicrophones = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter(device => device.kind === 'audioinput');
      setAvailableMicrophones(mics);
      
      // Select default microphone if none selected
      if (!selectedMicId && mics.length > 0) {
        setSelectedMicId(mics[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting microphones:', error);
    }
  }, [selectedMicId]);

  // Request microphone permission and setup audio analysis
  const setupMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true 
      });
      
      micStreamRef.current = stream;
      setMicPermission('granted');

      // Setup audio context for level detection
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      analyserRef.current = analyser;

      // Get microphones list after permission granted
      await getMicrophones();
    } catch (error: any) {
      console.error('Microphone error:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMicPermission('denied');
      }
    }
  }, [selectedMicId, getMicrophones]);

  // Analyze audio level
  const analyzeAudioLevel = useCallback(() => {
    if (!analyserRef.current || !isListening) {
      setAudioLevel(0);
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(Math.min(100, (average / 128) * 100));

    animationFrameRef.current = requestAnimationFrame(analyzeAudioLevel);
  }, [isListening]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onTranscript]);

  const startListening = async () => {
    if (!recognitionRef.current || isListening) return;

    try {
      // Request microphone permission if not granted
      if (micPermission !== 'granted') {
        await setupMicrophone();
      }

      recognitionRef.current.start();
      setIsListening(true);
      analyzeAudioLevel();
    } catch (error) {
      console.error('Error starting recognition:', error);
      alert('Please allow microphone access to use voice input.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAudioLevel(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const changeMicrophone = async (deviceId: string) => {
    const wasListening = isListening;
    
    // Stop current listening
    if (wasListening) {
      stopListening();
    }

    // Stop current stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Update selected mic
    setSelectedMicId(deviceId);

    // Restart if was listening
    if (wasListening) {
      setTimeout(async () => {
        await setupMicrophone();
        await startListening();
      }, 100);
    } else {
      await setupMicrophone();
    }
  };

  return {
    isListening,
    isSupported,
    audioLevel,
    availableMicrophones,
    selectedMicId,
    micPermission,
    startListening,
    stopListening,
    changeMicrophone,
    setupMicrophone
  };
}
