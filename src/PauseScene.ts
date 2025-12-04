import Phaser from "phaser";
import  TTS  from "./utils/TTS"; 

export default class PauseScene extends Phaser.Scene {
  private ttsEnabled = false;
  private ttsButton!: Phaser.GameObjects.Text;

  constructor() {
    super("Pause");
  }

  init() {
    // read previous TTS state from registry if available
    const existing = this.registry.get("ttsEnabled");
    if (typeof existing === "boolean") {
      this.ttsEnabled = existing;
    }

    // make sure TTS helper is initialized and synced
    TTS.init();
    TTS.enabled = this.ttsEnabled;
  }

  preload() {
    this.load.image("resumeBtn", "assets/images/resumeBtn.png");
    this.load.image("restartBtn", "assets/images/restartBtn.png");
    this.load.image("homeBtn", "assets/images/homeBtn.png");
  }

  create(data: { from: string }) {
    const { width: W, height: H } = this.scale;

    // Dark full-screen overlay
    this.add
      .rectangle(W / 2, H / 2, W, H, 0x000000, 0.4)
      .setOrigin(0.5);

    // Panel background
    const panelW = W * 0.6;
    const panelH = H * 0.5;

    const panelBg = this.add
      .rectangle(W / 2, H / 2, panelW, panelH, 0x29587F, 0.95)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff);

    // Title
    this.add
      .text(W / 2, panelBg.y - panelH / 2 + 40, "PAUSED", {
        fontSize: "32px",
        color: "#ffffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    // --- TTS Toggle Button ---
    this.ttsButton = this.add
      .text(W / 2, panelBg.y - panelH / 2 + 80, this.ttsLabel(), {
        fontSize: "20px",
        color: "#ffffff",
        fontFamily: "Arial",
        backgroundColor: "#333333",
        padding: { left: 10, right: 10, top: 6, bottom: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.ttsButton.on("pointerover", () => {
      this.ttsButton.setBackgroundColor("#444444");
    });

    this.ttsButton.on("pointerout", () => {
      this.ttsButton.setBackgroundColor("#333333");
    });

    this.ttsButton.on("pointerdown", () => {
      this.toggleTTS();
    });

    // Resume Button (Image)
    const resumeBtn = this.add
      .image(panelBg.x - panelW * 0.25, panelBg.y + 40, "resumeBtn")
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScale(0.2);

    resumeBtn.on("pointerover", () => resumeBtn.setTint(0xdddddd));
    resumeBtn.on("pointerout", () => resumeBtn.clearTint());
    resumeBtn.on("pointerdown", () => {
      this.scene.stop();
      this.scene.resume(data.from);
    });

    // Restart Button (Image)
    const restartBtn = this.add
      .image(panelBg.x, panelBg.y + 40, "restartBtn")
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScale(0.2);

    restartBtn.on("pointerover", () => restartBtn.setTint(0xdddddd));
    restartBtn.on("pointerout", () => restartBtn.clearTint());
    restartBtn.on("pointerdown", () => {
      this.scene.stop();
      this.scene.stop(data.from);
      this.scene.start(data.from);
    });

    // Home Button (Image)
    const homeBtn = this.add
      .image(panelBg.x + panelW * 0.25, panelBg.y + 40, "homeBtn")
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScale(0.2);

    homeBtn.on("pointerover", () => homeBtn.setTint(0xdddddd));
    homeBtn.on("pointerout", () => homeBtn.clearTint());
    homeBtn.on("pointerdown", () => {
      this.scene.stop(data.from);
      this.scene.start("Play");
      this.scene.stop();
    });

    // Allow ESC to unpause as well
    this.input.keyboard?.on("keydown-ESC", () => {
      this.scene.stop();
      this.scene.resume(data.from);
    });

    // Keyboard: T toggles TTS
    this.input.keyboard?.on("keydown-T", () => {
      this.toggleTTS();
    });
  }

  private ttsLabel() {
    return `TTS (T): ${this.ttsEnabled ? "On" : "Off"}`;
  }

  private toggleTTS() {
    this.ttsEnabled = !this.ttsEnabled;
    this.ttsButton.setText(this.ttsLabel());

    // update helper + registry so other scenes can read it
    TTS.enabled = this.ttsEnabled;
    this.registry.set("ttsEnabled", this.ttsEnabled);

    // Optional: little feedback
    if (this.ttsEnabled) {
      TTS.speak("Text to speech enabled");
    } else {
      TTS.stop();
    }
  }
}
