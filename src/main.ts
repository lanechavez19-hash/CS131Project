import Phaser from "phaser";
import StartScene from "./StartScene";
import PlayScene from "./PlayScene";

new Phaser.Game({
  type: Phaser.AUTO,              // WebGL with Canvas fallback
  parent: "game",
  backgroundColor: "#aee0ff",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 450
  },
  scene: [StartScene,PlayScene]
});
