import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Note, Folder, Tag, EditorMode, Theme, NoteVersion, AppView, FitnessRecord, TodoItem, DayPlan } from '@/types';

interface AppState {
  // Notes
  notes: Note[];
  activeNoteId: string | null;

  // Folders
  folders: Folder[];
  activeFolderId: string | null;

  // Tags
  tags: Tag[];

  // UI State
  editorMode: EditorMode;
  theme: Theme;
  sidebarOpen: boolean;
  searchQuery: string;

  // Note Actions
  createNote: (folderId?: string | null) => Note;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'versions'>>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  saveNoteVersion: (id: string) => void;
  restoreNoteVersion: (noteId: string, versionId: string) => void;

  // Folder Actions
  createFolder: (name: string, parentId?: string | null) => Folder;
  updateFolder: (id: string, updates: Partial<Omit<Folder, 'id'>>) => void;
  deleteFolder: (id: string) => void;
  setActiveFolder: (id: string | null) => void;
  toggleFolderExpanded: (id: string) => void;

  // Tag Actions
  createTag: (name: string, color?: string) => Tag;
  updateTag: (id: string, updates: Partial<Omit<Tag, 'id'>>) => void;
  deleteTag: (id: string) => void;
  addTagToNote: (noteId: string, tagId: string) => void;
  removeTagFromNote: (noteId: string, tagId: string) => void;

  // Fitness
  fitnessRecords: FitnessRecord[];
  addFitnessRecord: (record: Omit<FitnessRecord, 'id'>) => void;
  updateFitnessRecord: (id: string, updates: Partial<Omit<FitnessRecord, 'id'>>) => void;
  deleteFitnessRecord: (id: string) => void;

  // Planning
  dayPlans: DayPlan[];
  addDayPlan: (date: string) => void;
  deleteDayPlan: (id: string) => void;
  addTodo: (dayPlanId: string, text: string) => void;
  toggleTodo: (dayPlanId: string, todoId: string) => void;
  deleteTodo: (dayPlanId: string, todoId: string) => void;

  // App View
  appView: AppView;
  setAppView: (view: AppView) => void;

  // UI Actions
  setEditorMode: (mode: EditorMode) => void;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;

  // Computed
  getActiveNote: () => Note | null;
  getNotesInFolder: (folderId: string | null) => Note[];
  getSubFolders: (parentId: string | null) => Folder[];
  searchNotes: (query: string) => Note[];
}

const TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#f43f5e'
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      notes: [],
      activeNoteId: null,
      folders: [],
      activeFolderId: null,
      tags: [],
      editorMode: 'richtext',
      theme: 'dark',
      sidebarOpen: true,
      searchQuery: '',
      fitnessRecords: [],
      dayPlans: [],
      appView: 'fitness',

      // Note Actions
      createNote: (folderId = null) => {
        const newNote: Note = {
          id: uuidv4(),
          title: '无标题笔记',
          content: '',
          folderId: folderId ?? get().activeFolderId,
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          versions: [],
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
          activeNoteId: newNote.id,
        }));
        return newNote;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: Date.now() }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
        }));
      },

      setActiveNote: (id) => {
        set({ activeNoteId: id });
      },

      saveNoteVersion: (id) => {
        const note = get().notes.find((n) => n.id === id);
        if (!note) return;

        const version: NoteVersion = {
          id: uuidv4(),
          content: note.content,
          title: note.title,
          timestamp: Date.now(),
        };

        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, versions: [version, ...n.versions].slice(0, 50) }
              : n
          ),
        }));
      },

      restoreNoteVersion: (noteId, versionId) => {
        const note = get().notes.find((n) => n.id === noteId);
        if (!note) return;

        const version = note.versions.find((v) => v.id === versionId);
        if (!version) return;

        // Save current state as a version before restoring
        get().saveNoteVersion(noteId);

        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  content: version.content,
                  title: version.title,
                  updatedAt: Date.now(),
                }
              : n
          ),
        }));
      },

      // Folder Actions
      createFolder: (name, parentId = null) => {
        const newFolder: Folder = {
          id: uuidv4(),
          name,
          parentId: parentId ?? get().activeFolderId,
          createdAt: Date.now(),
          isExpanded: true,
        };
        set((state) => ({
          folders: [...state.folders, newFolder],
        }));
        return newFolder;
      },

      updateFolder: (id, updates) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, ...updates } : folder
          ),
        }));
      },

      deleteFolder: (id) => {
        // Also delete all notes in this folder and subfolders
        const getAllSubFolderIds = (folderId: string): string[] => {
          const subFolders = get().folders.filter((f) => f.parentId === folderId);
          return [
            folderId,
            ...subFolders.flatMap((f) => getAllSubFolderIds(f.id)),
          ];
        };

        const folderIds = getAllSubFolderIds(id);

        set((state) => ({
          folders: state.folders.filter((f) => !folderIds.includes(f.id)),
          notes: state.notes.filter((n) => !folderIds.includes(n.folderId || '')),
          activeFolderId:
            state.activeFolderId && folderIds.includes(state.activeFolderId)
              ? null
              : state.activeFolderId,
        }));
      },

      setActiveFolder: (id) => {
        set({ activeFolderId: id });
      },

      toggleFolderExpanded: (id) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id
              ? { ...folder, isExpanded: !folder.isExpanded }
              : folder
          ),
        }));
      },

      // Tag Actions
      createTag: (name, color) => {
        const existingColors = get().tags.map((t) => t.color);
        const availableColors = TAG_COLORS.filter((c) => !existingColors.includes(c));
        const randomColor =
          color ||
          availableColors[0] ||
          TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

        const newTag: Tag = {
          id: uuidv4(),
          name,
          color: randomColor,
        };
        set((state) => ({
          tags: [...state.tags, newTag],
        }));
        return newTag;
      },

      updateTag: (id, updates) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id ? { ...tag, ...updates } : tag
          ),
        }));
      },

      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter((tag) => tag.id !== id),
          notes: state.notes.map((note) => ({
            ...note,
            tags: note.tags.filter((tagId) => tagId !== id),
          })),
        }));
      },

      addTagToNote: (noteId, tagId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId && !note.tags.includes(tagId)
              ? { ...note, tags: [...note.tags, tagId] }
              : note
          ),
        }));
      },

      removeTagFromNote: (noteId, tagId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? { ...note, tags: note.tags.filter((t) => t !== tagId) }
              : note
          ),
        }));
      },

      // Fitness Actions
      addFitnessRecord: (record) => {
        const newRecord: FitnessRecord = { id: uuidv4(), ...record };
        set((state) => ({
          fitnessRecords: [...state.fitnessRecords, newRecord].sort((a, b) => a.date.localeCompare(b.date)),
        }));
      },

      updateFitnessRecord: (id, updates) => {
        set((state) => ({
          fitnessRecords: state.fitnessRecords
            .map((r) => (r.id === id ? { ...r, ...updates } : r))
            .sort((a, b) => a.date.localeCompare(b.date)),
        }));
      },

      deleteFitnessRecord: (id) => {
        set((state) => ({
          fitnessRecords: state.fitnessRecords.filter((r) => r.id !== id),
        }));
      },

      // Planning Actions
      addDayPlan: (date) => {
        const exists = get().dayPlans.some((p) => p.date === date);
        if (exists) return;
        const newPlan: DayPlan = { id: uuidv4(), date, todos: [] };
        set((state) => ({
          dayPlans: [...state.dayPlans, newPlan].sort((a, b) => a.date.localeCompare(b.date)),
        }));
      },

      deleteDayPlan: (id) => {
        set((state) => ({ dayPlans: state.dayPlans.filter((p) => p.id !== id) }));
      },

      addTodo: (dayPlanId, text) => {
        const todo: TodoItem = { id: uuidv4(), text, completed: false };
        set((state) => ({
          dayPlans: state.dayPlans.map((p) =>
            p.id === dayPlanId ? { ...p, todos: [...p.todos, todo] } : p
          ),
        }));
      },

      toggleTodo: (dayPlanId, todoId) => {
        set((state) => ({
          dayPlans: state.dayPlans.map((p) =>
            p.id === dayPlanId
              ? { ...p, todos: p.todos.map((t) => (t.id === todoId ? { ...t, completed: !t.completed } : t)) }
              : p
          ),
        }));
      },

      deleteTodo: (dayPlanId, todoId) => {
        set((state) => ({
          dayPlans: state.dayPlans.map((p) =>
            p.id === dayPlanId ? { ...p, todos: p.todos.filter((t) => t.id !== todoId) } : p
          ),
        }));
      },

      setAppView: (view) => set({ appView: view }),

      // UI Actions
      setEditorMode: (mode) => {
        set({ editorMode: mode });
      },

      setTheme: (theme) => {
        set({ theme });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      // Computed
      getActiveNote: () => {
        const { notes, activeNoteId } = get();
        return notes.find((note) => note.id === activeNoteId) || null;
      },

      getNotesInFolder: (folderId) => {
        return get().notes.filter((note) => note.folderId === folderId);
      },

      getSubFolders: (parentId) => {
        return get().folders.filter((folder) => folder.parentId === parentId);
      },

      searchNotes: (query) => {
        if (!query.trim()) return get().notes;
        const lowerQuery = query.toLowerCase();
        return get().notes.filter(
          (note) =>
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    {
      name: 'noteflow-storage',
      partialize: (state) => ({
        notes: state.notes,
        folders: state.folders,
        tags: state.tags,
        theme: state.theme,
        editorMode: state.editorMode,
        fitnessRecords: state.fitnessRecords,
        dayPlans: state.dayPlans,
      }),
    }
  )
);
