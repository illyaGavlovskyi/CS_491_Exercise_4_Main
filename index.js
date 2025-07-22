
// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const app = express();

// const PORT = process.env.PORT || 8000;
// const gameFile = path.join(__dirname, 'game.json');

// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.json());

// if (!fs.existsSync(gameFile)) {
//   fs.writeFileSync(gameFile, JSON.stringify({
//     board: Array(4).fill().map(() => Array(4).fill("")),
//     currentPlayer: "",
//     gameActive: false,
//     winLine: [],
//     state: "Flip",
//     playerX: null,
//     playerO: null
//   }, null, 2));
// }

// app.get('/state', (req, res) => {
//   const game = JSON.parse(fs.readFileSync(gameFile));
//   res.json(game);
// });

// app.post('/state', (req, res) => {
//   fs.writeFileSync(gameFile, JSON.stringify(req.body, null, 2));
//   res.sendStatus(200);
// });

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const gameFile = path.join(__dirname, 'game.json');

// Automatically reset game state
const initialGameState = {
  board: Array.from({ length: 4 }, () => Array(4).fill("")),
  currentPlayer: "",
  gameActive: false,
  winLine: [],
  state: "Flip",
  playerX: null,
  playerO: null
};
fs.writeFileSync(gameFile, JSON.stringify(initialGameState, null, 2));
console.log(" game.json reset on server start.");

// Serve static files from ./public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API to get game state
app.get('/state', (req, res) => {
  const game = JSON.parse(fs.readFileSync(gameFile));
  res.json(game);
});

// API to update game state
app.post('/state', (req, res) => {
  fs.writeFileSync(gameFile, JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
