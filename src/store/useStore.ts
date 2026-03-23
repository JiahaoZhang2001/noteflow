import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Note, Folder, Tag, EditorMode, Theme, NoteVersion, AppView, FitnessRecord, TodoItem, DayPlan } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  initAuth: () => void;
  loadData: (userId: string) => Promise<void>;

  // Notes
  notes: Note[];
  activeNoteId: string | null;
  folders: Folder[];
  activeFolderId: string | null;
  tags: Tag[];
  editorMode: EditorMode;
  theme: Theme;
  sidebarOpen: boolean;
  searchQuery: string;

  createNote: (folderId?: string | null) => Note;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'versions'>>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  saveNoteVersion: (id: string) => void;
  restoreNoteVersion: (noteId: string, versionId: string) => void;
  createFolder: (name: string, parentId?: string | null) => Folder;
  updateFolder: (id: string, updates: Partial<Omit<Folder, 'id'>>) => void;
  deleteFolder: (id: string) => void;
  setActiveFolder: (id: string | null) => void;
  toggleFolderExpanded: (id: string) => void;
  createTag: (name: string, color?: string) => Tag;
  updateTag: (id: string, updates: Partial<Omit<Tag, 'id'>>) => void;
  deleteTag: (id: string) => void;
  addTagToNote: (noteId: string, tagId: string) => void;
  removeTagFromNote: (noteId: string, tagId: string) => void;
  setEditorMode: (mode: EditorMode) => void;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  getActiveNote: () => Note | null;
  getNotesInFolder: (folderId: string | null) => Note[];
  getSubFolders: (parentId: string | null) => Folder[];
  searchNotes: (query: string) => Note[];

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
}

const TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#f43f5e'
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      authLoading: true,

      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) return null;
        // If login fails, try sign up
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        return signUpError ? signUpError.message : null;
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, fitnessRecords: [], dayPlans: [] });
      },

      initAuth: () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            set({ user: session.user });
            get().loadData(session.user.id);
          }
          set({ authLoading: false });
        });

        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            set({ user: session.user });
            get().loadData(session.user.id);
          } else {
            set({ user: null, fitnessRecords: [], dayPlans: [], authLoading: false });
          }
        });
      },

      loadData: async (userId) => {
        const [{ data: records }, { data: plans }] = await Promise.all([
          supabase.from('fitness_records').select('*').eq('user_id', userId).order('date'),
          supabase.from('day_plans').select('*').eq('user_id', userId).order('date'),
        ]);
        set({
          fitnessRecords: (records ?? []).map((r) => ({
            id: r.id,
            date: r.date,
            weight: r.weight ?? undefined,
            bodyPart: r.body_part ?? '',
            exercises: r.exercises ?? '',
          })),
          dayPlans: (plans ?? []).map((p) => ({
            id: p.id,
            date: p.date,
            todos: p.todos ?? [],
          })),
        });
      },

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

      // Note Actions (unchanged)
      createNote: (folderId = null) => {
        const newNote: Note = {
          id: uuidv4(), title: '无标题笔记', content: '',
          folderId: folderId ?? get().activeFolderId,
          tags: [], createdAt: Date.now(), updatedAt: Date.now(), versions: [],
        };
        set((state) => ({ notes: [newNote, ...state.notes], activeNoteId: newNote.id }));
        return newNote;
      },
      updateNote: (id, updates) => {
        set((state) => ({ notes: state.notes.map((n) => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n) }));
      },
      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id), activeNoteId: state.activeNoteId === id ? null : state.activeNoteId }));
      },
      setActiveNote: (id) => set({ activeNoteId: id }),
      saveNoteVersion: (id) => {
        const note = get().notes.find((n) => n.id === id);
        if (!note) return;
        const version: NoteVersion = { id: uuidv4(), content: note.content, title: note.title, timestamp: Date.now() };
        set((state) => ({ notes: state.notes.map((n) => n.id === id ? { ...n, versions: [version, ...n.versions].slice(0, 50) } : n) }));
      },
      restoreNoteVersion: (noteId, versionId) => {
        const note = get().notes.find((n) => n.id === noteId);
        const version = note?.versions.find((v) => v.id === versionId);
        if (!note || !version) return;
        get().saveNoteVersion(noteId);
        set((state) => ({ notes: state.notes.map((n) => n.id === noteId ? { ...n, content: version.content, title: version.title, updatedAt: Date.now() } : n) }));
      },
      createFolder: (name, parentId = null) => {
        const newFolder: Folder = { id: uuidv4(), name, parentId: parentId ?? get().activeFolderId, createdAt: Date.now(), isExpanded: true };
        set((state) => ({ folders: [...state.folders, newFolder] }));
        return newFolder;
      },
      updateFolder: (id, updates) => {
        set((state) => ({ folders: state.folders.map((f) => f.id === id ? { ...f, ...updates } : f) }));
      },
      deleteFolder: (id) => {
        const getAllSubFolderIds = (fid: string): string[] => {
          const subs = get().folders.filter((f) => f.parentId === fid);
          return [fid, ...subs.flatMap((f) => getAllSubFolderIds(f.id))];
        };
        const ids = getAllSubFolderIds(id);
        set((state) => ({
          folders: state.folders.filter((f) => !ids.includes(f.id)),
          notes: state.notes.filter((n) => !ids.includes(n.folderId || '')),
          activeFolderId: state.activeFolderId && ids.includes(state.activeFolderId) ? null : state.activeFolderId,
        }));
      },
      setActiveFolder: (id) => set({ activeFolderId: id }),
      toggleFolderExpanded: (id) => {
        set((state) => ({ folders: state.folders.map((f) => f.id === id ? { ...f, isExpanded: !f.isExpanded } : f) }));
      },
      createTag: (name, color) => {
        const existing = get().tags.map((t) => t.color);
        const available = TAG_COLORS.filter((c) => !existing.includes(c));
        const newTag: Tag = { id: uuidv4(), name, color: color || available[0] || TAG_COLORS[0] };
        set((state) => ({ tags: [...state.tags, newTag] }));
        return newTag;
      },
      updateTag: (id, updates) => {
        set((state) => ({ tags: state.tags.map((t) => t.id === id ? { ...t, ...updates } : t) }));
      },
      deleteTag: (id) => {
        set((state) => ({ tags: state.tags.filter((t) => t.id !== id), notes: state.notes.map((n) => ({ ...n, tags: n.tags.filter((tid) => tid !== id) })) }));
      },
      addTagToNote: (noteId, tagId) => {
        set((state) => ({ notes: state.notes.map((n) => n.id === noteId && !n.tags.includes(tagId) ? { ...n, tags: [...n.tags, tagId] } : n) }));
      },
      removeTagFromNote: (noteId, tagId) => {
        set((state) => ({ notes: state.notes.map((n) => n.id === noteId ? { ...n, tags: n.tags.filter((t) => t !== tagId) } : n) }));
      },
      setEditorMode: (mode) => set({ editorMode: mode }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      getActiveNote: () => { const { notes, activeNoteId } = get(); return notes.find((n) => n.id === activeNoteId) || null; },
      getNotesInFolder: (folderId) => get().notes.filter((n) => n.folderId === folderId),
      getSubFolders: (parentId) => get().folders.filter((f) => f.parentId === parentId),
      searchNotes: (query) => {
        if (!query.trim()) return get().notes;
        const q = query.toLowerCase();
        return get().notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
      },

      // Fitness Actions (with Supabase sync)
      addFitnessRecord: (record) => {
        const id = uuidv4();
        const newRecord: FitnessRecord = { id, ...record };
        set((state) => ({
          fitnessRecords: [...state.fitnessRecords, newRecord].sort((a, b) => a.date.localeCompare(b.date)),
        }));
        const user = get().user;
        if (user) {
          supabase.from('fitness_records').insert({
            id, user_id: user.id, date: record.date,
            weight: record.weight ?? null,
            body_part: record.bodyPart,
            exercises: record.exercises,
          });
        }
      },

      updateFitnessRecord: (id, updates) => {
        set((state) => ({
          fitnessRecords: state.fitnessRecords
            .map((r) => r.id === id ? { ...r, ...updates } : r)
            .sort((a, b) => a.date.localeCompare(b.date)),
        }));
        if (get().user) {
          supabase.from('fitness_records').update({
            weight: updates.weight ?? null,
            body_part: updates.bodyPart,
            exercises: updates.exercises,
          }).eq('id', id);
        }
      },

      deleteFitnessRecord: (id) => {
        set((state) => ({ fitnessRecords: state.fitnessRecords.filter((r) => r.id !== id) }));
        if (get().user) supabase.from('fitness_records').delete().eq('id', id);
      },

      // Planning Actions (with Supabase sync)
      addDayPlan: (date) => {
        if (get().dayPlans.some((p) => p.date === date)) return;
        const id = uuidv4();
        const newPlan: DayPlan = { id, date, todos: [] };
        set((state) => ({
          dayPlans: [...state.dayPlans, newPlan].sort((a, b) => a.date.localeCompare(b.date)),
        }));
        const user = get().user;
        if (user) supabase.from('day_plans').insert({ id, user_id: user.id, date, todos: [] });
      },

      deleteDayPlan: (id) => {
        set((state) => ({ dayPlans: state.dayPlans.filter((p) => p.id !== id) }));
        if (get().user) supabase.from('day_plans').delete().eq('id', id);
      },

      addTodo: (dayPlanId, text) => {
        const todo: TodoItem = { id: uuidv4(), text, completed: false };
        let updatedTodos: TodoItem[] = [];
        set((state) => ({
          dayPlans: state.dayPlans.map((p) => {
            if (p.id !== dayPlanId) return p;
            updatedTodos = [...p.todos, todo];
            return { ...p, todos: updatedTodos };
          }),
        }));
        if (get().user) supabase.from('day_plans').update({ todos: updatedTodos }).eq('id', dayPlanId);
      },

      toggleTodo: (dayPlanId, todoId) => {
        let updatedTodos: TodoItem[] = [];
        set((state) => ({
          dayPlans: state.dayPlans.map((p) => {
            if (p.id !== dayPlanId) return p;
            updatedTodos = p.todos.map((t) => t.id === todoId ? { ...t, completed: !t.completed } : t);
            return { ...p, todos: updatedTodos };
          }),
        }));
        if (get().user) supabase.from('day_plans').update({ todos: updatedTodos }).eq('id', dayPlanId);
      },

      deleteTodo: (dayPlanId, todoId) => {
        let updatedTodos: TodoItem[] = [];
        set((state) => ({
          dayPlans: state.dayPlans.map((p) => {
            if (p.id !== dayPlanId) return p;
            updatedTodos = p.todos.filter((t) => t.id !== todoId);
            return { ...p, todos: updatedTodos };
          }),
        }));
        if (get().user) supabase.from('day_plans').update({ todos: updatedTodos }).eq('id', dayPlanId);
      },

      setAppView: (view) => set({ appView: view }),
    }),
    {
      name: 'noteflow-storage',
      partialize: (state) => ({
        notes: state.notes,
        folders: state.folders,
        tags: state.tags,
        theme: state.theme,
        editorMode: state.editorMode,
        appView: state.appView,
      }),
    }
  )
);
