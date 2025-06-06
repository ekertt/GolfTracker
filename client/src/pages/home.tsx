import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import StatusBar from "@/components/status-bar";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import RoundCard from "@/components/round-card";
import PerformanceAnalytics from "@/components/performance-analytics";
import ScoreInputModal from "@/components/score-input-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { RoundWithHoles, RoundStats } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [activeRoundId, setActiveRoundId] = useState<number | null>(null);

  // Using user ID 1 for now (default user)
  const userId = 1;

  const { data: stats } = useQuery<RoundStats>({
    queryKey: [`/api/users/${userId}/stats`],
  });

  const { data: activeRound, refetch: refetchActiveRound } = useQuery<RoundWithHoles>({
    queryKey: [`/api/users/${userId}/active-round`],
  });

  const { data: recentRounds = [] } = useQuery<RoundWithHoles[]>({
    queryKey: [`/api/users/${userId}/rounds`],
  });

  const handleStartNewRound = async () => {
    try {
      const courseName = prompt("Enter course name:");
      if (!courseName) return;

      const response = await apiRequest("POST", "/api/rounds", {
        userId,
        courseName,
        totalPar: 72,
      });

      const newRound = await response.json();
      await refetchActiveRound();
      setLocation(`/rounds/${newRound.id}`);
    } catch (error) {
      console.error("Failed to start new round:", error);
    }
  };

  const handleContinueRound = () => {
    if (activeRound) {
      setLocation(`/rounds/${activeRound.id}`);
    }
  };

  return (
    <>
      <StatusBar />
      <AppHeader stats={stats} />
      
      <div className="px-6 -mt-6 relative z-10 pb-24">
        {/* Active Round Card */}
        {activeRound && (
          <RoundCard
            round={activeRound}
            isActive={true}
            onContinue={handleContinueRound}
          />
        )}

        {/* New Round Button */}
        <Button
          onClick={handleStartNewRound}
          className="w-full bg-white rounded-2xl card-shadow p-4 mb-6 flex items-center justify-center space-x-3 text-golf-green border-2 border-dashed border-[hsl(var(--golf-green))] hover:bg-gray-50"
          variant="outline"
        >
          <Plus className="text-xl" />
          <span className="font-semibold">Start New Round</span>
        </Button>

        {/* Recent Rounds */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Rounds</h3>
            <Button
              onClick={() => setLocation("/rounds")}
              variant="ghost"
              className="text-[hsl(var(--golf-green))] text-sm font-medium"
            >
              View All
            </Button>
          </div>
          
          {recentRounds.slice(0, 3).map((round) => (
            <RoundCard key={round.id} round={round} />
          ))}
          
          {recentRounds.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No rounds recorded yet</p>
              <p className="text-sm">Start your first round to begin tracking!</p>
            </div>
          )}
        </div>

        {/* Performance Analytics */}
        {stats && stats.totalRounds > 0 && (
          <PerformanceAnalytics stats={stats} />
        )}
      </div>

      <BottomNavigation currentPage="home" />

      {/* Floating Action Button */}
      <Button
        onClick={handleStartNewRound}
        className="fixed bottom-20 right-6 w-14 h-14 bg-[hsl(var(--golf-green))] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[hsl(var(--golf-green))]/90"
        size="icon"
      >
        <Plus className="text-xl" />
      </Button>

      {showScoreModal && activeRoundId && (
        <ScoreInputModal
          roundId={activeRoundId}
          onClose={() => setShowScoreModal(false)}
        />
      )}
    </>
  );
}
