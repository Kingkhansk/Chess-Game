import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";

import ChessBoard from "./components/ChessBoard";
import MoveHistory from "./components/MoveHistory";
import GameInfo from "./components/GameInfo";

import { createGame, getGameStatus } from "./lib/chess";
import { createStockfish } from "./lib/stockfish";

function App() {
  const [game, setGame] = useState<Chess>(createGame());
  const [moves, setMoves] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);

  const engineRef = useRef<Worker | null>(null);

  useEffect(() => {
    const engine = createStockfish();

    engineRef.current = engine;

    engine.onmessage = (event) => {
      const line = event.data;

      if (
        typeof line === "string" &&
        line.startsWith("bestmove")
      ) {
        const bestMove = line.split(" ")[1];

        if (
          !bestMove ||
          bestMove === "(none)"
        ) {
          setThinking(false);
          return;
        }

        setGame((currentGame) => {
          const copy = new Chess(currentGame.fen());

          copy.move({
            from: bestMove.slice(0, 2),
            to: bestMove.slice(2, 4),
            promotion: "q",
          });

          setMoves(copy.history());

          return copy;
        });

        setThinking(false);
      }
    };

    return () => {
      engine.terminate();
    };
  }, []);

  const makeAIMove = (position: Chess) => {
    const engine = engineRef.current;

    if (!engine) return;

    setThinking(true);

    engine.postMessage(
      `position fen ${position.fen()}`
    );

    // Increase for stronger AI
    engine.postMessage("go depth 12");
  };

  const onDrop = (
    sourceSquare: string,
    targetSquare: string
  ) => {
    if (thinking) return false;

    const gameCopy = new Chess(game.fen());

    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!move) {
      return false;
    }

    setGame(gameCopy);
    setMoves(gameCopy.history());

    if (
      !gameCopy.isCheckmate() &&
      !gameCopy.isDraw()
    ) {
      setTimeout(() => {
        makeAIMove(gameCopy);
      }, 300);
    }

    return true;
  };

  const resetGame = () => {
    const newGame = createGame();

    setGame(newGame);
    setMoves([]);
    setThinking(false);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        padding: "24px",
        alignItems: "flex-start",
      }}
    >
      <ChessBoard
        position={game.fen()}
        onDrop={onDrop}
      />

      <div
        style={{
          width: "320px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <GameInfo
          status={getGameStatus(game)}
          onReset={resetGame}
        />

        <div
          style={{
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h3>AI Status</h3>

          <p>
            {thinking
              ? "🤖 AI Thinking..."
              : "♟️ Your Move"}
          </p>
        </div>

        <MoveHistory moves={moves} />
      </div>
    </div>
  );
}

export default App;