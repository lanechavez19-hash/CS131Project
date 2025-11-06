import Phaser from "phaser";
import PreloadScene from "./PreloadScene";
import StartScene from "./StartScene";
import PlayScene from "./PlayScene";
import Game1Scene from "./game1Scene";
import Game2Scene from "./game2Scene";
import Game3Scene from "./game3Scene";
import PauseScene from "./PauseScene";

// Create Phaser game
const game = new Phaser.Game({
  type: Phaser.AUTO,              // WebGL with Canvas fallback
  parent: "game",
  backgroundColor: "#aee0ff",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 450
  },
  scene: [
    PreloadScene,
    StartScene,
    PlayScene,
    Game1Scene,
    Game2Scene,
    Game3Scene,
    PauseScene
  ]
});

