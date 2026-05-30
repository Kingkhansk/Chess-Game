import "./MoveHistory.css";

interface MoveHistoryProps {
  moves: string[];
}

export default function MoveHistory({
  moves,
}: MoveHistoryProps) {
  return (
    <div className="move-history card">
      <h3>Move History</h3>

      <div className="moves-container">
        {moves.length === 0 && (
          <p className="empty-state">
            <span>♟️</span>
            No moves yet
          </p>
        )}

        {moves.length > 0 && (
          <div className="moves-grid">
            {moves.map((move, index) => {
              const moveNumber = Math.floor(index / 2) + 1;
              const isWhiteMove = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`move-item ${isWhiteMove ? "white" : "black"}`}
                >
                  {isWhiteMove && (
                    <span className="move-number">{moveNumber}.</span>
                  )}
                  <span className="move-notation">{move}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="move-stats">
        <div className="stat">
          <span className="stat-label">Total Moves</span>
          <span className="stat-number">{moves.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Pairs</span>
          <span className="stat-number">{Math.ceil(moves.length / 2)}</span>
        </div>
      </div>
    </div>
  );
}