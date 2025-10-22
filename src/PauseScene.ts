import Phaser from "phaser";

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super("Pause");
    }

    preload() {
        this.load.image('resumeBtn', 'assets/images/resumeBtn.png');
        this.load.image('restartBtn', 'assets/images/restartBtn.png');
        this.load.image('homeBtn', 'assets/images/homeBtn.png');
    }

    create(data: { from: string }) {
        const { width: W, height: H } = this.scale;

        // Semi-transparent overlay
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.15);

        this.add.text(W / 2, H * 0.3, "PAUSED", { fontSize: "32px" }).setOrigin(0.5);

        // Resume Button (Image)
        const resumeBtn = this.add.image(W * 0.2, H * 0.5, 'resumeBtn')
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setScale(0.2); // Adjust scale if needed (e.g., 0.5 for half size)

        resumeBtn.on("pointerover", () => resumeBtn.setTint(0xdddddd));
        resumeBtn.on("pointerout", () => resumeBtn.clearTint());
        resumeBtn.on("pointerdown", () => {
            this.scene.stop();
            this.scene.resume(data.from);
        });

        // Restart Button (Image)
        const restartBtn = this.add.image(W * 0.5, H * 0.5, 'restartBtn')
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
        const homeBtn = this.add.image(W * 0.8, H * 0.5, 'homeBtn')
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
    }
}
