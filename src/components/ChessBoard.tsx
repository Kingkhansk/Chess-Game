import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import "./ChessBoard.css";

interface ChessBoardProps {
  position: string;
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
  isThinking: boolean;
  isEngineReady: boolean;
}

export default function ChessBoard({
  position,
  onDrop,
  isThinking,
  isEngineReady,
}: ChessBoardProps) {
  const [boardSize, setBoardSize] = useState(0);
  const [isDraggedPiece, setIsDraggedPiece] = useState<string | null>(null);

  useEffect(() => {
    const calculateBoardSize = () => {
      const container = document.querySelector(".chess-board-wrapper");
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const maxSize = Math.min(rect.width, rect.height - 60);
      const size = Math.max(280, Math.min(maxSize, 600));
      setBoardSize(size);
    };

    calculateBoardSize();
    window.addEventListener("resize", calculateBoardSize);

    return () => {
      window.removeEventListener("resize", calculateBoardSize);
    };
  }, []);

  const handlePieceDrop = (
    sourceSquare: string,
    targetSquare: string,
    piece: string
  ): boolean => {
    setIsDraggedPiece(null);

    if (!isEngineReady) {
      return false;
    }

    return onDrop(sourceSquare, targetSquare);
  };

  return (
    <div className="chess-board-wrapper">
      <div
        className={`chess-board-container ${isThinking ? "thinking" : ""} ${
          !isEngineReady ? "disabled" : ""
        }`}
        style={{
          opacity: isThinking ? 0.7 : isEngineReady ? 1 : 0.6,
          transition: "opacity 0.3s ease",
        }}
      >
        {boardSize > 0 && (
          <Chessboard
            position={position}
            onPieceDrop={handlePieceDrop}
            onPieceClick={() => {}}
            boardWidth={boardSize}
            arePiecesDraggable={!isThinking && isEngineReady}
            animationDuration={300}
            customDarkSquareStyle={{
              backgroundColor: "#5a6b7d",
            }}
            customLightSquareStyle={{
              backgroundColor: "#d4d4d8",
            }}
            customDropSquareStyle={{
              boxShadow: "inset 0 0 1px 4px rgba(255, 215, 0, 0.6)",
            }}
          />
        )}
      </div>

      {!isEngineReady && (
        <div className="board-overlay">
          <div className="overlay-message">
            <span className="loader"></span>
            <p>Loading Chess Engine...</p>
          </div>
        </div>
      )}

      {isThinking && (
        <div className="board-overlay">
          <div className="overlay-message">
            <span className="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <p>AI Thinking...</p>
          </div>
        </div>
      )}

      <div className="board-controls">
        <span className={`indicator ${isEngineReady ? "ready" : "loading"}`}>
          {isEngineReady ? "✓ Ready" : "⏳ Loading"}
        </span>
        <span className="board-size">
          {boardSize}px
        </span>
      </div>
    </div>
  );
}