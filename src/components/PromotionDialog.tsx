import "./PromotionDialog.css";

interface PromotionDialogProps {
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
  onCancel: () => void;
}

export default function PromotionDialog({
  onSelect,
  onCancel,
}: PromotionDialogProps) {
  const pieces = [
    { piece: "q", name: "Queen", symbol: "♕" },
    { piece: "r", name: "Rook", symbol: "♖" },
    { piece: "b", name: "Bishop", symbol: "♗" },
    { piece: "n", name: "Knight", symbol: "♘" },
  ] as const;

  return (
    <div className="promotion-overlay">
      <div className="promotion-dialog">
        <h2>Promote your pawn</h2>

        <div className="promotion-pieces">
          {pieces.map(({ piece, name, symbol }) => (
            <button
              key={piece}
              className="promotion-piece"
              onClick={() => onSelect(piece as "q" | "r" | "b" | "n")}
              title={name}
            >
              <span className="piece-symbol">{symbol}</span>
              <span className="piece-name">{name}</span>
            </button>
          ))}
        </div>

        <button className="btn btn-secondary btn-block" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}