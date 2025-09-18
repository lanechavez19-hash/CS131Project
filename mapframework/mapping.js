const canvas = document.createElement('canvas');
canvas.width = 600;
canvas.height = 400;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Isometric tile size
const tileWidth = 80;
const tileHeight = 40;

// Map data: 2 locations (A and B)
const locations = [
    { name: 'A', x: 2, y: 2, color: 'red' },
    { name: 'B', x: 5, y: 4, color: 'blue' }
];

// Draw isometric tile
function drawTile(x, y, color) {
    const screenX = (x - y) * tileWidth / 2 + canvas.width / 2;
    const screenY = (x + y) * tileHeight / 2 + 50;
    ctx.beginPath();
    ctx.moveTo(screenX, screenY);
    ctx.lineTo(screenX + tileWidth / 2, screenY + tileHeight / 2);
    ctx.lineTo(screenX, screenY + tileHeight);
    ctx.lineTo(screenX - tileWidth / 2, screenY + tileHeight / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();
    return { screenX, screenY };
}

// Draw map grid
function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
            drawTile(x, y, '#e0e0e0');
        }
    }
    // Draw locations
    locations.forEach(loc => {
        const { screenX, screenY } = drawTile(loc.x, loc.y, loc.color);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(loc.name, screenX, screenY + tileHeight / 1.2);
    });
}

// Handle selection
let selected = null;
canvas.addEventListener('click', function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    selected = null;
    locations.forEach(loc => {
        const { screenX, screenY } = drawTile(loc.x, loc.y, loc.color);
        // Simple hit test
        if (
            mouseX > screenX - tileWidth / 2 &&
            mouseX < screenX + tileWidth / 2 &&
            mouseY > screenY &&
            mouseY < screenY + tileHeight
        ) {
            selected = loc;
        }
    });
    drawMap();
    if (selected) {
        const { screenX, screenY } = drawTile(selected.x, selected.y, selected.color);
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX + tileWidth / 2, screenY + tileHeight / 2);
        ctx.lineTo(screenX, screenY + tileHeight);
        ctx.lineTo(screenX - tileWidth / 2, screenY + tileHeight / 2);
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = 1;
    }
});

drawMap();