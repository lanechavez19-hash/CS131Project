import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  preload() {
    // Show a loading text
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, "Loading...", {
      fontSize: "24px",
      color: "#00324d",
    }).setOrigin(0.5);

    // Load audio
    this.load.audio("bgm", "./assets/audio/Test.mp3");

    // Example: load images too
    // this.load.image("frog", "assets/images/frog.png");
  }

  create() {
    // Once loaded, go to Start screen
    this.scene.start("Start");
  }
}