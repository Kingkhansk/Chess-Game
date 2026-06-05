import "./GameInfo.css";

interface GameInfoProps {
  status: string;
  onReset: () => void;
  onUndo: () => void;
  onResign: () => void;
  canUndo: boolean;
  gameStats: {
    whiteTime: number;
    blackTime: number;
    moves: number;
  };
  engineReady: boolean;
}

export default function GameInfo({
  status,
  onReset,
  onUndo,
  onResign,
  canUndo,
  gameStats,
  engineReady,
}: GameInfoProps) {
  const isGameOver =
    status === "Checkmate" || status === "Draw" || status === "Resigned";

  const getStatusColor = (): string => {
    if (status === "Checkmate") return "danger";
    if (status === "Draw") return "warning";
    if (status === "Check") return "accent";
    return "info";
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="game-info card">
      <h2>Game Status</h2>

      <div className={`status-display ${getStatusColor()}`}>
        <div className="status-icon">
          {status === "Checkmate" && "♔"}
          {status === "Draw" && "⚖️"}
          {status === "Check" && "⚡"}
          {status.includes("to move") && "♟️"}
        </div>
        <div className="status-text">
          <p className="status-label">Status</p>
          <p className="status-value">{status}</p>
        </div>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Moves</span>
          <span className="stat-value">{gameStats.moves}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">White</span>
          <span className="stat-value">{formatTime(gameStats.whiteTime)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Black</span>
          <span className="stat-value">{formatTime(gameStats.blackTime)}</span>
        </div>
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary btn-block"
          onClick={onReset}
          title="Start a new game"
        >
          <span>🔄</span> New Game
        </button>

        <div className="button-row">
          <button
            className="btn btn-secondary"
            onClick={onUndo}
            disabled={!canUndo || !engineReady}
            title="Undo last two moves"
          >
            <span>↶</span> Undo
          </button>

          <button
            className="btn btn-danger"
            onClick={onResign}
            disabled={isGameOver || !engineReady}
            title="Resign the game"
          >
            <span>🏳️</span> Resign
          </button>
        </div>
      </div>

      {isGameOver && (
        <div className="game-over-message">
          <p>Game Over!</p>
          <button className="btn btn-primary btn-block" onClick={onReset}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}