import React from 'react';
import { Lock, Plus, Shield } from 'lucide-react';
import { useVaultStore } from '../../store/useVaultStore';

export const TopBar: React.FC = () => {
  const { role, activeView, setActiveView, openAdminOrPrompt, lockVault } = useVaultStore();

  const isOverview = activeView === 'overview';

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
        isOverview
          ? 'bg-[#14181F]/95 border-white/10 text-[#FAF8F5] backdrop-blur-md'
          : 'bg-[#FAF8F5]/95 border-[#14181F]/15 text-[#14181F] backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-3">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => setActiveView('overview')}
          className="font-editorial text-lg font-semibold tracking-tight whitespace-nowrap shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
        >
          Principia Archive
        </button>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium tracking-wide">
          <button
            type="button"
            onClick={() => setActiveView('compendium')}
            className={`whitespace-nowrap shrink-0 cursor-pointer transition-colors pb-0.5 border-b ${
              activeView === 'compendium'
                ? 'border-[#1E3A5F] text-[#1E3A5F] font-semibold'
                : isOverview
                  ? 'border-transparent text-[#FAF8F5]/80 hover:text-white'
                  : 'border-transparent text-[#475569] hover:text-[#14181F]'
            }`}
          >
            Compendium
          </button>

          <button
            type="button"
            onClick={() => setActiveView('books')}
            className={`whitespace-nowrap shrink-0 cursor-pointer transition-colors pb-0.5 border-b ${
              activeView === 'books'
                ? 'border-[#1E3A5F] text-[#1E3A5F] font-semibold'
                : isOverview
                  ? 'border-transparent text-[#FAF8F5]/80 hover:text-white'
                  : 'border-transparent text-[#475569] hover:text-[#14181F]'
            }`}
          >
            Books &amp; Notes
          </button>

          <button
            type="button"
            onClick={() => setActiveView('lectures')}
            className={`whitespace-nowrap shrink-0 cursor-pointer transition-colors pb-0.5 border-b ${
              activeView === 'lectures'
                ? 'border-[#1E3A5F] text-[#1E3A5F] font-semibold'
                : isOverview
                  ? 'border-transparent text-[#FAF8F5]/80 hover:text-white'
                  : 'border-transparent text-[#475569] hover:text-[#14181F]'
            }`}
          >
            Lecture Reel
          </button>

          <button
            type="button"
            onClick={() => setActiveView('problems')}
            className={`whitespace-nowrap shrink-0 cursor-pointer transition-colors pb-0.5 border-b ${
              activeView === 'problems'
                ? 'border-[#1E3A5F] text-[#1E3A5F] font-semibold'
                : isOverview
                  ? 'border-transparent text-[#FAF8F5]/80 hover:text-white'
                  : 'border-transparent text-[#475569] hover:text-[#14181F]'
            }`}
          >
            Problem Archive
          </button>

          <button
            type="button"
            onClick={lockVault}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors pb-0.5 border-b border-transparent ${
              isOverview
                ? 'text-[#FAF8F5]/70 hover:text-white'
                : 'text-[#64748B] hover:text-[#14181F]'
            }`}
          >
            <Lock className="h-3 w-3" aria-hidden="true" />
            <span>Lock</span>
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {role === 'admin' ? (
            <button
              type="button"
              onClick={openAdminOrPrompt}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                isOverview
                  ? 'bg-[#FAF8F5] text-[#14181F] hover:bg-white'
                  : 'bg-[#1E3A5F] text-white hover:bg-[#162C49]'
              }`}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ingest / Export</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openAdminOrPrompt}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                isOverview
                  ? 'border border-white/25 text-[#FAF8F5] hover:bg-white/10'
                  : 'border border-[#14181F]/20 bg-white text-[#14181F] hover:bg-[#F3EFE8]'
              }`}
            >
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Admin Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <div
        className={`flex md:hidden items-center gap-5 overflow-x-auto px-6 py-2 text-xs font-medium border-t ${
          isOverview
            ? 'border-white/10 text-[#FAF8F5]/80'
            : 'border-[#14181F]/10 text-[#475569]'
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveView('compendium')}
          className="whitespace-nowrap shrink-0 cursor-pointer"
        >
          Compendium
        </button>
        <button
          type="button"
          onClick={() => setActiveView('books')}
          className="whitespace-nowrap shrink-0 cursor-pointer"
        >
          Books &amp; Notes
        </button>
        <button
          type="button"
          onClick={() => setActiveView('lectures')}
          className="whitespace-nowrap shrink-0 cursor-pointer"
        >
          Lecture Reel
        </button>
        <button
          type="button"
          onClick={() => setActiveView('problems')}
          className="whitespace-nowrap shrink-0 cursor-pointer"
        >
          Problem Archive
        </button>
        <button
          type="button"
          onClick={lockVault}
          className="whitespace-nowrap shrink-0 cursor-pointer"
        >
          Lock
        </button>
      </div>
    </header>
  );
};
