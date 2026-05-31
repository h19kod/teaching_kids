import { useEffect, useState } from "react";
import { api } from "../api.js";
import { ShoppingBag, Coins, Star, Gem, Lock, ShoppingCart } from "lucide-react";

export default function RewardsShop() {
  const [rewards, setRewards] = useState([]);
  const [userCurrency, setUserCurrency] = useState({ coins: 0, stars: 0, gems: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const [rewardsData, userData] = await Promise.all([
          api.get("/rewards"),
          api.get("/users/me"),
        ]);
        setRewards(rewardsData);
        setUserCurrency({
          coins: userData.coins,
          stars: userData.stars,
          gems: userData.gems,
        });
      } catch (error) {
        console.error("Error fetching rewards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 text-slate-400">
          <ShoppingBag className="w-5 h-5 animate-pulse" />
          <span>Loading rewards shop...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Rewards Shop</h2>
            <p className="text-sm text-slate-500">Spend your currency on awesome rewards!</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full">
            <Coins className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-amber-700">{userCurrency.coins}</span>
          </div>
          <div className="flex items-center gap-1 bg-purple-100 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 text-purple-600" />
            <span className="font-bold text-purple-700">{userCurrency.stars}</span>
          </div>
          <div className="flex items-center gap-1 bg-cyan-100 px-3 py-1 rounded-full">
            <Gem className="w-4 h-4 text-cyan-600" />
            <span className="font-bold text-cyan-700">{userCurrency.gems}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <RewardCard key={reward.id} reward={reward} userCurrency={userCurrency} />
        ))}
      </div>
    </div>
  );
}

function RewardCard({ reward, userCurrency }) {
  const [owned, setOwned] = useState(false);

  const canAfford = () => {
    switch (reward.costType) {
      case "coins":
        return userCurrency.coins >= reward.cost;
      case "stars":
        return userCurrency.stars >= reward.cost;
      case "gems":
        return userCurrency.gems >= reward.cost;
      default:
        return false;
    }
  };

  const getCurrencyIcon = () => {
    switch (reward.costType) {
      case "coins":
        return <Coins className="w-4 h-4" />;
      case "stars":
        return <Star className="w-4 h-4" />;
      case "gems":
        return <Gem className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRarityColor = () => {
    switch (reward.rarity) {
      case "common":
        return "bg-gray-100 border-gray-300";
      case "rare":
        return "bg-blue-100 border-blue-300";
      case "epic":
        return "bg-purple-100 border-purple-300";
      case "legendary":
        return "bg-amber-100 border-amber-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const handlePurchase = async () => {
    try {
      await api.post(`/rewards/${reward.id}/purchase`);
      setOwned(true);
      // Refresh user currency
      const userData = await api.get("/users/me");
      setUserCurrency({
        coins: userData.coins,
        stars: userData.stars,
        gems: userData.gems,
      });
    } catch (error) {
      console.error("Error purchasing reward:", error);
    }
  };

  return (
    <div className={`card ${getRarityColor()} border-2 overflow-hidden hover:shadow-xl transition-all duration-300`}>
      <div className="p-6">
        <div className="text-5xl text-center mb-4">{reward.icon}</div>
        <h3 className="text-lg font-bold text-slate-800 text-center mb-2">{reward.name}</h3>
        <p className="text-sm text-slate-600 text-center mb-4">{reward.description}</p>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getRarityColor()}`}>
            {reward.rarity}
          </span>
          <span className="text-xs text-slate-500 capitalize">{reward.type.replace("_", " ")}</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4 font-bold text-slate-700">
          {getCurrencyIcon()}
          <span>{reward.cost} {reward.costType}</span>
        </div>

        {owned ? (
          <button className="w-full py-2 px-4 rounded-lg font-bold text-white bg-green-500 cursor-not-allowed">
            ✓ Owned
          </button>
        ) : canAfford() ? (
          <button
            onClick={handlePurchase}
            className="w-full py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> Purchase
          </button>
        ) : (
          <button className="w-full py-2 px-4 rounded-lg font-bold text-slate-400 bg-slate-200 cursor-not-allowed flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Not enough {reward.costType}
          </button>
        )}
      </div>
    </div>
  );
}
