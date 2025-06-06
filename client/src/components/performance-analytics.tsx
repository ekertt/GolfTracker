import { Target, Flag, TrendingUp } from "lucide-react";
import type { RoundStats } from "@shared/schema";

interface PerformanceAnalyticsProps {
  stats: RoundStats;
}

export default function PerformanceAnalytics({ stats }: PerformanceAnalyticsProps) {
  const getImprovementArea = (firPercentage: number, girPercentage: number, averagePutts: number) => {
    if (firPercentage < 50) return { area: "Driving", status: "Needs Work", color: "red" };
    if (averagePutts > 2.2) return { area: "Putting", status: "Needs Work", color: "red" };
    if (girPercentage < 50) return { area: "Approach Shots", status: "Average", color: "yellow" };
    if (firPercentage < 70) return { area: "Driving", status: "Average", color: "yellow" };
    return { area: "Short Game", status: "Strong", color: "green" };
  };

  const improvement = getImprovementArea(stats.firPercentage, stats.girPercentage, stats.averagePutts);

  return (
    <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Performance Overview</h3>
      
      {/* Circular Progress Indicators */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-2">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" stroke="#E0E0E0" strokeWidth="8" fill="none"/>
              <circle 
                cx="40" 
                cy="40" 
                r="36" 
                stroke="hsl(var(--light-green))" 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray={`${(stats.firPercentage / 100) * 226} 226`}
                className="progress-ring"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-[hsl(var(--golf-green))]">
                {Math.round(stats.firPercentage)}%
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">Fairways Hit</p>
        </div>
        
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-2">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" stroke="#E0E0E0" strokeWidth="8" fill="none"/>
              <circle 
                cx="40" 
                cy="40" 
                r="36" 
                stroke="hsl(var(--sky-blue))" 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray={`${(stats.girPercentage / 100) * 226} 226`}
                className="progress-ring"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-[hsl(var(--sky-blue))]">
                {Math.round(stats.girPercentage)}%
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">Greens in Reg</p>
        </div>
      </div>

      {/* Improvement Areas */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-700 mb-3">Areas to Improve</h4>
        
        <div className={`flex items-center justify-between p-3 rounded-lg ${
          improvement.color === 'red' ? 'bg-red-50' : 
          improvement.color === 'yellow' ? 'bg-yellow-50' : 'bg-green-50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              improvement.color === 'red' ? 'bg-red-100' : 
              improvement.color === 'yellow' ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <Flag className={`text-sm ${
                improvement.color === 'red' ? 'text-red-600' : 
                improvement.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
              }`} />
            </div>
            <span className="font-medium text-gray-700">{improvement.area}</span>
          </div>
          <span className={`text-sm font-medium ${
            improvement.color === 'red' ? 'text-red-600' : 
            improvement.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {improvement.status}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="text-blue-600 text-sm" />
            </div>
            <span className="font-medium text-gray-700">Putting Average</span>
          </div>
          <span className="text-sm text-blue-600 font-medium">
            {stats.averagePutts.toFixed(1)} per hole
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-gray-600 text-sm" />
            </div>
            <span className="font-medium text-gray-700">Score Trend</span>
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {stats.averageScore.toFixed(1)} avg
          </span>
        </div>
      </div>
    </div>
  );
}
