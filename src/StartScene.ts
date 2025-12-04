import Phaser from "phaser";
import { addMuteButton } from "./ui/Buttons";
import { Music } from "./Music";

export default class StartScene extends Phaser.Scene {
  constructor() { super("Start"); }

    preload() {
    this.load.image("startBg", "assets/ui/davis_combined.png"); 
    this.load.image("playBtn", "assets/ui/play.png"); 
    this.load.image("title", "assets/ui/title.png");
  }
  create() {
    const { width: W, height: H } = this.scale;

    Music.play(this);

    const bg = this.add.image(0, 0, "startBg").setOrigin(0);
    const title = this.add.image(W / 2, H * 0.25, "title");
    // Scale to fill screen while preserving aspect ratio

    const scale = Math.max(W / bg.width, H / bg.height);
    bg.setScale(scale);
    title.setScale(0.25);

    // --- Play button image ---
    const playButton = this.add.image(W * 0.5, H * 0.72, "playBtn");

    playButton.setScale(0.25);

    playButton.setInteractive({ useHandCursor: true });

    const baseScale = playButton.scale;

    // Hover feedback
    playButton.on("pointerover", () => {
      playButton.setScale(baseScale * 1.05);
    });

    playButton.on("pointerout", () => {
      playButton.setScale(baseScale);
      playButton.clearTint();
    });

    // Click feedback
    playButton.on("pointerdown", () => {
      playButton.setScale(baseScale * 0.95);
      playButton.setTint(0xfff3c4);
    });

    playButton.on("pointerup", () => {
      playButton.setScale(baseScale * 1.05);
      playButton.clearTint();
      this.startGame();
    });

    // Keyboard: Enter / Space start game
    this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "Space") {
        this.startGame();
      }
    });

    // Mute button on top of everything
    addMuteButton(this);
  }

  private startGame() {
    this.scene.start("Play");
  }
}