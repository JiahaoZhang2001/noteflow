'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Trash2, Dumbbell, Pencil, Check, X } from 'lucide-react';

function getNextDate(records: { date: string }[]): string {
  if (records.length === 0) return new Date().toISOString().split('T')[0];
  const last = records[records.length - 1].date;
  const next = new Date(last);
  next.setDate(next.getDate() + 1);
  return next.toISOString().split('T')[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

type EditState = {
  weight: string;
  bodyPart: string;
  exercises: string;
};

export function FitnessTracker() {
  const { fitnessRecords, addFitnessRecord, updateFitnessRecord, deleteFitnessRecord } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', weight: '', bodyPart: '', exercises: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ weight: '', bodyPart: '', exercises: '' });

  const handleOpenForm = () => {
    setForm({ date: getNextDate(fitnessRecords), weight: '', bodyPart: '', exercises: '' });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.date) return;
    addFitnessRecord({
      date: form.date,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      bodyPart: form.bodyPart,
      exercises: form.exercises,
    });
    setShowForm(false);
  };

  const startEdit = (id: string) => {
    const r = fitnessRecords.find((r) => r.id === id);
    if (!r) return;
    setEditingId(id);
    setEditState({
      weight: r.weight != null ? String(r.weight) : '',
      bodyPart: r.bodyPart,
      exercises: r.exercises,
    });
  };

  const saveEdit = (id: string) => {
    updateFitnessRecord(id, {
      weight: editState.weight ? parseFloat(editState.weight) : undefined,
      bodyPart: editState.bodyPart,
      exercises: editState.exercises,
    });
    setEditingId(null);
  };

  const reversed = [...fitnessRecords].reverse();

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
          <div className="text-sm font-medium text-red-400">新增训练日</div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">日期</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="例：70.5"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">训练部位</label>
            <input
              type="text"
              placeholder="例：胸肌 / 腿部 / 背部"
              value={form.bodyPart}
              onChange={(e) => setForm({ ...form, bodyPart: e.target.value })}
              className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">训练动作与重量</label>
            <textarea
              placeholder="例：卧推 60kg×10×3&#10;深蹲 80kg×8×4"
              value={form.exercises}
              onChange={(e) => setForm({ ...form, exercises: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
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

      {/* Records */}
      {reversed.length === 0 && !showForm ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-5xl mb-4">🏋️</div>
          <p className="text-sm">还没有记录，开始第一次训练吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reversed.map((record, index) => (
            <div key={record.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
              {editingId === record.id ? (
                /* Edit Mode */
                <div className="p-4 space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">体重 (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editState.weight}
                      onChange={(e) => setEditState({ ...editState, weight: e.target.value })}
                      className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">训练部位</label>
                    <input
                      type="text"
                      value={editState.bodyPart}
                      onChange={(e) => setEditState({ ...editState, bodyPart: e.target.value })}
                      className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">训练动作与重量</label>
                    <textarea
                      value={editState.exercises}
                      onChange={(e) => setEditState({ ...editState, exercises: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-red-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(record.id)}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> 保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-[#222] text-gray-400 rounded-lg text-sm transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div>
                  {/* Row: 日期 */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#111] border border-[#333] flex items-center justify-center text-xs font-bold text-red-500">
                        {fitnessRecords.length - index}
                      </span>
                      <span className="text-sm font-semibold text-white">{formatDate(record.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(record.id)}
                        className="p-1.5 text-gray-600 hover:text-gray-300 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteFitnessRecord(record.id)}
                        className="p-1.5 text-gray-600 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Row: 体重 */}
                  <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#222]">
                    <span className="text-xs text-gray-500 w-20 flex-shrink-0">体重</span>
                    <span className="text-sm text-white">
                      {record.weight != null ? `${record.weight} kg` : <span className="text-gray-600">—</span>}
                    </span>
                  </div>

                  {/* Row: 训练部位 */}
                  <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#222]">
                    <span className="text-xs text-gray-500 w-20 flex-shrink-0">训练部位</span>
                    <span className="text-sm text-white">
                      {record.bodyPart || <span className="text-gray-600">—</span>}
                    </span>
                  </div>

                  {/* Row: 训练动作与重量 */}
                  <div className="flex gap-3 px-4 py-2.5">
                    <span className="text-xs text-gray-500 w-20 flex-shrink-0 pt-0.5">动作与重量</span>
                    <span className="text-sm text-white whitespace-pre-wrap flex-1">
                      {record.exercises || <span className="text-gray-600">—</span>}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
