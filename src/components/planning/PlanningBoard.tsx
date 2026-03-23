'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Trash2, Target, X } from 'lucide-react';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function PlanningBoard() {
  const { dayPlans, addDayPlan, deleteDayPlan, addTodo, toggleTodo, deleteTodo } = useStore();

  const [newDate, setNewDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [todoInputs, setTodoInputs] = useState<Record<string, string>>({});

  const handleAddDay = () => {
    const date = newDate || getToday();
    addDayPlan(date);
    setShowDatePicker(false);
    setNewDate('');
  };

  const handleAddTodo = (dayPlanId: string) => {
    const text = todoInputs[dayPlanId]?.trim();
    if (!text) return;
    addTodo(dayPlanId, text);
    setTodoInputs((prev) => ({ ...prev, [dayPlanId]: '' }));
  };

  const sortedPlans = [...dayPlans].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">未来规划</h1>
            <p className="text-xs text-gray-500">{dayPlans.length} 天计划</p>
          </div>
        </div>
        <button
          onClick={() => { setNewDate(getToday()); setShowDatePicker(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加日期
        </button>
      </div>

      {/* Date Picker */}
      {showDatePicker && (
        <div className="mb-4 p-4 bg-[#1a1a1a] border border-red-900/50 rounded-2xl space-y-3">
          <div className="text-sm font-medium text-red-400">选择日期</div>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddDay}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              添加
            </button>
            <button
              onClick={() => setShowDatePicker(false)}
              className="px-4 py-2 bg-[#222] text-gray-400 rounded-lg text-sm transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Day Plans */}
      {sortedPlans.length === 0 && !showDatePicker ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-sm">还没有计划，添加第一天吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPlans.map((plan) => {
            const completed = plan.todos.filter((t) => t.completed).length;
            const total = plan.todos.length;
            const isToday = plan.date === getToday();

            return (
              <div
                key={plan.id}
                className={`bg-[#1a1a1a] border rounded-2xl overflow-hidden ${
                  isToday ? 'border-red-700' : 'border-[#2a2a2a]'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
                  <div className="flex items-center gap-2">
                    {isToday && (
                      <span className="text-xs px-2 py-0.5 bg-red-600 text-white rounded-full font-medium">今天</span>
                    )}
                    <span className="text-sm font-semibold text-white">{formatDate(plan.date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {total > 0 && (
                      <span className="text-xs text-gray-500">{completed}/{total}</span>
                    )}
                    <button
                      onClick={() => deleteDayPlan(plan.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Todo List */}
                <div className="px-4 py-3 space-y-2">
                  {plan.todos.map((todo) => (
                    <div key={todo.id} className="flex items-center gap-3 group">
                      <button
                        onClick={() => toggleTodo(plan.id, todo.id)}
                        className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          todo.completed
                            ? 'bg-red-600 border-red-600'
                            : 'border-[#444] hover:border-red-500'
                        }`}
                      >
                        {todo.completed && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm transition-all ${
                          todo.completed ? 'line-through text-gray-600' : 'text-gray-200'
                        }`}
                      >
                        {todo.text}
                      </span>
                      <button
                        onClick={() => deleteTodo(plan.id, todo.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Todo Input */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                    <input
                      type="text"
                      placeholder="添加待办事项..."
                      value={todoInputs[plan.id] || ''}
                      onChange={(e) => setTodoInputs((prev) => ({ ...prev, [plan.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTodo(plan.id);
                      }}
                      onBlur={() => handleAddTodo(plan.id)}
                      className="flex-1 bg-transparent text-sm text-gray-400 placeholder-gray-700 focus:outline-none focus:text-gray-200"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
