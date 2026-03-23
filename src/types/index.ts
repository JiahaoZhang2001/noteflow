export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  versions: NoteVersion[];
}

export interface NoteVersion {
  id: string;
  content: string;
  title: string;
  timestamp: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  isExpanded: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type EditorMode = 'richtext' | 'markdown';

export type Theme = 'light' | 'dark' | 'system';

export type AppView = 'fitness' | 'planning';

export interface FitnessRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weight?: number;
  bodyPart: string;
  exercises: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface DayPlan {
  id: string;
  date: string; // YYYY-MM-DD
  todos: TodoItem[];
}
