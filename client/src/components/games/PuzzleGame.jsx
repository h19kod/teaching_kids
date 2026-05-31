import { useState, useEffect } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "puzzle" games: arrange puzzle pieces to complete the image.
export default function PuzzleGame({ content, onFinish }) {
  const gridSize = content.gridSize || 3; // 3x3 default
  const totalPieces = gridSize * gridSize;
  const [pieces, setPieces] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(totalPieces - 1);
  const [moves, setMoves] = useState(0);

  // Initialize puzzle
  useEffect(() => {
    const initialPieces = Array.from({ length: totalPieces }, (_, i) => i);
    // Shuffle ensuring solvability
    let shuffled;
    do {
      shuffled = [...initialPieces].sort(() => Math.random() - 0.5);
    } while (!isSolvable(shuffled, gridSize));
    
    setPieces(shuffled);
    setEmptyIndex(shuffled.indexOf(totalPieces - 1));
  }, [gridSize, totalPieces]);

  function isSolvable(puzzle, size) {
    let inversions = 0;
    const flat = puzzle.filter(p => p !== size * size - 1);
    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) inversions++;
      }
    }
    return inversions % 2 === 0;
  }

  function isAdjacent(index1, index2) {
    const row1 = Math.floor(index1 / gridSize);
    const col1 = index1 % gridSize;
    const row2 = Math.floor(index2 / gridSize);
    const col2 = index2 % gridSize;
    return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
  }

  function movePiece(index) {
    if (!isAdjacent(index, emptyIndex)) return;
    
    const newPieces = [...pieces];
    [newPieces[index], newPieces[emptyIndex]] = [newPieces[emptyIndex], newPieces[index]];
    setPieces(newPieces);
    setEmptyIndex(index);
    setMoves((prev) => prev + 1);
    sounds.click();

    // Check if solved
    const isSolved = newPieces.every((piece, index) => piece === index);
    if (isSolved) {
      sounds.success();
      setTimeout(() => onFinish(1), 500);
    }
  }

  function resetPuzzle() {
    const initialPieces = Array.from({ length: totalPieces }, (_, i) => i);
    let shuffled;
    do {
      shuffled = [...initialPieces].sort(() => Math.random() - 0.5);
    } while (!isSolvable(shuffled, gridSize));
    
    setPieces(shuffled);
    setEmptyIndex(shuffled.indexOf(totalPieces - 1));
    setMoves(0);
  }

  const isSolved = pieces.every((piece, index) => piece === index);

  return (
    <div className="card animate-pop space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-500">Moves: {moves}</p>
        <button onClick={resetPuzzle} className="btn-ghost text-sm">
          Reset
        </button>
      </div>

      {isSolved && (
        <div className="text-center animate-pop">
          <p className="text-emerald-600 font-bold text-xl">Puzzle Solved! 🎉</p>
        </div>
      )}

      <div
        className="grid gap-1 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: "min(100%, 300px)",
          aspectRatio: "1",
        }}
      >
        {pieces.map((piece, index) => {
          const isEmpty = piece === totalPieces - 1;
          const correctRow = Math.floor(piece / gridSize);
          const correctCol = piece % gridSize;
          const currentRow = Math.floor(index / gridSize);
          const currentCol = index % gridSize;

          return (
            <button
              key={index}
              onClick={() => movePiece(index)}
              disabled={isEmpty || !isAdjacent(index, emptyIndex)}
              className={`
                aspect-square rounded-lg font-bold text-2xl flex items-center justify-center transition-all
                ${isEmpty 
                  ? "bg-slate-100" 
                  : isAdjacent(index, emptyIndex)
                  ? "bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }
                ${piece === index ? "ring-2 ring-emerald-500" : ""}
              `}
              style={{
                transform: `translate(${(correctCol - currentCol) * 100}%, ${(correctRow - currentRow) * 100}%)`,
              }}
            >
              {isEmpty ? "" : piece + 1}
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm text-slate-500">
        Click pieces adjacent to the empty space to move them
      </p>
    </div>
  );
}
