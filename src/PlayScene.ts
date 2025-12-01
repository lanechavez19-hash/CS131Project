import Phaser from "phaser";
import { addMuteButton } from "./ui/Buttons";


type MenuItem = {
  key: string;          // image key
  sceneKey: string;     // scene to start
  image?: Phaser.GameObjects.Image;
  hit?: Phaser.GameObjects.Zone;
  hoverTween?: Phaser.Tweens.Tween | null;
  baseY?: number;
  baseScale?: number;
};

export default class PlayScene extends Phaser.Scene {
  constructor() { super("Play"); }

  private items: MenuItem[] = [
    { key: "btn-pretreatment",sceneKey: "Game1" },
    { key: "btn-sorting",     sceneKey: "Game2" },
    { key: "btn-wildlife",    sceneKey: "Game3" },
  ];
  private title!: Phaser.GameObjects.Text;
  private bg!: Phaser.GameObjects.Image;
  private selectionIndex = 0;
  private highlight!: Phaser.GameObjects.Graphics;
  private mascot!: Phaser.GameObjects.Image;

  preload() {
    this.load.image("btn-sorting",     "assets/ui/btn_sorting.png");
    this.load.image("btn-pretreatment","assets/ui/btn_pretreatment.png");
    this.load.image("btn-wildlife",    "assets/ui/btn_wildlife.png");
    this.load.image("menu-bg",         "assets/ui/davis_combined.png");
    this.load.image("ProfessorDavis",  "assets/images/ProfDavis.png");
  }

  create() {
    this.input.enabled = false;
    this.time.delayedCall(150, () => {
      this.input.enabled = true;
    });

    const { width, height } = this.scale;
    this.highlight = this.add.graphics();
    // Background (cover-style)
    this.bg = this.add.image(0, 0, "menu-bg").setOrigin(0);
    this.coverBackground();
    addMuteButton(this);
    // Create buttons
    this.createButtons();
        // Title (top, bold) + floating
    this.title = this.add.text(width / 2, height * 0.15, "Choose a mission", {
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: "48px",
      fontStyle: "bold",
      color: "#1b2b42",
      align: "center",
      stroke: "#ffffff",
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: this.title,
      y: this.title.y - 8,
      duration: 1400,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    // Highlight frame
    this.drawHighlight();

    // Keyboard
    this.input.keyboard!.on("keydown-LEFT",  () => this.moveSelection(-1));
    this.input.keyboard!.on("keydown-RIGHT", () => this.moveSelection(1));
    this.input.keyboard!.on("keydown-ENTER", () => this.launchSelected());
    // (Optional) Up/Down mirror
    this.input.keyboard!.on("keydown-UP",    () => this.moveSelection(-1));
    this.input.keyboard!.on("keydown-DOWN",  () => this.moveSelection(1));

    // Resize handler
    this.scale.on("resize", this.onResize, this);
  }

  // Lay out buttons evenly and wire interactions
  private createButtons() {
    const { width, height } = this.scale;

    // Horizontal layout
    const y = height * 0.48;       
    const cols = this.items.length;
    const colGap = Math.min(320, width / 5); 
    const totalWidth = colGap * (cols - 1);
    const startX = width*0.15 + (width / 2 - totalWidth / 2);

    this.items.forEach((item, i) => {
      const img = this.add.image(0, 0, item.key);

      // scale 
      const targetH = Math.min(280, this.scale.height * 0.33);
      const s = targetH / img.height;
      img.setScale(s);
      const x = startX + i * colGap;

      img.setPosition(x, y);
      img.setDepth(1);
      img.setInteractive({ useHandCursor: true });

      // store bases for hover animation
      item.baseY = y;
      item.baseScale = s;

      // hover animations
      img.on("pointerover", () => {
        this.selectionIndex = i;
        this.drawHighlight();
        this.playHoverIn(item);
      });
      img.on("pointerout", () => this.playHoverOut(item));
      img.on("pointerup",  () => this.launch(item.sceneKey));

      // larger click zone matching image rect
      const hit = this.add.zone(x, y, img.displayWidth, img.displayHeight)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      hit.on("pointerover", () => {
        this.selectionIndex = i;
        this.drawHighlight();
        this.playHoverIn(item);
      });
      hit.on("pointerout", () => this.playHoverOut(item));
      hit.on("pointerup",  () => this.launch(item.sceneKey));

      item.image = img;
      item.hit = hit;
    });

    this.drawHighlight();
  }

  // ---------- Hover animations ----------
  private playHoverIn(item: MenuItem) {
    if (!item.image || item.hoverTween) return;
    const img = item.image;
    const lift = 10;
    item.hoverTween = this.tweens.add({
      targets: img,
      scale: (item.baseScale ?? 1) * 1.06,
      y: (item.baseY ?? img.y) - lift,
      duration: 140,
      ease: "Sine.out",
      onStart: () => img.setTint(0xffffff),
      onComplete: () => { item.hoverTween = null; }
    });
  }

  private playHoverOut(item: MenuItem) {
    if (!item.image) return;
    const img = item.image;
    if (item.hoverTween) { item.hoverTween.stop(); item.hoverTween = null; }
    this.tweens.add({
      targets: img,
      scale: (item.baseScale ?? 1),
      y: (item.baseY ?? img.y),
      duration: 140,
      ease: "Sine.inOut",
      onComplete: () => img.clearTint()
    });
  }

  // ---------- Navigation ----------
  private moveSelection(delta: number) {
    const n = this.items.length;
    this.selectionIndex = (this.selectionIndex + delta + n) % n;
    this.drawHighlight();

    const item = this.items[this.selectionIndex];
    this.playHoverIn(item);
    // reset others
    this.items.forEach((it, idx) => { if (idx !== this.selectionIndex) this.playHoverOut(it); });
  }

  private launchSelected() {
    const item = this.items[this.selectionIndex];
    if (item) this.launch(item.sceneKey);
  }

  private launch(sceneKey: string) {
    this.input.enabled = false;
    this.time.delayedCall(40, () => this.scene.start(sceneKey));
  }

  // ---------- Highlight ----------
  private drawHighlight() {
    if (!this.highlight) return;
    this.highlight.clear();

    const item = this.items[this.selectionIndex];
    if (!item?.image) return;

    const pad = 14;
    const r = 22;

    this.highlight.lineStyle(6, 0x2b7fff, 1);
    this.highlight.strokeRoundedRect(
      item.image.x - item.image.displayWidth / 2 - pad,
      item.image.y - item.image.displayHeight / 2 - pad,
      item.image.displayWidth + pad * 2,
      item.image.displayHeight + pad * 2,
      r
    );
    this.highlight.fillStyle(0x2b7fff, 0.07);
    this.highlight.fillRoundedRect(
      item.image.x - item.image.displayWidth / 2 - pad,
      item.image.y - item.image.displayHeight / 2 - pad,
      item.image.displayWidth + pad * 2,
      item.image.displayHeight + pad * 2,
      r
    );
  }

  // ---------- Resize & utilities ----------
  private onResize(gameSize: Phaser.Structs.Size) {
    const { width, height } = gameSize;
    this.cameras.main.setSize(width, height);
    this.coverBackground();

    // title position
    this.title.setPosition(width / 2, height * 0.10);

    // rebuild buttons for new size
    this.items.forEach(i => { i.image?.destroy(); i.hit?.destroy(); i.hoverTween?.stop(); i.hoverTween = null; });
    this.createButtons();
  }

  private coverBackground() {
    const { width, height } = this.scale;
    const img = this.bg;
    const sx = width / img.width;
    const sy = height / img.height;
    const s = Math.max(sx, sy);
    img.setScale(s).setPosition(0, 0).setOrigin(0);
  }
}