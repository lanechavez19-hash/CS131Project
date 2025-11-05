// src/MapMenu.ts
export type SceneNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  sceneKey: string;
};

export default class MapMenu {
  private nodes: SceneNode[];
  private currentIndex = 0;

  constructor(nodes: SceneNode[]) {
    this.nodes = nodes;
    this.injectStyles();
    this.buildDOM();
    this.attachKeyboardControls();
    this.fadeIn();
  }

  /** Inject CSS styles for selected marker glow */
  private injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .map-marker {
        transition: all 0.25s ease, box-shadow 0.3s ease;
      }

      .map-marker.selected {
        box-shadow: 0 0 15px 5px rgba(24, 180, 58, 0.8);
        background-color: #0dc535ff !important;
        transform: translate(-50%, -50%) scale(1.15);
        z-index: 10;
      }
    `;
    document.head.appendChild(style);
  }

  /** Builds the DOM structure for the map and markers */
  private buildDOM() {
    let mapMenu = document.getElementById("map-menu");
    if (!mapMenu) {
      mapMenu = document.createElement("div");
      mapMenu.id = "map-menu";
      document.body.appendChild(mapMenu);
    }

    // Full-screen transparent overlay
    Object.assign(mapMenu.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      display: "none",
      zIndex: "1000",
      backgroundColor: "transparent",
      opacity: "0",
      transition: "opacity 0.5s ease",
      pointerEvents: "auto",
    });

    mapMenu.innerHTML = `<div id="map-markers" style="position:relative;width:100%;height:100%;"></div>`;
    const markersContainer = document.getElementById("map-markers")!;
    markersContainer.innerHTML = "";

    // Compute right-side positioning
    const screenWidth = window.innerWidth;
    const rightX = screenWidth * 0.70; // shifted slightly left from the edge
    const baseY = window.innerHeight * 0.4; // vertical center
    const spacing = 130; // <-- reduced spacing (was 160)

    this.nodes.forEach((node, index) => {
      const marker = document.createElement("button");
      marker.className = "map-marker";
      marker.style.position = "absolute";
      marker.style.left = `${rightX}px`;
      marker.style.top = `${baseY + index * spacing}px`;
      marker.style.transform = "translate(-50%, -50%)";
      marker.style.width = "380px"; // consistent width
      marker.style.height = "100px"; // consistent height
      marker.style.borderRadius = "20px";
      marker.style.border = "3px solid #fff";
      marker.style.backgroundColor = "#007a7a";
      marker.style.color = "#fff";
      marker.style.fontSize = "1.6rem";
      marker.style.fontWeight = "600";
      marker.style.cursor = "pointer";
      marker.style.transition = "all 0.25s ease";
      marker.style.boxShadow = "0 0 12px rgba(0,0,0,0.25)";
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

    // --- Add ProfDavis.png image to the left of the buttons ---

    // Calculate vertical bounds of buttons
    const topButtonY = baseY; // center of top button
    const bottomButtonY = baseY + (this.nodes.length - 1) * spacing; // center of bottom button

    // Since buttons are centered with translate(-50%, -50%), adjust to edges:
    const buttonHeight = 100;
    const topOfTopButton = topButtonY - buttonHeight / 2;
    const bottomOfBottomButton = bottomButtonY + buttonHeight / 2;

    const imageHeight = bottomOfBottomButton - topOfTopButton;

    const img = document.createElement("img");
    img.src = "assets/images/ProfDavis.png"; // relative to public folder
    img.alt = "Prof Davis";
    img.style.position = "absolute";
    // Position image to the left of the buttons (half button width + 20px margin)
    const imageLeftMargin = 300; // pixels to shift left from the buttons
    img.style.left = `${rightX - 380 / 2 - imageLeftMargin}px`;
    img.style.top = `${topOfTopButton}px`;
    img.style.height = `${imageHeight}px`;
    img.style.width = "auto"; // keep aspect ratio
    img.style.objectFit = "contain";
    img.style.userSelect = "none";
    img.style.pointerEvents = "none"; // so clicks go through to buttons

    markersContainer.appendChild(img);

    // Select the first marker initially
    const firstMarker = markersContainer.querySelector(".map-marker") as HTMLElement | null;
    if (firstMarker) firstMarker.classList.add("selected");

    mapMenu.style.display = "block";
  }

  /** Smooth fade-in animation */
  private fadeIn() {
    const mapMenu = document.getElementById("map-menu");
    if (mapMenu) {
      setTimeout(() => {
        mapMenu.style.opacity = "1";
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
        case "ArrowDown":
          this.currentIndex = (this.currentIndex + 1) % markers.length;
          break;
        case "ArrowUp":
          this.currentIndex = (this.currentIndex - 1 + markers.length) % markers.length;
          break;
        case "Enter":
        case " ":
          markers[this.currentIndex].click();
          break;
        // Ignore left and right arrows now (do nothing)
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

    const game = (window as any).game;
    if (game && game.scene) {
      if (game.scene.isActive("Play")) game.scene.stop("Play");
      game.scene.start(sceneKey);
    } else {
      console.warn("Phaser game instance not found on window.");
    }
  }
}
