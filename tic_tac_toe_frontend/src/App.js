import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

/**
 * Calculates a winning line (if any) for the given board.
 * Board is an array of 9 cells containing "X", "O", or null.
 */
function getWinningLine(board) {
  const lines = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Cols
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diags
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    const v = board[a];
    if (v && v === board[b] && v === board[c]) return [a, b, c];
  }
  return null;
}

function isBoardFull(board) {
  return board.every((c) => c !== null);
}

// PUBLIC_INTERFACE
function App() {
  /** App theme: match retro arcade look while keeping the provided light theme palette */
  const [theme] = useState("retro");

  /** Board state and gameplay */
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  /** Simple scoreboard (resets on full reset) */
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const winningLine = useMemo(() => getWinningLine(board), [board]);
  const winner = useMemo(() => {
    if (!winningLine) return null;
    return board[winningLine[0]];
  }, [board, winningLine]);

  const isDraw = useMemo(() => !winner && isBoardFull(board), [winner, board]);

  // Update scoreboard when game ends (winner/draw).
  useEffect(() => {
    if (winner) {
      setScore((s) => ({ ...s, [winner]: s[winner] + 1 }));
    } else if (isDraw) {
      setScore((s) => ({ ...s, draws: s.draws + 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, isDraw]);

  const currentPlayer = xIsNext ? "X" : "O";
  const gameOver = Boolean(winner) || isDraw;

  const statusText = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "Draw: No more moves";
    return `Turn: ${currentPlayer}`;
  }, [winner, isDraw, currentPlayer]);

  const statusTone = useMemo(() => {
    if (winner) return "win";
    if (isDraw) return "draw";
    return "turn";
  }, [winner, isDraw]);

  function handleCellClick(index) {
    // Ignore clicks when game is over or cell is occupied.
    if (gameOver || board[index]) return;

    setBoard((prev) => {
      const next = prev.slice();
      next[index] = currentPlayer;
      return next;
    });
    setXIsNext((v) => !v);
  }

  function restartRound() {
    // Keep score; start a fresh round with X.
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  }

  function resetAll() {
    restartRound();
    setScore({ X: 0, O: 0, draws: 0 });
  }

  return (
    <div className="App">
      <main className="ttt-page">
        <header className="ttt-header">
          <div className="ttt-brand">
            <div className="ttt-title">Tic Tac Toe</div>
            <div className="ttt-subtitle">Retro classic • Local 2-player</div>
          </div>

          <div className="ttt-scoreboard" aria-label="Scoreboard">
            <div className="ttt-score">
              <div className="ttt-score-label">X</div>
              <div className="ttt-score-value">{score.X}</div>
            </div>
            <div className="ttt-score">
              <div className="ttt-score-label">O</div>
              <div className="ttt-score-value">{score.O}</div>
            </div>
            <div className="ttt-score ttt-score-draw">
              <div className="ttt-score-label">Draws</div>
              <div className="ttt-score-value">{score.draws}</div>
            </div>
          </div>
        </header>

        <section className="ttt-card" aria-label="Game">
          <div className={`ttt-status ttt-status--${statusTone}`} role="status" aria-live="polite">
            <span className="ttt-status-label">{statusText}</span>
            {!gameOver && (
              <span className="ttt-status-hint">
                Click a square to place <strong>{currentPlayer}</strong>
              </span>
            )}
            {gameOver && (
              <span className="ttt-status-hint">
                {winner ? "Press Restart to play again." : "Try a rematch?"}
              </span>
            )}
          </div>

          <div className="ttt-board-wrap">
            <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
              {board.map((cell, idx) => {
                const isWinningCell = winningLine ? winningLine.includes(idx) : false;
                const ariaLabel = cell
                  ? `Cell ${idx + 1}, ${cell}`
                  : `Cell ${idx + 1}, empty`;

                return (
                  <button
                    key={idx}
                    type="button"
                    className={[
                      "ttt-cell",
                      cell ? `ttt-cell--${cell}` : "",
                      isWinningCell ? "ttt-cell--win" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleCellClick(idx)}
                    aria-label={ariaLabel}
                    role="gridcell"
                    disabled={gameOver || Boolean(cell)}
                  >
                    <span className="ttt-cell-inner" aria-hidden="true">
                      {cell ?? ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ttt-controls" aria-label="Controls">
            <button type="button" className="ttt-btn ttt-btn-primary" onClick={restartRound}>
              Restart
            </button>
            <button type="button" className="ttt-btn ttt-btn-ghost" onClick={resetAll}>
              Reset Score
            </button>
          </div>

          <footer className="ttt-footer">
            <div className="ttt-help">
              Tip: X goes first. First to get 3 in a row wins.
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
