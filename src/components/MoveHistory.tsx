interface MoveHistoryProps {
  moves: string[];
}

export default function MoveHistory({
  moves,
}: MoveHistoryProps) {
  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        minHeight: "300px",
      }}
    >
      <h2>Move History</h2>

      {moves.length === 0 && (
        <p>No moves played yet.</p>
      )}

      {moves.map((move, index) => (
        <div key={index}>
          {index + 1}. {move}
        </div>
      ))}
    </div>
  );
}