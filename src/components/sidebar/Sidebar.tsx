'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { FolderTree } from './FolderTree';
import {
  Search,
  Plus,
  Settings,
  Moon,
  Sun,
  Monitor,
  Tag,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export function Sidebar() {
  const {
    sidebarOpen,
    searchQuery,
    setSearchQuery,
    createNote,
    theme,
    setTheme,
    tags,
    createTag,
    deleteTag,
    notes,
    setActiveNote,
  } = useStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showTags, setShowTags] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  if (!sidebarOpen) return null;

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTag(newTagName.trim());
      setNewTagName('');
    }
    setIsCreatingTag(false);
  };

  const filteredNotes = searchQuery
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <aside className="w-screen md:w-64 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          NoteFlow
        </h1>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => {
                    setActiveNote(note.id);
                    setSearchQuery('');
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="font-medium truncate">{note.title || '无标题笔记'}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {note.content.replace(/<[^>]*>/g, '').slice(0, 50)}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                未找到相关笔记
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Note Button */}
      <div className="px-3 pb-3">
        <button
          onClick={() => createNote()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建笔记
        </button>
      </div>

      {/* Folder Tree */}
      <FolderTree />

      {/* Tags Section */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setShowTags(!showTags)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-500 uppercase">标签</span>
          </div>
          {showTags ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showTags && (
          <div className="px-3 pb-2">
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="group inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="opacity-0 group-hover:opacity-100 hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {isCreatingTag ? (
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onBlur={handleCreateTag}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateTag();
                    if (e.key === 'Escape') setIsCreatingTag(false);
                  }}
                  placeholder="标签名"
                  className="w-20 px-2 py-0.5 text-xs bg-white dark:bg-gray-800 border border-blue-500 rounded-full outline-none"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsCreatingTag(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-500 border border-dashed border-gray-300 dark:border-gray-600 rounded-full hover:border-gray-400"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center gap-2 px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">设置</span>
        </button>

        {showSettings && (
          <div className="px-3 pb-3 space-y-2">
            <div className="text-xs text-gray-500 mb-1">主题</div>
            <div className="flex gap-1">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md border ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Sun className="w-3 h-3" />
                浅色
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md border ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Moon className="w-3 h-3" />
                深色
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md border ${
                  theme === 'system'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Monitor className="w-3 h-3" />
                系统
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
