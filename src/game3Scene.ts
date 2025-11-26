import Phaser from "phaser";
import { addControlButtons } from "./ui/Buttons";

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

    // TTS: state
    private ttsEnabled = true;
    private ttsReady = false;
    private introSpoken = false;
    private ttsVoice?: SpeechSynthesisVoice;

    constructor() {
        super("Game3");
    }

    private campObjects: CampObj[] = [
        {
            key: 'raccoon',
            question: 'Is it ok to feed squirrels or raccoons?',
            correctAnswer: false,
            correctFeedback: 'Correct!\nNever. Feeding wildlife does more harm than good.',
            incorrectFeedback: 'Incorrect!\nFeeding wildlife does more harm than good.'
        },
        {
            key: 'wrapper',
            question: 'Is it okay to leave food wrappers on the ground?',
            correctAnswer: false,
            correctFeedback: 'Correct!\nNever litter! It harms wildlife.',
            incorrectFeedback: 'Incorrect!\nLittering hurts animals and nature!'
        },
        {
            key: 'appleTree',
            question: 'Should you pick up the fallen fruit?',
            correctAnswer: true,
            correctFeedback: 'Correct!\nPick up fallen fruit to avoid pest problems.',
            incorrectFeedback: 'Incorrect!\nPick up fallen fruit to avoid pest problems.'
        },
        {
            key: 'mosquito',
            question: 'Is it okay to squish all bugs when you see them?',
            correctAnswer: false,
            correctFeedback: 'Correct!\nNot all bugs are bad, many are helpful!',
            incorrectFeedback: 'Incorrect!\nNot all bugs are bad, many are helpful!'
        },
        {
            key: 'dog',
            question: 'Should you pick up your dog poop?',
            correctAnswer: true,
            correctFeedback: 'Correct!\nAlways pick up after your dog(s).',
            incorrectFeedback: 'Incorrect!\nAlways pick up after your dog(s).'
        },
    ];

    preload() {
        // Load background
        this.load.image("park", "assets/images/park.png");

        // Load button images
        this.load.image("raccoon", "assets/images/racoon.png");
        this.load.image("wrapper", "assets/images/wrapper.png");
        this.load.image("appleTree", "assets/images/appleTree.png");
        this.load.image("mosquito", "assets/images/mosquito.png");
        this.load.image("dog", "assets/images/dog.png");
    }

    create() {
        const { width: W, height: H } = this.scale;

        // Add background image
        const bg = this.add.image(W / 2, H / 2, "park");
        bg.setDisplaySize(W, H);

        this.add.text(W / 2, 60, "Click the image or press the button to get your question", {
            fontSize: "23px",
            color: "#000000",
            fontStyle: "bold",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
        }).setOrigin(0.5);

        // Add pause/mute buttons
        addControlButtons(this);

        // === Five Question buttons horizontally ===
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

        // Keyboard shortcuts for selecting items
        this.input.keyboard!.on('keydown-R', () => this.askYesNoQuestion(0));
        this.input.keyboard!.on('keydown-W', () => this.askYesNoQuestion(1));
        this.input.keyboard!.on('keydown-A', () => this.askYesNoQuestion(2));
        this.input.keyboard!.on('keydown-B', () => this.askYesNoQuestion(3));
        this.input.keyboard!.on('keydown-D', () => this.askYesNoQuestion(4));

        // TTS toggle only
        this.input.keyboard!.on('keydown-T', () => {
            this.ttsEnabled = !this.ttsEnabled;
            this.stopSpeaking();
            const status = this.ttsEnabled ? "on" : "off";
            this.speak(`Text to speech ${status}.`);
        });

        // Labels under buttons
        this.add.text(startX, yPos + 25, "Raccoon(R)", { fontSize: "17px", fontStyle: "bold", color: "#000" }).setOrigin(0.5);
        this.add.text(startX + spacing, yPos + 25, "Wrapper(W)", { fontSize: "17px", fontStyle: "bold", color: "#000" }).setOrigin(0.5);
        this.add.text(startX + spacing * 2, yPos + 25, "Apple Tree(A)", { fontSize: "17px", fontStyle: "bold", color: "#000" }).setOrigin(0.5);
        this.add.text(startX + spacing * 3, yPos + 25, "Bugs(B)", { fontSize: "17px", fontStyle: "bold", color: "#000" }).setOrigin(0.5);
        this.add.text(startX + spacing * 4, yPos + 25, "Dog Poop(D)", { fontSize: "17px", fontStyle: "bold", color: "#000" }).setOrigin(0.5);

        // TTS: setup & controls
        this.initTTSOnceOnFirstGesture();
    }

    // Create interactive IMAGE buttons
    private makeImageBtn(
        x: number,
        y: number,
        imageKey: string,
        callback: () => void
    ): Phaser.GameObjects.Image {
        const btn = this.add.image(x, y, imageKey)
            .setOrigin(0.5)
            .setDisplaySize(150, 150) // Set a fixed width and height
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", callback)
            .on("pointerover", () => btn.setTint(0xdddddd))
            .on("pointerout", () => btn.clearTint());

        return btn;
    }

    // Create text buttons (for Yes/No)
    private makeTextBtn(
        x: number,
        y: number,
        label: string,
        callback: () => void
    ): Phaser.GameObjects.Text {
        const btn = this.add.text(x, y, label, {
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
             .on("pointerout", () => btn.setStyle({ backgroundColor: "rgba(255, 255, 255, 0.9)" }));

        return btn;
    }

    private askYesNoQuestion(index: number): void {
        const { width: W, height: H } = this.scale;

        this.clearExistingQuestion();

        const obj = this.campObjects[index];

        const questionText = this.add.text(W / 2, H / 2 - 100, obj.question, {
            fontSize: "24px",
            color: "#000000",
            fontStyle: "bold",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: { x: 10, y: 5 },
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        this.speak(obj.question); // TTS: read the question

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
        this.stopSpeaking(); // TTS: cancel current utterance

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

        this.currentAnswerText = this.add.text(W / 2, H / 2, text, {
            fontSize: "24px",
            color: "#000000",
            fontStyle: "bold",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: { x: 10, y: 5 },
            wordWrap: { width: 600 },
            align: "center"
        }).setOrigin(0.5);

        this.speak(text, { rate: 1.05 }); // TTS: read the feedback
    }

    // TTS: Initialize once on first gesture
    private initTTSOnceOnFirstGesture() {
        const enable = () => {
            if (this.ttsReady) return;
            this.ttsReady = true;

            // Pick voices
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

            // Speak intro ONCE only
            if (!this.introSpoken) {
                this.introSpoken = true;
                this.speak(
                    "Welcome to Urban Wildlife Game. Press R, W, A, B, or D to choose an item. Use Y for Yes, N for No. Press T to toggle narration."
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