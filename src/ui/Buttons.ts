import Phaser from "phaser";
import { Settings } from "./Settings";

/**
 * Create a mute/unmute button in the given scene.
 * Default position: top-left.
 */
export function addMuteButton(
  scene: Phaser.Scene,
  x = 100,
  y = 30,
  baseScale = 0.7
) {
  const textureKey = Settings.muted ? "btnSoundOff" : "btnSoundOn";

  const btn = scene.add
    .image(x, y, textureKey)
    .setInteractive({ useHandCursor: true });

  btn.setScale(baseScale);

  // apply current audio state
  scene.sound.mute = Settings.muted;
  scene.game.sound.mute = Settings.muted;

  // hover feedback
  btn.on("pointerover", () => {
    btn.setScale(baseScale * 1.15);
  });

  btn.on("pointerout", () => {
    btn.setScale(baseScale);
    btn.clearTint();
  });

  // click feedback + toggle
  btn.on("pointerdown", () => {
    btn.setScale(baseScale * 0.9);
    btn.setTint(0xfff3c4);
  });

  btn.on("pointerup", () => {
    Settings.muted = !Settings.muted;
    scene.sound.mute = Settings.muted;
    scene.game.sound.mute = Settings.muted;

    btn.setTexture(Settings.muted ? "btnSoundOff" : "btnSoundOn");
    btn.setScale(baseScale * 1.15);
    btn.clearTint();
  });

  return btn;
}

/**
 * Pause button that opens the Pause scene.
 * Default position: top-left.
 */
export function addPauseButton(
  scene: Phaser.Scene,
  x = 50,
  y = 40,
  baseScale = 0.7
) {
  const pauseBtn = scene.add
    .image(x, y, "btnPause")
    .setInteractive({ useHandCursor: true });

  pauseBtn.setScale(baseScale);

  const openPause = () => {
    pauseBtn.setTint(0xfff3c4);
    pauseBtn.setScale(baseScale * 0.9);

    scene.scene.launch("Pause", { from: scene.scene.key });
    scene.scene.pause();
  };

  // hover feedback
  pauseBtn.on("pointerover", () => {
    pauseBtn.setScale(baseScale * 1.15);
  });

  pauseBtn.on("pointerout", () => {
    pauseBtn.setScale(baseScale);
    pauseBtn.clearTint();
  });

  pauseBtn.on("pointerdown", openPause);

  // ESC also opens pause
  scene.input.keyboard?.on("keydown-ESC", openPause);

  return pauseBtn;
}

/**
 * Convenience helper to add both pause + mute buttons.
 * Top-left by default.
 */
export function addControlButtons(scene: Phaser.Scene) {
  addPauseButton(scene, 50, 40);
  addMuteButton(scene, 110, 40);
}
