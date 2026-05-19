let board = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];
let score = 0;
let bestScore = localStorage.getItem("best-score-2048") || 0;
let rows = 4;
let colums = 4;

setGame();

function setGame() {
  board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  score = 0;
  bestScore = localStorage.getItem("best-score-2048") || 0;

  document.getElementById("board").replaceChildren();
  document.getElementById("board").classList.remove("over");
  if (document.getElementById("over")) document.getElementById("over").remove();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < colums; j++) {
      let tile = document.createElement("div");
      tile.id = i.toString() + "-" + j.toString();
      let num = board[i][j];
      updateTile(tile, num);
      document.getElementById("board").append(tile);
    }
  }

  document.getElementById("best-score").innerText = bestScore;
  document.getElementById("score").innerText = score;

  setTwo();
  setTwo();

  document.addEventListener("keyup", keyUpHandler);
  detectSwipe(document.getElementById("board"));
}

function updateTile(tile, num) {
  tile.innerText = "";
  tile.classList.value = "";
  tile.classList.add("tile");
  if (num > 0) {
    tile.innerText = num;
    if (num <= 4096) {
      tile.classList.add("x" + num.toString());
    } else {
      tile.classList.add("x8192");
    }
  }
}

function keyUpHandler(e) {
  if (e.code == "ArrowLeft") {
    slideLeft();
    setTwo();
  } else if (e.code == "ArrowRight") {
    slideRight();
    setTwo();
  } else if (e.code == "ArrowUp") {
    slideUp();
    setTwo();
  } else if (e.code == "ArrowDown") {
    slideDown();
    setTwo();
  }
  document.getElementById("score").innerText = score;
  if (bestScore < score) {
    bestScore = score;
    localStorage.setItem("best-score-2048", bestScore);
    document.getElementById("best-score").innerText = bestScore;
  }
}

function slide(row) {
  row = filterZero(row);
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] == row[i + 1]) {
      row[i] *= 2;
      row[i + 1] = 0;
      score += row[i];
    }
  }
  row = filterZero(row);

  while (row.length < colums) {
    row.push(0);
  }

  return row;
}

function filterZero(row) {
  return row.filter((num) => num != 0);
}

function slideLeft() {
  for (let r = 0; r < rows; r++) {
    let row = board[r];
    row = slide(row);
    board[r] = row;

    for (let c = 0; c < colums; c++) {
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = board[r][c];
      updateTile(tile, num);
    }
  }
}

function slideRight() {
  for (let r = 0; r < rows; r++) {
    let row = board[r];
    row.reverse();
    row = slide(row);
    row.reverse();
    board[r] = row;

    for (let c = 0; c < colums; c++) {
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = board[r][c];
      updateTile(tile, num);
    }
  }
}

function slideUp() {
  for (let c = 0; c < colums; c++) {
    let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
    row = slide(row);

    for (let r = 0; r < rows; r++) {
      board[r][c] = row[r];
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = board[r][c];
      updateTile(tile, num);
    }
  }
}

function slideDown() {
  for (let c = 0; c < colums; c++) {
    let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
    row.reverse();
    row = slide(row);
    row.reverse();

    for (let r = 0; r < rows; r++) {
      board[r][c] = row[r];
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = board[r][c];
      updateTile(tile, num);
    }
  }
}

function setTwo() {
  if (!hasEmptyTile()) {
    document.getElementById("board").classList.add("over");

    if (!document.getElementById("over")) {
      let resetButton = document.createElement("input");
      resetButton.onclick = () => setGame();
      resetButton.setAttribute("type", "button");
      resetButton.setAttribute("value", "Заново");
      resetButton.id = "over";
      document.getElementById("board").after(resetButton);
      document.removeEventListener("keyup", keyUpHandler);
    }
    return;
  }

  let found = false;
  while (!found) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * colums);

    if (board[r][c] == 0) {
      board[r][c] = 2;
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      tile.innerText = "2";
      tile.classList.add("x2");
      found = true;
    }
  }
}

function hasEmptyTile() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < colums; c++) {
      if (board[r][c] == 0) return true;
    }
  }
  return false;
}

function detectSwipe(element) {
  let startX, startY, startTime;
  const minDistance = 50;
  const maxTime = 300;

  element.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  });

  element.addEventListener("touchend", (e) => {
    if (!startX) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = Date.now() - startTime;

    if (deltaTime > maxTime) return;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minDistance) {
      if (deltaX > 0) {
        slideRight();
        setTwo();
      } else {
        slideLeft();
        setTwo();
      }
    } else if (Math.abs(deltaY) > minDistance) {
      if (deltaY > 0) {
        slideDown();
        setTwo();
      } else {
        slideUp();
        setTwo();
      }
    }

    startX = null; // сброс
  });
}
