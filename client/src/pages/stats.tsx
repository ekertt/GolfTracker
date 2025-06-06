import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import StatusBar from "@/components/status-bar";
import BottomNavigation from "@/components/bottom-navigation";
import PerformanceAnalytics from "@/components/performance-analytics";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Target, Flag } from "lucide-react";
import type { RoundStats, RoundWithHoles } from "@shared/schema";

export default function Stats() {
  const [, setLocation] = useLocation();
  const userId = 1;

  const { data: stats } = useQuery<RoundStats>({
    queryKey: [`/api/users/${userId}/stats`],
  });

  const { data: rounds = [] } = useQuery<RoundWithHoles[]>({
    queryKey: [`/api/users/${userId}/rounds`],
  });

  const completedRounds = rounds.filter(round => round.isCompleted);

  return (
    <>
      <StatusBar />
      
      {/* Header */}
      <div className="gradient-bg text-white px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="text-2xl" />
          </Button>
          <h1 className="text-xl font-semibold">Statistics</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10 pb-24">
        {stats && stats.totalRounds > 0 ? (
          <>
            {/* Performance Analytics */}
            <PerformanceAnalytics stats={stats} />

            {/* Detailed Stats */}
            <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Detailed Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="text-[hsl(var(--golf-green))] h-5 w-5" />
                    <span className="font-medium">Average Score</span>
                  </div>
                  <span className="text-lg font-bold">{stats.averageScore.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="text-[hsl(var(--sky-blue))] h-5 w-5" />
                    <span className="font-medium">Average Putts</span>
                  </div>
                  <span className="text-lg font-bold">{stats.averagePutts.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Flag className="text-[hsl(var(--golf-orange))] h-5 w-5" />
                    <span className="font-medium">Total Rounds</span>
                  </div>
                  <span className="text-lg font-bold">{stats.totalRounds}</span>
                </div>
              </div>
            </div>

            {/* Recent Performance */}
            <div className="bg-white rounded-2xl card-shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Performance</h3>
              
              {completedRounds.slice(0, 5).map((round, index) => {
                const totalPar = round.holes.reduce((sum, hole) => sum + hole.par, 0);
                const scoreToPar = (round.totalScore || 0) - totalPar;
                const scoreText = scoreToPar === 0 ? "E" : scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`;
                
                return (
                  <div key={round.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <h4 className="font-medium text-gray-800">{round.courseName}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(round.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{round.totalScore}</div>
                      <div className="text-sm text-[hsl(var(--golf-green))]">{scoreText}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl card-shadow p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Statistics Yet</h3>
              <p className="text-gray-500 mb-4">Complete some rounds to see your performance analytics!</p>
              <Button
                onClick={() => setLocation("/")}
                className="bg-[hsl(var(--golf-green))] text-white hover:bg-[hsl(var(--golf-green))]/90"
              >
                Start Tracking Rounds
              </Button>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation currentPage="stats" />
    </>
  );
}
