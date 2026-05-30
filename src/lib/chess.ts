import { Chess } from "chess.js";

export const createGame = () => new Chess();

export const getGameStatus = (game: Chess) => {
  if (game.isCheckmate()) {
    return "Checkmate";
  }

  if (game.isDraw()) {
    return "Draw";
  }

  if (game.isCheck()) {
    return "Check";
  }

  return `${game.turn() === "w" ? "White" : "Black"} to move`;
};