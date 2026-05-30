let engine: Worker | null = null;

export function createStockfish() {
  if (engine) return engine;

  engine = new Worker(
    new URL(
      "stockfish/src/stockfish-nnue-16-single.js",
      import.meta.url
    ),
    {
      type: "module",
    }
  );

  return engine;
}