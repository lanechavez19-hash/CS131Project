import Phaser from "phaser";
import { addControlButtons } from "./ui/Buttons";

export default class Game1Scene extends Phaser.Scene {
  private currentAnswerText?: Phaser.GameObjects.Text;
  private activeObjects: Phaser.GameObjects.GameObject[] = []; // track question + buttons

  constructor() {
    super("Game1");
  }

  create() {
    const { width: W } = this.scale;

    // Title
    this.add.text(W / 2, 100, "Storm Water Game", {
      fontSize: "28px",
      color: "#000000",
    }).setOrigin(0.5);

    // Add pause/mute buttons
    addControlButtons(this);

    // === Three Ask Question buttons horizontally ===
    const startX = W / 2 - 200; // starting position for leftmost button
    const spacing = 200;        // horizontal spacing between buttons
    const yPos = 400;           // same Y position for all buttons

    this.makeBtn(startX, yPos, "Slime", () =>
      this.askYesNoQuestion("Should you flush slime down your toilet?")
    );

    this.makeBtn(startX + spacing, yPos, "Water", () =>
      this.askYesNoQuestion("Should you pour water down your sink drain?")
    );

    this.makeBtn(startX + spacing * 2, yPos, "Rocks", () =>
      this.askYesNoQuestion("Should you flush rock down your toilet?")
    );
  }

  // Create interactive text buttons
  private makeBtn(
    x: number,
    y: number,
    label: string,
    callback: () => void
  ): Phaser.GameObjects.Text {
    const btn = this.add.text(x, y, label, {
      color: "#000000",
      fontSize: "24px",
      backgroundColor: "#ffffff",
      padding: { x: 10, y: 5 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", callback)
      .on("pointerover", () => btn.setStyle({ backgroundColor: "#dddddd" }))
      .on("pointerout", () => btn.setStyle({ backgroundColor: "#ffffff" }));

    return btn;
  }

  // Display a question with Yes/No buttons
  private askYesNoQuestion(question: string): void {
    const { width: W, height: H } = this.scale;

    // Clear previous question and answer
    this.clearExistingQuestion();

    // Create question text
    const questionText = this.add.text(W / 2, H / 2 - 50, question, {
      fontSize: "26px",
      color: "#000000",
      backgroundColor: "#eeeeee",
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);

    // YES button (below question)
    const yesBtn = this.makeBtn(W / 2, H / 2 + 20, "Yes", () => {
      this.showAnswer("You clicked YES ✅");
      this.clearOptionsOnly(questionText, yesBtn, noBtn);
    });

    // NO button (below Yes button)
    const noBtn = this.makeBtn(W / 2, H / 2 + 80, "No", () => {
      this.showAnswer("You clicked NO ❌");
      this.clearOptionsOnly(questionText, yesBtn, noBtn);
    });

    // Track objects to clean up when switching questions
    this.activeObjects = [questionText, yesBtn, noBtn];
  }

  // Remove old question & buttons (but keep the answer)
  private clearOptionsOnly(
    questionText: Phaser.GameObjects.Text,
    yesBtn: Phaser.GameObjects.Text,
    noBtn: Phaser.GameObjects.Text
  ): void {
    questionText;
    yesBtn.destroy();
    noBtn.destroy();
    this.activeObjects = [];
  }


  // Remove previous question AND answer
  private clearExistingQuestion(): void {
    // Destroy question-related objects
    this.activeObjects.forEach(obj => obj.destroy());
    this.activeObjects = [];

    // Destroy old answer text
    if (this.currentAnswerText) {
      this.currentAnswerText.destroy();
      this.currentAnswerText = undefined;
    }
  }

  // Show player's answer
  private showAnswer(text: string): void {
    const { width: W, height: H } = this.scale;

    // Remove any existing answer before showing a new one
    if (this.currentAnswerText) {
      this.currentAnswerText.destroy();
    }

    this.currentAnswerText = this.add.text(W / 2, H / 2 + 120, text, {
      fontSize: "24px",
      color: "#000000",
    }).setOrigin(0.5);
  }
}
