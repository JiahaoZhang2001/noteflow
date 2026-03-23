'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import {
  Eye,
  Edit3,
  Columns,
  Undo,
  Redo,
  History,
  Tag,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';

type ViewMode = 'edit' | 'preview' | 'split';

// Simple HTML to Markdown converter
function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let md = html;

  // Headers
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

  // Bold and Italic
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~');

  // Code
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');

  // Links and Images
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

  // Lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
  });
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    let counter = 0;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
      counter++;
      return `${counter}. $1\n`;
    }) + '\n';
  });

  // Blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n');

  // Horizontal rule
  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n\n');

  // Paragraphs and line breaks
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br[^>]*\/?>/gi, '\n');

  // Clean up remaining tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');

  // Clean up extra whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}

// Simple Markdown to HTML converter
function markdownToHtml(md: string): string {
  if (!md) return '';

  let html = md;

  // Escape HTML
  html = html.replace(/&/g, '&amp;');
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');

  // Code blocks (must be before other formatting)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold and Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');

  // Links and Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Blockquotes
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gim, '<hr />');

  // Unordered lists
  html = html.replace(/^\s*[-*+] (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<oli>$1</oli>');
  html = html.replace(/(<oli>.*<\/oli>\n?)+/g, (match) => {
    return '<ol>' + match.replace(/<\/?oli>/g, (tag) => tag.replace('oli', 'li')) + '</ol>';
  });

  // Paragraphs
  html = html.replace(/\n\n+/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ol>)/g, '$1');
  html = html.replace(/(<\/ol>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr \/>)<\/p>/g, '$1');

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  return html;
}

export function MarkdownEditor() {
  const {
    notes,
    activeNoteId,
    updateNote,
    deleteNote,
    saveNoteVersion,
    tags,
    addTagToNote,
    removeTagFromNote,
    setEditorMode,
  } = useStore();

  const activeNote = notes.find((n) => n.id === activeNoteId);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [markdown, setMarkdown] = useState('');
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const noteTags = activeNote?.tags || [];

  // Convert HTML content to Markdown when note changes
  useEffect(() => {
    if (activeNote) {
      setMarkdown(htmlToMarkdown(activeNote.content));
    }
  }, [activeNote?.id]);

  // Update note content when markdown changes
  const handleMarkdownChange = useCallback(
    (value: string) => {
      setMarkdown(value);
      if (activeNoteId) {
        const html = markdownToHtml(value);
        updateNote(activeNoteId, { content: html });
      }
    },
    [activeNoteId, updateNote]
  );

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

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2 px-4 py-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1 px-2 py-1 text-xs ${
                viewMode === 'edit'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              编辑
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2 py-1 text-xs border-x border-gray-200 dark:border-gray-700 ${
                viewMode === 'split'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Columns className="w-3 h-3" />
              分屏
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1 px-2 py-1 text-xs ${
                viewMode === 'preview'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Eye className="w-3 h-3" />
              预览
            </button>
          </div>

          <div className="flex-1" />

          {/* Tags */}
          <div className="relative">
            <button
              onClick={() => setShowTagMenu(!showTagMenu)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              title="标签"
            >
              <Tag className="w-4 h-4" />
            </button>
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
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="relative">
            <button
              onClick={() => setShowHistoryMenu(!showHistoryMenu)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              title="历史版本"
            >
              <History className="w-4 h-4" />
            </button>
            {showHistoryMenu && (
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
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
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

          {/* Switch to Rich Text */}
          <button
            onClick={() => setEditorMode('richtext')}
            className="px-2 py-1 text-xs rounded border border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600"
            title="切换到富文本模式"
          >
            富文本
          </button>

          {/* More */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              title="更多"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
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

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2 border-r border-gray-200 dark:border-gray-800' : 'w-full'} flex flex-col`}>
            <textarea
              value={markdown}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              placeholder="使用 Markdown 语法开始写作..."
              className="flex-1 w-full px-8 py-4 bg-transparent resize-none outline-none font-mono text-sm"
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto`}>
            <div
              className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none px-8 py-4"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
