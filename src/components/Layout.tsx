'use client';

import { useStore } from '@/store/useStore';
import { FitnessTracker } from './fitness/FitnessTracker';
import { PlanningBoard } from './planning/PlanningBoard';
import { Dumbbell, Target } from 'lucide-react';

export function Layout() {
  const { appView, setAppView } = useStore();

  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-white">
      {/* Top Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <span className="font-bold text-white tracking-wide">TRAINFLOW</span>
        </div>
        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-xl p-1">
          <button
            onClick={() => setAppView('fitness')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              appView === 'fitness'
                ? 'bg-red-600 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            健身
          </button>
          <button
            onClick={() => setAppView('planning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              appView === 'planning'
                ? 'bg-red-600 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            规划
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {appView === 'fitness' ? <FitnessTracker /> : <PlanningBoard />}
      </div>
    </div>
  );
}
