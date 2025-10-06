import Phaser from "phaser";
import { addControlButtons } from "./ui/Buttons";

type Category = 'recycle' | 'compost' | 'landfill';

type ItemDef = {
  name: string;
  category: Category;
  color: number; // for zero-asset block
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
  private bins!: Record<Category, Phaser.GameObjects.Container>;
  private score = 0;
  private lives = this.START_LIVES;
  private itemsLeft = this.ITEMS_PER_ROUND;

  //  HUD 
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private leftText!: Phaser.GameObjects.Text;

  preload() { /* no assest yet, will implement later*/ }

  create() {
    addControlButtons(this);
    this.makePool();
    this.buildHUD();
    this.buildBins();
    this.startRound();
  }

  // creates a pool of 25 items, can always add more items.
  private makePool() {
    const recycle: ItemDef[] = [
      { name: 'Water Bottle', category: 'recycle', color: 0x56cfe1 },
      { name: 'Soda Can', category: 'recycle', color: 0x56cfe1 },
      { name: 'Glass Jar', category: 'recycle', color: 0x56cfe1 },
      { name: 'Cardboard Box', category: 'recycle', color: 0x56cfe1 },
      { name: 'Newspaper', category: 'recycle', color: 0x56cfe1 },
      { name: 'Mail', category: 'recycle', color: 0x56cfe1 },
      { name: 'Cereal Box', category: 'recycle', color: 0x56cfe1 },
      { name: 'Tin Can', category: 'recycle', color: 0x56cfe1 }
    ];
    const compost: ItemDef[] = [
      { name: 'Banana Peel', category: 'compost', color: 0x8bc34a },
      { name: 'Apple Core', category: 'compost', color: 0x8bc34a },
      { name: 'Coffee Grounds', category: 'compost', color: 0x8bc34a },
      { name: 'Tea Bag', category: 'compost', color: 0x8bc34a },
      { name: 'Eggshells', category: 'compost', color: 0x8bc34a },
      { name: 'Leaves', category: 'compost', color: 0x8bc34a },
      { name: 'Bread Crust', category: 'compost', color: 0x8bc34a },
      { name: 'Orange Peel', category: 'compost', color: 0x8bc34a }
    ];
    const landfill: ItemDef[] = [
      { name: 'Chip Bag', category: 'landfill', color: 0xffa94d },
      { name: 'Styrofoam Cup', category: 'landfill', color: 0xffa94d },
      { name: 'Plastic Utensil', category: 'landfill', color: 0xffa94d },
      { name: 'Candy Wrapper', category: 'landfill', color: 0xffa94d },
      { name: 'Diaper', category: 'landfill', color: 0xffa94d },
      { name: 'Broken Toy', category: 'landfill', color: 0xffa94d },
      { name: 'Greasy Pizza Box', category: 'landfill', color: 0xffa94d },
      { name: 'Pen', category: 'landfill', color: 0xffa94d },
      { name: 'Straw', category: 'landfill', color: 0xffa94d }
    ];
    this.pool = [...recycle, ...compost, ...landfill]; // 25 items
  }

  private buildHUD() {

    this.scoreText = this.add.text(24, 56, 'Score: 0', { fontFamily: 'Arial', fontSize: '18px', color: '#0b5132' });
    this.livesText = this.add.text(24, 78, 'Lives: 3', { fontFamily: 'Arial', fontSize: '18px', color: '#7b341e' });
    this.leftText  = this.add.text(24, 100, 'Items Left: 10', { fontFamily: 'Arial', fontSize: '18px', color: '#1a202c' });
  }

  private buildBins() {
    const { width, height } = this.scale;
    const gap = 24;
    const w = (width - gap * 4) / 3;
    const h = 130;
    const y = height - h / 2 - 24;

    const mkBin = (x: number, label: string, color: number) => {
      const panel = this.add.rectangle(x, y, w, h, color, 0.18).setStrokeStyle(3, color).setOrigin(0.5);
      const text = this.add.text(x, y - h / 2 + 10, label, {
        fontFamily: 'Arial', fontSize: '18px', color: '#222'
      }).setOrigin(0.5, 0);
      const c = this.add.container(0, 0, [panel, text]);
      // store bounds for hit-test
      (c as any).panel = panel;
      return c;
    };

    const x1 = gap + w / 2;
    const x2 = gap * 2 + w + w / 2;
    const x3 = gap * 3 + w * 2 + w / 2;

    this.bins = {
      recycle: mkBin(x1, 'RECYCLE', 0x3182ce),
      compost: mkBin(x2, 'COMPOST', 0x2f855a),
      landfill: mkBin(x3, 'LANDFILL', 0xc05621)
    };
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

    // sample 10 from 25
    const sample = Phaser.Utils.Array.Shuffle(this.pool.slice()).slice(0, this.ITEMS_PER_ROUND);
    this.roundItems = sample;

    // spawn draggable cards
    this.spawnItems(sample);
  }

  // ---------- Spawning & Drag ----------
  private spawnItems(items: ItemDef[]) {
  const { width } = this.scale;

  // layout: 2 rows × 5 columns
  const COLS = 5;
  const ROWS = Math.ceil(items.length / COLS);
  const startX = 110;           // left padding
  const colGap = 140;           // horizontal spacing
  const startY = 140;           // top row y
  const rowGap = 90;            // vertical spacing

  // smaller objects, can modify if needed
  const CARD_W = 90;
  const CARD_H = 40;
  const FONT_SIZE = 12;

  // clear previous
  this.liveDraggables.forEach(d => d.destroy());
  this.liveDraggables = [];

  items.forEach((it, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);

    const x = startX + col * colGap;
    const y = startY + row * rowGap;

    // build card
    const card = this.add.rectangle(0, 0, CARD_W, CARD_H, it.color)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x222222);

    const label = this.add.text(0, 0, it.name, {
      fontFamily: 'Arial',
      fontSize: `${FONT_SIZE}px`,
      color: '#111',
      wordWrap: { width: CARD_W - 8 }
    }).setOrigin(0.5);

    // container holds both and is the thing we drag
    const container = this.add.container(x, y, [card, label]);
    (container as any).item = it;
    (container as any).home = new Phaser.Math.Vector2(x, y);

    // Makes the container interactive + draggable
    container.setSize(CARD_W, CARD_H); // defines its hit area
    container.setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(container, true);

    // drag handlers — move the container
    container.on('drag', (_p: any, dragX: number, dragY: number) => {
      container.x = dragX;
      container.y = dragY;
    });

    container.on('dragend', () => this.onDrop(container));

    // subtle pulse
    this.tweens.add({
      targets: container,
      duration: 1100,
      repeat: -1,
      yoyo: true,
      alpha: { from: 1, to: 0.88 },
      ease: 'Sine.easeInOut',
      delay: Phaser.Math.Between(0, 400)
    });

    this.liveDraggables.push(container);
  });
}


  // ---------- Drop logic ----------
private onDrop(card: Phaser.GameObjects.Container) {
  if (this.roundState !== 'playing') return; // ignore after game ended

  const item: ItemDef = (card as any).item;
  const home: Phaser.Math.Vector2 = (card as any).home;

  const hit = this.hitWhichBin(card);

  if (!hit) {
    // not over any bin -> snap back
    this.tweens.add({ targets: card, x: home.x, y: home.y, duration: 120, ease: 'Sine.easeOut' });
    return;
  }

  // correct?
  if (hit === item.category) {
    this.score += 1;
    this.itemsLeft -= 1;               
    this.updateHUD();

    this.flashBin(hit, true);

    // remove draggable from scene + from our list
    this.tweens.add({
      targets: card,
      scaleX: 0.1, scaleY: 0.1, alpha: 0,
      duration: 160, ease: 'Sine.easeIn',
      onComplete: () => {
        // hard remove
        card.destroy();
        // keep liveDraggables in sync
        this.liveDraggables = this.liveDraggables.filter(c => c.active && c.visible);
        // WIN condition
        if (this.itemsLeft <= 0) this.endRound(true);  
      }
    });
  } else {
    // wrong bin
    this.lives -= 1;                     
    this.updateHUD();
    this.flashBin(hit, false);

    if (this.lives <= 0) {
      // immediate LOSE
      this.endRound(false);              
      return;
    }

    // still have lives -> snap back
    this.tweens.add({ targets: card, x: home.x, y: home.y, duration: 120, ease: 'Sine.easeOut' });
  }
}

  private hitWhichBin(card: Phaser.GameObjects.Container): Category | null {
    const world = new Phaser.Geom.Rectangle(card.x - 70, card.y - 32, 140, 64); // card bounds
    const inBin = (cat: Category) => {
      const panel = (this.bins[cat] as any).panel as Phaser.GameObjects.Rectangle;
      const r = new Phaser.Geom.Rectangle(panel.x - panel.width / 2, panel.y - panel.height / 2, panel.width, panel.height);
      return Phaser.Geom.Intersects.RectangleToRectangle(world, r);
    };
    if (inBin('recycle')) return 'recycle';
    if (inBin('compost')) return 'compost';
    if (inBin('landfill')) return 'landfill';
    return null;
    // Tip: for sprite art, consider using zone hit areas or Physics overlap.
  }

  private flashBin(cat: Category, success: boolean) {
    const panel = (this.bins[cat] as any).panel as Phaser.GameObjects.Rectangle;
    const original = panel.strokeColor;
    panel.setStrokeStyle(3, success ? 0x38a169 : 0xe53e3e);
    this.time.delayedCall(220, () => panel.setStrokeStyle(3, original));
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

  // Disable drag on remaining items (but keep global input alive)
  this.liveDraggables.forEach(c => c.disableInteractive());

  const { width, height } = this.scale;

  // --- FULL-SCREEN BLOCKER (swallows input, default cursor) ---
  const blocker = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35)
    .setOrigin(0.5)
    .setInteractive({ cursor: 'default' }); // no pointer hand

  // Panel & text
  const panel = this.add.rectangle(width / 2, height / 2, 520, 260, won ? 0x22543d : 0x742a2a, 0.95).setOrigin(0.5);
  const title = this.add.text(width / 2, height / 2 - 30, won ? 'Nice sorting!' : 'Out of lives!', {
    fontFamily: 'Arial', fontSize: '28px', color: '#ffffff'
  }).setOrigin(0.5);

  const scoreLabel = this.add.text(width / 2, height / 2 + 6, `Score: ${this.score} / ${this.ITEMS_PER_ROUND}`, {
    fontFamily: 'Arial', fontSize: '20px', color: '#e6fffa'
  }).setOrigin(0.5);

  // Restart "button" 
  const restartBg = this.add.rectangle(width / 2, height / 2 + 60, 160, 46, 0xffffff)
    .setOrigin(0.5)
    .setInteractive({ cursor: 'pointer' }); 

  const restartTxt = this.add.text(width / 2, height / 2 + 60, 'Restart', {
    fontFamily: 'Arial', fontSize: '18px', color: '#111'
  }).setOrigin(0.5);

  // Small visual feedback on press
  restartBg.on('pointerdown', () => {
    restartBg.setFillStyle(0xe2e8f0);
  });
  restartBg.on('pointerup', () => {
    restartBg.setFillStyle(0xffffff);
    this.destroyOverlayAndRestart();
  });
  restartBg.on('pointerout', () => {
    restartBg.setFillStyle(0xffffff);
  });

  // Group them so we can clean up easily
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
}
