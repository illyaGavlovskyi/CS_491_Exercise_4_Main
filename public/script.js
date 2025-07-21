const SIZE = 4;
const boardElem = document.getElementById("board");
const button = document.getElementById("state-button");
const playerDisplay = document.getElementById("playerNameDisplay");
const statusEl = document.getElementById("statusMessage");

let board = [];
let currentPlayer = "";
let gameActive = true;
let winLine = [];
let state = "Flip";
let playerX = null;
let playerO = null;
let myName, myBrowser, mySymbol;

let lastWinner = null;

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

async function startPolling() {
  await fetchGame();
  setInterval(fetchGame, 500);
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
  lastWinner = data.lastWinner; // retrieve from server

  // Assign roles
  if (!playerX && (!playerO || !isMe(playerO))) { // If there is no player X and either: there is no player O yet, or player O is not me
    data.playerX = { user: myName, browser: myBrowser };
    mySymbol = "X"; //assign me to be playerX
    await saveGame(data);
  } 
  else if (!playerO && (!playerX || !isMe(playerX))) { // If there is no player O AND either: there is no player X, or player X is not me
    data.playerO = { user: myName, browser: myBrowser };
    mySymbol = "O"; // assign me to be playerO
    await saveGame(data);
  } 
  else if (isMe(playerX)) {
    mySymbol = "X";
  } 
  else if (isMe(playerO)) {
    mySymbol = "O";
  }

  playerDisplay.textContent = `You are: ${myName} (${mySymbol || "Spectator"})`;
  renderBoard();
  updateStatusMessage();
}

function isMyTurn() {
  return gameActive && mySymbol === currentPlayer;
}

function isMe(playerObj) {
  return playerObj && playerObj.user === myName && playerObj.browser === myBrowser;
}

async function saveGame(state) {
  await fetch('/state', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state)
  });
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

function updateStatusMessage() {
  if (!playerX || !playerO) {
    statusEl.textContent = "Waiting for players to join the game";
  } 
  else if (winLine.length) {
    statusEl.textContent = `Player ${currentPlayer === "O" ? "X" : "O"} wins!`;
  } 
  else if (!gameActive && state === "Clear") {
    statusEl.textContent = "It's a draw!";
  } 
  else if (mySymbol && isMyTurn()) {
    statusEl.textContent = "Your turn!";
  } 
  else if (mySymbol) {
    statusEl.textContent = `Waiting for opponent (${currentPlayer}'s turn)`;
  } 
  else {
    statusEl.textContent = "Spectating game";
  }
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
    lastWinner = mySymbol;
  } 
  else if (board.flat().every(cell => cell !== "")) {
    gameActive = false;
    state = "Clear";
    lastWinner = null;
  } 
  else {
    currentPlayer = currentPlayer === "O" ? "X" : "O";
  }

  await saveGame({
  board, currentPlayer, gameActive, winLine, state, playerX, playerO, lastWinner
  });
}

function checkWinner(r, c) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
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

// button.onclick = async () => {
//   if (!mySymbol) return alert("Only X or O can control the game");

//   if (state === "Flip") {
//     const coinWinner = Math.random() < 0.5 ? "X" : "O";
//     const oPlayer = coinWinner === "X" ? playerX : playerO;
//     const xPlayer = coinWinner === "X" ? playerO : playerX;

//     board = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
//     currentPlayer = "O";
//     gameActive = true;
//     winLine = [];
//     state = "Playing";

//     await saveGame({
//       board, currentPlayer, gameActive, winLine, state,
//       playerX: xPlayer,
//       playerO: oPlayer
//     });
//   } else if (state === "Clear" || state === "Start") {
//     board = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
//     winLine = [];
//     gameActive = true;
//     state = "Playing";
//     currentPlayer = currentPlayer === "O" ? "X" : "O";

//     await saveGame({ board, currentPlayer, gameActive, winLine, state, playerX, playerO });
//   }
// };

button.onclick = async () => {
  if (!mySymbol) return alert("Only X or O can control the game");

  if (state === "Flip") {
    const coinWinner = Math.random() < 0.5 ? "X" : "O";
    const xPlayer = coinWinner === "X" ? { user: myName, browser: myBrowser } : null;
    const oPlayer = coinWinner === "O" ? { user: myName, browser: myBrowser } : null;

    currentPlayer = coinWinner;
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
    winLine = [];
    gameActive = true;
    state = "Clear";

    await saveGame({
      board, currentPlayer, gameActive, winLine, state,
      playerX: xPlayer || playerX,
      playerO: oPlayer || playerO,
      lastWinner
    });
  }

  else if (state === "Start") {
    if (mySymbol !== lastWinner) {
      return alert("Only the player who won the last game can start a new one.");
    }

    gameActive = true;
    state = "Clear"; // Next click will clear the board
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
    winLine = [];
    await saveGame({
    board, currentPlayer, gameActive, winLine, state, playerX, playerO, lastWinner
    });
  }

  else if (state === "Clear") {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
    winLine = [];
    gameActive = false;
    state = "Start";
    currentPlayer = "";
    // playerX = null;
    // playerO = null;

    await saveGame({
    board, currentPlayer, gameActive, winLine, state, playerX, playerO, lastWinner
    });
  }
};
