// 音频管理模块
class AudioManager {
    // 初始化音频文件
    constructor() {
        Object.defineProperty(this, "audioElements", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "audioContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "audioBuffers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "isEnabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "volume", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.7
        });
        this.preloadAudio();
        this.initializeAudioContext();
    }
    // 初始化Web Audio API上下文
    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        catch (error) {
            console.warn('Web Audio API不可用，将使用HTML5 Audio');
        }
    }
    // 预加载音频文件
    async preloadAudio() {
        // 卖出信号提示音 - 使用更长的警报声音
        await this.loadAudio('sell', 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
        // 买入信号提示音
        await this.loadAudio('buy', 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-back-2575.mp3');
        // 预警提示音
        await this.loadAudio('alert', 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3');
    }
    // 加载音频文件
    async loadAudio(id, url) {
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
            }
            catch (error) {
                console.warn(`加载音频缓冲区失败: ${id}`, error);
            }
        }
    }
    // 播放音频（优先使用Web Audio API，后台也能播放）
    play(id) {
        if (!this.isEnabled)
            return;
        // 优先使用Web Audio API
        if (this.audioContext && this.audioBuffers.has(id)) {
            this.playWithWebAudio(id);
        }
        else {
            // 回退到HTML5 Audio
            this.playWithHtmlAudio(id);
        }
    }
    // 使用Web Audio API播放（后台也能播放）
    playWithWebAudio(id) {
        if (!this.audioContext)
            return;
        const buffer = this.audioBuffers.get(id);
        if (!buffer)
            return;
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
    playWithHtmlAudio(id) {
        const audio = this.audioElements.get(id);
        if (audio) {
            // 重置音频并播放
            audio.currentTime = 0;
            audio.play().catch(error => {
                console.error('播放音频失败:', error);
            });
        }
    }
    // 播放卖出信号提示音 - 重复播放3次以确保用户听到
    playSellAlert() {
        // 立即播放第一次
        this.play('sell');
        // 延迟播放第二次
        setTimeout(() => {
            this.play('sell');
        }, 1000);
        // 延迟播放第三次
        setTimeout(() => {
            this.play('sell');
        }, 2000);
    }
    // 播放买入信号提示音
    playBuyAlert() {
        this.play('buy');
    }
    // 播放预警提示音
    playAlert() {
        this.play('alert');
    }
    // 设置音量
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audioElements.forEach(audio => {
            audio.volume = this.volume;
        });
    }
    // 启用/禁用音频
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    // 检查是否启用
    getEnabled() {
        return this.isEnabled;
    }
    // 获取当前音量
    getVolume() {
        return this.volume;
    }
}
// 导出单例实例
let audioManagerInstance = null;
export const getAudioManager = () => {
    if (!audioManagerInstance) {
        audioManagerInstance = new AudioManager();
    }
    return audioManagerInstance;
};
// 便捷方法
export const playSellAlert = () => {
    getAudioManager().playSellAlert();
};
export const playBuyAlert = () => {
    getAudioManager().playBuyAlert();
};
export const playAlert = () => {
    getAudioManager().playAlert();
};
