// 音频管理模块

class AudioManager {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private isEnabled: boolean = true;
  private volume: number = 0.7;

  // 初始化音频文件
  constructor() {
    this.preloadAudio();
  }

  // 预加载音频文件
  private preloadAudio(): void {
    // 卖出信号提示音
    this.createAudio('sell', 'https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3');
    // 买入信号提示音
    this.createAudio('buy', 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-back-2575.mp3');
    // 预警提示音
    this.createAudio('alert', 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3');
  }

  // 创建音频元素
  private createAudio(id: string, url: string): void {
    const audio = new Audio(url);
    audio.volume = this.volume;
    this.audioElements.set(id, audio);
  }

  // 播放音频
  play(id: string): void {
    if (!this.isEnabled) return;
    
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