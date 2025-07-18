const SIZE = 4;
const boardElem = document.getElementById("board");
const button = document.getElementById("state-button");
const playerDisplay = document.getElementById("playerNameDisplay");

let board = [];
let currentPlayer = "O";
let gameActive = false;
let winLine = [];
let state = "Flip";
let playerX = null;
let playerO = null;
let myName, myBrowser, mySymbol;

init();

function init() {
  myName = prompt("Enter your name:");
  myBrowser = detectBrowser();
  startPolling();
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
}

function isMyTurn() {
  return gameActive && mySymbol === currentPlayer;
}

function isMe(playerObj) {
  return playerObj && playerObj.user === myName && playerObj.browser === myBrowser;
}

async function startPolling() {
  await fetchGame();
  setInterval(fetchGame, 1000);
}

async function fetchGame() {
  const res = await fetch('/state');
  const data = await res.json();

  board = data.board;
  currentPlayer = data.currentPlayer;
  gameActive = data.gameActive;
  winLine = data.winLine;
  state = data.state;
  playerX = data.playerX;
  playerO = data.playerO;

  // Assign self to X or O if available
  if (!playerX && !isMe(playerO)) {
    data.playerX = { user: myName, browser: myBrowser };
    mySymbol = "X";
    await saveGame(data);
  } else if (!playerO && !isMe(playerX)) {
    data.playerO = { user: myName, browser: myBrowser };
    mySymbol = "O";
    await saveGame(data);
  } else if (isMe(playerX)) {
    mySymbol = "X";
  } else if (isMe(playerO)) {
    mySymbol = "O";
  }

  playerDisplay.textContent = `You are: ${myName} (${mySymbol || "Spectator"})`;
  renderBoard();
}

function renderBoard() {
  boardElem.innerHTML = "";
  for (let i = 0; i < SIZE; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < SIZE; j++) {
      const cell = document.createElement("td");
      cell.textContent = board[i][j];
      if (winLine.some(pos => pos[0] === i && pos[1] === j)) {
        cell.classList.add("win");
      }
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.onclick = handleMove;
      row.appendChild(cell);
    }
    boardElem.appendChild(row);
  }
  button.textContent = state;
}

async function handleMove(e) {
  if (!isMyTurn()) return;

  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  if (board[row][col] !== "") return;

  board[row][col] = mySymbol;
  winLine = checkWinner(row, col);
  if (winLine.length) {
    gameActive = false;
    state = "Start";
  } else if (board.flat().every(cell => cell !== "")) {
    gameActive = false;
    state = "Clear";
  } else {
    currentPlayer = currentPlayer === "O" ? "X" : "O";
  }

  await saveGame({
    board, currentPlayer, gameActive, winLine, state, playerX, playerO
  });
}

function checkWinner(r, c) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  const win = [];
  for (const [dr, dc] of dirs) {
    let line = [[r, c]];
    for (let i = 1; i < 4; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== mySymbol) break;
      line.push([nr, nc]);
    }
    for (let i = 1; i < 4; i++) {
      const nr = r - dr * i, nc = c - dc * i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== mySymbol) break;
      line.push([nr, nc]);
    }
    if (line.length >= 4) return line;
  }
  return [];
}

async function saveGame(state) {
  await fetch('/state', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state)
  });
}

button.onclick = async () => {
  if (!mySymbol) return alert("Only X or O can control the game");

  if (state === "Flip") {
    currentPlayer = Math.random() < 0.5 ? "O" : "X";
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
    winLine = [];
    gameActive = true;
    state = "Playing";
  } else if (state === "Clear" || state === "Start") {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
    winLine = [];
    gameActive = true;
    state = "Playing";
    currentPlayer = currentPlayer === "O" ? "X" : "O";
  }

  await saveGame({ board, currentPlayer, gameActive, winLine, state, playerX, playerO });
};
