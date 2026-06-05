import { useState } from "react";
import { game } from "../lib/chess";

// Get piece image based on type and color
const getPieceImage = (type: string, color: string): string => {
  const prefix = color === "w" ? "w" : "b";
  return `/src/assets/pieces/${prefix}${type}.png`;
};

interface Move {
  number: number;
  white: string;
  black?: string;
}

const scrollbarHideStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export default function ChessBoard() {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [moves, setMoves] = useState<Move[]>([
    { number: 1, white: "e4", black: "c6" },
    { number: 2, white: "e2", black: "a5" },
    { number: 3, white: "e3", black: "d5" },
    { number: 4, white: "f3", black: "g4" },
  ]);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);

  const board = game.board();

  const handleSquareClick = (row: number, col: number) => {
    const square = String.fromCharCode(97 + col) + (8 - row);

    // If clicking on a legal move destination, make the move
    if (selectedSquare && legalMoves.includes(square)) {
      try {
        const moveResult = game.move({
          from: selectedSquare,
          to: square,
          promotion: "q",
        });
        if (moveResult) {
          // Add move to history
          const moveNum = Math.ceil((moves.length + 1) / 2);
          if (moveResult.color === "w") {
            setMoves([...moves, { number: moveNum, white: moveResult.san }]);
          } else {
            const lastMove = moves[moves.length - 1];
            if (lastMove && lastMove.number === moveNum) {
              lastMove.black = moveResult.san;
              setMoves([...moves]);
            } else {
              setMoves([...moves, { number: moveNum, white: "", black: moveResult.san }]);
            }
          }
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    // Deselect if clicking same square
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Select new square and get legal moves
    const movesAvailable = game.moves({ square, verbose: true });
    if (movesAvailable.length > 0) {
      setSelectedSquare(square);
      setLegalMoves(movesAvailable.map((m: any) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  return (
    <>
      <style>{scrollbarHideStyles}</style>
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#2a2a2a",
        color: "#fff",
        display: "flex",
        gap: "1rem",
        padding: "1rem",
        fontFamily: "var(--font-sans, system-ui)",
      }}>
        {/* LEFT SIDE - BOARD & PLAYERS */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Black Player Info */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem",
            backgroundColor: "#1a1a1a",
            borderRadius: "4px",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>sk-skf (413)</div>
              <div style={{ fontSize: "12px", color: "#999" }}>
                <span style={{ marginRight: "0.5rem" }}>🇮🇳</span>
                <span style={{ marginRight: "0.5rem" }}>Level 3</span>
              </div>
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>25:46</div>
          </div>

          {/* BOARD */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: 0,
            border: "3px solid #666",
            borderRadius: "4px",
            overflow: "hidden",
            backgroundColor: "#1a1a1a",
            aspectRatio: "1",
            width: "100%",
            maxWidth: "600px",
          }}>
            {Array.from({ length: 64 }).map((_, index) => {
              const row = Math.floor(index / 8);
              const col = index % 8;
              const square = String.fromCharCode(97 + col) + (8 - row);
              const isDark = (row + col) % 2 === 1;
              const piece = board[row][col];
              const isSelected = selectedSquare === square;

              return (
                <div
                  key={index}
                  onClick={() => handleSquareClick(row, col)}
                  style={{
                    aspectRatio: "1",
                    backgroundColor: isSelected ? "#fbbf24" : legalMoves.includes(square) ? "#d4f472" : isDark ? "#779556" : "#ebecd0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    transition: "background-color 0.1s",
                    border: legalMoves.includes(square) ? "2px solid #22c55e" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.opacity = "0.9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                >
                  {/* Row/Col Labels */}
                  {col === 0 && (
                    <div style={{
                      position: "absolute",
                      top: "2px",
                      left: "2px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      opacity: 0.5,
                      color: isDark ? "#ebecd0" : "#779556",
                    }}>
                      {8 - row}
                    </div>
                  )}
                  {row === 7 && (
                    <div style={{
                      position: "absolute",
                      bottom: "2px",
                      right: "2px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      opacity: 0.5,
                      color: isDark ? "#ebecd0" : "#779556",
                    }}>
                      {String.fromCharCode(97 + col)}
                    </div>
                  )}

                  {/* Piece */}
                  {piece ? (
                    <img
                      src={getPieceImage(piece.type, piece.color)}
                      alt={piece.type}
                      style={{
                        width: "75%",
                        height: "75%",
                        objectFit: "contain",
                        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
                      }}
                    />
                  ) : null}

                  {/* Legal move indicator */}
                  {legalMoves.includes(square) && (
                    <div style={{
                      position: "absolute",
                      width: piece ? "16px" : "12px",
                      height: piece ? "16px" : "12px",
                      borderRadius: "50%",
                      backgroundColor: piece ? "transparent" : "#4ade80",
                      border: piece ? "3px solid #4ade80" : "none",
                      pointerEvents: "none",
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* White Player Info */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem",
            backgroundColor: "#1a1a1a",
            borderRadius: "4px",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>mumair451 (152)</div>
              <div style={{ fontSize: "12px", color: "#999" }}>
                <span style={{ marginRight: "0.5rem" }}>🇵🇰</span>
                <span style={{ marginRight: "0.5rem" }}>Level 4</span>
              </div>
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>0.0</div>
          </div>
        </div>

        {/* RIGHT SIDE - SIDEBAR */}
        <div style={{
          width: "320px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxHeight: "calc(100vh - 2rem)",
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: "2rem",
            borderBottom: "1px solid #444",
            paddingBottom: "0.5rem",
          }}>
            {["Moves", "Chat", "Info"].map((tab) => (
              <button
                key={tab}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: tab === "Moves" ? "#fff" : "#999",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  paddingBottom: "0.5rem",
                  borderBottom: tab === "Moves" ? "2px solid #fff" : "none",
                  transition: "color 0.2s",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Opening Name */}
          <div style={{
            padding: "0.75rem",
            backgroundColor: "#1a1a1a",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: 500,
          }}>
            <div style={{ marginBottom: "0.5rem", color: "#4ade80" }}>
              {game.turn() === "w" ? "♙ White to Move" : "♟ Black to Move"}
            </div>
            {selectedSquare && (
              <div style={{ fontSize: "12px", color: "#fbbf24" }}>
                Selected: {selectedSquare.toUpperCase()} | {legalMoves.length} moves available
              </div>
            )}
            <div style={{ fontSize: "12px", color: "#60a5fa", marginTop: "0.25rem" }}>
              {game.isCheckmate() ? "Checkmate!" : game.isCheck() ? "Check!" : game.isDraw() ? "Draw" : "Active Game"}
            </div>
          </div>

          {/* Moves List */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            scrollbarWidth: "none",
          }} className="scrollbar-hide">
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr 1fr",
              gap: "0.5rem",
              fontSize: "13px",
            }}>
              {moves.map((move, idx) => (
                <div key={idx} style={{ display: "contents" }}>
                  <div style={{
                    textAlign: "center",
                    color: "#999",
                    fontWeight: 500,
                    minWidth: "30px",
                  }}>
                    {move.number}.
                  </div>
                  <div
                    onClick={() => setSelectedMoveIndex(idx * 2)}
                    style={{
                      padding: "0.35rem 0.5rem",
                      backgroundColor: selectedMoveIndex === idx * 2 ? "#444" : "transparent",
                      borderRadius: "3px",
                      cursor: "pointer",
                      transition: "background-color 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedMoveIndex !== idx * 2) {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedMoveIndex !== idx * 2) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {move.white}
                  </div>
                  <div
                    onClick={() => move.black && setSelectedMoveIndex(idx * 2 + 1)}
                    style={{
                      padding: "0.35rem 0.5rem",
                      backgroundColor: selectedMoveIndex === idx * 2 + 1 ? "#444" : "transparent",
                      borderRadius: "3px",
                      cursor: "pointer",
                      transition: "background-color 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedMoveIndex !== idx * 2 + 1) {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedMoveIndex !== idx * 2 + 1) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {move.black || ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Controls */}
          <div style={{
            display: "flex",
            gap: "0.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid #444",
            flexShrink: 0,
          }}>
            <button 
              onClick={() => {
                game.undo();
                setMoves(moves.slice(0, -1));
                setSelectedSquare(null);
                setLegalMoves([]);
              }}
              disabled={moves.length === 0}
              style={{
                flex: 1,
                padding: "0.5rem",
                backgroundColor: moves.length === 0 ? "#4b5563" : "#1a1a1a",
                border: "1px solid #444",
                color: moves.length === 0 ? "#888" : "#fff",
                borderRadius: "4px",
                cursor: moves.length === 0 ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: 500,
              }}>
              ↺ Undo
            </button>
            <button 
              onClick={() => {
                game.reset();
                setMoves([]);
                setSelectedSquare(null);
                setLegalMoves([]);
              }}
              style={{
                flex: 1,
                padding: "0.5rem",
                backgroundColor: "#1a1a1a",
                border: "1px solid #444",
                color: "#fff",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
              }}>
              ⚙ Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}