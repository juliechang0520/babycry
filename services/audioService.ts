
class AudioService {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create white noise buffer
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 0;

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'bandpass';
    this.filterNode.frequency.value = 1200;
    this.filterNode.Q.value = 0.5;

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
    
    this.noiseNode.start();
  }

  update(velocity: number) {
    if (!this.gainNode || !this.ctx || !this.filterNode) return;
    
    // Resume context if suspended (browser security)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const targetGain = Math.min(velocity * 0.5, 0.4);
    // Smooth transition for audio gain
    this.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    
    // Jitter the filter for that "crunchy" sound
    const jitter = Math.random() * 500 * (velocity > 0 ? 1 : 0);
    this.filterNode.frequency.setTargetAtTime(1000 + jitter + velocity * 1000, this.ctx.currentTime, 0.05);
  }

  stop() {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }
}

export const audioService = new AudioService();
