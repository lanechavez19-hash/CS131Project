import Phaser from "phaser";
import { Settings } from "./Settings";

/**
 * Creates a mute and pause button in the given scene.
 * @param scene - Phaser.Scene to place the button in
 * @param x - X position
 * @param y - Y position
 **/

export function addMuteButton(scene: Phaser.Scene, x = 60, y = 20) {
  const btn = scene.add.text(x, y, Settings.muted ? "🔇" : "🔊", {
    fontSize: "28px",
    color: "#00324d",
  })
  .setOrigin(0, 0)                    
  .setInteractive({ cursor: "pointer" })

  // apply current state
  scene.sound.mute = Settings.muted;
  scene.game.sound.mute = Settings.muted;

  btn.on("pointerdown", () => {
    Settings.muted = !Settings.muted;
    scene.sound.mute = Settings.muted;
    scene.game.sound.mute = Settings.muted;
    btn.setText(Settings.muted ? "🔇" : "🔊");
  });

  return btn;
}

export function addPauseButton(scene: Phaser.Scene, x = 20, y = 20) {
    const pauseBtn = scene.add
        .text(x, y, "⏸", { fontSize: "28px", color: "#00324d" })
        .setInteractive({ cursor: "pointer" });

    pauseBtn.on("pointerdown", () => {
        scene.scene.launch("Pause", { from: scene.scene.key }); 
        scene.scene.pause();
    });

    // ESC also opens pause
    scene.input.keyboard?.on("keydown-ESC", () => {
        scene.scene.launch("Pause", { from: scene.scene.key });
        scene.scene.pause();
    });

    return pauseBtn;
}

export function addControlButtons(scene: Phaser.Scene) {
  addPauseButton(scene, 20, 18);
  addMuteButton(scene, 50, 20);
}


