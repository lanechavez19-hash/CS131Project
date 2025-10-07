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
      this.askYesNoQuestion(1)
    );

    this.makeBtn(startX + spacing, yPos, "Water", () =>
      this.askYesNoQuestion(2)
    );

    this.makeBtn(startX + spacing * 2, yPos, "Rocks", () =>
      this.askYesNoQuestion(3)
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
  private askYesNoQuestion(question: number): void {
    const { width: W, height: H } = this.scale;

    // Clear previous question and answer
    this.clearExistingQuestion();
    //"Should you flush slime down your toilet?";
    if(question==1){
      // Create question text
      const questionText1 = this.add.text(W / 2, H / 2 - 50, "Should you flush slime down your toilet?", {
        fontSize: "26px",
        color: "#000000",
        backgroundColor: "#eeeeee",
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5);

      // YES button (below question)
      const yesBtn1 = this.makeBtn(W / 2, H / 2 + 20, "Yes", () => {
        this.showAnswer("Incorrect❌\nYou should not flush slime down your toilet\nIt can clog your pipes");
        this.clearOptionsOnly(questionText1, yesBtn1, noBtn1);
      });

      // NO button (below Yes button)
      const noBtn1 = this.makeBtn(W / 2, H / 2 + 80, "No", () => {
        this.showAnswer("Correct✅\nYou should not flush slime down your toilet\nIt can clog your pipes");
        this.clearOptionsOnly(questionText1, yesBtn1, noBtn1);
      });

      // Track objects to clean up when switching questions
      this.activeObjects = [questionText1, yesBtn1, noBtn1];
      } else if(question==2){
        // Create question text
      const questionText2 = this.add.text(W / 2, H / 2 - 50, "Should you pour water down your sink drain?", {
        fontSize: "26px",
        color: "#000000",
        backgroundColor: "#eeeeee",
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5);

      // YES button (below question)
      const yesBtn2 = this.makeBtn(W / 2, H / 2 + 20, "Yes", () => {
        this.showAnswer("Correct✅\nYou should pour water down your sink drain\nThat is what it is made for\nBut be careful not to waste water");
        this.clearOptionsOnly(questionText2, yesBtn2, noBtn2);
      });

      // NO button (below Yes button)
      const noBtn2 = this.makeBtn(W / 2, H / 2 + 80, "No", () => {
        this.showAnswer("Incorrect❌\nYou should pour water down your sink drain\nThat is what it is made for\nBut be careful not to waste water");
        this.clearOptionsOnly(questionText2, yesBtn2, noBtn2);
      });

      // Track objects to clean up when switching questions
      this.activeObjects = [questionText2, yesBtn2, noBtn2];
      } else {
        // Create question text
      const questionText3 = this.add.text(W / 2, H / 2 - 50, "Should you flush rock down your toilet?", {
        fontSize: "26px",
        color: "#000000",
        backgroundColor: "#eeeeee",
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5);

      // YES button (below question)
      const yesBtn3 = this.makeBtn(W / 2, H / 2 + 20, "Yes", () => {
        this.showAnswer("Incorrect❌\nYou should not flush slime down your toilet\nIt can clog your pipes");
        this.clearOptionsOnly(questionText3, yesBtn3, noBtn3);
      });

      // NO button (below Yes button)
      const noBtn3 = this.makeBtn(W / 2, H / 2 + 80, "No", () => {
        this.showAnswer("Correct✅\nYou should not flush slime down your toilet\nIt can clog your pipes");
        this.clearOptionsOnly(questionText3, yesBtn3, noBtn3);
      });

      // Track objects to clean up when switching questions
      this.activeObjects = [questionText3, yesBtn3, noBtn3];
      }
      
  }

  // Remove old question & buttons (but keep the answer)
  private clearOptionsOnly(
    questionText: Phaser.GameObjects.Text,
    yesBtn: Phaser.GameObjects.Text,
    noBtn: Phaser.GameObjects.Text
  ): void {
    questionText.destroy();
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

    this.currentAnswerText = this.add.text(W / 2, H / 2 + 100, text, {
      fontSize: "24px",
      color: "#000000",
    }).setOrigin(0.5);
  }
}
