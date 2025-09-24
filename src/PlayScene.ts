import Phaser from "phaser";
import { addMuteButton } from "./ui/Buttons";

export default class PlayScene extends Phaser.Scene {
  constructor() { super("Play"); }      
  create() {
    
    const { width: W, height: H } = this.scale;

    this.add.text(W/2, H*0.2, "Choose a Mission", { fontSize: "32px" }).setOrigin(0.5);
    // Buttons to launch game scenes, these are just place holders for now
    const makeBtn = (x: number, y: number, label: string, target: string) => {
      const btn = this.add.text(x, y, label, { color: "#000000", fontSize: "24px", backgroundColor: "#fff" })
        .setOrigin(0.5).setInteractive({ cursor: "pointer" });
      btn.on("pointerdown", () => this.scene.start(target));
    };

    makeBtn(W*0.3,H*0.4, "Storm Water", "Game1");
    makeBtn(W*0.7,H*0.4, "Recycling", "Game2");
    makeBtn(W*0.5,H*0.7, "Camping / Wildlife", "Game3");
    addMuteButton(this);
  }
}