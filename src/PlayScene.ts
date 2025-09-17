import Phaser from "phaser";

export default class PlayScene extends Phaser.Scene {
  constructor() { super("Play"); }      
  create() {
    const { width: W, height: H } = this.scale;
    this.add.text(W/2, H/2, "Game Goes Here", { fontSize: "28px" }).setOrigin(0.5);
  }
}