import { useEffect, useState } from "react";
import { api } from "../api.js";
import { User, Lock, Sparkles, Crown, Shield, Zap } from "lucide-react";

export default function CharacterSelection() {
  const [characters, setCharacters] = useState([]);
  const [userCharacter, setUserCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charactersData, userData] = await Promise.all([
          api.get("/characters"),
          api.get("/users/me"),
        ]);
        setCharacters(charactersData);
        setUserCharacter(userData.selectedCharacter);
      } catch (error) {
        console.error("Error fetching character data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelect = (characterId) => {
    setUserCharacter(characterId);
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 text-slate-400">
          <User className="w-5 h-5 animate-pulse" />
          <span>Loading characters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Character Selection</h2>
          <p className="text-sm text-slate-500">Choose your learning companion!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            isSelected={userCharacter === character.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}

function CharacterCard({ character, isSelected, onSelect }) {
  const [owned, setOwned] = useState(false);

  const getRarityColor = () => {
    const colors = {
      common: "from-gray-400 to-slate-500",
      rare: "from-blue-400 to-cyan-500",
      epic: "from-purple-400 to-pink-500",
      legendary: "from-amber-400 to-orange-500",
    };
    return colors[character.rarity] || colors.common;
  };

  const getRarityIcon = () => {
    const icons = {
      common: null,
      rare: <Sparkles className="w-4 h-4" />,
      epic: <Crown className="w-4 h-4" />,
      legendary: <Zap className="w-4 h-4" />,
    };
    return icons[character.rarity];
  };

  const getTypeIcon = () => {
    const icons = {
      explorer: <User className="w-5 h-5" />,
      space_ranger: <Zap className="w-5 h-5" />,
      science_wizard: <Sparkles className="w-5 h-5" />,
      math_knight: <Shield className="w-5 h-5" />,
      english_hero: <Crown className="w-5 h-5" />,
    };
    return icons[character.type] || <User className="w-5 h-5" />;
  };

  const handleSelect = async () => {
    try {
      await api.post(`/characters/${character.id}/select`);
      onSelect(character.id);
    } catch (error) {
      console.error("Error selecting character:", error);
    }
  };

  return (
    <div
      className={`relative bg-slate-50 rounded-xl p-6 border-2 overflow-hidden hover:shadow-xl transition-all duration-300 ${
        isSelected ? "border-indigo-500 bg-indigo-50" : "border-slate-200"
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          Selected
        </div>
      )}

      <div className="text-center mb-4">
        <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getRarityColor()} grid place-items-center text-4xl mb-3`}>
          {character.icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800">{character.name}</h3>
        <p className="text-sm text-slate-500 mt-1">{character.description}</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getRarityColor()} grid place-items-center text-white`}>
          {getTypeIcon()}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${getRarityColor()} text-white flex items-center gap-1`}>
          {getRarityIcon()}
          {character.rarity}
        </span>
      </div>

      {character.cost > 0 && !owned && (
        <div className="text-center mb-4">
          <span className="text-sm font-bold text-cyan-600">
            💎 {character.cost} gems
          </span>
        </div>
      )}

      {character.unlockedBy && !owned && (
        <div className="text-center mb-4">
          <span className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Unlock by: {character.unlockedBy}
          </span>
        </div>
      )}

      {isSelected ? (
        <button className="w-full py-2 px-4 rounded-lg font-bold text-white bg-green-500 cursor-not-allowed">
          ✓ Currently Selected
        </button>
      ) : character.unlockedBy && !owned ? (
        <button className="w-full py-2 px-4 rounded-lg font-bold text-slate-400 bg-slate-200 cursor-not-allowed flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" /> Locked
        </button>
      ) : character.cost > 0 && !owned ? (
        <button className="w-full py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg transition">
          💎 Unlock
        </button>
      ) : (
        <button
          onClick={handleSelect}
          className="w-full py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg transition"
        >
          Select Character
        </button>
      )}
    </div>
  );
}
