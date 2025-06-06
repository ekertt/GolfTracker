import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import StatusBar from "@/components/status-bar";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Award, Calendar, Target } from "lucide-react";
import type { RoundStats } from "@shared/schema";

export default function Profile() {
  const [, setLocation] = useLocation();
  const userId = 1;

  const { data: stats } = useQuery<RoundStats>({
    queryKey: [`/api/users/${userId}/stats`],
  });

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
          <h1 className="text-xl font-semibold">Profile</h1>
          <div className="w-10" />
        </div>
        
        {/* Profile Info */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Mike</h2>
            <p className="text-green-100">Golf Enthusiast</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10 pb-24">
        {/* Profile Stats */}
        <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Your Golf Profile</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Award className="text-[hsl(var(--golf-green))] h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">
                {stats?.averageScore.toFixed(1) || "0"}
              </div>
              <div className="text-sm text-gray-500">Avg Score</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Calendar className="text-[hsl(var(--sky-blue))] h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">
                {stats?.totalRounds || 0}
              </div>
              <div className="text-sm text-gray-500">Rounds Played</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
          
          <div className="space-y-3">
            {stats && stats.totalRounds >= 1 && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="text-green-600 text-sm" />
                </div>
                <div>
                  <span className="font-medium text-gray-700">First Round</span>
                  <p className="text-sm text-green-600">Completed your first round!</p>
                </div>
              </div>
            )}
            
            {stats && stats.totalRounds >= 5 && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="text-blue-600 text-sm" />
                </div>
                <div>
                  <span className="font-medium text-gray-700">Regular Player</span>
                  <p className="text-sm text-blue-600">Played 5+ rounds</p>
                </div>
              </div>
            )}
            
            {stats && stats.firPercentage >= 70 && (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Award className="text-yellow-600 text-sm" />
                </div>
                <div>
                  <span className="font-medium text-gray-700">Straight Shooter</span>
                  <p className="text-sm text-yellow-600">70%+ fairways hit</p>
                </div>
              </div>
            )}
            
            {(!stats || stats.totalRounds === 0) && (
              <div className="text-center py-4 text-gray-500">
                <p>Complete rounds to unlock achievements!</p>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
          
          <div className="space-y-3">
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              Handicap Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              Course Preferences
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              Export Data
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-600">
              Clear All Data
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation currentPage="profile" />
    </>
  );
}
