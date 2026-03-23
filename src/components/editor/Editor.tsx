'use client';

import { useEffect, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { common, createLowlight } from 'lowlight';
import { useStore } from '@/store/useStore';
import { EditorToolbar } from './EditorToolbar';
import { MarkdownEditor } from './MarkdownEditor';

const lowlight = createLowlight(common);

export function Editor() {
  const {
    notes,
    activeNoteId,
    updateNote,
    saveNoteVersion,
    editorMode,
  } = useStore();

  const activeNote = notes.find((n) => n.id === activeNoteId);
  const [lastSavedContent, setLastSavedContent] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: '开始写作...',
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image.configure({
        inline: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: activeNote?.content || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[calc(100vh-200px)] px-8 py-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (activeNoteId) {
        const html = editor.getHTML();
        updateNote(activeNoteId, { content: html });
      }
    },
  });

  // Update editor content when active note changes
  useEffect(() => {
    if (editor && activeNote) {
      const currentContent = editor.getHTML();
      if (currentContent !== activeNote.content) {
        editor.commands.setContent(activeNote.content || '');
        setLastSavedContent(activeNote.content || '');
      }
    }
  }, [editor, activeNote?.id]);

  // Auto-save version every 5 minutes or on significant changes
  useEffect(() => {
    if (!activeNoteId || !activeNote) return;

    const interval = setInterval(() => {
      if (activeNote.content !== lastSavedContent && activeNote.content.length > 0) {
        saveNoteVersion(activeNoteId);
        setLastSavedContent(activeNote.content);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [activeNoteId, activeNote?.content, lastSavedContent, saveNoteVersion]);

  // Handle title change
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (activeNoteId) {
        updateNote(activeNoteId, { title: e.target.value });
      }
    },
    [activeNoteId, updateNote]
  );

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg">选择一个笔记开始编辑</p>
          <p className="text-sm mt-2">或创建一个新笔记</p>
        </div>
      </div>
    );
  }

  if (editorMode === 'markdown') {
    return <MarkdownEditor />;
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 overflow-hidden">
      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Title */}
      <div className="px-8 pt-6">
        <input
          type="text"
          value={activeNote.title}
          onChange={handleTitleChange}
          placeholder="无标题笔记"
          className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600"
        />
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
