import React, { useState, useRef, useEffect } from 'react';
import { Mic, Trash2, Send, AlertCircle } from 'lucide-react';

interface VoiceNoteRecorderProps {
  onSendVoice: (audioBlob: Blob, durationSeconds: number) => void;
  disabled?: boolean;
  floating?: boolean;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onSendVoice,
  disabled = false,
  floating = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  const cleanupRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Browser Anda tidak mendukung perekaman mikrofon.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      // Realtime Volume Analysis for live HUD soundwave reactivity
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Determine supported MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(250); // Slice data every 250ms
      setIsRecording(true);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            stopAndSend();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Izin mikrofon ditolak. Izinkan mikrofon di browser Anda untuk menggunakan Voice Note.');
      } else {
        setPermissionError('Gagal mengakses mikrofon.');
      }
      setIsRecording(false);
      cleanupRecording();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    cleanupRecording();
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
    setVolumeLevel(0);
  };

  const stopAndSend = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    const finalDuration = Math.max(1, recordingSeconds);
    const recorder = mediaRecorderRef.current;

    recorder.onstop = () => {
      const mime = recorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mime });
      cleanupRecording();
      setIsRecording(false);
      setRecordingSeconds(0);
      setVolumeLevel(0);

      if (audioBlob.size > 100) {
        onSendVoice(audioBlob, finalDuration);
      }
    };

    recorder.stop();
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If currently recording, render HUD
  if (isRecording) {
    const recordingHud = (
      <div className={`flex items-center gap-2 sm:gap-3 ${floating ? 'fixed bottom-6 right-20 sm:right-24 z-50 p-2.5 rounded-2xl bg-slate-900/95 border border-red-500/40 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-3' : 'w-full animate-in fade-in zoom-in-95 duration-200'}`}>
        {/* Recording Status & Waveform Indicator */}
        <div className="flex-1 flex items-center justify-between gap-3 px-3 sm:px-4 py-2 rounded-xl liquid-glass border border-red-500/30 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 shadow-[0_0_8px_#ef4444]"></span>
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-red-300">
              {formatTimer(recordingSeconds)}
            </span>
          </div>

          {/* Dynamic Sound Wave Pulse */}
          <div className="flex items-center gap-1 h-5 px-2">
            {[0.4, 0.8, 1.2, 0.7, 1.4, 0.9, 0.5].map((multiplier, idx) => {
              const height = Math.max(18, Math.min(100, volumeLevel * multiplier));
              return (
                <div
                  key={idx}
                  className="w-1 bg-red-400 rounded-full transition-all duration-75"
                  style={{
                    height: `${height}%`,
                    opacity: 0.6 + (height / 250)
                  }}
                />
              );
            })}
          </div>

          <span className="text-[11px] text-white/70 hidden sm:inline font-medium">
            Merekam suara...
          </span>
        </div>

        {/* Cancel Button */}
        <button
          onClick={cancelRecording}
          type="button"
          className="p-2 sm:p-2.5 rounded-xl liquid-glass text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer active:scale-95 shadow-sm"
          title="Batalkan rekaman"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        {/* Send Voice Note Button */}
        <button
          onClick={stopAndSend}
          type="button"
          className="flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer active:scale-95"
          title="Kirim pesan suara (Voice Note)"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Kirim VN</span>
        </button>
      </div>
    );

    return recordingHud;
  }

  // Idle state: Floating Button variant
  if (floating) {
    return (
      <div className="relative group">
        {permissionError && (
          <div className="absolute bottom-full mb-3 right-0 w-64 p-3 rounded-xl bg-red-950/95 border border-red-500/40 text-red-200 text-xs shadow-2xl backdrop-blur-md z-50 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{permissionError}</p>
              <button
                onClick={() => setPermissionError(null)}
                className="text-[10px] text-red-300 underline mt-1 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        <button
          onClick={startRecording}
          disabled={disabled}
          type="button"
          className="p-3.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-emerald-400 border border-emerald-400/50 shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-emerald-950/50 disabled:opacity-50"
          title="Bicara dengan VoiceAI Buku Saku"
          aria-label="Bicara dengan VoiceAI Buku Saku"
        >
          <Mic className="w-7 h-7 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
        </button>

        {/* Floating Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-emerald-500/30 shadow-xl backdrop-blur-md">
          VoiceAI Buku Saku
        </div>
      </div>
    );
  }

  // Idle state: Inline Bar variant
  return (
    <div className="relative">
      {permissionError && (
        <div className="absolute bottom-full mb-2 right-0 w-64 p-2.5 rounded-xl bg-red-950/90 border border-red-500/40 text-red-200 text-xs shadow-xl backdrop-blur-md z-50 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{permissionError}</p>
            <button
              onClick={() => setPermissionError(null)}
              className="text-[10px] text-red-300 underline mt-1 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <button
        onClick={startRecording}
        disabled={disabled}
        type="button"
        className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl liquid-glass hover:bg-white/20 text-white/90 hover:text-white border border-white/25 hover:border-emerald-400/50 transition-all duration-300 cursor-pointer active:scale-95 shadow-md hover:shadow-[0_0_16px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group"
        title="Bicara dengan Voice Note (VoiceAI Buku Saku)"
      >
        <Mic className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform duration-200 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
      </button>
    </div>
  );
};
