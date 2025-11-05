import Phaser from "phaser";
import { addControlButtons } from "./ui/Buttons";

export default class Game1Scene extends Phaser.Scene {
  private currentAnswerText?: Phaser.GameObjects.Text;
  private activeObjects: Phaser.GameObjects.GameObject[] = [];

  // --- TTS: state ---
  private ttsEnabled = true;
  private ttsReady = false;
  private introSpoken = false;
  private ttsVoice?: SpeechSynthesisVoice;

  constructor() {
    super("Game1");
  }

  // 🔹 1. Load your images
  preload() {
    // Load background
    this.load.image("counter", "assets/images/counter.png");
    // Load button images
    this.load.image("PaperTowel", "assets/images/PaperTowel.png");
    this.load.image("water", "assets/images/water.png");
    this.load.image("wipes", "assets/images/wipes.png");
    this.load.image("oil", "assets/images/oil.png");
    this.load.image("LeftoverFood", "assets/images/LeftoverFood.png");
  }

  // 🔹 2. Create the scene
  create() {
    const { width: W, height: H } = this.scale;

    // Add background image
        const bg = this.add.image(W / 2, H / 2, "counter");
        bg.setDisplaySize(W, H);

    // Title
    this.add.text(W / 2, 50, "Pretreatment Game", {
      fontSize: "28px",
      color: "#000000",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
    }).setOrigin(0.5);

    // Add pause/mute buttons (already provided by your UI system)
    addControlButtons(this);

    // === Image Buttons ===
    const startX = W / 2 - 300;
    const spacing = 150;
    const yPos = 298;

    // Create clickable image buttons
    this.makeImageBtn(startX, yPos, "PaperTowel", () => this.askYesNoQuestion(1));
    this.makeImageBtn(startX + spacing, yPos, "water", () => this.askYesNoQuestion(2));
    this.makeImageBtn(startX + spacing * 2, yPos, "wipes", () => this.askYesNoQuestion(3));    
    this.makeImageBtn(startX + spacing * 3, yPos, "oil", () => this.askYesNoQuestion(4));    
    this.makeImageBtn(startX + spacing * 4, yPos, "LeftoverFood", () => this.askYesNoQuestion(5));    

    //Make image buttons selectable via keyboard
    this.input.keyboard!.on('keydown-P', () => this.askYesNoQuestion(1));
    this.input.keyboard!.on('keydown-W', () => this.askYesNoQuestion(2));
    this.input.keyboard!.on('keydown-F', () => this.askYesNoQuestion(3));
    this.input.keyboard!.on('keydown-O', () => this.askYesNoQuestion(4));
    this.input.keyboard!.on('keydown-L', () => this.askYesNoQuestion(5));

    // Optional text labels under images
    this.add.text(startX, yPos + 70, "Paper Towels(P)", { fontSize: "17px", color: "#000" }).setOrigin(0.5);
    this.add.text(startX + spacing, yPos + 70, "Water(W)", { fontSize: "17px", color: "#000" }).setOrigin(0.5);
    this.add.text(startX + spacing * 2, yPos + 70, "Fushable Wipes(F)", { fontSize: "17px", color: "#000" }).setOrigin(0.5);
    this.add.text(startX + spacing * 3, yPos + 70, "Oil(O)", { fontSize: "17px", color: "#000" }).setOrigin(0.5);
    this.add.text(startX + spacing * 4, yPos + 70, "Leftover Food(L)", { fontSize: "17px", color: "#000" }).setOrigin(0.5);
    
    // ===== TTS: setup & controls =====
    this.initTTSOnceOnFirstGesture();

    this.input.keyboard!.on("keydown-T", () => {
      this.ttsEnabled = !this.ttsEnabled;
      this.stopSpeaking();
      const status = this.ttsEnabled ? "on" : "off";
      this.speak(`Text to speech ${status}.`);
    });
    this.input.keyboard!.on("keydown-M", () => this.stopSpeaking());

    // ===== END TTS =====
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
      qText = this.add.text(W / 2, H / 2 - 100, "Should you flush paper towels down your toilet?", {
        fontSize: "26px",
        color: "#000",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5);
      this.speak(qText.text);

      yesBtn = this.makeTextBtn(W / 2, H / 2 - 40, "Yes(Y)", () => {
        this.showAnswer("Incorrect\n You should NOT flush paper towels down your toilet.\nIt can clog your pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });

      noBtn = this.makeTextBtn(W / 2, H / 2 + 10, "No(N)", () => {
        this.showAnswer("Correct\nYou should NOT flush paper towels down your toilet.\nIt can clog your pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });
    } 
    else if (question === 2) {
      qText = this.add.text(W / 2, H / 2 - 100, "Should you pour water down your sink drain?", {
        fontSize: "26px",
        color: "#000",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5);
      this.speak(qText.text);

      yesBtn = this.makeTextBtn(W / 2, H / 2 - 40, "Yes(Y)", () => {
        this.showAnswer("Correct\nWater is safe to pour down the sink!\nJust be careful not to waste it.");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });

      noBtn = this.makeTextBtn(W / 2, H / 2 + 10, "No(N)", () => {
        this.showAnswer("Incorrect\nWater is safe to pour down the sink!\nJust be careful not to waste it.");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });
    } 
    else if (question === 3) {
      qText = this.add.text(W / 2, H / 2 - 100, "Should you put flushable wipes in the toilet?", {
        fontSize: "26px",
        color: "#000",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5);
      this.speak(qText.text);

      yesBtn = this.makeTextBtn(W / 2, H / 2 - 40, "Yes(Y)", () => {
        this.showAnswer("Incorrect\nYou should NOT put flushable wipes in the toilet.\nThey can clog pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });

      noBtn = this.makeTextBtn(W / 2, H / 2 + 10, "No(N)", () => {
        this.showAnswer("Correct\nYou should NOT put flushable wipes in the toilet.\nThey can clog pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });
    }
    else if(question === 4){
      qText = this.add.text(W / 2, H / 2 - 100, "Should you pour oils and grease down the drain?", {
        fontSize: "26px",
        color: "#000",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5);
      this.speak(qText.text);

      yesBtn = this.makeTextBtn(W / 2, H / 2 - 40, "Yes(Y)", () => {
        this.showAnswer("Incorrect\nYou should NEVER pour grease or oil down the drain.\nIt will clog your sewer pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });

      noBtn = this.makeTextBtn(W / 2, H / 2 + 10, "No(N)", () => {
        this.showAnswer("Correct\nYou should NEVER pour grease or oil down the drain.\nIt will clog your sewer pipes!");
        this.clearOptionsOnly(qText, yesBtn, noBtn);
      });
    } 
    else {
      qText = this.add.text(W / 2, H / 2 - 100, "Should you put leftover food in the trash instead of the sink?", {
        fontSize: "26px",
        color: "#000",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        padding: { x: 10, y: 5 },
        wordWrap: { width: 600 },
      }).setOrigin(0.5);
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
    //make yes and no buttons selectable via Y and N keys
    this.input.keyboard!.removeAllListeners("keydown-Y");
    this.input.keyboard!.removeAllListeners("keydown-N");
    this.input.keyboard!.on("keydown-Y", () => {
      yesBtn.emit("pointerdown"); // simulate clicking the "Yes" button
    });
    this.input.keyboard!.on("keydown-N", () => {
      noBtn.emit("pointerdown"); // simulate clicking the "No" button
    });
    this.activeObjects = [qText, yesBtn, noBtn];
  }

  // 🔹 5. Text button helper (for Yes/No)
  private makeTextBtn(x: number, y: number, label: string, cb: () => void) {
    const btn = this.add.text(x, y, label, {
      color: "#000",
      fontSize: "24px",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
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
    this.stopSpeaking(); // TTS: cancel current utterance

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
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      padding: { x: 10, y: 5 },
      wordWrap: { width: 600 },
    }).setOrigin(0.5);

    this.speak(text, { rate: 1.05 }); // TTS: read the feedback
  }

  private initTTSOnceOnFirstGesture() {
  const enable = () => {
    if (this.ttsReady) return;
    this.ttsReady = true;

    // Pick voices (unchanged)
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      const pickVoice = () => {
        const voices = synth.getVoices();
        this.ttsVoice = voices.find(v => /en/i.test(v.lang)) || voices[0];
      };
      pickVoice();
      // @ts-ignore
      if (typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
        // @ts-ignore
        window.speechSynthesis.onvoiceschanged = pickVoice;
      }
    }

    // 🔊 Speak intro ONCE only, right here
    if (!this.introSpoken) {
      this.introSpoken = true;
      this.speak(
        "Welcome to Pretreatment Game. Press P, W, F, O, or L to choose an item. Use Y for Yes, N for No. Press T to toggle narration."
      );
    }
  };

  // These fire only once; whichever comes first enables TTS and speaks intro
  this.input.once("pointerdown", enable);
  this.input.keyboard?.once("keydown", enable);
}


  private speak(text: string, opts?: { rate?: number; pitch?: number }) {
    if (!this.ttsEnabled || !this.ttsReady) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    // Guard: if an old utterance is still going, let this queue after it
    const u = new SpeechSynthesisUtterance(text);
    if (this.ttsVoice) u.voice = this.ttsVoice;
    u.rate = opts?.rate ?? 1.0;   // 0.1–10
    u.pitch = opts?.pitch ?? 1.0; // 0–2
    synth.speak(u);
  }

  private stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}
