import Phaser from "phaser";
import { addMuteButton } from "./ui/Buttons";
import { Music } from "./Music";

export default class StartScene extends Phaser.Scene {
  constructor() { super("Start"); }

  create() {
    const { width: W, height: H } = this.scale;
    Music.play(this);
    this.add.text(W / 2, H * 0.35, "Davis Toad", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "36px",
      color: "#073b4c"
    }).setOrigin(0.5);

    const btn = this.add.rectangle(W / 2, H * 0.6, 180, 52, 0xffffff)
      .setStrokeStyle(3, 0x123456)
      .setInteractive({ cursor: "pointer" });

    this.add.text(btn.x, btn.y, "Start", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "22px",
      color: "#123456",
      fontStyle: "bold"
    }).setOrigin(0.5);

    btn.on("pointerdown", () => this.scene.start("Play"));
    this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "Space") {
        this.scene.start("Play");
      }
    });

    this.add.text(W / 2, H * 0.85, "Press Enter/Space or Click Start", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      color: "#0b3d5c"
    }).setOrigin(0.5);

    addMuteButton(this);
  }
}