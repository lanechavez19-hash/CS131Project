import Phaser from "phaser";
import { addControlButtons } from "./ui/Buttons";
import  TTS  from "./utils/TTS";   // ← adjust path if different

export default class Game1Scene extends Phaser.Scene {
  private currentAnswerText?: Phaser.GameObjects.Text;
  private activeObjects: Phaser.GameObjects.GameObject[] = [];

  // TTS state (no T key anymore)
  private ttsEnabled = false;

  constructor() {
    super("Game1");
  }

  preload() {
    this.load.image("counter", "assets/images/counter.png");
    this.load.image("PaperTowel", "assets/images/PaperTowel.png");
    this.load.image("water", "assets/images/water.png");
    this.load.image("wipes", "assets/images/wipes.png");
    this.load.image("oil", "assets/images/oil.png");
    this.load.image("LeftoverFood", "assets/images/LeftoverFood.png");
  }

  create() {
    const { width: W, height: H } = this.scale;

    // Init global TTS helper once
    TTS.init();

    // Read TTS flag from registry (set by Pause/Settings)
    const regTts = this.registry.get("ttsEnabled");
    if (typeof regTts === "boolean") {
      this.ttsEnabled = regTts;
    }
    TTS.enabled = this.ttsEnabled;

    const bg = this.add.image(W / 2, H / 2, "counter");
    bg.setDisplaySize(W, H);

    this.add.text(W / 2, 50, "Pretreatment Game", {
      fontSize: "28px",
      color: "#000000",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
    }).setOrigin(0.5);

    this.add.text(
      W / 2,
      75,
      "Click the image or press the button to get your question",
      {
        fontSize: "20px",
        color: "#000000",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: { x: 5, y: 5 },
      }
    ).setOrigin(0.5);

    // You can either remove this line entirely, or change the text
    // since T no longer does anything:
    this.add.text(W / 2, 440, "Use P, W, F, O, or L to choose an item. Y = Yes, N = No.", {
      fontSize: "18px",
      color: "#000000",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      padding: { x: 5, y: 5 },
    }).setOrigin(0.5);

    addControlButtons(this);

    const startX = W / 2 - 300;
    const spacing = 150;
    const yPos = 298;

    this.makeImageBtn(startX, yPos, "PaperTowel", () => this.askYesNoQuestion(1));
    this.makeImageBtn(startX + spacing, yPos, "water", () => this.askYesNoQuestion(2));
    this.makeImageBtn(startX + spacing * 2, yPos, "wipes", () => this.askYesNoQuestion(3));
    this.makeImageBtn(startX + spacing * 3, yPos, "oil", () => this.askYesNoQuestion(4));
    this.makeImageBtn(startX + spacing * 4, yPos, "LeftoverFood", () => this.askYesNoQuestion(5));

    this.input.keyboard!.on("keydown-P", () => this.askYesNoQuestion(1));
    this.input.keyboard!.on("keydown-W", () => this.askYesNoQuestion(2));
    this.input.keyboard!.on("keydown-F", () => this.askYesNoQuestion(3));
    this.input.keyboard!.on("keydown-O", () => this.askYesNoQuestion(4));
    this.input.keyboard!.on("keydown-L", () => this.askYesNoQuestion(5));

    this.add.text(startX, yPos + 70, "Paper Towels(P)", { fontSize: "17px", color: "#000" }).setOrigin(0.5);
    this.add.text(startX + spacing, yPos + 70, "Water(W)", { fontSize: "17px", color: "#000" }).setOrigin(0.5);
    this.add.text(startX + spacing * 2, yPos + 70, "Flushable Wipes(F)", { fontSize: "17px", color: "#000" }).setOrigin(0.5);
    this.add.text(startX + spacing * 3, yPos + 70, "Oil(O)", { fontSize: "17px", color: "#000" }).setOrigin(0.5);
    this.add.text(startX + spacing * 4, yPos + 70, "Leftover Food(L)", { fontSize: "17px", color: "#000" }).setOrigin(0.5);

    // Optional: if TTS is already enabled (from settings), speak a welcome once
    if (this.ttsEnabled) {
      this.speak(
        "Welcome to Pretreatment Game. Press P, W, F, O, or L to choose an item. Use Y for Yes and N for No.",
        { rate: 1.1, pitch: 1.1 }
      );
    }
  }

  // ---------- helpers below stay same, using this.speak / this.stopSpeaking ----------

  private makeImageBtn(
    x: number,
    y: number,
    key: string,
    onClick: () => void
  ): Phaser.GameObjects.Image {
    const img = this.add.image(x, y, key).setInteractive({ useHandCursor: true });

    const targetWidth = 110;
    const scale = targetWidth / img.width;
    img.setScale(scale);

    img.on("pointerdown", onClick)
       .on("pointerover", () => img.setTint(0xdddddd))
       .on("pointerout",  () => img.clearTint());

    return img;
  }

  private askYesNoQuestion(question: number): void {
    const { width: W, height: H } = this.scale;
    this.clearExistingQuestion();

    let qText: Phaser.GameObjects.Text;
    let yesBtn: Phaser.GameObjects.Text;
    let noBtn: Phaser.GameObjects.Text;

    if (question === 1) {
      qText = this.add.text(
        W / 2,
        H / 2 - 100,
        "Should you flush paper towels down your toilet?",
        {
          fontSize: "26px",
          color: "#000",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: { x: 10, y: 5 },
        }
      ).setOrigin(0.5);
      this.speak(qText.text);

      yesBtn = this.makeTextBtn(W / 2, H / 2 - 40, "Yes(Y)", () => {
        this.showAnswer("Incorrect\n You should NOT flush paper towels down your toilet.\nIt can clog your pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });

      noBtn = this.makeTextBtn(W / 2, H / 2 + 10, "No(N)", () => {
        this.showAnswer("Correct\nYou should NOT flush paper towels down your toilet.\nIt can clog your pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });
    } else if (question === 2) {
      qText = this.add.text(
        W / 2,
        H / 2 - 100,
        "Should you pour water down your sink drain?",
        {
          fontSize: "26px",
          color: "#000",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: { x: 10, y: 5 },
        }
      ).setOrigin(0.5);
      this.speak(qText.text);

      yesBtn = this.makeTextBtn(W / 2, H / 2 - 40, "Yes(Y)", () => {
        this.showAnswer("Correct\nWater is safe to pour down the sink!\nJust be careful not to waste it.");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });

      noBtn = this.makeTextBtn(W / 2, H / 2 + 10, "No(N)", () => {
        this.showAnswer("Incorrect\nWater is safe to pour down the sink!\nJust be careful not to waste it.");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });
    } else if (question === 3) {
      qText = this.add.text(
        W / 2,
        H / 2 - 100,
        "Should you put flushable wipes in the toilet?",
        {
          fontSize: "26px",
          color: "#000",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: { x: 10, y: 5 },
        }
      ).setOrigin(0.5);
      this.speak(qText.text);

      yesBtn = this.makeTextBtn(W / 2, H / 2 - 40, "Yes(Y)", () => {
        this.showAnswer("Incorrect\nYou should NOT put flushable wipes in the toilet.\nThey can clog pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });

      noBtn = this.makeTextBtn(W / 2, H / 2 + 10, "No(N)", () => {
        this.showAnswer("Correct\nYou should NOT put flushable wipes in the toilet.\nThey can clog pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });
    } else if (question === 4) {
      qText = this.add.text(
        W / 2,
        H / 2 - 100,
        "Should you pour oils and grease down the drain?",
        {
          fontSize: "26px",
          color: "#000",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: { x: 10, y: 5 },
        }
      ).setOrigin(0.5);
      this.speak(qText.text);

      yesBtn = this.makeTextBtn(W / 2, H / 2 - 40, "Yes(Y)", () => {
        this.showAnswer("Incorrect\nYou should NEVER pour grease or oil down the drain.\nIt will clog your sewer pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });

      noBtn = this.makeTextBtn(W / 2, H / 2 + 10, "No(N)", () => {
        this.showAnswer("Correct\nYou should NEVER pour grease or oil down the drain.\nIt will clog your sewer pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });
    } else {
      qText = this.add.text(
        W / 2,
        H / 2 - 100,
        "Should you put leftover food in the compost instead of the sink?",
        {
          fontSize: "26px",
          color: "#000",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: { x: 10, y: 5 },
          wordWrap: { width: 600 },
        }
      ).setOrigin(0.5);
      this.speak(qText.text);

      yesBtn = this.makeTextBtn(W / 2, H / 2 - 40, "Yes(Y)", () => {
        this.showAnswer("Correct\nYou should NOT put leftover food down the sink.\nIt can clog the pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });

      noBtn = this.makeTextBtn(W / 2, H / 2 + 10, "No(N)", () => {
        this.showAnswer("Incorrect\nYou should NOT put leftover food down the sink.\nIt can clog the pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });
    }

    this.input.keyboard!.removeAllListeners("keydown-Y");
    this.input.keyboard!.removeAllListeners("keydown-N");
    this.input.keyboard!.on("keydown-Y", () => {
      yesBtn.emit("pointerdown");
    });
    this.input.keyboard!.on("keydown-N", () => {
      noBtn.emit("pointerdown");
    });

    this.activeObjects = [qText, yesBtn, noBtn];
  }

  private makeTextBtn(x: number, y: number, label: string, cb: () => void) {
    const btn = this.add
      .text(x, y, label, {
        color: "#000",
        fontSize: "24px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", cb)
      .on("pointerover", () => btn.setStyle({ backgroundColor: "#dddddd" }))
      .on("pointerout", () => btn.setStyle({ backgroundColor: "#ffffff" }));
    return btn;
  }

  private clearOptionsOnly(
    q: Phaser.GameObjects.Text,
    yes: Phaser.GameObjects.Text,
    no: Phaser.GameObjects.Text
  ) {
    yes.destroy();
    no.destroy();
    this.activeObjects = [q];
  }

  private clearExistingQuestion() {
    this.stopSpeaking();
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

    this.currentAnswerText = this.add.text(W / 2, H / 2 - 30, text, {
      fontSize: "22px",
      color: "#000",
      align: "center",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      padding: { x: 10, y: 5 },
      wordWrap: { width: 600 },
    }).setOrigin(0.5);

    this.speak(text, { rate: 1.05 });
  }

  // Wrappers around the global helper
  private speak(text: string, opts?: { rate?: number; pitch?: number }) {
    if (!this.ttsEnabled) return;
    TTS.speak(text, opts);
  }

  private stopSpeaking() {
    TTS.stop();
  }
}
