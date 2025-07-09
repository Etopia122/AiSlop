class Audio {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        this.masterVolume = 1.0;
        this.soundVolume = 0.7;
        this.musicVolume = 0.5;
        this.muted = false;
        
        // Audio context for Web Audio API
        this.audioContext = null;
        this.gainNode = null;
        
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.masterVolume;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // Load a sound effect
    loadSound(name, url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.addEventListener('canplaythrough', () => {
                this.sounds[name] = audio;
                resolve(audio);
            });
            audio.addEventListener('error', reject);
            audio.src = url;
        });
    }

    // Load background music
    loadMusic(name, url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.loop = true;
            audio.addEventListener('canplaythrough', () => {
                this.music[name] = audio;
                resolve(audio);
            });
            audio.addEventListener('error', reject);
            audio.src = url;
        });
    }

    // Play a sound effect
    playSound(name, volume = 1.0) {
        if (this.muted || !this.sounds[name]) return;
        
        const sound = this.sounds[name];
        sound.volume = volume * this.soundVolume * this.masterVolume;
        sound.currentTime = 0;
        
        // Clone the audio for overlapping sounds
        const clonedSound = sound.cloneNode();
        clonedSound.volume = sound.volume;
        clonedSound.play().catch(e => console.warn('Could not play sound:', e));
    }

    // Play background music
    playMusic(name, volume = 1.0) {
        if (this.muted || !this.music[name]) return;
        
        // Stop current music
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
        
        this.currentMusic = this.music[name];
        this.currentMusic.volume = volume * this.musicVolume * this.masterVolume;
        this.currentMusic.play().catch(e => console.warn('Could not play music:', e));
    }

    // Stop current music
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
        }
    }

    // Pause current music
    pauseMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
        }
    }

    // Resume paused music
    resumeMusic() {
        if (this.currentMusic) {
            this.currentMusic.play().catch(e => console.warn('Could not resume music:', e));
        }
    }

    // Set master volume
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.value = this.masterVolume;
        }
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume * this.masterVolume;
        }
    }

    // Set sound effects volume
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }

    // Set music volume
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume * this.masterVolume;
        }
    }

    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }
    }

    // Create simple sound effects using Web Audio API
    createBeep(frequency = 440, duration = 0.1, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Mario-specific sound effects
    playJumpSound() {
        this.createBeep(523, 0.1, 'square'); // C5 note
    }

    playCoinSound() {
        this.createBeep(659, 0.1, 'sine'); // E5 note
        setTimeout(() => {
            this.createBeep(784, 0.1, 'sine'); // G5 note
        }, 50);
    }

    playPowerUpSound() {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.createBeep(note, 0.2, 'sine');
            }, index * 100);
        });
    }

    playEnemyDeathSound() {
        this.createBeep(220, 0.2, 'square'); // A3 note
    }

    playPlayerDeathSound() {
        const notes = [523, 494, 440, 392, 349, 311, 277, 247]; // Descending scale
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.createBeep(note, 0.1, 'square');
            }, index * 50);
        });
    }

    playFireballSound() {
        this.createBeep(880, 0.05, 'sawtooth'); // A5 note
    }

    playBlockBreakSound() {
        this.createBeep(196, 0.15, 'square'); // G3 note
    }

    playWarpSound() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createBeep(440 + i * 100, 0.05, 'sine');
            }, i * 25);
        }
    }

    // Load all Mario-style sounds
    async loadAllSounds() {
        const soundPromises = [];
        
        // Create placeholder sounds if no files available
        const sounds = {
            jump: () => this.playJumpSound(),
            coin: () => this.playCoinSound(),
            powerup: () => this.playPowerUpSound(),
            enemy_death: () => this.playEnemyDeathSound(),
            player_death: () => this.playPlayerDeathSound(),
            fireball: () => this.playFireballSound(),
            block_break: () => this.playBlockBreakSound(),
            warp: () => this.playWarpSound()
        };
        
        // Store the generated sounds
        Object.keys(sounds).forEach(key => {
            this.sounds[key] = { play: sounds[key] };
        });
        
        return Promise.resolve();
    }

    // Clean up resources
    destroy() {
        this.stopMusic();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}