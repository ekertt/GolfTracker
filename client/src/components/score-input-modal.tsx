import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";
import type { GolfHole } from "@shared/schema";

interface ScoreInputModalProps {
  roundId: number;
  hole: GolfHole;
  onClose: () => void;
  onSave: (holeData: any) => void;
}

export default function ScoreInputModal({ hole, onClose, onSave }: ScoreInputModalProps) {
  const [score, setScore] = useState(hole.score || hole.par);
  const [putts, setPutts] = useState(hole.putts || 2);
  const [fairwayInRegulation, setFairwayInRegulation] = useState(hole.fairwayInRegulation ?? false);
  const [greenInRegulation, setGreenInRegulation] = useState(hole.greenInRegulation ?? false);
  const [notes, setNotes] = useState(hole.notes || "");

  const handleSave = () => {
    onSave({
      score,
      putts,
      fairwayInRegulation,
      greenInRegulation,
      notes: notes.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="max-w-sm mx-auto bg-white min-h-screen relative">
        
        {/* Modal Header */}
        <div className="gradient-bg text-white px-6 py-8">
          <div className="flex items-center justify-between">
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="text-2xl" />
            </Button>
            <div className="text-center">
              <h2 className="text-xl font-semibold">Hole {hole.holeNumber}</h2>
              <p className="text-green-100 text-sm">Par {hole.par} • {hole.yardage} yards</p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          
          {/* Score Input */}
          <div className="bg-white rounded-2xl card-shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Score</h3>
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={() => setScore(Math.max(score - 1, 1))}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full"
              >
                <Minus className="text-gray-600" />
              </Button>
              <div className="text-4xl font-bold text-[hsl(var(--golf-green))] w-16 text-center">
                {score}
              </div>
              <Button
                onClick={() => setScore(Math.min(score + 1, 15))}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full"
              >
                <Plus className="text-gray-600" />
              </Button>
            </div>
          </div>

          {/* FIR & GIR Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl card-shadow p-4">
              <div className="text-center mb-3">
                <h4 className="font-semibold text-gray-700">Fairway Hit</h4>
                <p className="text-xs text-gray-500">FIR</p>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => setFairwayInRegulation(!fairwayInRegulation)}
                  variant="ghost"
                  className={`w-16 h-8 rounded-full flex items-center transition-all duration-200 ${
                    fairwayInRegulation ? 'bg-[hsl(var(--light-green))]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                    fairwayInRegulation ? 'translate-x-9' : 'translate-x-1'
                  }`}></div>
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl card-shadow p-4">
              <div className="text-center mb-3">
                <h4 className="font-semibold text-gray-700">Green in Reg</h4>
                <p className="text-xs text-gray-500">GIR</p>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => setGreenInRegulation(!greenInRegulation)}
                  variant="ghost"
                  className={`w-16 h-8 rounded-full flex items-center transition-all duration-200 ${
                    greenInRegulation ? 'bg-[hsl(var(--light-green))]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                    greenInRegulation ? 'translate-x-9' : 'translate-x-1'
                  }`}></div>
                </Button>
              </div>
            </div>
          </div>

          {/* Putts Input */}
          <div className="bg-white rounded-2xl card-shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Putts</h3>
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={() => setPutts(Math.max(putts - 1, 0))}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full"
              >
                <Minus className="text-gray-600" />
              </Button>
              <div className="text-4xl font-bold text-[hsl(var(--sky-blue))] w-16 text-center">
                {putts}
              </div>
              <Button
                onClick={() => setPutts(Math.min(putts + 1, 10))}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full"
              >
                <Plus className="text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-2xl card-shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-none" 
              rows={3} 
              placeholder="Add notes about this hole..."
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-[hsl(var(--golf-green))] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[hsl(var(--golf-green))]/90"
          >
            Save & Continue
          </Button>

        </div>
      </div>
    </div>
  );
}
