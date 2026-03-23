'use client';

import { Editor } from '@tiptap/react';
import { useStore } from '@/store/useStore';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Highlighter,
  FileCode,
  History,
  Tag,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { useState, useCallback } from 'react';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive ? 'bg-gray-200 dark:bg-gray-700 text-blue-600' : ''
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />;
}

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const {
    activeNoteId,
    notes,
    tags,
    editorMode,
    setEditorMode,
    addTagToNote,
    removeTagFromNote,
    deleteNote,
    saveNoteVersion,
  } = useStore();

  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const activeNote = notes.find((n) => n.id === activeNoteId);
  const noteTags = activeNote?.tags || [];

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('输入图片 URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      {/* Main Toolbar */}
      <div className="flex items-center gap-0.5 px-4 py-2 flex-wrap">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="撤销 (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="重做 (Ctrl+Shift+Z)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="标题 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="标题 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="标题 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="粗体 (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="斜体 (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="删除线"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="高亮"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="行内代码"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="无序列表"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="有序列表"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title="任务列表"
        >
          <CheckSquare className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Blocks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="引用"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="代码块"
        >
          <FileCode className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="分割线"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Insert */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowLinkInput(!showLinkInput)}
            isActive={editor.isActive('link')}
            title="链接"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-48 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                onKeyDown={(e) => e.key === 'Enter' && setLink()}
              />
              <button
                onClick={setLink}
                className="ml-2 px-2 py-1 text-sm bg-blue-600 text-white rounded"
              >
                确定
              </button>
            </div>
          )}
        </div>
        <ToolbarButton onClick={addImage} title="图片">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addTable} title="表格">
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="flex-1" />

        {/* Right Side Actions */}
        <div className="flex items-center gap-1">
          {/* Tags */}
          <div className="relative">
            <ToolbarButton onClick={() => setShowTagMenu(!showTagMenu)} title="标签">
              <Tag className="w-4 h-4" />
            </ToolbarButton>
            {showTagMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-2">
                <div className="text-xs text-gray-500 mb-2">选择标签</div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={noteTags.includes(tag.id)}
                        onChange={(e) => {
                          if (activeNoteId) {
                            if (e.target.checked) {
                              addTagToNote(activeNoteId, tag.id);
                            } else {
                              removeTagFromNote(activeNoteId, tag.id);
                            }
                          }
                        }}
                        className="rounded"
                      />
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm">{tag.name}</span>
                    </label>
                  ))}
                  {tags.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      暂无标签
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="relative">
            <ToolbarButton onClick={() => setShowHistoryMenu(!showHistoryMenu)} title="历史版本">
              <History className="w-4 h-4" />
            </ToolbarButton>
            {showHistoryMenu && activeNote && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-gray-500">历史版本</span>
                  <button
                    onClick={() => {
                      if (activeNoteId) saveNoteVersion(activeNoteId);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    保存当前版本
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {activeNote.versions.length > 0 ? (
                    activeNote.versions.map((version) => (
                      <button
                        key={version.id}
                        onClick={() => {
                          if (activeNoteId) {
                            useStore.getState().restoreNoteVersion(activeNoteId, version.id);
                            setShowHistoryMenu(false);
                          }
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="text-sm font-medium truncate">{version.title}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(version.timestamp).toLocaleString('zh-CN')}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      暂无历史版本
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Editor Mode Toggle */}
          <button
            onClick={() => setEditorMode(editorMode === 'richtext' ? 'markdown' : 'richtext')}
            className={`px-2 py-1 text-xs rounded border ${
              editorMode === 'markdown'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="切换编辑模式"
          >
            {editorMode === 'richtext' ? 'MD' : '富文本'}
          </button>

          {/* More Options */}
          <div className="relative">
            <ToolbarButton onClick={() => setShowMoreMenu(!showMoreMenu)} title="更多">
              <MoreHorizontal className="w-4 h-4" />
            </ToolbarButton>
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    if (activeNoteId) {
                      deleteNote(activeNoteId);
                      setShowMoreMenu(false);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  删除笔记
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note Tags Display */}
      {noteTags.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {noteTags.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
