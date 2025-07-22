// gameLogic.js
// Four-in-a-Row Game Logic
// Author: Illya Gavlovskyi
// Date: July 2025

/**
 * Checks for a winning line on the board starting from the given cell.
 * Looks in 4 directions: horizontal, vertical, and both diagonals.
 *
 * @param {string[][]} board - The current game board.
 * @param {number} r - The row index of the last move.
 * @param {number} c - The column index of the last move.
 * @param {string} playerSymbol - The symbol of the player ('X' or 'O').
 * @returns {Array<Array<number>>} - Array of winning cell coordinates if found, otherwise empty array.
 */

export function checkWinner(board, r, c, playerSymbol) {
  const SIZE = 4;
  const directions = [
    [0, 1],  // Horizontal
    [1, 0],  // Vertical
    [1, 1],  // Diagonal top-left to bottom-right
    [1, -1]  // Diagonal top-right to bottom-left
  ];

  for (const [dr, dc] of directions) {
    let line = [[r, c]];

    // Forward pass in the current direction
    for (let i = 1; i < 4; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== playerSymbol) break;
      line.push([nr, nc]);
    }

    // Backward pass in the current direction
    for (let i = 1; i < 4; i++) {
      const nr = r - dr * i, nc = c - dc * i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== playerSymbol) break;
      line.push([nr, nc]);
    }

    // Winning condition
    if (line.length >= 4) return line;
  }

  // Return empty array if no winning line is found
  return [];
}
