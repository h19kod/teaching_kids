import { useState } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "dragdrop" games: drag items to their correct zones.
export default function DragDropGame({ content, onFinish }) {
  const items = content.items || [];
  const zones = content.zones || [];
  const [placed, setPlaced] = useState({}); // { itemId: zoneId }

  if (items.length === 0 || zones.length === 0) {
    return <p className="text-slate-400">This game has no items or zones yet.</p>;
  }

  const allCorrect = items.every((item) => {
    const placedZoneId = placed[item.id];
    const correctZone = zones.find((z) => z.id === item.correctZoneId);
    return placedZoneId === correctZone?.id;
  });

  const allPlaced = items.length === Object.keys(placed).length;

  function handleDragStart(e, itemId) {
    e.dataTransfer.setData("itemId", itemId);
    sounds.click();
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e, zoneId) {
    e.preventDefault();
    const itemId = parseInt(e.dataTransfer.getData("itemId"));
    const item = items.find((i) => i.id === itemId);
    const zone = zones.find((z) => z.id === zoneId);

    if (!item || !zone) return;

    setPlaced((prev) => ({ ...prev, [itemId]: zoneId }));

    if (zone.id === item.correctZoneId) {
      sounds.correct();
      if (allPlaced && allCorrect) {
        setTimeout(() => {
          sounds.success();
          onFinish(1);
        }, 500);
      }
    } else {
      sounds.wrong();
    }
  }

  function handleRemove(itemId) {
    setPlaced((prev) => {
      const newPlaced = { ...prev };
      delete newPlaced[itemId];
      return newPlaced;
    });
  }

  const unplacedItems = items.filter((item) => !placed[item.id]);

  return (
    <div className="card animate-pop space-y-6">
      <p className="text-center text-slate-500">
        Placed {Object.keys(placed).length} of {items.length}
      </p>

      {/* Drop Zones */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, zone.id)}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-4 min-h-[120px] bg-slate-50 transition-all hover:border-indigo-400"
          >
            <div className="text-center mb-2">
              <span className="text-2xl">{zone.icon}</span>
              <p className="text-sm font-semibold text-slate-600">{zone.label}</p>
            </div>
            <div className="space-y-2">
              {items
                .filter((item) => placed[item.id] === zone.id)
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleRemove(item.id)}
                    className="bg-white rounded-xl p-2 shadow-sm cursor-pointer hover:shadow-md transition border-2 border-indigo-200"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-xs font-semibold text-slate-600">{item.label}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Draggable Items */}
      <div className="bg-slate-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-slate-500 mb-3">Drag items to their zones:</p>
        <div className="flex flex-wrap gap-3">
          {unplacedItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              className="bg-white rounded-xl p-3 shadow-sm cursor-move hover:shadow-md transition border border-slate-200 select-none"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="text-sm font-semibold text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
