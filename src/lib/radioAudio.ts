// Web Audio API Radio & PTT Sound Synthesizer & Voice Engine
// Works reliably across mobile (iOS Safari, Android Chrome) and desktop

class RadioSoundEffects {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Explicit audio unlock on user gesture
  unlockAudio() {
    if (this.isUnlocked) return;
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      // Play a short silent buffer to unlock iOS Safari
      const buffer = ctx.createBuffer(1, 1, 22050);
      const node = ctx.createBufferSource();
      node.buffer = buffer;
      node.connect(ctx.destination);
      node.start(0);
      this.isUnlocked = true;
    } catch (e) {}
  }

  // Get best supported audio MIME type across iOS Safari and Android/Desktop
  getOptimalAudioMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return '';
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return '';
  }

  // Play incoming voice message over speaker with automatic alert and error handling
  async playVoice(audioUrl: string): Promise<void> {
    if (!audioUrl) return;
    this.unlockAudio();
    this.playIncomingAlert();

    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const audio = new Audio();
          audio.src = audioUrl;
          audio.autoplay = true;
          audio.onended = () => {
            this.playPttRelease();
            resolve();
          };
          audio.onerror = () => {
            resolve();
          };
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Fallback via Web Audio decodeAudioData if HTML5 audio fails
              this.playViaAudioContext(audioUrl).then(resolve);
            });
          }
        } catch (err) {
          this.playViaAudioContext(audioUrl).then(resolve);
        }
      }, 150);
    });
  }

  // Web Audio fallback for audio playback
  private async playViaAudioContext(audioUrl: string): Promise<void> {
    try {
      const ctx = this.getContext();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        this.playPttRelease();
      };
      source.start(0);
    } catch (e) {}
  }

  // Walkie-Talkie Push Beep (Chirp on button press)
  playPttStart() {
    this.unlockAudio();
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08); // E6
      
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  // Radio Squelch Tail (Static burst on release)
  playPttRelease() {
    try {
      const ctx = this.getContext();
      const bufferSize = Math.floor(ctx.sampleRate * 0.08); // 80ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 3;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start();
    } catch (e) {}
  }

  // Incoming transmission radio beep (2-tone roger alert)
  playIncomingAlert() {
    this.unlockAudio();
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.06); // A5
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }

  // Crisp Modern Messaging Notification Tone (3-tone ascending bell chime: C6 -> E6 -> G6)
  playMessageNotification() {
    this.unlockAudio();
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      const playTone = (freq: number, start: number, duration: number, vol = 0.28) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(vol, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Crisp harmonic melody for new message
      playTone(1046.50, now, 0.12, 0.25); // C6
      playTone(1318.51, now + 0.07, 0.14, 0.22); // E6
      playTone(1567.98, now + 0.14, 0.25, 0.30); // G6
    } catch (e) {}
  }

  // Crisp Outgoing Sent Tone
  playMessageSentTone() {
    this.unlockAudio();
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  // Tactical SOS emergency alarm
  playSosAlarm() {
    this.unlockAudio();
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.15);
      osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }

  // Speak Case Number dynamically via Text-to-Speech (Web Speech API)
  speakCaseNumber(caseNumber: string, type: 'text' | 'voice' | 'ptt' = 'text') {
    try {
      this.unlockAudio();
      
      // Play crisp beep sound first to catch investigator attention
      if (type === 'text') {
        this.playMessageSentTone();
      } else {
        this.playMessageNotification();
      }

      if (typeof window !== 'undefined' && window.speechSynthesis) {
        // Cancel any active Speech to avoid overlap
        window.speechSynthesis.cancel();
        
        let textToSpeak = "";
        if (type === 'text') {
          textToSpeak = `تم الإرسال`;
        } else if (type === 'voice') {
          textToSpeak = `ملاحظة صوتية`;
        } else if (type === 'ptt') {
          textToSpeak = `نداء لاسلكي`;
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'ar-SA';
        utterance.rate = 1.15; // slightly faster rate for snappier alerts
        
        // Find best Arabic voice
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arabicVoice) {
          utterance.voice = arabicVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("⚠️ Speech synthesis failed:", e);
    }
  }

  // Speak a generic short text message via Text-to-Speech
  speakText(textToSpeak: string) {
    try {
      this.unlockAudio();
      
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'ar-SA';
        utterance.rate = 1.15; // clean and fast
        
        // Find best Arabic voice
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arabicVoice) {
          utterance.voice = arabicVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("⚠️ Speech synthesis failed:", e);
    }
  }
}

export const radioAudio = new RadioSoundEffects();
