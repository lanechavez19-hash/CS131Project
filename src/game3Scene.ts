import Phaser from "phaser";
import { addControlButtons } from "./ui/Buttons";

export default class Game3Scene extends Phaser.Scene {
  constructor() { super("Game3"); }

  create() {
    const { width: W } = this.scale;

    this.add.text(W/2, 100, "Camp/Wildlife Game", { fontSize: "28px" }).setOrigin(0.5);

    // Add a pause and mute button to this scene (top-left corner), see ui/Buttons.ts
    addControlButtons(this);
  }
}