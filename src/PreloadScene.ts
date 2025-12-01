import Phaser from "phaser";
import  TTS  from "./utils/TTS";

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
    // Initialize TTS system
    TTS.init();
    // Load audio
    this.load.audio("bgm", "./assets/audio/Test.mp3");
    this.load.image("btnPause", "assets/ui/pause.png");
    this.load.image("btnSoundOn", "assets/ui/sound_on.png");
    this.load.image("btnSoundOff", "assets/ui/sound_off.png");
  }

  create() {
    // Once loaded, go to Start screen
    this.scene.start("Start");
  }
}