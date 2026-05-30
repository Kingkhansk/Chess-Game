interface GameInfoProps {
  status: string;
  onReset: () => void;
}

export default function GameInfo({
  status,
  onReset,
}: GameInfoProps) {
  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2>Game Info</h2>

      <p>
        <strong>Status:</strong> {status}
      </p>

      <button onClick={onReset}>
        New Game
      </button>
    </div>
  );
}