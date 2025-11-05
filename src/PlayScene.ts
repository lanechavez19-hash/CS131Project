import Phaser from "phaser";
import { addMuteButton } from "./ui/Buttons";
import MapMenu, { SceneNode } from "./MapMenu";

export default class PlayScene extends Phaser.Scene {
  private mapMenu?: MapMenu;

  constructor() {
    super("Play");
  }

  create() {
    const { width: W, height: H } = this.scale;

    this.add.text(W / 2, H * 0.15, "Select a Mission on the Map", {
      fontSize: "46px",
      color: "#050505ff"
    }).setOrigin(0.5);

    
    addMuteButton(this);
    
   
    // Hide any existing map first (prevents duplicates)
    const oldMap = document.getElementById("map-menu");
    if (oldMap) oldMap.remove();

    // Define the nodes that appear on the map
    const nodes: SceneNode[] = [
    { id: "forest", name: "Pretreatment", sceneKey: "Game1" },
    { id: "river",  name: "Recycling", sceneKey: "Game2" },
    { id: "camp",   name: "Urban Wildlife", sceneKey: "Game3" }
    ];

    // Build the map menu (the image and clickable markers)
    this.mapMenu = new MapMenu(nodes);

    // Make sure the map is visible
    const mapElement = document.getElementById("map-menu");
    if (mapElement) mapElement.style.display = "block";
  }

  // Optional: Clean up the map when leaving this scene
  shutdown() {
    const mapElement = document.getElementById("map-menu");
    if (mapElement) mapElement.remove();
  }

  // This ensures cleanup when scene is stopped
  destroy() {
    this.shutdown();
  }
}
