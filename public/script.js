let board = [];
let currentPlayer = "X";
let gameActive = false;
const SIZE = 4;

const boardElem = document.getElementById("board");
const button = document.getElementById("state-button");

function initializeBoard() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
  renderBoard();
}

function renderBoard() {
  boardElem.innerHTML = "";
  for (let i = 0; i < SIZE; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < SIZE; j++) {
      const cell = document.createElement("td");
      cell.textContent = board[i][j];
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.addEventListener("click", handleMove);
      row.appendChild(cell);
    }
    boardElem.appendChild(row);
  }
}

function handleMove(e) {
  if (!gameActive) return;

  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);

  if (board[row][col] === "") {
    board[row][col] = currentPlayer;
    renderBoard();

    if (checkWinner(row, col)) {
      alert(`${currentPlayer} wins!`);
      gameActive = false;
      button.textContent = "Reset";
      return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
  }
}

function checkWinner(r, c) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];

  for (let [dr, dc] of directions) {
    let count = 1;
    for (let i = 1; i < 4; i++) {
      let nr = r + dr * i;
      let nc = c + dc * i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== currentPlayer) break;
      count++;
    }
    for (let i = 1; i < 4; i++) {
      let nr = r - dr * i;
      let nc = c - dc * i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== currentPlayer) break;
      count++;
    }
    if (count >= 4) return true;
  }

  return false;
}

button.addEventListener("click", () => {
  if (button.textContent === "Start" || button.textContent === "Reset") {
    initializeBoard();
    gameActive = true;
    currentPlayer = "X";
    button.textContent = "Playing...";
  }
});
