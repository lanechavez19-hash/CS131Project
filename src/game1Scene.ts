import Phaser from "phaser";
import { addControlButtons } from "./ui/Buttons";

export default class Game1Scene extends Phaser.Scene {
  private currentAnswerText?: Phaser.GameObjects.Text;
  private activeObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("Game1");
  }

  // 🔹 1. Load your images
  preload() {
    this.load.image("PaperTowel", "assets/images/PaperTowel.png");
    this.load.image("water", "assets/images/water.png");
    this.load.image("wipes", "assets/images/wipes.png");
  }

  // 🔹 2. Create the scene
  create() {
    const { width: W } = this.scale;

    // Title
    this.add.text(W / 2, 100, "Pretreatment Game", {
      fontSize: "28px",
      color: "#000000",
    }).setOrigin(0.5);

    // Add pause/mute buttons (already provided by your UI system)
    addControlButtons(this);

    // === Image Buttons ===
    const startX = W / 2 - 200;
    const spacing = 200;
    const yPos = 360;

    // Create clickable image buttons
    this.makeImageBtn(startX, yPos, "PaperTowel", () => this.askYesNoQuestion(1));
    this.makeImageBtn(startX + spacing, yPos, "water", () => this.askYesNoQuestion(2));
    this.makeImageBtn(startX + spacing * 2, yPos, "wipes", () => this.askYesNoQuestion(3));

    // Optional text labels under images
    this.add.text(startX, yPos + 70, "Paper Towels", { fontSize: "18px", color: "#000" }).setOrigin(0.5);
    this.add.text(startX + spacing, yPos + 70, "Water", { fontSize: "18px", color: "#000" }).setOrigin(0.5);
    this.add.text(startX + spacing * 2, yPos + 70, "Fushable Wipes", { fontSize: "18px", color: "#000" }).setOrigin(0.5);
  }

  // 🔹 3. Helper function: image button
  private makeImageBtn(
    x: number,
    y: number,
    key: string,
    onClick: () => void
  ): Phaser.GameObjects.Image {
    const img = this.add.image(x, y, key).setInteractive({ useHandCursor: true });

    // Scale all images to a consistent width
    const targetWidth = 110;
    const scale = targetWidth / img.width;
    img.setScale(scale);

    img.on("pointerdown", onClick)
       .on("pointerover", () => img.setTint(0xdddddd))
       .on("pointerout",  () => img.clearTint());

    return img;
  }

  // 🔹 4. Question + answer logic
  private askYesNoQuestion(question: number): void {
    const { width: W, height: H } = this.scale;
    this.clearExistingQuestion();

    let qText: Phaser.GameObjects.Text;
    let yesBtn: Phaser.GameObjects.Text;
    let noBtn: Phaser.GameObjects.Text;

    if (question === 1) {
      qText = this.add.text(W / 2, H / 2 - 60, "Should you flush paper towels down your toilet?", {
        fontSize: "26px",
        color: "#000",
        backgroundColor: "#eeeeee",
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5);

      yesBtn = this.makeTextBtn(W / 2, H / 2, "Yes", () => {
        this.showAnswer("Incorrect❌\n You should NOT flush paper towels down your toilet.\nIt can clog your pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });

      noBtn = this.makeTextBtn(W / 2, H / 2 + 50, "No", () => {
        this.showAnswer("Correct✅\nYou should NOT flush paper towels down your toilet.\nIt can clog your pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });
    } 
    else if (question === 2) {
      qText = this.add.text(W / 2, H / 2 - 60, "Should you pour water down your sink drain?", {
        fontSize: "26px",
        color: "#000",
        backgroundColor: "#eeeeee",
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5);

      yesBtn = this.makeTextBtn(W / 2, H / 2, "Yes", () => {
        this.showAnswer("Correct✅\nWater is safe to pour down the sink!\nJust be careful not to waste it.");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });

      noBtn = this.makeTextBtn(W / 2, H / 2 + 50, "No", () => {
        this.showAnswer("Incorrect❌\nWater is safe to pour down the sink!\nJust be careful not to waste it.");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });
    } 
    else {
      qText = this.add.text(W / 2, H / 2 - 60, "Should you put flushable wipes in the toilet?", {
        fontSize: "26px",
        color: "#000",
        backgroundColor: "#eeeeee",
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5);

      yesBtn = this.makeTextBtn(W / 2, H / 2, "Yes", () => {
        this.showAnswer("Incorrect❌\nYou should NOT put flushable wipes in the toilet.\nThey can clog pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });

      noBtn = this.makeTextBtn(W / 2, H / 2 + 50, "No", () => {
        this.showAnswer("Correct✅\nYou should NOT put flushable wipes in the toilet.\nThey can clog pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });
    }

    this.activeObjects = [qText, yesBtn, noBtn];
  }

  // 🔹 5. Text button helper (for Yes/No)
  private makeTextBtn(x: number, y: number, label: string, cb: () => void) {
    const btn = this.add.text(x, y, label, {
      color: "#000",
      fontSize: "24px",
      backgroundColor: "#fff",
      padding: { x: 10, y: 5 },
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on("pointerdown", cb)
    .on("pointerover", () => btn.setStyle({ backgroundColor: "#dddddd" }))
    .on("pointerout", () => btn.setStyle({ backgroundColor: "#ffffff" }));
    return btn;
  }

  // 🔹 6. Clean-up helpers
  private clearOptionsOnly(q: Phaser.GameObjects.Text, yes: Phaser.GameObjects.Text, no: Phaser.GameObjects.Text) {
    yes.destroy();
    no.destroy();
    this.activeObjects = [q];
  }

  private clearExistingQuestion() {
    this.activeObjects.forEach(o => o.destroy());
    this.activeObjects = [];

    if (this.currentAnswerText) {
      this.currentAnswerText.destroy();
      this.currentAnswerText = undefined;
    }
  }

  private showAnswer(text: string) {
    const { width: W, height: H } = this.scale;

    if (this.currentAnswerText) this.currentAnswerText.destroy();

    this.currentAnswerText = this.add.text(W / 2, H / 2 + 20, text, {
      fontSize: "22px",
      color: "#000",
      align: "center",
      wordWrap: { width: 600 },
    }).setOrigin(0.5);
  }
}
