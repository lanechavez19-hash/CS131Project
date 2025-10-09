import Phaser from "phaser";
import { addControlButtons } from "./ui/Buttons";

type CampObj = {
    key: string;
    question: string;
    correctAnswer: boolean; // true = Yes, false = No
    correctFeedback: string;
    incorrectFeedback: string;
};

export default class Game3Scene extends Phaser.Scene {
    private currentAnswerText?: Phaser.GameObjects.Text;
    private activeObjects: Phaser.GameObjects.GameObject[] = [];

    constructor() {
        super("Game3");
    }

    // Define camping/wildlife questions
    private campObjects: CampObj[] = [
        {
            key: 'bottle',
            question: 'Should you recycle this empty water bottle?',
            correctAnswer: true, // Yes is correct
            correctFeedback: 'Correct!\nAlways recycle bottles to protect nature!',
            incorrectFeedback: 'Incorrect!\nWe should always recycle bottles!'
        },
        {
            key: 'wrapper',
            question: 'Is it okay to leave food wrappers on the ground?',
            correctAnswer: false, // No is correct
            correctFeedback: 'Correct!\nNever litter! It harms wildlife.',
            incorrectFeedback: 'Incorrect!\nLittering hurts animals and nature!'
        },
        {
            key: 'firepit',
            question: 'Should you put out your campfire before leaving?',
            correctAnswer: true, // Yes is correct
            correctFeedback: 'Correct!\nAlways extinguish fires to prevent wildfires!',
            incorrectFeedback: 'Incorrect!\nNever leave a campfire burning!'
        }
    ];

    create() {
        const { width: W } = this.scale;

        // Title
        this.add.text(W / 2, 100, "Camping & Wildlife Game", {
            fontSize: "28px",
            color: "#000000",
        }).setOrigin(0.5);

        // Add pause/mute buttons
        addControlButtons(this);

        // === Three Question buttons horizontally ===
        const startX = W / 2 - 200;
        const spacing = 200;
        const yPos = 400;

        this.makeBtn(startX, yPos, "Bottle", () =>
            this.askYesNoQuestion(0)
        );

        this.makeBtn(startX + spacing, yPos, "Wrapper", () =>
            this.askYesNoQuestion(1)
        );

        this.makeBtn(startX + spacing * 2, yPos, "Campfire", () =>
            this.askYesNoQuestion(2)
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
    private askYesNoQuestion(index: number): void {
        const { width: W, height: H } = this.scale;

        // Clear previous question and answer
        this.clearExistingQuestion();

        const obj = this.campObjects[index];

        // Create question text
        const questionText = this.add.text(W / 2, H / 2 - 50, obj.question, {
            fontSize: "26px",
            color: "#000000",
            backgroundColor: "#eeeeee",
            padding: { x: 10, y: 5 },
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        // YES button
        const yesBtn = this.makeBtn(W / 2, H / 2 + 20, "Yes", () => {
            if (obj.correctAnswer === true) {
                this.showAnswer(obj.correctFeedback);
            } else {
                this.showAnswer(obj.incorrectFeedback);
            }
            this.clearOptionsOnly(questionText, yesBtn, noBtn);
        });

        // NO button
        const noBtn = this.makeBtn(W / 2, H / 2 + 80, "No", () => {
            if (obj.correctAnswer === false) {
                this.showAnswer(obj.correctFeedback);
            } else {
                this.showAnswer(obj.incorrectFeedback);
            }
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

    // Show player's answer (moved higher on screen)
    private showAnswer(text: string): void {
        const { width: W, height: H } = this.scale;

        // Remove any existing answer before showing a new one
        if (this.currentAnswerText) {
            this.currentAnswerText.destroy();
        }

        // Moved from H/2 + 140 to H/2 + 80 so it's more visible
        this.currentAnswerText = this.add.text(W / 2, H / 2 + 80, text, {
            fontSize: "24px",
            color: "#000000",
            wordWrap: { width: 600 },
            align: "center"
        }).setOrigin(0.5);
    }
}
