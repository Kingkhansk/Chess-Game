let engine: Worker | null = null;
let engineInitialized = false;

export function createStockfish(): Worker {
  if (engine && engineInitialized) {
    return engine;
  }

  try {
    // Try to create a Stockfish worker
    engine = new Worker(
      new URL(
        "stockfish/src/stockfish-nnue-16-single.js",
        import.meta.url
      ),
      {
        type: "module",
      }
    );

    // Add timeout to detect if engine fails to load
    const loadTimeout = setTimeout(() => {
      if (!engineInitialized) {
        console.warn("Stockfish engine loading timed out");
        if (engine) {
          engine.terminate();
          engine = null;
        }
      }
    }, 10000); // 10 second timeout

    const originalOnMessage = engine.onmessage;

    engine.onmessage = (event) => {
      const line = event.data;

      if (typeof line === "string" && line.includes("uciok")) {
        engineInitialized = true;
        clearTimeout(loadTimeout);
      }

      if (originalOnMessage) {
        originalOnMessage.call(engine, event);
      }
    };

    return engine;
  } catch (error) {
    console.error("Failed to create Stockfish worker:", error);

    // Fallback: Create a dummy worker that throws an error
    const dummyWorker = new Worker(
      new URL(
        "stockfish/src/stockfish-nnue-16-single.js",
        import.meta.url
      ),
      {
        type: "module",
      }
    );

    // Emit error event
    const errorEvent = new Event("error");
    dummyWorker.dispatchEvent(errorEvent);

    return dummyWorker;
  }
}

export function isEngineReady(): boolean {
  return engineInitialized && engine !== null;
}

export function terminateEngine(): void {
  if (engine) {
    engine.terminate();
    engine = null;
    engineInitialized = false;
  }
}

export function resetEngine(): void {
  terminateEngine();
  createStockfish();
}