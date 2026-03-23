'use client';

import { useStore } from '@/store/useStore';
import { Sidebar } from './sidebar/Sidebar';
import { Editor } from './editor/Editor';
import { Menu, PanelLeftClose, PanelLeft } from 'lucide-react';

export function Layout() {
  const { sidebarOpen, toggleSidebar } = useStore();

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar: overlay on mobile, inline on desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-300
        md:relative md:translate-x-0 md:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}
      `}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <div className="h-12 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            title={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5 text-gray-500" />
            ) : (
              <PanelLeft className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Editor */}
        <Editor />
      </main>
    </div>
  );
}
