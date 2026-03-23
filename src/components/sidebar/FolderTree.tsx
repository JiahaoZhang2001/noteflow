'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Folder } from '@/types';
import {
  ChevronRight,
  ChevronDown,
  Folder as FolderIcon,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  FileText,
} from 'lucide-react';

interface FolderItemProps {
  folder: Folder;
  level: number;
}

function FolderItem({ folder, level }: FolderItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [showMenu, setShowMenu] = useState(false);

  const {
    folders,
    notes,
    activeFolderId,
    activeNoteId,
    setActiveFolder,
    setActiveNote,
    toggleFolderExpanded,
    updateFolder,
    deleteFolder,
    createNote,
  } = useStore();

  const subFolders = folders.filter((f) => f.parentId === folder.id);
  const folderNotes = notes.filter((n) => n.folderId === folder.id);
  const isActive = activeFolderId === folder.id;

  const handleRename = () => {
    if (editName.trim()) {
      updateFolder(folder.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          setActiveFolder(folder.id);
          if (!folder.isExpanded) {
            toggleFolderExpanded(folder.id);
          }
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFolderExpanded(folder.id);
          }}
          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          {folder.isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {folder.isExpanded ? (
          <FolderOpen className="w-4 h-4 text-yellow-500" />
        ) : (
          <FolderIcon className="w-4 h-4 text-yellow-500" />
        )}

        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="flex-1 px-1 py-0.5 text-sm bg-white dark:bg-gray-800 border border-blue-500 rounded outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-sm truncate">{folder.name}</span>
        )}

        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  createNote(folder.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
                新建笔记
              </button>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit2 className="w-4 h-4" />
                重命名
              </button>
              <button
                onClick={() => {
                  deleteFolder(folder.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            </div>
          )}
        </div>
      </div>

      {folder.isExpanded && (
        <>
          {subFolders.map((subFolder) => (
            <FolderItem key={subFolder.id} folder={subFolder} level={level + 1} />
          ))}
          {folderNotes.map((note) => (
            <div
              key={note.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                activeNoteId === note.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : ''
              }`}
              style={{ paddingLeft: `${(level + 1) * 12 + 28}px` }}
              onClick={() => setActiveNote(note.id)}
            >
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm truncate">{note.title || '无标题笔记'}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export function FolderTree() {
  const { folders, notes, activeNoteId, setActiveNote, createFolder } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const rootFolders = folders.filter((f) => f.parentId === null);
  const rootNotes = notes.filter((n) => n.folderId === null);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim(), null);
      setNewFolderName('');
    }
    setIsCreating(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-medium text-gray-500 uppercase">文件夹</span>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          title="新建文件夹"
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {isCreating && (
        <div className="px-3 py-1">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={handleCreateFolder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') setIsCreating(false);
            }}
            placeholder="文件夹名称"
            className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-blue-500 rounded outline-none"
            autoFocus
          />
        </div>
      )}

      <div className="px-1">
        {rootFolders.map((folder) => (
          <FolderItem key={folder.id} folder={folder} level={0} />
        ))}

        {rootNotes.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="px-3 text-xs text-gray-400">未分类笔记</span>
            {rootNotes.map((note) => (
              <div
                key={note.id}
                className={`flex items-center gap-2 px-2 py-1.5 ml-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  activeNoteId === note.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : ''
                }`}
                onClick={() => setActiveNote(note.id)}
              >
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm truncate">{note.title || '无标题笔记'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
