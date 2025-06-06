import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, List, BarChart3, User } from "lucide-react";

interface BottomNavigationProps {
  currentPage: "home" | "rounds" | "stats" | "profile";
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    { key: "home", icon: Home, label: "Home", path: "/" },
    { key: "rounds", icon: List, label: "Rounds", path: "/rounds" },
    { key: "stats", icon: BarChart3, label: "Stats", path: "/stats" },
    { key: "profile", icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
      <div className="grid grid-cols-4 py-2">
        {navItems.map(({ key, icon: Icon, label, path }) => (
          <Button
            key={key}
            onClick={() => setLocation(path)}
            variant="ghost"
            className={`flex flex-col items-center py-2 h-auto ${
              currentPage === key 
                ? "text-[hsl(var(--golf-green))]" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon className="text-xl mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
