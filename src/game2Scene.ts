import Phaser from "phaser";
import { addControlButtons } from "./ui/Buttons";

type Category = 'paper' | 'bottles_cans' | 'compost' | 'landfill';

type ItemDef = {
  name: string;
  slug: string;
  category: Category;
  color: number;
};

export default class Game2Scene extends Phaser.Scene {
  constructor() { super({ key: 'Game2' }); }

  //  Config
  private ITEMS_PER_ROUND = 10;
  private START_LIVES = 3;

  //  Game state
  private roundState: 'playing' | 'ended' = 'playing';
  private pool: ItemDef[] = [];
  private roundItems: ItemDef[] = [];
  private liveDraggables: Phaser.GameObjects.Container[] = [];
  private bins!: Record<Category, Phaser.GameObjects.Image>;
  private score = 0;
  private lives = this.START_LIVES;
  private itemsLeft = this.ITEMS_PER_ROUND;

  //  HUD
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private leftText!: Phaser.GameObjects.Text;

  // --- Keyboard nav state ---
  private k!: {
    W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key;
    ENTER: Phaser.Input.Keyboard.Key; ESC: Phaser.Input.Keyboard.Key;
  };

  private GRID_COLS = 5; // keep in sync with spawn layout
  private selectedItemIndex = -1;
  private holding: Phaser.GameObjects.Container | null = null;

  private binOrder: Category[] = ['paper', 'bottles_cans', 'compost', 'landfill'];
  private selectedBinIndex = 0;

  // visuals
  private itemHighlight?: Phaser.GameObjects.Rectangle;
  private binHighlight?: Phaser.GameObjects.Rectangle;
  private holdPulse?: Phaser.Tweens.Tween;
  private originalScale: { x: number; y: number } | null = null;

  // where items hover when picked up (set after bins are built)
  private hoverPos = { x: 0, y: 0 };

  preload() {
    // --- Load item images ---
    this.makePool();
    // background
    this.load.image('sortingBackground', 'assets/images/sortingBackground.png');

    // Load all item textures (from public/assets/items/)
    this.pool.forEach(it => {
      this.load.image(it.slug, `assets/items/${it.slug}.png`);
    });

    // --- Load bins ---
    this.load.image('bottles_bin', 'assets/bins/bottles_bin.png');
    this.load.image('organics_bin', 'assets/bins/organics_bin.png');
    this.load.image('trash_bin', 'assets/bins/trash_bin.png');
    this.load.image('paper_bin', 'assets/bins/paper_bin.png');
  }

  create() {
    this.input.keyboard?.removeAllListeners(); 
    this.input.removeAllListeners();  
    const bg = this.add.image(0, 0, 'sortingBackground')
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height);

    addControlButtons(this);
    this.buildHUD();
    this.buildBins();
    this.startRound();

    // ---- Keyboard wiring (use non-null assertions for TS) ----
    const ip = this.input!;
    const kb = ip.keyboard!;
    kb.removeAllListeners('keydown-ENTER');

    this.k = kb.addKeys({ W: 'W', A: 'A', S: 'S', D: 'D', ENTER: 'ENTER', ESC: 'ESC' }) as any;

    // WASD selection when NOT holding
    kb.on('keydown-W', () => this.moveSelection('up'));
    kb.on('keydown-A', () => this.onKeyA());
    kb.on('keydown-S', () => this.moveSelection('down'));
    kb.on('keydown-D', () => this.onKeyD());

    // Enter pick up / drop, Esc cancel
    kb.on('keydown-ENTER', () => this.confirmOrDrop());
    kb.on('keydown-ESC', () => this.cancelPickup());

    // (optional) allow arrows for selection too
    kb.on('keydown-LEFT', () => this.moveSelection('left'));
    kb.on('keydown-RIGHT', () => this.moveSelection('right'));
    kb.on('keydown-UP', () => this.moveSelection('up'));
    kb.on('keydown-DOWN', () => this.moveSelection('down'));
  }

  // creates a pool of items, can always add more items.
  private makePool() {
    const paper: ItemDef[] = [
      { name: 'Cardboard Box', slug: 'cardboard_box', category: 'paper', color: 0x56cfe1 },
      { name: 'Envelope', slug: 'envelope', category: 'paper', color: 0x56cfe1 },
      { name: 'Magazine', slug: 'magazine', category: 'paper', color: 0x56cfe1 },
      { name: 'Newspaper', slug: 'newspaper', category: 'paper', color: 0x56cfe1 },
      { name: 'Notebook', slug: 'notebook', category: 'paper', color: 0x56cfe1 },
      { name: 'Paper Bag', slug: 'paper_bag', category: 'paper', color: 0x56cfe1 },
      { name: 'Postcard', slug: 'postcard', category: 'paper', color: 0x56cfe1 },
    ];
    const bottles_cans: ItemDef[] = [
      { name: 'Water Bottle', slug: 'plastic_bottle', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Soda Can', slug: 'soda_can', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Glass Jar', slug: 'glass_jar', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Detergent Bottle', slug: 'detergent_bottle', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Aerosol Can', slug: 'aerosol_can', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Aluminum foil', slug: 'aluminum_foil', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Tin Can', slug: 'can', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Metal Can', slug: 'metal_can', category: 'bottles_cans', color: 0x56cfe1 }
    ];
    const compost: ItemDef[] = [
      { name: 'Banana Peel', slug: 'banana_peel', category: 'compost', color: 0x8bc34a },
      { name: 'Apple Core', slug: 'apple_core', category: 'compost', color: 0x8bc34a },
      { name: 'Coffee Grounds', slug: 'coffee_grounds', category: 'compost', color: 0x8bc34a },
      { name: 'Tea Bag', slug: 'teabag', category: 'compost', color: 0x8bc34a },
      { name: 'Eggshells', slug: 'egg_shell', category: 'compost', color: 0x8bc34a },
      { name: 'Leaves', slug: 'leaves', category: 'compost', color: 0x8bc34a },
      { name: 'Bread', slug: 'bread', category: 'compost', color: 0x8bc34a },
      { name: 'Orange Peel', slug: 'orange_peel', category: 'compost', color: 0x8bc34a },
      { name: 'Drumstick', slug: 'drumstick', category: 'compost', color: 0x8bc34a },
      { name: 'Used Napkin', slug: 'used_napkin', category: 'compost', color: 0x8bc34a },
      { name: 'Veggies', slug: 'veggies', category: 'compost', color: 0x8bc34a },
      { name: 'Wilted Flower', slug: 'wilted_flower', category: 'compost', color: 0x8bc34a },
      { name: 'Pizza box', slug: 'pizza_box', category: 'compost', color: 0xffa94d }
    ];
    const landfill: ItemDef[] = [
      { name: 'Chip Bag', slug: 'bag_of_chips', category: 'landfill', color: 0xffa94d },
      { name: 'Styrofoam Cup', slug: 'styrofoam_cup', category: 'landfill', color: 0xffa94d },
      { name: 'Plastic Utensil', slug: 'plastic_cutlery', category: 'landfill', color: 0xffa94d },
      { name: 'Candy Wrapper', slug: 'candy_wrapper', category: 'landfill', color: 0xffa94d },
      { name: 'Teddy Bear', slug: 'teddy', category: 'landfill', color: 0xffa94d },
      { name: 'Tooth Brush', slug: 'toothbrush', category: 'landfill', color: 0xffa94d },
      { name: 'Straw', slug: 'straw', category: 'landfill', color: 0xffa94d },
      { name: 'Broken Phone', slug: 'broken_phone', category: 'landfill', color: 0xffa94d },
      { name: 'Nitrile Glove', slug: 'nitrile_glove', category: 'landfill', color: 0xffa94d },
      { name: 'Takeout Box', slug: 'takeout', category: 'landfill', color: 0xffa94d },
    ];
    this.pool = [...bottles_cans, ...paper, ...compost, ...landfill]; // 25 items
  }

  private buildHUD() {
    this.scoreText = this.add.text(24, 56, 'Score: 0', { fontFamily: 'Arial', fontSize: '18px', color: '#0b5132' });
    this.livesText = this.add.text(24, 78, 'Lives: 3', { fontFamily: 'Arial', fontSize: '18px', color: '#7b341e' });
    this.leftText = this.add.text(24, 100, 'Items Left: 10', { fontFamily: 'Arial', fontSize: '18px', color: '#1a202c' });
  }

  private buildBins() {
    const { width, height } = this.scale;
    const y = height - 90;
    const margin = 70;
    const cols = 4;
    const gap = (width - margin * 2) / (cols - 1);

    const mk = (_i: number, _cat: Category, tex: string, i: number) => {
      const x = margin + gap * i;
      const img = this.add.image(x, y, tex).setOrigin(0.5).setScale(0.25);
      return img;
    };

    this.bins = {
      paper: mk(0, 'paper', 'paper_bin', 0),
      bottles_cans: mk(1, 'bottles_cans', 'bottles_bin', 1),
      compost: mk(2, 'compost', 'organics_bin', 2),
      landfill: mk(3, 'landfill', 'trash_bin', 3)
    };

    // Compute hover spot above bins (center between first & last)
    const first = this.bins.paper;
    const last = this.bins.landfill;
    this.hoverPos.x = (first.x + last.x) / 2;
    this.hoverPos.y = first.y - first.displayHeight * 0.9;
  }

  private startRound() {
    // reset
    this.roundState = 'playing';
    this.score = 0;
    this.lives = this.START_LIVES;
    this.itemsLeft = this.ITEMS_PER_ROUND;
    this.updateHUD();

    // clean previous
    this.liveDraggables.forEach(d => d.destroy());
    this.liveDraggables = [];

    // sample items
    const sample = Phaser.Utils.Array.Shuffle(this.pool.slice()).slice(0, this.ITEMS_PER_ROUND);
    this.roundItems = sample;

    // spawn draggable cards
    this.spawnItems(sample);

    // init selection/hilites
    this.selectedItemIndex = this.liveDraggables.length ? 0 : -1;
    this.updateItemHighlight();
    this.selectedBinIndex = 0;
    this.updateBinHighlight(false);
  }

  // helper: scale an image to fit within max box (preserve aspect)
  private fitImage(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    const tex = image.texture.getSourceImage() as HTMLImageElement;
    const iw = tex.width, ih = tex.height;
    if (!iw || !ih) return;
    const s = Math.min(maxW / iw, maxH / ih);
    image.setScale(s);
  }

  private getAliveCards() {
  return this.liveDraggables.filter(c => c.active && c.visible);
  }

  private ensureValidSelection() {
    const cards = this.getAliveCards();
    if (!cards.length) { this.selectedItemIndex = -1; return; }
    if (this.selectedItemIndex < 0 || this.selectedItemIndex >= cards.length) {
    // pick the visually top-left card as a sane default
    const idx = cards
      .map((c, i) => ({ c, i }))
      .sort((a, b) => (a.c.y - b.c.y) || (a.c.x - b.c.x))[0].i;
    this.selectedItemIndex = idx;
  }
  }
  private spawnItems(items: ItemDef[]) {
    const COLS = this.GRID_COLS; // keep in sync
    const startX = 110;
    const colGap = 140;
    const startY = 140;
    const rowGap = 90;

    // thumbnail box to fit images into
    const THUMB_MAX_W = 90;
    const THUMB_MAX_H = 70;
    const FONT_SIZE = 12;

    // clear previous
    this.liveDraggables.forEach(d => d.destroy());
    this.liveDraggables = [];

    items.forEach((it, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = startX + col * colGap;
      const y = startY + row * rowGap;

      // image (if exists)
      let img: Phaser.GameObjects.Image | null = null;
      if (this.textures.exists(it.slug)) {
        img = this.add.image(0, 0, it.slug).setOrigin(0.5);
        this.fitImage(img, THUMB_MAX_W, THUMB_MAX_H);
      }

      // label
      const label = this.add.text(0, 0, it.name, {
        fontFamily: 'Arial',
        fontSize: `${FONT_SIZE}px`,
        color: '#111',
        align: 'center',
        wordWrap: { width: THUMB_MAX_W }
      }).setOrigin(0.5);

      let contents: Phaser.GameObjects.GameObject[] = [];
      let w = THUMB_MAX_W, h = THUMB_MAX_H + 18;

      if (img) {
        img.y = -8;
        label.y = (THUMB_MAX_H / 2) - 6;
        contents = [img, label];
        w = Math.max(THUMB_MAX_W, img.displayWidth);
        h = Math.max(THUMB_MAX_H + 18, img.displayHeight + 18);
      } else {
        const card = this.add.rectangle(0, 0, THUMB_MAX_W, THUMB_MAX_H, it.color)
          .setOrigin(0.5)
          .setStrokeStyle(2, 0x222222);
        label.y = 0;
        contents = [card, label];
      }

      const container = this.add.container(x, y, contents)
        .setSize(w, h)
        .setInteractive({ draggable: true, useHandCursor: true });

      (container as any).item = it;
      (container as any).home = new Phaser.Math.Vector2(x, y);

      // ensure hit area is tight
      if (container.input?.hitArea) {
        // @ts-ignore
        container.input.hitArea.setTo(0, 0, w, h);
        container.input.localX = -w / 2;
        container.input.localY = -h / 2;
      }

      this.input!.setDraggable(container, true);
      container.on('drag', (_p: any, dragX: number, dragY: number) => {
        container.x = dragX;
        container.y = dragY;
      });
      container.on('dragend', () => this.onDrop(container));

      // subtle pulse
      this.tweens.add({
        targets: container,
        duration: 1100, repeat: -1, yoyo: true,
        alpha: { from: 1, to: 0.88 },
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 400)
      });

      this.liveDraggables.push(container);
    });
  }

  // ---------- Mouse drop logic (unified via resolveDrop) ----------
  private onDrop(card: Phaser.GameObjects.Container) {
    if (this.roundState !== 'playing') return;

    const home: Phaser.Math.Vector2 = (card as any).home;
    const hit = this.hitWhichBin(card);

    if (!hit) {
      this.tweens.add({ targets: card, x: home.x, y: home.y, duration: 120, ease: 'Sine.easeOut' });
      return;
    }
    // Use shared resolver
    this.resolveDrop(card, hit);
  }

  private hitWhichBin(card: Phaser.GameObjects.Container): Category | null {
    const world = new Phaser.Geom.Rectangle(card.x - card.width / 2, card.y - card.height / 2, card.width, card.height);

    const test = (img: Phaser.GameObjects.Image, cat: Category) => {
      const r = new Phaser.Geom.Rectangle(
        img.x - img.displayWidth / 2,
        img.y - img.displayHeight / 2,
        img.displayWidth,
        img.displayHeight
      );
      return Phaser.Geom.Intersects.RectangleToRectangle(world, r) ? cat : null;
    };

    return (
      test(this.bins.paper, 'paper') ||
      test(this.bins.bottles_cans, 'bottles_cans') ||
      test(this.bins.compost, 'compost') ||
      test(this.bins.landfill, 'landfill') ||
      null
    );
  }

  private flashBin(cat: Category, success: boolean) {
    const img = this.bins[cat];
    const tint = success ? 0x7CFC00 : 0xFF4B4B;
    this.tweens.add({ targets: img, duration: 90, yoyo: true, repeat: 1, tint });
  }

  // ---------- Shared resolver for mouse + keyboard ----------
  private resolveDrop(card: Phaser.GameObjects.Container, chosen: Category) {
    if (this.roundState !== 'playing') return;

    const item: ItemDef = (card as any).item;
    const home: Phaser.Math.Vector2 = (card as any).home;

    if (chosen === item.category) {
      // correct
      this.score += 1;
      this.itemsLeft -= 1;
      this.updateHUD();
      this.flashBin(chosen, true);

      this.tweens.add({
        targets: card,
        scaleX: 0.1, scaleY: 0.1, alpha: 0,
        duration: 160, ease: 'Sine.easeIn',
        onComplete: () => {
          const removed = card;
          card.destroy();
          this.liveDraggables = this.getAliveCards(); // normalize
          if (this.itemsLeft <= 0) this.endRound(true);
          this.afterRemovalAdjustSelection(removed);
      }
      });
    } else {
      // wrong
      this.lives -= 1;
      this.updateHUD();
      this.flashBin(chosen, false);

      if (this.lives <= 0) {
        this.endRound(false);
      } else {
        this.tweens.add({ targets: card, x: home.x, y: home.y, duration: 120, ease: 'Sine.easeOut' });
      }
    }
  }

  // ---------- End / Restart ----------
  private updateHUD() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.livesText.setText(`Lives: ${this.lives}`);
    this.leftText.setText(`Items Left: ${this.itemsLeft}`);
  }

  private overlay?: Phaser.GameObjects.Container;

  private endRound(won: boolean) {
    if (this.roundState === 'ended') return;
    this.roundState = 'ended';

    // Disable drag on remaining items
    this.liveDraggables.forEach(c => c.disableInteractive());

    const { width, height } = this.scale;

    // Blocker
    const blocker = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35)
      .setOrigin(0.5)
      .setInteractive({ cursor: 'default' });

    // Panel & text
    const panel = this.add.rectangle(width / 2, height / 2, 520, 260, won ? 0x22543d : 0x742a2a, 0.95).setOrigin(0.5);
    const title = this.add.text(width / 2, height / 2 - 30, won ? 'Nice sorting!' : 'Out of lives!', {
      fontFamily: 'Arial', fontSize: '28px', color: '#ffffff'
    }).setOrigin(0.5);

    const scoreLabel = this.add.text(width / 2, height / 2 + 6, `Score: ${this.score} / ${this.ITEMS_PER_ROUND}`, {
      fontFamily: 'Arial', fontSize: '20px', color: '#e6fffa'
    }).setOrigin(0.5);

    // Restart
    const restartBg = this.add.rectangle(width / 2, height / 2 + 60, 160, 46, 0xffffff)
      .setOrigin(0.5)
      .setInteractive({ cursor: 'pointer' });

    const restartTxt = this.add.text(width / 2, height / 2 + 60, 'Restart', {
      fontFamily: 'Arial', fontSize: '18px', color: '#111'
    }).setOrigin(0.5);

    restartBg.on('pointerdown', () => restartBg.setFillStyle(0xe2e8f0));
    restartBg.on('pointerup', () => {
      restartBg.setFillStyle(0xffffff);
      this.destroyOverlayAndRestart();
    });
    restartBg.on('pointerout', () => restartBg.setFillStyle(0xffffff));

    this.overlay = this.add.container(0, 0, [blocker, panel, title, scoreLabel, restartBg, restartTxt]);
    this.overlay.setDepth(3000);
  }

  private destroyOverlayAndRestart() {
    if (this.overlay) {
      this.overlay.destroy(true);
      this.overlay = undefined;
    }
    this.startRound();
  }

  // ---------- Keyboard-only helpers ----------
  private moveSelection(dir: 'up' | 'down' | 'left' | 'right') {
  if (this.roundState !== 'playing' || this.holding) return;

  const cards = this.getAliveCards();
  const n = cards.length;
  if (!n) return;

  this.ensureValidSelection();
  const cur = cards[this.selectedItemIndex];
  if (!cur) return;

  const cx = cur.x, cy = cur.y;
  const EPS = 8; // tolerance band so we don't require perfect alignment

  // direction filters
  const isCandidate = (other: Phaser.GameObjects.Container) => {
    const dx = other.x - cx;
    const dy = other.y - cy;
    if (dir === 'up')    return dy < -EPS;
    if (dir === 'down')  return dy >  EPS;
    if (dir === 'left')  return dx < -EPS;
    if (dir === 'right') return dx >  EPS;
    return false;
  };

  // score candidates by direction-first distance, then perpendicular closeness
  const score = (other: Phaser.GameObjects.Container) => {
    const dx = other.x - cx;
    const dy = other.y - cy;
    if (dir === 'up'   || dir === 'down')  return Math.abs(dy) * 1000 + Math.abs(dx);
    if (dir === 'left' || dir === 'right') return Math.abs(dx) * 1000 + Math.abs(dy);
    return Number.MAX_SAFE_INTEGER;
  };

  const candidates = cards
    .map((c, i) => ({ c, i }))
    .filter(({ c, i }) => i !== this.selectedItemIndex && isCandidate(c));

  if (!candidates.length) return; // no neighbor in that direction

  candidates.sort((a, b) => score(a.c) - score(b.c));
  this.selectedItemIndex = candidates[0].i;
  this.updateItemHighlight();
}

  private onKeyA() {
    if (this.holding) this.shiftBin(-1);
    else this.moveSelection('left');
  }
  private onKeyD() {
    if (this.holding) this.shiftBin(+1);
    else this.moveSelection('right');
  }

  private confirmOrDrop() {
    if (this.roundState !== 'playing') return;

    // Pick up phase
    if (!this.holding) {
      if (this.selectedItemIndex < 0 || this.selectedItemIndex >= this.liveDraggables.length) return;
      const card = this.liveDraggables[this.selectedItemIndex];

      this.holding = card;
      this.originalScale = { x: card.scaleX, y: card.scaleY };

      // fly to hover, enlarge, gentle bobbing
      card.setDepth(2000);
      this.itemHighlight?.destroy();
      this.itemHighlight = undefined;

      this.tweens.add({
        targets: card,
        x: this.hoverPos.x,
        y: this.hoverPos.y,
        scaleX: (this.originalScale.x || 1) * 1.15,
        scaleY: (this.originalScale.y || 1) * 1.15,
        duration: 140,
        ease: 'Sine.easeOut',
        onComplete: () => {
          this.holdPulse?.stop();
          this.holdPulse = this.tweens.add({
            targets: card,
            y: { from: this.hoverPos.y - 6, to: this.hoverPos.y + 6 },
            duration: 1100,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
          });
        }
      });

      // show bin highlight (start at first bin)
      this.selectedBinIndex = 0;
      this.updateBinHighlight(true);
      return;
    }

    // Drop phase
    const chosen = this.binOrder[this.selectedBinIndex];
    const card = this.holding;
    this.holding = null;
    this.updateBinHighlight(false);
    this.holdPulse?.stop();

    const img = this.bins[chosen];
    this.tweens.add({
      targets: card,
      x: img.x,
      y: img.y - img.displayHeight * 0.25,
      duration: 120,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (this.originalScale) card.setScale(this.originalScale.x, this.originalScale.y);
        this.originalScale = null;
        this.resolveDrop(card!, chosen);
        this.updateItemHighlight();
      }
    });
  }

  private cancelPickup() {
    if (!this.holding) return;
    const card = this.holding;
    this.holding = null;
    this.updateBinHighlight(false);
    this.holdPulse?.stop();

    const home: Phaser.Math.Vector2 = (card as any).home;
    this.tweens.add({
      targets: card,
      x: home.x, y: home.y,
      scaleX: this.originalScale ? this.originalScale.x : 1,
      scaleY: this.originalScale ? this.originalScale.y : 1,
      duration: 120, ease: 'Sine.easeOut',
      onComplete: () => {
        this.originalScale = null;
        card.setDepth(0);
        this.updateItemHighlight();
      }
    });
  }

  private shiftBin(delta: number) {
    if (!this.holding) return;
    const n = this.binOrder.length;
    this.selectedBinIndex = ((this.selectedBinIndex + delta) % n + n) % n;
    this.updateBinHighlight(true);
  }

  private afterRemovalAdjustSelection(removedCard?: Phaser.GameObjects.Container) {
  const cards = this.getAliveCards();
  if (!cards.length) {
    this.selectedItemIndex = -1;
    this.itemHighlight?.destroy(); this.itemHighlight = undefined;
    return;
  }

  // Try to select the visually closest remaining card to the removed one (or current)
  const ref = removedCard ?? cards[Math.min(this.selectedItemIndex, cards.length - 1)];
  let best = 0, bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    const dx = c.x - ref.x, dy = c.y - ref.y;
    const d2 = dx*dx + dy*dy;
    if (d2 < bestDist) { bestDist = d2; best = i; }
  }
  this.selectedItemIndex = best;
  this.updateItemHighlight();
}

  private updateItemHighlight() {
    this.itemHighlight?.destroy();
    this.itemHighlight = undefined;
    if (this.holding) return;

    if (this.selectedItemIndex < 0 || this.selectedItemIndex >= this.liveDraggables.length) return;
    const card = this.liveDraggables[this.selectedItemIndex];
    if (!card || !card.active || !card.visible) return;

    const w = card.width, h = card.height;
    const r = this.add.rectangle(card.x, card.y, w + 12, h + 12)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0x1e90ff)
      .setFillStyle(0x000000, 0) as Phaser.GameObjects.Rectangle;
    r.setDepth(1500);
    this.itemHighlight = r;

    this.events.off('update', this.__trackItemHighlight, this);
    this.events.on('update', this.__trackItemHighlight, this);
  }

  private __trackItemHighlight() {
    if (!this.itemHighlight) return;
    if (this.selectedItemIndex < 0 || this.selectedItemIndex >= this.liveDraggables.length) return;
    const card = this.liveDraggables[this.selectedItemIndex];
    if (!card || !card.active || !card.visible) return;
    this.itemHighlight.setPosition(card.x, card.y);
  }

  private updateBinHighlight(show: boolean) {
    this.ensureValidSelection();
    this.binHighlight?.destroy();
    this.binHighlight = undefined;
    if (!show) return;

    const cat = this.binOrder[this.selectedBinIndex];
    const img = this.bins[cat];
    const rect = this.add.rectangle(img.x, img.y, img.displayWidth + 18, img.displayHeight + 18)
      .setOrigin(0.5)
      .setStrokeStyle(4, 0xffd166)
      .setFillStyle(0x000000, 0) as Phaser.GameObjects.Rectangle;
    rect.setDepth(1500);
    this.binHighlight = rect;

    this.tweens.add({
      targets: rect,
      alpha: { from: 1, to: 0.6 },
      duration: 700, repeat: -1, yoyo: true, ease: 'Sine.easeInOut'
    });
  }
}


