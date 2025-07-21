/**
 * logic.js - Game logic module for Four-in-a-Row
 * Author: Thomas Vasile & Illya G @@@@@@@@@@@@@@@@@@@@ do this before submit 
 * Date: 18 July 2025
 */

/**
 * Checks for a win on the 4x4 board.
 * @param {string[]} board - An array of 16 cells ("", "X", or "O").
 * @returns {{ winner: string|null, winLine: number[]|null }} - The winner and winning stripe.
 */
export function checkWin(board) {
  const lines = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // rows
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // cols
    [0, 5, 10, 15], [3, 6, 9, 12]                                 // diagonals
  ];
  for (const line of lines) {
    const [a, b, c, d] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] === board[d]) {
      return { winner: board[a], winLine: line };
    }
  }
  return { winner: null, winLine: null };
}
