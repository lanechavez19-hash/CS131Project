import Phaser from "phaser";
import { Settings } from "./ui/Settings";

export const Music = {
  track: null as Phaser.Sound.BaseSound | null,

  play(scene: Phaser.Scene) {
    // respect current mute
    scene.game.sound.mute = Settings.muted;
    //check if already playing
    if (!this.track) {
      this.track = scene.sound.add("bgm", { loop: true, volume: 0.25 });
    }
    if (!this.track.isPlaying) this.track.play();
  },
  //Can call this to stop music.
  stop() {
    this.track?.stop();
    this.track = null;
  }
};