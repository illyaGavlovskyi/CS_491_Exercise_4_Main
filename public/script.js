// Four-in-a-Row Game
// Author: Illya Gavlovskyi and Thomas Vasile
// Date: July 2025

import { checkWinner } from './gameLogic.js';

const SIZE = 4;
const boardElem = document.getElementById("board");
const button = document.getElementById("state-button");
const playerDisplay = document.getElementById("playerNameDisplay");
const statusEl = document.getElementById("statusMessage");

// Game state variables
let board = [];
let currentPlayer = "";
let gameActive = true;
let winLine = [];
let state = "Flip";
let playerX = null;
let playerO = null;
let myName, myBrowser, mySymbol;
let lastWinner = null;

init(); // Start the game

function init() {
  myName = prompt("Enter your name:"); // Ask player name
  myBrowser = detectBrowser(); // Identify browser
  startPolling(); // Get server state
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
}

// Gets server state continuously every 500ms
async function startPolling() {
  await fetchGame();
  setInterval(fetchGame, 500);
}

// Fetch current game state from server
async function fetchGame() {
  const res = await fetch('/state');
  const data = await res.json();

  // Update game state variables from server
  board = data.board;
  currentPlayer = data.currentPlayer;
  gameActive = data.gameActive;
  winLine = data.winLine;
  state = data.state;
  playerX = data.playerX;
  playerO = data.playerO;
  lastWinner = data.lastWinner;

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

// Check if it is player turn
function isMyTurn() {
  return gameActive && mySymbol === currentPlayer;
}

// Check if player is matching
function isMe(playerObj) {
  return playerObj && playerObj.user === myName && playerObj.browser === myBrowser;
}

// Send updated game state to server
async function saveGame(state) {
  await fetch('/state', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state)
  });
}

// Render the game board
function renderBoard() {
  boardElem.innerHTML = "";
  for (let i = 0; i < SIZE; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < SIZE; j++) {
      const cell = document.createElement("td");
      cell.textContent = board[i][j];
      // Highlights win line
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

// Display game status message
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
    statusEl.textContent = "Your turn";
  } 
  else if (mySymbol) {
    statusEl.textContent = `Waiting for opponent (${currentPlayer}'s turn)`;
  } 
  else {
    statusEl.textContent = "Spectating game";
  }
}

// Handle a move when player clicks a cell
async function handleMove(e) {
  if (!isMyTurn()) return;

  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  if (board[row][col] !== "") return; // Stops overwriting

  board[row][col] = mySymbol;
  winLine = checkWinner(board, row, col, mySymbol); // Check for win
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
    currentPlayer = currentPlayer === "O" ? "X" : "O"; // Switch turn
  }

  await saveGame({
  board, currentPlayer, gameActive, winLine, state, playerX, playerO, lastWinner
  });
}

// Button logic for Flip -> Clear -> Start cycle
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

    await saveGame({
    board, currentPlayer, gameActive, winLine, state, playerX, playerO, lastWinner
    });
  }
};
