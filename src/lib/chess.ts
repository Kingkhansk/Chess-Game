import { Chess } from "chess.js";

export const createGame = () => {
  try {
    return new Chess();
  } catch (error) {
    console.error("Failed to create chess game:", error);
    throw new Error("Failed to initialize chess game");
  }
};

export const getGameStatus = (game: Chess): string => {
  try {
    if (game.isCheckmate()) {
      const winner = game.turn() === "w" ? "Black" : "White";
      return `Checkmate (${winner} wins)`;
    }

    if (game.isDraw()) {
      return "Draw";
    }

    if (game.isStalemate()) {
      return "Stalemate";
    }

    if (game.isThreefoldRepetition()) {
      return "Threefold Repetition";
    }

    if (game.isInsufficientMaterial()) {
      return "Insufficient Material";
    }

    if (game.isCheck()) {
      return `Check (${game.turn() === "w" ? "White" : "Black"} in check)`;
    }

    const currentPlayer = game.turn() === "w" ? "White" : "Black";
    return `${currentPlayer} to move`;
  } catch (error) {
    console.error("Failed to get game status:", error);
    return "Unknown";
  }
};

export const isGameOver = (game: Chess): boolean => {
  return (
    game.isCheckmate() ||
    game.isDraw() ||
    game.isStalemate() ||
    game.isThreefoldRepetition() ||
    game.isInsufficientMaterial()
  );
};

export const getPossibleMoves = (game: Chess, square: string): string[] => {
  try {
    const moves = game.moves({ square: square as any, verbose: true });
    return moves.map((m) => m.to);
  } catch (error) {
    console.error("Failed to get possible moves:", error);
    return [];
  }
};

export const evaluatePosition = (game: Chess): number => {
  // Simple material evaluation (not a full position evaluation)
  let evaluation = 0;
  const board = game.board();

  const pieceValues: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  };

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const value = pieceValues[piece.type] || 0;
        evaluation += piece.color === "w" ? value : -value;
      }
    }
  }

  return evaluation;
};