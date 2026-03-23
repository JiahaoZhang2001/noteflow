'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Trash2, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';

function getNextDate(records: { date: string }[]): string {
  if (records.length === 0) {
    return new Date().toISOString().split('T')[0];
  }
  const last = records[records.length - 1].date;
  const next = new Date(last);
  next.setDate(next.getDate() + 1);
  return next.toISOString().split('T')[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
}

export function FitnessTracker() {
  const { fitnessRecords, addFitnessRecord, updateFitnessRecord, deleteFitnessRecord } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState('');
  const [weight, setWeight] = useState('');
  const [workout, setWorkout] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editWorkout, setEditWorkout] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleOpenForm = () => {
    setDate(getNextDate(fitnessRecords));
    setWeight('');
    setWorkout('');
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!date) return;
    addFitnessRecord({ date, weight: weight ? parseFloat(weight) : undefined, workout });
    setShowForm(false);
  };

  const handleEdit = (id: string) => {
    const r = fitnessRecords.find((r) => r.id === id);
    if (!r) return;
    setEditingId(id);
    setEditWeight(r.weight != null ? String(r.weight) : '');
    setEditWorkout(r.workout);
  };

  const handleSaveEdit = (id: string) => {
    updateFitnessRecord(id, {
      weight: editWeight ? parseFloat(editWeight) : undefined,
      workout: editWorkout,
    });
    setEditingId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">健身记录</h1>
            <p className="text-xs text-gray-500">{fitnessRecords.length} 条记录</p>
          </div>
        </div>
        <button
          onClick={handleOpenForm}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加记录
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="mb-4 p-4 bg-[#1a1a1a] border border-red-900/50 rounded-2xl space-y-3">
          <div className="text-sm font-medium text-red-400 mb-1">新增训练日</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="例：70.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">训练内容</label>
            <textarea
              placeholder="例：胸肌 3组×12 / 深蹲 4组×10 / 篮球 1小时"
              value={workout}
              onChange={(e) => setWorkout(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              保存
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-[#222] hover:bg-[#2a2a2a] text-gray-400 rounded-lg text-sm transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Records List */}
      {fitnessRecords.length === 0 && !showForm ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-5xl mb-4">🏋️</div>
          <p className="text-sm">还没有记录，开始第一次训练吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...fitnessRecords].reverse().map((record, index) => (
            <div
              key={record.id}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden"
            >
              {/* Record Header */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#333] flex items-center justify-center">
                    <span className="text-xs font-bold text-red-500">
                      {fitnessRecords.length - index}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{formatDate(record.date)}</div>
                    {record.weight != null && (
                      <div className="text-xs text-gray-500">{record.weight} kg</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {expandedId === record.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === record.id && (
                <div className="px-4 pb-4 border-t border-[#2a2a2a] pt-3 space-y-3">
                  {editingId === record.id ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">体重 (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editWeight}
                            onChange={(e) => setEditWeight(e.target.value)}
                            className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">训练内容</label>
                        <textarea
                          value={editWorkout}
                          onChange={(e) => setEditWorkout(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500 resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(record.id)}
                          className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 bg-[#222] text-gray-400 rounded-lg text-sm transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {record.workout ? (
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{record.workout}</p>
                      ) : (
                        <p className="text-sm text-gray-600 italic">未填写训练内容</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(record.id)}
                          className="flex-1 py-1.5 bg-[#222] hover:bg-[#2a2a2a] text-gray-400 rounded-lg text-sm transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => deleteFitnessRecord(record.id)}
                          className="px-3 py-1.5 bg-[#222] hover:bg-red-900/40 text-gray-500 hover:text-red-400 rounded-lg text-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
