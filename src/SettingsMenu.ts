// src/SettingsMenu.ts
//
// A reusable Phaser 3 TypeScript scene that works as a modal settings/pause menu.
// - Toggles global mute
// - Toggles TTS (uses Web Speech API and stores flag in registry/localStorage)
// - Global volume slider (0..1) that controls this.sound.volume
// - Acts as a pause: pauses target scenes passed in when opened, and resumes them on close
// - Emits 'settings:changed' on this.game.events with the updated state
//
// Usage examples:
//  this.scene.launch('SettingsMenu', { pauseTargets: ['GameScene'] });
//  this.scene.bringToTop('SettingsMenu');
//
// Persisted into localStorage under key "gameSettings"

import Phaser from "phaser";

type SavedSettings = {
    muted: boolean;
    volume: number;
    ttsEnabled: boolean;
};

const STORAGE_KEY = 'gameSettings';

export default class SettingsMenu extends Phaser.Scene {
    private overlay!: Phaser.GameObjects.Rectangle;
    private panel!: Phaser.GameObjects.Container;
    private muteButton!: Phaser.GameObjects.Text;
    private ttsButton!: Phaser.GameObjects.Text;
    private sliderTrack!: Phaser.GameObjects.Rectangle;
    private sliderKnob!: Phaser.GameObjects.Ellipse;
    private volumeLabel!: Phaser.GameObjects.Text;

    private pausedTargets: string[] = [];
    private savedSettings: SavedSettings = {
        muted: false,
        volume: 1,
        ttsEnabled: false,
    };

    constructor() {
        super({ key: 'SettingsMenu' });
    }

    init(data?: { pauseTargets?: string[] }) {
        if (data && Array.isArray(data.pauseTargets)) {
            this.pausedTargets = data.pauseTargets;
        } else {
            this.pausedTargets = []; // caller can set
        }

        // load saved settings
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as Partial<SavedSettings>;
                this.savedSettings = {
                    muted: parsed.muted ?? false,
                    volume: parsed.volume ?? 1,
                    ttsEnabled: parsed.ttsEnabled ?? false,
                };
            } catch (e) {
                // ignore parse errors
            }
        }

        // apply to sound manager
        if (this.sound) {
            this.sound.mute = this.savedSettings.muted;
            this.sound.volume = this.savedSettings.volume;
        }

        // register tts flag in registry for other scenes to read
        this.registry.set('ttsEnabled', this.savedSettings.ttsEnabled);
    }

    create() {
        const { width, height } = this.scale;

        // Pause requested scenes
        this.pauseTargets();

        // Overlay to darken background and close when clicking outside panel
        this.overlay = this.add
            .rectangle(0, 0, width, height, 0x000000, 0.6)
            .setOrigin(0)
            .setInteractive()
            .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                // close only when clicked outside panel area
                if (!this.panel.getBounds().contains(pointer.x, pointer.y)) {
                    this.close();
                }
            });

        // Panel
        const panelW = Math.min(560, width * 0.8);
        const panelH = 300;
        const panelX = width / 2;
        const panelY = height / 2;
        

        const title = this.add
            .text(-panelW / 2 + 22, -panelH / 2 + 18, 'Settings', {
                color: '#ffffff',
                fontSize: '22px',
                fontFamily: 'Arial',
            })
            .setOrigin(0);

        // Mute button
        this.muteButton = this.add
            .text(-panelW / 2 + 22, -panelH / 2 + 60, this.muteLabel(), {
                color: '#ffffff',
                fontSize: '18px',
                fontFamily: 'Arial',
                backgroundColor: '#333333',
                padding: { left: 10, right: 10, top: 6, bottom: 6 },
            })
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => this.toggleMute());

        // TTS toggle
        this.ttsButton = this.add
            .text(-panelW / 2 + 22, -panelH / 2 + 110, this.ttsLabel(), {
                color: '#ffffff',
                fontSize: '18px',
                fontFamily: 'Arial',
                backgroundColor: '#333333',
                padding: { left: 10, right: 10, top: 6, bottom: 6 },
            })
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => this.toggleTts());

        // Volume slider
        const trackW = panelW - 44;
        const trackH = 8;
        this.volumeLabel = this.add.text(-panelW / 2 + 22, 20, 'Volume', {
            color: '#ffffff',
            fontSize: '16px',
            fontFamily: 'Arial',
        });

        this.sliderTrack = this.add
            .rectangle(0, 60, trackW, trackH, 0x555555)
            .setOrigin(0, 0.5)
            .setInteractive({ cursor: 'pointer' });

        // knob
        const knobSize = 18;
        const knobX = this.valueToX(this.savedSettings.volume, trackW);
        this.sliderKnob = this.add
            .ellipse(knobX, 60, knobSize, knobSize, 0xffffff)
            .setStrokeStyle(2, 0x111111)
            .setInteractive({ draggable: true, useHandCursor: true });

        // current volume text
        const volText = this.add
            .text(trackW / 2 + 10, 60, `${Math.round(this.savedSettings.volume * 100)}%`, {
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'Arial',
            })
            .setOrigin(0, 0.5);

        // slider events
        this.input.setDraggable(this.sliderKnob);
        this.sliderKnob.on('dragstart', () => {});
        this.sliderKnob.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            // clamp local X to track
            const localMin = -panelW / 2 + 22;
            const trackLeft = localMin;
            const trackRight = localMin + trackW;
            const clampedX = Phaser.Math.Clamp(dragX, trackLeft, trackRight);
            this.sliderKnob.x = clampedX;
            // map to 0..1
            const relativeX = clampedX - trackLeft;
            const v = Phaser.Math.Clamp(relativeX / trackW, 0, 1);
            this.setVolume(v);
            volText.setText(`${Math.round(v * 100)}%`);
        });

        // click on track to set volume
        this.sliderTrack.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // convert to panel-local coords
            const localX = pointer.x - (panelX - panelW / 2);
            const v = Phaser.Math.Clamp(localX / trackW, 0, 1);
            const knobXPos = this.valueToX(v, trackW);
            this.sliderKnob.x = knobXPos;
            this.setVolume(v);
            volText.setText(`${Math.round(v * 100)}%`);
        });

        // Close button
        const closeButton = this.add
            .text(panelW / 2 - 18, -panelH / 2 + 12, '✕', {
                color: '#ffffff',
                fontSize: '18px',
                fontFamily: 'Arial',
            })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => this.close());

        // Layout container - everything is relative to center
        const panelBg = this.add
        .rectangle(0, 0, panelW, panelH, 0x111827, 0.95)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0xffffff);

        this.panel = this.add.container(panelX, panelY, [
            panelBg,
            title,
            this.muteButton,
            this.ttsButton,
            this.volumeLabel,
            this.sliderTrack,
            this.sliderKnob,
            volText,
            closeButton,
        ]);

        // initially position slider knob relative to panel
        this.sliderKnob.x = this.valueToX(this.savedSettings.volume, trackW);
        this.sliderKnob.y = this.volumeLabel.y + 40;

        // keyboard close (ESC)
        this.input.keyboard!.on('keydown-ESC', () => this.close());

        // simple show animation
        this.panel.setScale(0.8).setAlpha(0);
        this.tweens.add({
            targets: this.panel,
            alpha: 1,
            scale: 1,
            duration: 180,
            ease: 'Back.easeOut',
        });
    }

    private pauseTargets() {
        // Pause each target if it's running
        const running = this.scene.manager.getScenes(true);
        // If no targets provided, pause all scenes except this one and the Boot/Plugin scenes
        if (this.pausedTargets.length === 0) {
            for (const s of running) {
                if (s.scene.key !== this.scene.key) {
                    this.scene.pause(s.scene.key);
                }
            }
        } else {
            for (const key of this.pausedTargets) {
                if (this.scene.isActive(key)) {
                    this.scene.pause(key);
                }
            }
        }
    }

    private resumeTargets() {
        if (this.pausedTargets.length === 0) {
            // resume all paused scenes except this
            const all = this.scene.manager.getScenes(false);
            for (const s of all) {
                if (s.scene.key !== this.scene.key && this.scene.isPaused(s.scene.key)) {
                    this.scene.resume(s.scene.key);
                }
            }
        } else {
            for (const key of this.pausedTargets) {
                if (this.scene.isPaused(key)) {
                    this.scene.resume(key);
                }
            }
        }
    }

    private muteLabel() {
        return this.savedSettings.muted ? 'Unmute' : 'Mute';
    }

    private ttsLabel() {
        return `TTS: ${this.savedSettings.ttsEnabled ? 'On' : 'Off'}`;
    }

    private toggleMute() {
        this.savedSettings.muted = !this.savedSettings.muted;
        if (this.sound) {
            this.sound.mute = this.savedSettings.muted;
        }
        this.muteButton.setText(this.muteLabel());
        this.saveSettings();
        this.emitChanged();
    }

    private toggleTts() {
        // check for SpeechSynthesis availability
        const hasSS = typeof window !== 'undefined' && 'speechSynthesis' in window;
        if (!hasSS) {
            // silent fail: set flag but no actual engine
            console.warn('TTS not supported in this environment');
        }
        this.savedSettings.ttsEnabled = !this.savedSettings.ttsEnabled;
        this.ttsButton.setText(this.ttsLabel());
        this.registry.set('ttsEnabled', this.savedSettings.ttsEnabled);
        this.saveSettings();
        this.emitChanged();
    }

    private valueToX(v: number, trackW: number) {
        // convert 0..1 to panel local x position (relative to track left)
        const panelLeft = -this.panel.width / 2 + 22;
        return panelLeft + Phaser.Math.Clamp(v * trackW, 0, trackW);
    }

    private setVolume(v: number) {
        this.savedSettings.volume = Phaser.Math.Clamp(v, 0, 1);
        if (this.sound) {
            this.sound.volume = this.savedSettings.volume;
        }
        this.saveSettings();
        this.emitChanged();
    }

    private saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.savedSettings));
        } catch (e) {
            // ignore localStorage errors (e.g., in some privacy modes)
        }
    }

    private emitChanged() {
        this.game.events.emit('settings:changed', {
            muted: this.savedSettings.muted,
            volume: this.savedSettings.volume,
            ttsEnabled: this.savedSettings.ttsEnabled,
        });
    }

    private close() {
        // nice hide animation, then stop the scene
        this.tweens.add({
            targets: this.panel,
            alpha: 0,
            scale: 0.9,
            duration: 140,
            ease: 'Power1',
            onComplete: () => {
                this.resumeTargets();
                this.scene.stop();
            },
        });
    }
}