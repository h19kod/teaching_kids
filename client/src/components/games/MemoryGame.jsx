import { useState, useEffect } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "memory" games: flip cards to find matching pairs.
export default function MemoryGame({ content, onFinish }) {
  const cards = content.cards || [];
  const [flipped, setFlipped] = useState([]); // array of card indices
  const [matched, setMatched] = useState([]); // array of card indices
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  if (cards.length === 0 || cards.length % 2 !== 0) {
    return <p className="text-slate-400">This game needs an even number of cards.</p>;
  }

  // Shuffle cards on mount
  const [shuffledCards, setShuffledCards] = useState([]);

  useEffect(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  }, [cards]);

  function handleCardClick(index) {
    if (isChecking || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    setMoves((prev) => prev + 1);
    sounds.click();

    if (newFlipped.length === 2) {
      setIsChecking(true);
      const [firstIndex, secondIndex] = newFlipped;
      const firstCard = shuffledCards[firstIndex];
      const secondCard = shuffledCards[secondIndex];

      if (firstCard.id === secondCard.id) {
        // Match found
        sounds.correct();
        setMatched((prev) => [...prev, firstIndex, secondIndex]);
        setFlipped([]);
        setIsChecking(false);

        if (matched.length + 2 === shuffledCards.length) {
          setTimeout(() => {
            sounds.success();
            onFinish(1);
          }, 500);
        }
      } else {
        // No match
        sounds.wrong();
        setTimeout(() => {
          setFlipped([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }

  return (
    <div className="card animate-pop space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-500">Moves: {moves}</p>
        <p className="text-slate-500">
          Matched: {matched.length / 2} / {cards.length / 2}
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {shuffledCards.map((card, index) => {
          const isFlipped = flipped.includes(index);
          const isMatched = matched.includes(index);

          return (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              disabled={isFlipped || isMatched || isChecking}
              className={`
                aspect-square rounded-2xl flex items-center justify-center text-4xl transition-all duration-300
                ${isFlipped || isMatched ? "bg-indigo-500 text-white rotate-0" : "bg-slate-200 text-transparent rotate-y-180"}
                ${isMatched ? "opacity-50" : "hover:scale-105"}
                cursor-pointer
              `}
            >
              {isFlipped || isMatched ? card.icon : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
