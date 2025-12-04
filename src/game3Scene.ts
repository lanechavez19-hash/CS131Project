import Phaser from "phaser";
import { addControlButtons } from "./ui/Buttons";
import TTS  from "./utils/TTS";

type CampObj = {
  key: string;
  question: string;
  correctAnswer: boolean;
  correctFeedback: string;
  incorrectFeedback: string;
};

export default class Game3Scene extends Phaser.Scene {
  private currentAnswerText?: Phaser.GameObjects.Text;
  private activeObjects: Phaser.GameObjects.GameObject[] = [];
  private introSpoken = false;

  constructor() {
    super("Game3");
  }

  private campObjects: CampObj[] = [
    {
      key: "raccoon",
      question: "Is it ok to feed squirrels or raccoons?",
      correctAnswer: false,
      correctFeedback: "Correct!\nNever. Feeding wildlife does more harm than good.",
      incorrectFeedback: "Incorrect!\nFeeding wildlife does more harm than good.",
    },
    {
      key: "wrapper",
      question: "Is it okay to leave food wrappers on the ground?",
      correctAnswer: false,
      correctFeedback: "Correct!\nNever litter! It harms wildlife.",
      incorrectFeedback: "Incorrect!\nLittering hurts animals and nature!",
    },
    {
      key: "appleTree",
      question: "Should you pick up the fallen fruit?",
      correctAnswer: true,
      correctFeedback: "Correct!\nPick up fallen fruit to avoid pest problems.",
      incorrectFeedback: "Incorrect!\nPick up fallen fruit to avoid pest problems.",
    },
    {
      key: "mosquito",
      question: "Is it okay to squish all bugs when you see them?",
      correctAnswer: false,
      correctFeedback: "Correct!\nNot all bugs are bad, many are helpful!",
      incorrectFeedback: "Incorrect!\nNot all bugs are bad, many are helpful!",
    },
    {
      key: "dog",
      question: "Should you pick up your dog poop?",
      correctAnswer: true,
      correctFeedback: "Correct!\nAlways pick up after your dog(s).",
      incorrectFeedback: "Incorrect!\nAlways pick up after your dog(s).",
    },
  ];

  preload() {
    this.load.image("park", "assets/images/park.png");
    this.load.image("raccoon", "assets/images/racoon.png");
    this.load.image("wrapper", "assets/images/wrapper.png");
    this.load.image("appleTree", "assets/images/appleTree.png");
    this.load.image("mosquito", "assets/images/mosquito.png");
    this.load.image("dog", "assets/images/dog.png");
  }

  create() {
    const { width: W, height: H } = this.scale;

    // Init global TTS helper
    TTS.init();
    
    const regTts = this.registry.get("ttsEnabled");

    TTS.enabled = typeof regTts === "boolean" ? regTts : false;

    const bg = this.add.image(W / 2, H / 2, "park");
    bg.setDisplaySize(W, H);

    this.add
      .text(
        W / 2,
        80,
        "Click the image or press the button to get your question",
        {
          fontSize: "23px",
          color: "#000000",
          fontStyle: "bold",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }
      )
      .setOrigin(0.5);

    addControlButtons(this);

    // Layout
    const startX = W / 2 - 300;
    const spacing = 150;
    const yPos = 400;

    this.makeImageBtn(startX, yPos - 55, "raccoon", () =>
      this.askYesNoQuestion(0)
    );
    this.makeImageBtn(startX + spacing, yPos - 55, "wrapper", () =>
      this.askYesNoQuestion(1)
    );
    this.makeImageBtn(startX + spacing * 2, yPos - 55, "appleTree", () =>
      this.askYesNoQuestion(2)
    );
    this.makeImageBtn(startX + spacing * 3, yPos - 30, "mosquito", () =>
      this.askYesNoQuestion(3)
    );
    this.makeImageBtn(startX + spacing * 4, yPos - 30, "dog", () =>
      this.askYesNoQuestion(4)
    );

    // Keyboard shortcuts
    this.input.keyboard!.on("keydown-R", () => this.askYesNoQuestion(0));
    this.input.keyboard!.on("keydown-W", () => this.askYesNoQuestion(1));
    this.input.keyboard!.on("keydown-A", () => this.askYesNoQuestion(2));
    this.input.keyboard!.on("keydown-B", () => this.askYesNoQuestion(3));
    this.input.keyboard!.on("keydown-D", () => this.askYesNoQuestion(4));

    // Labels
    this.add
      .text(startX, yPos + 25, "Raccoon(R)", {
        fontSize: "17px",
        fontStyle: "bold",
        color: "#000",
      })
      .setOrigin(0.5);
    this.add
      .text(startX + spacing, yPos + 25, "Wrapper(W)", {
        fontSize: "17px",
        fontStyle: "bold",
        color: "#000",
      })
      .setOrigin(0.5);
    this.add
      .text(startX + spacing * 2, yPos + 25, "Apple Tree(A)", {
        fontSize: "17px",
        fontStyle: "bold",
        color: "#000",
      })
      .setOrigin(0.5);
    this.add
      .text(startX + spacing * 3, yPos + 25, "Bugs(B)", {
        fontSize: "17px",
        fontStyle: "bold",
        color: "#000",
      })
      .setOrigin(0.5);
    this.add
      .text(startX + spacing * 4, yPos + 25, "Dog Poop(D)", {
        fontSize: "17px",
        fontStyle: "bold",
        color: "#000",
      })
      .setOrigin(0.5);

    // intro line if TTS is already on
    if (TTS.enabled && !this.introSpoken) {
      this.introSpoken = true;
      this.speak(
        "Welcome to Urban Wildlife Game. Press R, W, A, B, or D to choose an item. Use Y for Yes and N for No.",
        { rate: 1.05, pitch: 1.05 }
      );
    }
  }

  // ---------- UI helpers ----------

  private makeImageBtn(
    x: number,
    y: number,
    imageKey: string,
    callback: () => void
  ): Phaser.GameObjects.Image {
    const btn = this.add
      .image(x, y, imageKey)
      .setOrigin(0.5)
      .setDisplaySize(150, 150)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", callback)
      .on("pointerover", () => btn.setTint(0xdddddd))
      .on("pointerout", () => btn.clearTint());

    return btn;
  }

  private makeTextBtn(
    x: number,
    y: number,
    label: string,
    callback: () => void
  ): Phaser.GameObjects.Text {
    const btn = this.add
      .text(x, y, label, {
        color: "#000000",
        fontSize: "24px",
        fontStyle: "bold",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", callback)
      .on("pointerover", () => btn.setStyle({ backgroundColor: "#dddddd" }))
      .on("pointerout", () =>
        btn.setStyle({ backgroundColor: "rgba(255, 255, 255, 0.9)" })
      );

    return btn;
  }

  // ---------- Question / answer ----------

  private askYesNoQuestion(index: number): void {
    const { width: W, height: H } = this.scale;

    this.clearExistingQuestion();

    const obj = this.campObjects[index];

    const questionText = this.add
      .text(W / 2, H / 2 - 100, obj.question, {
        fontSize: "24px",
        color: "#000000",
        fontStyle: "bold",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: { x: 10, y: 5 },
        wordWrap: { width: 600 },
      })
      .setOrigin(0.5);

    this.speak(obj.question);

    const yesBtn = this.makeTextBtn(W / 2, H / 2 - 30, "Yes(Y)", () => {
      if (obj.correctAnswer === true) {
        this.showAnswer(obj.correctFeedback);
      } else {
        this.showAnswer(obj.incorrectFeedback);
      }
      this.clearOptionsOnly(questionText, yesBtn, noBtn);
    });

    const noBtn = this.makeTextBtn(W / 2, H / 2 + 30, "No(N)", () => {
      if (obj.correctAnswer === false) {
        this.showAnswer(obj.correctFeedback);
      } else {
        this.showAnswer(obj.incorrectFeedback);
      }
      this.clearOptionsOnly(questionText, yesBtn, noBtn);
    });

    this.input.keyboard!.removeAllListeners("keydown-Y");
    this.input.keyboard!.removeAllListeners("keydown-N");
    this.input.keyboard!.on("keydown-Y", () => {
      yesBtn.emit("pointerdown");
    });
    this.input.keyboard!.on("keydown-N", () => {
      noBtn.emit("pointerdown");
    });

    this.activeObjects = [questionText, yesBtn, noBtn];
  }

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

  private clearExistingQuestion(): void {
    this.stopSpeaking();

    this.activeObjects.forEach(obj => obj.destroy());
    this.activeObjects = [];

    if (this.currentAnswerText) {
      this.currentAnswerText.destroy();
      this.currentAnswerText = undefined;
    }
  }

  private showAnswer(text: string): void {
    const { width: W, height: H } = this.scale;

    if (this.currentAnswerText) {
      this.currentAnswerText.destroy();
    }

    this.currentAnswerText = this.add
      .text(W / 2, H / 2, text, {
        fontSize: "24px",
        color: "#000000",
        fontStyle: "bold",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: { x: 10, y: 5 },
        wordWrap: { width: 600 },
        align: "center",
      })
      .setOrigin(0.5);

    this.speak(text, { rate: 1.05 });
  }

  // ---------- TTS wrappers using global helper ----------

  private speak(text: string, opts?: { rate?: number; pitch?: number }) {
    if (!TTS.enabled) return;
    TTS.speak(text, opts);
  }

  private stopSpeaking() {
    TTS.stop();
  }
}
