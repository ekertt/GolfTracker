export default function StatusBar() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div className="gradient-bg text-white px-4 py-2 flex justify-between items-center text-sm">
      <span>{timeString}</span>
      <div className="flex items-center space-x-1">
        <i className="fas fa-signal text-xs"></i>
        <i className="fas fa-wifi text-xs"></i>
        <i className="fas fa-battery-three-quarters text-xs"></i>
      </div>
    </div>
  );
}
