import Phaser from "phaser";
import { addControlButtons } from "./ui/Buttons";

type CampObj = {
    key: string;
    x: number;
    y: number;
    img: string;
    yesImg: string;
    noImg: string;
    id: string;
    question: string;
    yesFeedback: string;
    noFeedback: string;
};

export default class Game3Scene extends Phaser.Scene {
    constructor() { super({ key: 'Game3' }); }
    campObjects: CampObj[] = [
        {
            key: 'bottle',
            x: 200, y: 300,
            img: 'main1.png',
            yesImg: 'yes1.png',
            noImg: 'no1.png',
            id: 'obj1',
            question: 'Should you recycle this empty bottle?',
            yesFeedback: 'Correct! Bottles belong in recycling.',
            noFeedback: 'Oops! We should ALWAYS recycle bottles.'
        },
        {
            key: 'wrapper',
            x: 420, y: 360,
            img: 'main2.png',
            yesImg: 'yes2.png',
            noImg: 'no2.png',
            id: 'obj2',
            question: 'Is it okay to throw this wrapper on the ground?',
            yesFeedback: 'No! We should protect nature.',
            noFeedback: 'Right! Littering harms animals.'
        },
        {
            key: 'firepit',
            x: 600, y: 240,
            img: 'main3.png',
            yesImg: 'yes3.png',
            noImg: 'no3.png',
            id: 'obj3',
            question: 'Should you put out your campfire before leaving?',
            yesFeedback: 'Great! That keeps the forest safe.',
            noFeedback: 'Wrong! Always put out fires before leaving.'
        }
    ];

    preload() {
        this.load.image('main1.png', 'assets/main1.png');
        this.load.image('main2.png', 'assets/main2.png');
        this.load.image('main3.png', 'assets/main3.png');
        this.load.image('yes1.png', 'assets/yes1.png');
        this.load.image('no1.png', 'assets/no1.png');
        this.load.image('yes2.png', 'assets/yes2.png');
        this.load.image('no2.png', 'assets/no2.png');
        this.load.image('yes3.png', 'assets/yes3.png');
        this.load.image('no3.png', 'assets/no3.png');
    }

    create() {
        // Hide main menu on game start
        const mainMenu = document.getElementById('main-menu');
        addControlButtons(this);
        if (mainMenu) mainMenu.style.display = 'none';
        document.querySelectorAll('.clickable').forEach(e => e.remove());
        this.add.text(30, 30, 'Camping Game: Make eco-friendly choices!', { font: '24px Arial', color: '#064720' });

        // Add interactive objects (HTML) for modal logic
        this.campObjects.forEach(obj => {
            const div = document.createElement('div');
            div.className = 'clickable';
            div.setAttribute('data-img', `assets/${obj.img}`);
            div.setAttribute('data-yes', `assets/${obj.yesImg}`);
            div.setAttribute('data-no', `assets/${obj.noImg}`);
            div.setAttribute('data-id', obj.id);
            div.setAttribute('data-question', obj.question);
            div.setAttribute('data-yes-feedback', obj.yesFeedback);
            div.setAttribute('data-no-feedback', obj.noFeedback);
            div.style.top = obj.y + 'px';
            div.style.left = obj.x + 'px';
            document.body.appendChild(div);
        });

        // DOM hooks for modal functionality
        const objects = Array.from(document.querySelectorAll('.clickable')) as HTMLElement[];
        const modal = document.getElementById('modal') as HTMLElement;
        const modalImg = document.getElementById('modal-img') as HTMLImageElement;
        const closeBtn = document.querySelector('.close') as HTMLElement;
        const yesBtn = document.getElementById('yes-btn') as HTMLButtonElement;
        const noBtn = document.getElementById('no-btn') as HTMLButtonElement;
        const modalMsg = document.getElementById('modal-message') as HTMLElement;
        let currentObject: HTMLElement | null = null;

        setInterval(() => {
            objects.forEach(obj => {
                obj.classList.add('glow');
                setTimeout(() => obj.classList.remove('glow'), 1000);
            });
        }, 3000);

        objects.forEach(obj => {
            obj.addEventListener('click', (e) => {
                e.stopPropagation();
                const imgSrc = obj.getAttribute('data-img');
                const question = obj.getAttribute('data-question');
                modalImg.src = imgSrc ?? "";
                modal.style.display = 'flex';
                modalMsg.textContent = question ?? "";
                currentObject = obj;
            });
        });

        closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
        yesBtn.addEventListener('click', () => {
            if (currentObject) {
                const yesImg = currentObject.getAttribute('data-yes');
                const feedback = currentObject.getAttribute('data-yes-feedback');
                modalImg.src = yesImg ?? "";
                modalMsg.textContent = feedback ?? "";
                setTimeout(() => { modal.style.display = 'none'; }, 1200);
            }
        });
        noBtn.addEventListener('click', () => {
            if (currentObject) {
                const noImg = currentObject.getAttribute('data-no');
                const feedback = currentObject.getAttribute('data-no-feedback');
                modalImg.src = noImg ?? "";
                modalMsg.textContent = feedback ?? "";
                setTimeout(() => { modal.style.display = 'none'; }, 1200);
            }
        });
    }
}
