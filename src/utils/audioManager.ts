// 音频管理模块

class AudioManager {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isEnabled: boolean = true;
  private volume: number = 0.7;

  // 初始化音频文件
  constructor() {
    this.preloadAudio();
    this.initializeAudioContext();
  }

  // 初始化Web Audio API上下文
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API不可用，将使用HTML5 Audio');
    }
  }

  // 预加载音频文件
  private async preloadAudio(): Promise<void> {
    // 卖出信号提示音
    await this.loadAudio('sell', 'https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3');
    // 买入信号提示音
    await this.loadAudio('buy', 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-back-2575.mp3');
    // 预警提示音
    await this.loadAudio('alert', 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3');
  }

  // 加载音频文件
  private async loadAudio(id: string, url: string): Promise<void> {
    // 创建HTML5 Audio元素作为备用
    const htmlAudio = new Audio(url);
    htmlAudio.volume = this.volume;
    this.audioElements.set(id, htmlAudio);

    // 如果支持Web Audio API，加载音频缓冲区
    if (this.audioContext) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.audioBuffers.set(id, audioBuffer);
      } catch (error) {
        console.warn(`加载音频缓冲区失败: ${id}`, error);
      }
    }
  }

  // 播放音频（优先使用Web Audio API，后台也能播放）
  play(id: string): void {
    if (!this.isEnabled) return;
    
    // 优先使用Web Audio API
    if (this.audioContext && this.audioBuffers.has(id)) {
      this.playWithWebAudio(id);
    } else {
      // 回退到HTML5 Audio
      this.playWithHtmlAudio(id);
    }
  }

  // 使用Web Audio API播放（后台也能播放）
  private playWithWebAudio(id: string): void {
    if (!this.audioContext) return;

    const buffer = this.audioBuffers.get(id);
    if (!buffer) return;

    // 确保音频上下文处于激活状态
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = this.volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
  }

  // 使用HTML5 Audio播放（备用方案）
  private playWithHtmlAudio(id: string): void {
    const audio = this.audioElements.get(id);
    if (audio) {
      // 重置音频并播放
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('播放音频失败:', error);
      });
    }
  }

  // 播放卖出信号提示音
  playSellAlert(): void {
    this.play('sell');
  }

  // 播放买入信号提示音
  playBuyAlert(): void {
    this.play('buy');
  }

  // 播放预警提示音
  playAlert(): void {
    this.play('alert');
  }

  // 设置音量
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audioElements.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  // 启用/禁用音频
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // 检查是否启用
  getEnabled(): boolean {
    return this.isEnabled;
  }

  // 获取当前音量
  getVolume(): number {
    return this.volume;
  }
}

// 导出单例实例
let audioManagerInstance: AudioManager | null = null;

export const getAudioManager = (): AudioManager => {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
};

// 便捷方法
export const playSellAlert = (): void => {
  getAudioManager().playSellAlert();
};

export const playBuyAlert = (): void => {
  getAudioManager().playBuyAlert();
};

export const playAlert = (): void => {
  getAudioManager().playAlert();
};