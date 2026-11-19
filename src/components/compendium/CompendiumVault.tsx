import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Download,
  ExternalLink,
  FileText,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  BRANCH_CODE,
  BRANCH_SUBTOPICS,
  CONCEPT_TIERS,
  PROBLEM_SOURCES,
  SOURCE_TAG,
  SYLLABUS_BRANCHES,
  TIER_RANK,
  TIER_TAG,
} from '../../data/syllabus';
import { useVaultStore } from '../../store/useVaultStore';
import {
  ConceptTier,
  PhysicsBranch,
  ProblemSource,
  SortOrder,
} from '../../types/physics';
import { MathText } from '../../utils/latex';

interface CompendiumVaultProps {
  initialBranch?: 'All' | PhysicsBranch;
}

export const CompendiumVault: React.FC<CompendiumVaultProps> = ({ initialBranch = 'All' }) => {
  const {
    role,
    materials,
    readMaterialIds,
    toggleMaterialRead,
    removeMaterial,
    openAdminOrPrompt,
  } = useVaultStore();

  const [branchFilter, setBranchFilter] = useState<'All' | PhysicsBranch>(initialBranch);
  const [subtopicFilter, setSubtopicFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<'All' | ProblemSource>('All');
  const [tierFilter, setTierFilter] = useState<'All' | ConceptTier>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unread' | 'Read'>('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    setBranchFilter(initialBranch);
    setSubtopicFilter('All');
  }, [initialBranch]);

  const availableSubtopics = useMemo(() => {
    if (branchFilter === 'All') {
      return SYLLABUS_BRANCHES.flatMap((b) => BRANCH_SUBTOPICS[b]);
    }
    return BRANCH_SUBTOPICS[branchFilter];
  }, [branchFilter]);

  const handleBranchChange = (next: 'All' | PhysicsBranch) => {
    setBranchFilter(next);
    setSubtopicFilter('All');
  };

  const resetFilters = () => {
    setBranchFilter('All');
    setSubtopicFilter('All');
    setSourceFilter('All');
    setTierFilter('All');
    setStatusFilter('All');
    setSortOrder('newest');
  };

  const filtered = useMemo(() => {
    const list = materials.filter((m) => {
      if (branchFilter !== 'All' && m.branch !== branchFilter) return false;
      if (subtopicFilter !== 'All' && m.subtopic !== subtopicFilter) return false;
      if (sourceFilter !== 'All' && m.source !== sourceFilter) return false;
      if (tierFilter !== 'All' && m.tier !== tierFilter) return false;
      const isRead = readMaterialIds.includes(m.id);
      if (statusFilter === 'Read' && !isRead) return false;
      if (statusFilter === 'Unread' && isRead) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortOrder === 'tier-asc') return TIER_RANK[a.tier] - TIER_RANK[b.tier];
      if (sortOrder === 'tier-desc') return TIER_RANK[b.tier] - TIER_RANK[a.tier];
      if (sortOrder === 'source') return a.source.localeCompare(b.source);
      return b.createdAt - a.createdAt;
    });
  }, [
    materials,
    branchFilter,
    subtopicFilter,
    sourceFilter,
    tierFilter,
    statusFilter,
    sortOrder,
    readMaterialIds,
  ]);

  const activeItem = useMemo(
    () => filtered.find((m) => m.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  );

  const hasActiveFilters =
    branchFilter !== 'All' ||
    subtopicFilter !== 'All' ||
    sourceFilter !== 'All' ||
    tierFilter !== 'All' ||
    statusFilter !== 'All';

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 space-y-4">
      {/* Compact Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#14181F]/15 pb-4">
        <div>
          <p className="font-math text-[11px] tracking-wider text-[#1E3A5F]">
            ARCHIVE // DERIVATION COMPENDIUM
          </p>
          <h1 className="font-editorial mt-0.5 text-2xl font-semibold text-[#14181F] sm:text-3xl">
            Derivation Compendium &amp; PDF Vault
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-math text-[11px] text-[#475569]">
            {filtered.length}/{materials.length} ITEMS · {readMaterialIds.length} READ
          </span>
          <button
            type="button"
            onClick={openAdminOrPrompt}
            className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-3.5 py-2 font-math text-[11px] font-semibold tracking-wide text-white cursor-pointer hover:bg-[#162C49] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{role === 'admin' ? 'INGEST PDF / NOTE' : 'ADMIN UNLOCK'}</span>
          </button>
        </div>
      </div>

      {/* Cascading Multi-Axis Filter Grid */}
      <div className="border border-[#14181F]/15 bg-white p-3">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
              BRANCH
            </label>
            <select
              value={branchFilter}
              onChange={(e) => handleBranchChange(e.target.value as 'All' | PhysicsBranch)}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="All">All 7 Branches</option>
              {SYLLABUS_BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
              SUBTOPIC ({availableSubtopics.length})
            </label>
            <select
              value={subtopicFilter}
              onChange={(e) => setSubtopicFilter(e.target.value)}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="All">All Subtopics</option>
              {availableSubtopics.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
              SOURCE / TEXT
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as 'All' | ProblemSource)}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="All">All Sources</option>
              {PROBLEM_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
              CONCEPT DEPTH
            </label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as 'All' | ConceptTier)}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="All">All Tiers</option>
              {CONCEPT_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
              STATUS
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Unread' | 'Read')}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
                SORT
              </label>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 font-math text-[10px] text-[#1E3A5F] hover:underline cursor-pointer"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  <span>RESET</span>
                </button>
              )}
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="tier-asc">Tier (1 → 4)</option>
              <option value="tier-desc">Tier (4 → 1)</option>
              <option value="source">Source (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State vs Dense Split Reader */}
      {filtered.length === 0 ? (
        <div className="border border-[#14181F]/15 bg-white px-6 py-12 text-center">
          <FileText className="mx-auto h-7 w-7 text-[#64748B]" aria-hidden="true" />
          <p className="font-math mt-3 text-xs font-semibold tracking-wider text-[#14181F]">
            {materials.length > 0
              ? 'NO COMPENDIUM ENTRIES MATCH ACTIVE FILTERS'
              : 'DERIVATION COMPENDIUM EMPTY // NO PDFs OR NOTES INDEXED'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="border border-[#14181F]/20 bg-[#FAF8F5] px-4 py-2 font-math text-[11px] font-medium text-[#14181F] cursor-pointer hover:bg-[#F3EFE8]"
              >
                RESET FILTERS
              </button>
            )}
            <button
              type="button"
              onClick={openAdminOrPrompt}
              className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-4 py-2 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{role === 'admin' ? 'DROP PDF / ADD SHEET' : 'SWITCH TO ADMIN MODE'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
          {/* Dense Tabular List */}
          <aside className="border border-[#14181F]/15 bg-white divide-y divide-[#14181F]/10">
            <div className="flex items-center justify-between bg-[#F3EFE8] px-3 py-2 font-math text-[10px] font-semibold tracking-wider text-[#475569]">
              <span>INDEX ({filtered.length})</span>
              <span>TAG / TIER</span>
            </div>
            {filtered.map((item, idx) => {
              const selected = item.id === activeItem?.id;
              const isRead = readMaterialIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left cursor-pointer transition-colors ${
                    selected ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="min-w-0">
                    <div
                      className={`font-math text-[10px] truncate ${
                        selected ? 'text-white/80' : 'text-[#64748B]'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')} · [{BRANCH_CODE[item.branch]}] ·{' '}
                      {SOURCE_TAG[item.source]} {TIER_TAG[item.tier]}
                      {item.pdfUrl ? ' [PDF]' : ''}
                    </div>
                    <div
                      className={`mt-0.5 text-xs font-semibold leading-snug truncate ${
                        selected ? 'text-white' : 'text-[#14181F]'
                      }`}
                    >
                      {item.title}
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        selected ? 'text-white/70' : 'text-[#475569]'
                      }`}
                    >
                      {item.subtopic}
                    </div>
                  </div>
                  {isRead && (
                    <Check
                      className={`mt-1 h-3.5 w-3.5 shrink-0 ${
                        selected ? 'text-white' : 'text-[#166534]'
                      }`}
                      aria-label="Read"
                    />
                  )}
                </button>
              );
            })}
          </aside>

          {/* Active KaTeX Sheet + PDF Reader */}
          {activeItem && (
            <section className="space-y-4 min-w-0">
              <div className="border border-[#14181F]/15 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#14181F]/10 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-math text-[11px] text-[#475569]">
                      <span className="font-semibold text-[#1E3A5F]">
                        [{BRANCH_CODE[activeItem.branch]}]
                      </span>
                      <span>{SOURCE_TAG[activeItem.source]}</span>
                      <span>{TIER_TAG[activeItem.tier]}</span>
                      <span>·</span>
                      <span>{activeItem.subtopic}</span>
                    </div>
                    <h2 className="font-editorial mt-1.5 text-xl font-semibold text-[#14181F]">
                      {activeItem.title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleMaterialRead(activeItem.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 font-math text-[11px] font-medium cursor-pointer transition-colors ${
                        readMaterialIds.includes(activeItem.id)
                          ? 'bg-[#166534] text-white'
                          : 'border border-[#14181F]/15 bg-[#FAF8F5] text-[#14181F] hover:bg-[#F3EFE8]'
                      }`}
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                      <span>
                        {readMaterialIds.includes(activeItem.id) ? 'READ' : 'MARK READ'}
                      </span>
                    </button>

                    {activeItem.pdfUrl && (
                      <>
                        <a
                          href={activeItem.pdfUrl}
                          download={activeItem.pdfFileName || `${activeItem.title}.pdf`}
                          className="inline-flex items-center gap-1 border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 font-math text-[11px] font-medium text-[#14181F] hover:bg-[#F3EFE8]"
                        >
                          <Download className="h-3 w-3" aria-hidden="true" />
                          <span>DOWNLOAD PDF</span>
                        </a>
                        <a
                          href={activeItem.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 font-math text-[11px] font-medium text-[#14181F] hover:bg-[#F3EFE8]"
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          <span>TAB</span>
                        </a>
                      </>
                    )}

                    {role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => removeMaterial(activeItem.id)}
                        aria-label="Delete material"
                        className="border border-[#14181F]/15 p-1.5 text-[#64748B] hover:text-[#991B1B] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {activeItem.formulaSheetLatex && (
                  <div className="mt-4 text-sm text-[#14181F]">
                    <MathText text={activeItem.formulaSheetLatex} />
                  </div>
                )}
              </div>

              {activeItem.pdfUrl && (
                <div className="border border-[#14181F]/15 bg-white overflow-hidden">
                  <div className="border-b border-[#14181F]/10 bg-[#F3EFE8] px-4 py-2 font-math text-[11px] font-semibold text-[#14181F]">
                    PDF VIEWER // {activeItem.pdfFileName || activeItem.title}
                  </div>
                  <iframe
                    title={activeItem.title}
                    src={activeItem.pdfUrl}
                    className="h-[680px] w-full border-0 bg-[#FAF8F5]"
                  />
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};
