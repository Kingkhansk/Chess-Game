import { Chessboard } from "react-chessboard";

interface ChessBoardProps {
  position: string;
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
}

export default function ChessBoard({
  position,
  onDrop,
}: ChessBoardProps) {
  return (
    <Chessboard
      position={position}
      onPieceDrop={onDrop}
      boardWidth={600}
    />
  );
}