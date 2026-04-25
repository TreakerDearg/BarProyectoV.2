export default function LiveActivity() {
  const activities = [
    {
      title: "New High-Value Order",
      desc: "Table 12 • $428.00",
      time: "2 min ago",
      color: "bg-[#8B5CF6]" // Violeta original para diferenciar
    },
    {
      title: "Table 04 Cleared",
      desc: "Ready for seating",
      time: "5 min ago",
      color: "bg-bar-green"
    },
    {
      title: "Shift Change Complete",
      desc: "Night staff logged in",
      time: "14 min ago",
      color: "bg-gray-500"
    }
  ];

  return (
    <div className="bg-void border border-obsidian/40 rounded-xl flex-1 flex flex-col shadow-glass">
      <div className="p-4 border-b border-obsidian/40">
        <h3 className="font-bold text-gray-400 text-xs tracking-widest uppercase">Live Activity</h3>
      </div>
      
      <div className="p-4 flex-1 space-y-6">
        {activities.map((act, i) => (
          <div key={i} className="flex gap-4 relative">
            {/* linea conectora */}
            {i !== activities.length - 1 && (
              <div className="absolute left-2 top-6 bottom-[-1.5rem] w-px bg-obsidian" />
            )}
            
            <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${act.color} shadow-[0_0_8px_currentColor] border-2 border-void relative z-10`} />
            
            <div>
              <p className="text-sm font-bold text-white">{act.title}</p>
              <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                <span>{act.desc}</span>
                <span>•</span>
                <span>{act.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="p-3 border-t border-obsidian/40 w-full text-xs font-bold text-gray-400 hover:text-white transition uppercase tracking-widest">
        View All Activity
      </button>
    </div>
  );
}
