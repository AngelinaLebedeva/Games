const ROWSCOUNT = 20;
const COLUMNSCOUNT = 10;
const SQUARESIZE = 30;

let score = 0;
let bestScore = localStorage.getItem("best-score-tetris") || 0;
let context = 0;

let field;
let figure;
let state;
let pauseCount = 60;
let pauseTicks = pauseCount;

let mainInterval;
let button;
let animation;

const figuresTemplate = [
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 2, 2],
    [2, 2, 0],
    [0, 0, 0],
  ],
  [
    [0, 3, 0],
    [0, 3, 0],
    [3, 3, 0],
  ],
  [
    [0, 0, 0],
    [4, 4, 4],
    [0, 4, 0],
  ],
  [
    [0, 5, 0],
    [0, 5, 0],
    [0, 5, 5],
  ],
  [
    [0, 6, 0, 0],
    [0, 6, 0, 0],
    [0, 6, 0, 0],
    [0, 6, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 7, 7, 0],
    [0, 7, 7, 0],
    [0, 0, 0, 0],
  ],
];

class Field {
  constructor(wight, height) {
    this.width = wight;
    this.height = height;
    this.blocks = Array(height)
      .fill()
      .map(() => Array(wight).fill(0));
  }

  collision(figure) {
    for (let i = 0; i < figure.size; i++) {
      for (let j = 0; j < figure.size; j++) {
        let fx = figure.x + j;
        let fy = figure.y + i;
        if (figure.block[i][j] != 0) {
          if (fx < 0 || fx >= this.width || fy < 0 || fy >= this.height)
            return 1;
          if (this.blocks[fy][fx] != 0) return 1;
        }
      }
    }
    return 0;
  }

  plantFigure(figure) {
    for (let i = 0; i < figure.size; i++) {
      for (let j = 0; j < figure.size; j++) {
        if (figure.block[i][j] != 0) {
          let fx = figure.x + j;
          let fy = figure.y + i;
          if (fx >= 0 && fy >= 0) {
            this.blocks[fy][fx] = figure.block[i][j];
          }
        }
      }
    }
  }

  lineIsFilled(num) {
    for (let i = 0; i < this.width; i++) {
      if (this.blocks[num][i] == 0) return false;
    }
    return true;
  }

  shiftLines(num) {
    for (let i = num; i > 0; i--) {
      for (let j = 0; j < this.width; j++) {
        this.blocks[i][j] = this.blocks[i - 1][j];
      }
    }
  }

  eraseLines() {
    let count = 0;
    for (let i = this.height - 1; i > 0; i--) {
      while (this.lineIsFilled(i)) {
        this.shiftLines(i);
        count++;
      }
    }
    return count;
  }

  draw() {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        drawBlock(i, j, getColor(this.blocks[i][j]));
      }
    }
  }
}

class Figure {
  constructor(number, x, y) {
    this.figure = figuresTemplate[number];
    this.size = this.figure.length;
    this.x = x;
    this.y = y;
    this.block = figuresTemplate[number];
  }

  moveDown() {
    this.y++;
  }

  moveUp() {
    this.y--;
  }

  moveLeft() {
    this.x--;
  }

  moveRight() {
    this.x++;
  }

  rotate(field) {
    const size = this.size;
    const rotated = Array(size)
      .fill()
      .map(() => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        rotated[j][size - 1 - i] = this.block[i][j];
      }
    }

    const oldBlock = this.block;

    this.block = rotated;

    if (field.collision(this)) {
      this.block = oldBlock;
      return false;
    }
    return true;
  }

  createNew(field) {
    figure = new Figure(
      Math.floor(Math.random() * figuresTemplate.length),
      3,
      0,
    );
  }

  draw() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.block[i][j] != 0)
          drawBlock(i + this.y, j + this.x, getColor(this.block[i][j]));
      }
    }
  }
}

function createCanvas() {
  let canvas = document.createElement("canvas");
  canvas.width = COLUMNSCOUNT * SQUARESIZE;
  canvas.height = ROWSCOUNT * SQUARESIZE;
  context = canvas.getContext("2d");
  let container = document.getElementById("canvas");

  document.body.insertBefore(canvas, container);

  button = document.createElement("input");
  button.onclick = () => pressButtonHandler();
  button.id = "button";
  button.setAttribute("type", "button");
  button.setAttribute("value", "Начать");
  container.after(button);
  button = document.querySelector("#button");
}

function startGame() {
  field = new Field(COLUMNSCOUNT, ROWSCOUNT);
  figure = new Figure(Math.floor(Math.random() * figuresTemplate.length), 3, 0);

  state = 1;
  score = 0;

  document.getElementById("best-score").innerText = bestScore;
  document.getElementById("score").innerText = score;

  field.draw();
  button.setAttribute("value", "Начать");
}

function updateGame() {
  if (state == 0) {
    gameOver();
    cancelAnimationFrame(animation);
    return 0;
  }

  if (state == 2) {
    return 0;
  }

  if (pauseTicks <= 0) {
    pauseTicks = pauseCount;
    figure.moveDown();
    if (field.collision(figure)) {
      figure.moveUp();
      field.plantFigure(figure);
      score += field.eraseLines();
      document.getElementById("score").innerText = score;
      if (bestScore < score) {
        bestScore = score;
        localStorage.setItem("best-score-tetris", bestScore);
        document.getElementById("best-score").innerText = bestScore;
      }
      figure.createNew(field);
      figure.moveDown();
      if (field.collision(figure)) {
        figure.moveUp();
        state = 0;
        button.setAttribute("value", "Начать заново");
      } else {
        figure.moveUp();
      }
    }
  }

  field.draw();
  figure.draw();

  pauseTicks--;

  animation = requestAnimationFrame(updateGame);
}

function drawBlock(y, x, color) {
  context.fillStyle = color;
  context.fillRect(SQUARESIZE * x, SQUARESIZE * y, SQUARESIZE, SQUARESIZE);
  context.strokeStyle = "black";
  context.strokeRect(SQUARESIZE * x, SQUARESIZE * y, SQUARESIZE, SQUARESIZE);
}

createCanvas();
startGame();

document.addEventListener("keydown", keyUpHandler);

function getColor(square) {
  switch (square) {
    case 0:
      return "white";
    case 1:
      return "blue";
    case 2:
      return "red";
    case 3:
      return "yellow";
    case 4:
      return "orange";
    case 5:
      return "green";
    case 6:
      return "purple";
    case 7:
      return "gold";
  }
}

function drawText(font, color, text, x, y) {
  context.font = font;
  context.fillStyle = color;
  console.log(text);
  context.fillText(text, x, y);
}

function gameOver() {
  drawText("40px Arial", "#003366", "GAME OVER", SQUARESIZE, 10 * SQUARESIZE);
}

function keyUpHandler(e) {
  if (e.code == "ArrowLeft") {
    figure.moveLeft();
    if (field.collision(figure)) {
      figure.moveRight();
    }
  } else if (e.code == "ArrowRight") {
    figure.moveRight();
    if (field.collision(figure)) {
      figure.moveLeft();
    }
  } else if (e.code == "ArrowUp") {
    figure.rotate(field);
  } else if (e.code == "ArrowDown") {
    figure.moveDown();
    if (field.collision(figure)) {
      figure.moveUp();
    }
  }
}

function pressButtonHandler() {
  if (state == 0) {
    startGame();
    return 0;
  }
  if (state == 2) {
    button.setAttribute("value", "Пауза");
    state = 1;
    updateGame();
    return 0;
  }

  if (state == 1) {
    if (
      button.getAttribute("value") == "Начать" ||
      button.getAttribute("value") == "Начать заново"
    ) {
      button.setAttribute("value", "Пауза");
      updateGame();
    } else if (button.getAttribute("value") == "Пауза") {
      state = 2;
      button.setAttribute("value", "Возобновить");
      cancelAnimationFrame(animation);
    }
  }
}
