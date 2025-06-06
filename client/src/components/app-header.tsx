import { User } from "lucide-react";
import type { RoundStats } from "@shared/schema";

interface AppHeaderProps {
  stats?: RoundStats;
}

export default function AppHeader({ stats }: AppHeaderProps) {
  return (
    <div className="gradient-bg text-white px-6 py-8 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">GolfTracker Pro</h1>
          <p className="text-green-100 text-sm">Welcome back, Mike</p>
        </div>
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <User className="text-xl" />
        </div>
      </div>
      
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-effect rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">
            {stats?.averageScore.toFixed(1) || "0.0"}
          </div>
          <div className="text-xs text-green-100">Avg Score</div>
        </div>
        <div className="glass-effect rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">
            {stats?.firPercentage.toFixed(0) || "0"}%
          </div>
          <div className="text-xs text-green-100">FIR</div>
        </div>
        <div className="glass-effect rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">
            {stats?.girPercentage.toFixed(0) || "0"}%
          </div>
          <div className="text-xs text-green-100">GIR</div>
        </div>
      </div>
    </div>
  );
}
