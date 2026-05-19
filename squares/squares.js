const FIELD_SIZE = 10;

const block = document.querySelector(".block_container");
block.addEventListener("click", click);

const colors = ["red", "yellow", "blue", "green", "orange"];
let elems = [];
let score = 0;
let bestScore = localStorage.getItem("best-score-squares") || 0;

const scoreEl = document.createElement("div");
scoreEl.innerHTML = "Счет: " + score;
scoreEl.classList.add("score");
const bestScoreEl = document.createElement("div");
bestScoreEl.innerHTML = "Лучший результат: " + bestScore;
bestScoreEl.classList.add("score");
const info = document.querySelector(".info");
info.appendChild(scoreEl);
info.appendChild(bestScoreEl);
const button = document.createElement("input");
button.onclick = () => start();
button.setAttribute("type", "button");
button.setAttribute("value", "Заново");

info.appendChild(scoreEl);
info.appendChild(bestScoreEl);
info.after(button);

start();

function start() {
  score = 0;
  scoreEl.innerHTML = "Счет: " + score;
  block.replaceChildren();
  for (let i = 1; i < FIELD_SIZE ** 2 + 1; i++) {
    createCell(i);
  }
}

function randomColor() {
  let number = Math.floor(Math.random() * 5);
  return colors[number];
}

function createCell(num) {
  const el = document.createElement("div");
  el.id = num;
  el.classList.add(randomColor());
  block.append(el);
}

function changeColors(id1, id2) {
  if (
    Math.abs(Number(id1) - Number(id2)) === 1 ||
    Math.abs(Number(id1) - Number(id2)) === FIELD_SIZE
  ) {
    let el1 = document.getElementById(id1);
    let el2 = document.getElementById(id2);

    if (el1.classList.contains("picked")) el1.classList.remove("picked");
    let color1 = el1.classList[0];
    let color2 = el2.classList[0];

    el1.classList.remove(color1);
    el2.classList.remove(color2);
    el1.classList.add(color2);
    el2.classList.add(color1);
  }

  let row, col;
  [col, row] = findRow(id1);
  let successFlag = false;
  if (col.length > 2) {
    for (let i = 0; i < col.length; i++) {
      const el = document.getElementById(col[i]);
      el.className = "disabled";
    }
    successFlag = true;
    score = score + col.length * 2;
  }

  if (row.length > 2) {
    for (let i = 0; i < row.length; i++) {
      const el = document.getElementById(row[i]);
      el.className = "disabled";
    }
    successFlag = true;
    score = score + row.length * 2;
  }
  if (successFlag) setTimeout(fallColors(col, row), 3000);

  [col, row] = findRow(id2);
  successFlag = false;
  console.log("col =", col, "row = ", row);

  if (col.length > 2) {
    for (let i = 0; i < col.length; i++) {
      const el = document.getElementById(col[i]);
      el.className = "disabled";
    }
    successFlag = true;
    score = score + col.length * 2;
  }

  if (row.length > 2) {
    for (let i = 0; i < row.length; i++) {
      const el = document.getElementById(row[i]);
      el.className = "disabled";
    }
    successFlag = true;
    score = score + row.length * 2;
  }
  if (bestScore < score) {
    bestScore = score;
    bestScoreEl.innerHTML = "Лучший результат: " + bestScore;
    localStorage.setItem("best-score-squares", bestScore);
  }
  scoreEl.innerHTML = "Счет: " + score;

  if (successFlag) setTimeout(fallColors(col, row), 3000);
}

function click(e) {
  if (!e.target.classList.contains("block_container")) {
    if (elems.length < 1) {
      elems.push(e.target.id);
      e.target.classList.add("picked");
    } else {
      elems.push(e.target.id);
      if (
        document.getElementById(elems[0]).classList.contains("disabled") ||
        document.getElementById(elems[1]).classList.contains("disabled")
      ) {
        document.getElementById(elems[0]).classList.remove("picked");
        elems.length = 0;
      } else {
        changeColors(elems[0], elems[1]);
        document.getElementById(elems[0]).classList.remove("picked");
        elems.length = 0;
      }
    }
  }
}

function findRow(id) {
  let element = document.getElementById(id);
  let color = element.classList[0];
  let flag = false;
  let col = [id];
  let row = [id];

  //Поиск столбцов
  console.log("столбцы");
  let newId = String(Number(id) + FIELD_SIZE);
  do {
    flag = false;
    if (Number(newId) < FIELD_SIZE ** 2) {
      let nearElement = document.getElementById(newId);
      if (nearElement.classList[0] == color) {
        col.push(newId);
        flag = true;
        newId = +newId + +FIELD_SIZE;
      }
    }
  } while (flag);

  newId = String(Number(id) - FIELD_SIZE);
  do {
    flag = false;
    if (Number(newId) > 0) {
      let nearElement = document.getElementById(newId);
      if (nearElement.classList[0] == color) {
        col.push(newId);
        flag = true;
        newId = +newId - +FIELD_SIZE;
      }
    }
  } while (flag);

  // Поиск строк
  console.log("строки");
  newId = String(Number(id) + 1);
  do {
    flag = false;
    if (Number(newId) % 10 != 1) {
      let nearElement = document.getElementById(newId);
      if (nearElement.classList[0] == color) {
        row.push(newId);
        flag = true;
        newId = +newId + 1;
      }
    }
  } while (flag);

  newId = String(Number(id) - 1);
  do {
    flag = false;
    if (Number(newId) % 10 != 0) {
      let nearElement = document.getElementById(newId);
      if (nearElement.classList[0] == color) {
        row.push(newId);
        flag = true;
        newId = +newId - 1;
      }
    }
  } while (flag);

  return [col, row];
}

function fallColors(col, row) {
  row.sort();
  col.sort();
  console.log("sorted row=", row);
  console.log("sorted col=", col);
  row.forEach((item) => forEachRowElement(item, col));
}

function forEachRowElement(item, col) {
  if (col.includes(item)) {
    console.log("if col.includes(item)", true, item);
    col.forEach((item) => squareSwitch(item));
  } else {
    console.log("if col not includes item");
    squareSwitch(item);
  }
}

function squareSwitch(id) {
  if (id > FIELD_SIZE) {
    let el = document.getElementById(id);
    let upperId = Number(id) - FIELD_SIZE;
    console.log("el=", el);
    let upperEl = document.getElementById(upperId);
    console.log("upperEl=", upperEl);
    el.className = upperEl.className;
    console.log("new color=", el.className);
    upperEl.className = "disabled";
    squareSwitch(upperId);
  }
}
