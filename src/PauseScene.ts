import Phaser from "phaser";

export default class PauseScene extends Phaser.Scene {
  constructor() { super("Pause"); }

  create(data: { from: string }) {
    const { width: W, height: H } = this.scale;

    // Semi-transparent overlay
    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.15);

    this.add.text(W/2, H*0.3, "PAUSED", { fontSize: "32px" }).setOrigin(0.5);
    
    // Resume Button
    const resumeBtn = this.add.text(W*0.2, H*0.7, "Resume", { color:"#000",fontSize: "24px", backgroundColor: "#fff" })
      .setOrigin(0.5).setInteractive({ cursor: "pointer" });
    resumeBtn.on("pointerdown", () => {
      this.scene.stop();
      this.scene.resume(data.from);
    });
    
    // Restart Button
    const restartBtn = this.add.text(W*0.5, H*0.7, "Restart", { color:"#000",fontSize: "24px", backgroundColor: "#fff" })
      .setOrigin(0.5).setInteractive({ cursor: "pointer" });
    restartBtn.on("pointerdown", () => {
      this.scene.stop();
      this.scene.stop(data.from);
      this.scene.start(data.from);
    });

    // Home Button
    const homeBtn = this.add.text(W*0.8, H*0.7, "Home", { color:"#000",fontSize: "24px", backgroundColor: "#fff" })
      .setOrigin(0.5).setInteractive({ cursor: "pointer" });
    homeBtn.on("pointerdown", () => {
      this.scene.stop(data.from);
      this.scene.start("Play");
      this.scene.stop();
    });
  }
}