import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";

import ChessBoard from "./components/ChessBoard";
import MoveHistory from "./components/MoveHistory";
import GameInfo from "./components/GameInfo";
import PromotionDialog from "./components/PromotionDialog";

import { createGame, getGameStatus } from "./lib/chess";
import { createStockfish } from "./lib/stockfish";

import "./App.css";

function App() {
  const [game, setGame] = useState<Chess>(createGame());
  const [moves, setMoves] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [promotionData, setPromotionData] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [gameStats, setGameStats] = useState({
    whiteTime: 600, // 10 minutes in seconds
    blackTime: 600,
    moves: 0,
  });

  const engineRef = useRef<Worker | null>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const engine = createStockfish();

      engineRef.current = engine;

      let messageCount = 0;

      engine.onmessage = (event) => {
        const line = event.data;

        // Wait for engine to be ready
        if (typeof line === "string" && line.includes("uciok")) {
          setEngineReady(true);
          return;
        }

        if (
          typeof line === "string" &&
          line.startsWith("bestmove")
        ) {
          messageCount++;
          const bestMove = line.split(" ")[1];

          if (!bestMove || bestMove === "(none)") {
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
            setGameStats((prev) => ({
              ...prev,
              moves: copy.history().length,
            }));

            return copy;
          });

          setThinking(false);
        }
      };

      engine.onerror = (error) => {
        console.error("Engine error:", error);
        setEngineError("Failed to load chess engine");
        setEngineReady(false);
      };

      // Initialize engine
      engine.postMessage("uci");

      return () => {
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
        }
        engine.terminate();
      };
    } catch (error) {
      console.error("Failed to create Stockfish:", error);
      setEngineError("Failed to initialize chess engine");
    }
  }, []);

  const makeAIMove = (position: Chess) => {
    const engine = engineRef.current;

    if (!engine || !engineReady) return;

    setThinking(true);

    engine.postMessage(`position fen ${position.fen()}`);
    engine.postMessage("go depth 16");
  };

  const handlePromotion = (piece: "q" | "r" | "b" | "n") => {
    if (!promotionData) return;

    const gameCopy = new Chess(game.fen());

    const move = gameCopy.move({
      from: promotionData.from,
      to: promotionData.to,
      promotion: piece,
    });

    if (!move) {
      setPromotionData(null);
      return;
    }

    setGame(gameCopy);
    setMoves(gameCopy.history());
    setGameStats((prev) => ({
      ...prev,
      moves: gameCopy.history().length,
    }));
    setPromotionData(null);

    if (
      !gameCopy.isCheckmate() &&
      !gameCopy.isDraw()
    ) {
      moveTimeoutRef.current = setTimeout(() => {
        makeAIMove(gameCopy);
      }, 500);
    }
  };

  const onDrop = (
    sourceSquare: string,
    targetSquare: string
  ) => {
    if (thinking || !engineReady) return false;

    const gameCopy = new Chess(game.fen());

    // Check if move is a pawn promotion
    const piece = gameCopy.get(sourceSquare as Parameters<typeof gameCopy.get>[0]);
    const isPromotion =
      piece &&
      piece.type === "p" &&
      ((piece.color === "w" && targetSquare.charAt(1) === "8") ||
        (piece.color === "b" && targetSquare.charAt(1) === "1"));

    if (isPromotion) {
      setPromotionData({
        from: sourceSquare,
        to: targetSquare,
      });
      return true;
    }

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
    setGameStats((prev) => ({
      ...prev,
      moves: gameCopy.history().length,
    }));

    if (
      !gameCopy.isCheckmate() &&
      !gameCopy.isDraw()
    ) {
      moveTimeoutRef.current = setTimeout(() => {
        makeAIMove(gameCopy);
      }, 500);
    }

    return true;
  };

  const resetGame = () => {
    const newGame = createGame();

    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }

    setGame(newGame);
    setMoves([]);
    setThinking(false);
    setPromotionData(null);
    setGameStats({
      whiteTime: 600,
      blackTime: 600,
      moves: 0,
    });
  };

  const undoLastMove = () => {
    if (moves.length < 2 || thinking) return;

    const gameCopy = new Chess(game.fen());

    // Undo AI move
    gameCopy.undo();
    // Undo player move
    gameCopy.undo();

    setGame(gameCopy);
    setMoves(gameCopy.history());
    setThinking(false);

    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }

    setGameStats((prev) => ({
      ...prev,
      moves: gameCopy.history().length,
    }));
  };

  const resign = () => {
    setThinking(false);
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }
    // Game over - user has resigned
    setGame((current) => {
      // Create a game state that indicates resignation
      return current;
    });
    // Show message in GameInfo
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">♟️ Chess Master</h1>
          <p className="app-subtitle">Play against Stockfish Engine</p>
        </div>
      </header>

      <main className="main-content">
        <div className="game-wrapper">
          <div className="board-container">
            {engineError && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                <p>{engineError}</p>
              </div>
            )}

            {!engineReady && !engineError && (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading chess engine...</p>
              </div>
            )}

            <ChessBoard
              position={game.fen()}
              onDrop={onDrop}
              isThinking={thinking}
              isEngineReady={engineReady}
            />
          </div>

          <aside className="sidebar">
            <GameInfo
              status={getGameStatus(game)}
              onReset={resetGame}
              onUndo={undoLastMove}
              onResign={resign}
              canUndo={moves.length >= 2 && !thinking}
              gameStats={gameStats}
              engineReady={engineReady}
            />

            <div className="ai-status-card">
              <h3>AI Status</h3>
              <div className="status-indicator">
                <span className={`status-dot ${thinking ? "thinking" : "ready"}`}></span>
                <p>
                  {thinking
                    ? "🤖 Thinking..."
                    : engineReady
                      ? "✓ Ready"
                      : "Loading..."}
                </p>
              </div>
              <div className="engine-info">
                <span>Depth: 16</span>
                <span>Engine: Stockfish NNUE</span>
              </div>
            </div>

            <MoveHistory moves={moves} />
          </aside>
        </div>
      </main>

      {promotionData && (
        <PromotionDialog
          onSelect={handlePromotion}
          onCancel={() => setPromotionData(null)}
        />
      )}
    </div>
  );
}

export default App;