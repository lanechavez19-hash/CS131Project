// src/MapMenu.ts
// DOM-based map menu system for Phaser game launcher
// ---------------------------------------------------

export type SceneNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  sceneKey: string;
};

/**
 * MapMenu handles displaying a DOM-based map where each node
 * launches a Phaser scene. It supports mouse clicks and arrow key navigation.
 */
export default class MapMenu {
  private nodes: SceneNode[];
  private currentIndex = 0;

  constructor(nodes: SceneNode[]) {
    this.nodes = nodes;
    this.buildDOM();
    this.attachKeyboardControls();
    this.fadeIn();
  }

  /** Builds the DOM structure for the map and markers */
  private buildDOM() {
    // Create container if not already in HTML
    let mapMenu = document.getElementById("map-menu");
    if (!mapMenu) {
      mapMenu = document.createElement("div");
      mapMenu.id = "map-menu";
      document.body.appendChild(mapMenu);
    }

    // --- Styling to center and layer above Phaser ---
    Object.assign(mapMenu.style, {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "800px",
      height: "450px",
      overflow: "hidden",
      display: "none",
      zIndex: "1000",
      backgroundColor: "#0b2b2b",
      opacity: "0",
      transition: "opacity 0.5s ease",
      border: "2px solid #4ee3e3",
      borderRadius: "12px",
    });

    mapMenu.innerHTML = `
    <img id="map-image" src="assets/images/citymap.jpeg" alt="Game Map"
    style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;z-index:0;">
    <div id="map-markers" style="position:relative;width:100%;height:100%;"></div>
    `;

    const markersContainer = document.getElementById("map-markers")!;
    markersContainer.innerHTML = "";

    this.nodes.forEach((node, index) => {
      const marker = document.createElement("button");
      marker.className = "map-marker";
      marker.style.position = "absolute";
      marker.style.left = `${node.x}px`;
      marker.style.top = `${node.y}px`;
      marker.style.transform = "translate(-50%, -50%)";
      marker.style.borderRadius = "50%";
      marker.style.border = "2px solid #fff";
      marker.style.backgroundColor = "#007a7a";
      marker.style.color = "#fff";
      marker.style.padding = "10px 16px";
      marker.style.cursor = "pointer";
      marker.style.transition = "all 0.2s";
      marker.textContent = node.name;
      marker.dataset.index = String(index);

      marker.addEventListener("click", () => this.launchScene(node.sceneKey));

      marker.addEventListener("mouseenter", () => {
        marker.style.backgroundColor = "#00b3b3";
        marker.style.transform = "translate(-50%, -50%) scale(1.1)";
      });
      marker.addEventListener("mouseleave", () => {
        marker.style.backgroundColor = "#007a7a";
        marker.style.transform = "translate(-50%, -50%)";
      });

      markersContainer.appendChild(marker);
    });

    // Select the first marker initially
    const firstMarker = markersContainer.querySelector(".map-marker") as HTMLElement | null;
    if (firstMarker) firstMarker.classList.add("selected");

    // Show map after it's built
    mapMenu.style.display = "block";
  }

  /** Smooth fade-in animation */
  private fadeIn() {
    const mapMenu = document.getElementById("map-menu");
    if (mapMenu) {
      setTimeout(() => {
        mapMenu!.style.opacity = "1";
      }, 50);
    }
  }

  /** Handles arrow key navigation between markers */
  private attachKeyboardControls() {
    document.addEventListener("keydown", (e) => {
      const markers = Array.from(document.querySelectorAll(".map-marker")) as HTMLElement[];
      if (markers.length === 0) return;

      markers[this.currentIndex].classList.remove("selected");

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          this.currentIndex = (this.currentIndex + 1) % markers.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          this.currentIndex = (this.currentIndex - 1 + markers.length) % markers.length;
          break;
        case "Enter":
        case " ":
          markers[this.currentIndex].click();
          break;
      }

      markers[this.currentIndex].classList.add("selected");
    });
  }

  /** Launches a Phaser scene and hides the map menu */
  private launchScene(sceneKey: string) {
    const mapMenu = document.getElementById("map-menu");
    if (mapMenu) {
      mapMenu.style.opacity = "0";
      setTimeout(() => (mapMenu.style.display = "none"), 500);
    }

    // Ensure the Phaser game object is accessible from window
    const game = (window as any).game;
    if (game && game.scene) {
      // Stop the PlayScene first, then start the new scene
      if (game.scene.isActive("Play")) game.scene.stop("Play");
      game.scene.start(sceneKey);
    } else {
      console.warn("Phaser game instance not found on window.");
    }
  }
}
