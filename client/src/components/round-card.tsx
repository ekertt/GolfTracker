import { Button } from "@/components/ui/button";
import { calculateScoreToPar } from "@/lib/golf-utils";
import type { RoundWithHoles } from "@shared/schema";

interface RoundCardProps {
  round: RoundWithHoles;
  isActive?: boolean;
  onContinue?: () => void;
}

export default function RoundCard({ round, isActive = false, onContinue }: RoundCardProps) {
  const totalPar = round.holes.reduce((sum, hole) => sum + hole.par, 0);
  const scoreToPar = calculateScoreToPar(round.totalScore || 0, totalPar);
  const completedHoles = round.holes.filter(hole => hole.score !== null).length;
  const progress = (completedHoles / 18) * 100;

  // Calculate stats for completed holes
  const holesWithFIR = round.holes.filter(hole => hole.fairwayInRegulation !== null);
  const firHits = holesWithFIR.filter(hole => hole.fairwayInRegulation === true).length;
  const firPercentage = holesWithFIR.length > 0 ? Math.round((firHits / holesWithFIR.length) * 100) : 0;

  const holesWithGIR = round.holes.filter(hole => hole.greenInRegulation !== null);
  const girHits = holesWithGIR.filter(hole => hole.greenInRegulation === true).length;
  const girPercentage = holesWithGIR.length > 0 ? Math.round((girHits / holesWithGIR.length) * 100) : 0;

  const totalPutts = round.holes.filter(h => h.putts !== null).reduce((sum, hole) => sum + (hole.putts || 0), 0);

  if (isActive) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Current Round</h3>
            <p className="text-sm text-gray-500">{round.courseName}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[hsl(var(--golf-green))]">{scoreToPar}</div>
            <div className="text-sm text-gray-500">Hole {round.currentHole}/18</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[hsl(var(--golf-green))] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {onContinue && (
          <Button
            onClick={onContinue}
            className="w-full bg-[hsl(var(--golf-green))] text-white py-3 rounded-xl font-semibold hover:bg-[hsl(var(--golf-green))]/90"
          >
            Continue Round
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl card-shadow p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{round.courseName}</h4>
          <p className="text-sm text-gray-500">
            {new Date(round.date).toLocaleDateString()}
          </p>
          {round.isCompleted && (
            <div className="flex items-center space-x-4 mt-2 text-xs">
              <span className="text-[hsl(var(--light-green))]">FIR: {firPercentage}%</span>
              <span className="text-[hsl(var(--sky-blue))]">GIR: {girPercentage}%</span>
              <span className="text-[hsl(var(--golf-orange))]">Putts: {totalPutts}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{round.totalScore || 0}</div>
          <div className="text-sm text-[hsl(var(--golf-green))]">{scoreToPar}</div>
        </div>
      </div>
    </div>
  );
}
