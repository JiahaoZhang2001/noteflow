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
