import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import StatusBar from "@/components/status-bar";
import BottomNavigation from "@/components/bottom-navigation";
import RoundCard from "@/components/round-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { RoundWithHoles } from "@shared/schema";

export default function Rounds() {
  const [, setLocation] = useLocation();
  const userId = 1;

  const { data: rounds = [] } = useQuery<RoundWithHoles[]>({
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
      setLocation(`/rounds/${newRound.id}`);
    } catch (error) {
      console.error("Failed to start new round:", error);
    }
  };

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
          <h1 className="text-xl font-semibold">All Rounds</h1>
          <Button
            onClick={handleStartNewRound}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <Plus className="text-2xl" />
          </Button>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10 pb-24">
        {/* Rounds List */}
        <div className="space-y-4">
          {rounds.map((round) => (
            <RoundCard 
              key={round.id} 
              round={round} 
              isActive={!round.isCompleted}
              onContinue={() => setLocation(`/rounds/${round.id}`)}
            />
          ))}
          
          {rounds.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl card-shadow p-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Rounds Yet</h3>
                <p className="text-gray-500 mb-4">Start tracking your golf performance today!</p>
                <Button
                  onClick={handleStartNewRound}
                  className="bg-[hsl(var(--golf-green))] text-white hover:bg-[hsl(var(--golf-green))]/90"
                >
                  <Plus className="mr-2" />
                  Start Your First Round
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation currentPage="rounds" />
    </>
  );
}
