import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useState } from "react";
import StatusBar from "@/components/status-bar";
import ScoreInputModal from "@/components/score-input-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { calculateScoreToPar } from "@/lib/golf-utils";
import type { RoundWithHoles, GolfHole } from "@shared/schema";

export default function RoundInput() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedHole, setSelectedHole] = useState<number>(1);

  const roundId = parseInt(id || "0");

  const { data: round, isLoading } = useQuery<RoundWithHoles>({
    queryKey: [`/api/rounds/${roundId}`],
    enabled: !!roundId,
  });

  const updateHoleMutation = useMutation({
    mutationFn: async ({ holeNumber, updates }: { holeNumber: number; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/rounds/${roundId}/holes/${holeNumber}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rounds/${roundId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/1/active-round`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/1/rounds`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/1/stats`] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--golf-green))] mx-auto mb-4"></div>
          <p>Loading round...</p>
        </div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Round not found</h2>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleHoleClick = (holeNumber: number) => {
    setSelectedHole(holeNumber);
    setShowScoreModal(true);
  };

  const handleSaveHole = async (holeData: any) => {
    await updateHoleMutation.mutateAsync({
      holeNumber: selectedHole,
      updates: holeData,
    });
    setShowScoreModal(false);
    
    // Auto-advance to next hole if not the last hole
    if (selectedHole < 18) {
      setSelectedHole(selectedHole + 1);
      setShowScoreModal(true);
    }
  };

  const totalScore = round.holes.reduce((sum, hole) => sum + (hole.score || 0), 0);
  const totalPar = round.holes.reduce((sum, hole) => sum + hole.par, 0);
  const scoreToPar = calculateScoreToPar(totalScore, totalPar);
  const completedHoles = round.holes.filter(hole => hole.score !== null).length;
  const progress = (completedHoles / 18) * 100;

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
          <div className="text-center">
            <h1 className="text-xl font-semibold">{round.courseName}</h1>
            <p className="text-green-100 text-sm">
              {new Date(round.date).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <MoreHorizontal className="text-2xl" />
          </Button>
        </div>

        {/* Score Summary */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold">{totalScore || 0}</div>
            <div className="text-green-100 text-sm">{scoreToPar}</div>
          </div>
          <div className="text-right">
            <div className="text-lg">{completedHoles}/18 holes</div>
            <div className="text-green-100 text-sm">{progress.toFixed(0)}% complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10 pb-8">
        {/* Holes Grid */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Scorecard</h3>
          
          {/* Front 9 */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-600 mb-3">Front 9</h4>
            <div className="grid grid-cols-3 gap-3">
              {round.holes.slice(0, 9).map((hole) => (
                <Button
                  key={hole.holeNumber}
                  onClick={() => handleHoleClick(hole.holeNumber)}
                  variant="outline"
                  className={`h-16 flex flex-col items-center justify-center ${
                    hole.score !== null 
                      ? 'bg-[hsl(var(--golf-green))] text-white border-[hsl(var(--golf-green))]' 
                      : 'border-gray-200 hover:border-[hsl(var(--golf-green))]'
                  }`}
                >
                  <div className="text-xs">Hole {hole.holeNumber}</div>
                  <div className="font-bold">
                    {hole.score !== null ? hole.score : `Par ${hole.par}`}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Back 9 */}
          <div>
            <h4 className="font-medium text-gray-600 mb-3">Back 9</h4>
            <div className="grid grid-cols-3 gap-3">
              {round.holes.slice(9, 18).map((hole) => (
                <Button
                  key={hole.holeNumber}
                  onClick={() => handleHoleClick(hole.holeNumber)}
                  variant="outline"
                  className={`h-16 flex flex-col items-center justify-center ${
                    hole.score !== null 
                      ? 'bg-[hsl(var(--golf-green))] text-white border-[hsl(var(--golf-green))]' 
                      : 'border-gray-200 hover:border-[hsl(var(--golf-green))]'
                  }`}
                >
                  <div className="text-xs">Hole {hole.holeNumber}</div>
                  <div className="font-bold">
                    {hole.score !== null ? hole.score : `Par ${hole.par}`}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {completedHoles > 0 && (
          <div className="bg-white rounded-2xl card-shadow p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Round Stats</h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--light-green))]">
                  {Math.round((round.holes.filter(h => h.fairwayInRegulation === true).length / round.holes.filter(h => h.fairwayInRegulation !== null).length) * 100) || 0}%
                </div>
                <div className="text-xs text-gray-500">FIR</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--sky-blue))]">
                  {Math.round((round.holes.filter(h => h.greenInRegulation === true).length / round.holes.filter(h => h.greenInRegulation !== null).length) * 100) || 0}%
                </div>
                <div className="text-xs text-gray-500">GIR</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--golf-orange))]">
                  {round.holes.filter(h => h.putts !== null).reduce((sum, h) => sum + (h.putts || 0), 0)}
                </div>
                <div className="text-xs text-gray-500">Total Putts</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showScoreModal && (
        <ScoreInputModal
          roundId={roundId}
          hole={round.holes.find(h => h.holeNumber === selectedHole)!}
          onClose={() => setShowScoreModal(false)}
          onSave={handleSaveHole}
        />
      )}
    </>
  );
}
