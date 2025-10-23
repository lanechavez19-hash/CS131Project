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
    const bg = this.add.image(0, 0, 'sortingBackground')
      .setOrigin(0) // top-left corner
      .setDisplaySize(this.scale.width, this.scale.height); // stretch to screen
    addControlButtons(this);
    this.buildHUD();
    this.buildBins();
    this.startRound();
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
      { name: 'Postcard', slug:'postcard', category: 'paper', color: 0x56cfe1 },
    ];
    const bottles_cans: ItemDef[] = [
      { name: 'Water Bottle', slug:'plastic_bottle', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Soda Can', slug: 'soda_can', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Glass Jar', slug: 'glass_jar', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Detergent Bottle', slug: 'detergent_bottle', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Aerosol Can', slug: 'aerosol_can', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Aluminum foil', slug: 'aluminum_foil', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Milk Carton', slug: 'milk_carton', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Tin Can', slug: 'can', category: 'bottles_cans', color: 0x56cfe1 },
      { name: 'Metal Can', slug: 'metal_can', category: 'bottles_cans', color: 0x56cfe1 }
    ];
    const compost: ItemDef[] = [
      { name: 'Banana Peel', slug: 'banana_peel', category: 'compost', color: 0x8bc34a },
      { name: 'Apple Core', slug: 'apple_core', category: 'compost', color: 0x8bc34a },
      { name: 'Coffee Grounds', slug: 'coffee_grounds', category: 'compost', color: 0x8bc34a },
      { name: 'Tea Bag', slug: 'teabag', category: 'compost', color: 0x8bc34a },
      { name: 'Eggshells', slug: 'egg_shell',  category: 'compost', color: 0x8bc34a },
      { name: 'Leaves', slug: 'leaves',  category: 'compost', color: 0x8bc34a },
      { name: 'Bread', slug: 'bread',  category: 'compost', color: 0x8bc34a },
      { name: 'Orange Peel', slug: 'orange_peel',  category: 'compost', color: 0x8bc34a },
      { name: 'Drumstick', slug: 'drumstick',  category: 'compost', color: 0x8bc34a },
      { name: 'Used Napkin', slug: 'used_napkin',  category: 'compost', color: 0x8bc34a },
      { name: 'Veggies', slug: 'veggies',  category: 'compost', color: 0x8bc34a },
      { name: 'Wilted Flower', slug: 'wilted_flower',  category: 'compost', color: 0x8bc34a }
    ];
    const landfill: ItemDef[] = [
      { name: 'Chip Bag', slug:'bag_of_chips', category: 'landfill', color: 0xffa94d },
      { name: 'Styrofoam Cup', slug:'styrofoam_cup', category: 'landfill', color: 0xffa94d },
      { name: 'Plastic Utensil', slug:'plastic_cutlery', category: 'landfill', color: 0xffa94d },
      { name: 'Candy Wrapper', slug: 'candy_wrapper', category: 'landfill', color: 0xffa94d },
      { name: 'Teddy Bear', slug: 'teddy', category: 'landfill', color: 0xffa94d },
      { name: 'Tooth Brush', slug: 'toothbrush', category: 'landfill', color: 0xffa94d },
      { name: 'Straw', slug: 'straw', category: 'landfill', color: 0xffa94d },
      { name: 'Broken Phone', slug: 'broken_phone', category: 'landfill', color: 0xffa94d },
      { name: 'Nitrile Glove', slug: 'nitrile_glove',category: 'landfill', color: 0xffa94d },
      { name: 'Takeout Box', slug: 'takeout', category: 'landfill', color: 0xffa94d },
      { name: 'Lightbulb', slug: 'light_bulb', category: 'landfill', color: 0xffa94d },
      { name: 'Pizza box', slug: 'pizza_box', category: 'landfill', color: 0xffa94d }
    ];
    this.pool = [...bottles_cans,...paper, ...compost, ...landfill]; // 25 items
  }

  private buildHUD() {

    this.scoreText = this.add.text(24, 56, 'Score: 0', { fontFamily: 'Arial', fontSize: '18px', color: '#0b5132' });
    this.livesText = this.add.text(24, 78, 'Lives: 3', { fontFamily: 'Arial', fontSize: '18px', color: '#7b341e' });
    this.leftText  = this.add.text(24, 100, 'Items Left: 10', { fontFamily: 'Arial', fontSize: '18px', color: '#1a202c' });
  }

private buildBins() {
  const { width, height } = this.scale;
  const y = height - 90;
  const margin = 70;
  const cols = 4;
  const gap = (width - margin * 2) / (cols - 1);

  const mk = (i: number, cat: Category, tex: string) => {
    const x = margin + gap * i;
    const img = this.add.image(x, y, tex).setOrigin(0.5).setScale(0.25);
    return img;
  };

  this.bins = {
    paper:       mk(0, 'paper',       'paper_bin'),
    bottles_cans:  mk(1, 'bottles_cans',  'bottles_bin'),
    compost:    mk(2, 'compost',    'organics_bin'),
    landfill:       mk(3, 'landfill',       'trash_bin')
  };

  const labels: [Category, string, string][] = [
    ['paper', 'PAPER', '#2E5797'],
    ['bottles_cans', 'BOTTLES & CANS', '#41B0E6'],
    ['compost', 'ORGANICS', '#2F723C'],
    ['landfill', 'TRASH', '#383435']
  ];
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

    // sample 10 from 40
    const sample = Phaser.Utils.Array.Shuffle(this.pool.slice()).slice(0, this.ITEMS_PER_ROUND);
    this.roundItems = sample;

    // spawn draggable cards
    this.spawnItems(sample);
  }

 // helper: scale an image to fit within max box (preserve aspect)
fitImage(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
  const tex = image.texture.getSourceImage() as HTMLImageElement;
  const iw = tex.width, ih = tex.height;
  if (!iw || !ih) return;
  const s = Math.min(maxW / iw, maxH / ih);
  image.setScale(s);
}

private spawnItems(items: ItemDef[]) {
  const COLS = 5;
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

    // try to create an image using item name as key
    let img: Phaser.GameObjects.Image | null = null;
    if (this.textures.exists(it.slug)) {
      img = this.add.image(0, 0, it.slug).setOrigin(0.5);
      this.fitImage(img, THUMB_MAX_W, THUMB_MAX_H);
    }

    // optional label (tiny, below image)
    const label = this.add.text(0, 0, it.name, {
      fontFamily: 'Arial',
      fontSize: `${FONT_SIZE}px`,
      color: '#111',
      align: 'center',
      wordWrap: { width: THUMB_MAX_W }
    }).setOrigin(0.5);

    let contents: Phaser.GameObjects.GameObject[] = [];
    let w = THUMB_MAX_W, h = THUMB_MAX_H + 18; // reserve a bit for label

    if (img) {
      // stack image + label
      img.y = -8;                       // nudge up a bit
      label.y = (THUMB_MAX_H / 2) - 6;  // sits near bottom
      contents = [img, label];
      w = Math.max(THUMB_MAX_W, img.displayWidth);
      h = Math.max(THUMB_MAX_H + 18, img.displayHeight + 18);
    } else {
      // fallback: colored card with label centered
      const card = this.add.rectangle(0, 0, THUMB_MAX_W, THUMB_MAX_H, it.color)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0x222222);
      label.y = 0;
      contents = [card, label];
    }

    // container is the draggable unit
    const container = this.add.container(x, y, contents)
      .setSize(w, h)          // hit area size
      .setInteractive({ draggable: true, useHandCursor: true });

    // store item + home
    (container as any).item = it;
    (container as any).home = new Phaser.Math.Vector2(x, y);

    // match hit area tightly to visual bounds
    // (container.setSize already defines input hit area; but ensure after scale)
    if (container.input?.hitArea) {
      // @ts-ignore
      container.input.hitArea.setTo(0, 0, w, h);
      container.input.localX = -w / 2; // center-based container
      container.input.localY = -h / 2;
    }

    // drag behavior
    this.input.setDraggable(container, true);
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
  const world = new Phaser.Geom.Rectangle(card.x - card.width/2, card.y - card.height/2, card.width, card.height);

  const test = (img: Phaser.GameObjects.Image, cat: Category) => {
    const r = new Phaser.Geom.Rectangle(
      img.x - img.displayWidth/2,
      img.y - img.displayHeight/2,
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
  const img = this.bins[cat]; // Image
  const tint = success ? 0x7CFC00 : 0xFF4B4B;
  this.tweens.add({ targets: img, duration: 90, yoyo: true, repeat: 1, tint });
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
