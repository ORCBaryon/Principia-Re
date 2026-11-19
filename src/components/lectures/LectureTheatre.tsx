import React, { useEffect, useMemo, useState } from 'react';
import { Check, Clock, PlayCircle, Plus, RotateCcw, Trash2 } from 'lucide-react';
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
import { UnifiedVideoPlayer } from './UnifiedVideoPlayer';

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

interface LectureTheatreProps {
  initialBranch?: 'All' | PhysicsBranch;
}

export const LectureTheatre: React.FC<LectureTheatreProps> = ({ initialBranch = 'All' }) => {
  const {
    role,
    lectures,
    watchedLectureIds,
    toggleLectureWatched,
    updateLectureSource,
    removeLecture,
    openAdminOrPrompt,
  } = useVaultStore();

  const [branchFilter, setBranchFilter] = useState<'All' | PhysicsBranch>(initialBranch);
  const [subtopicFilter, setSubtopicFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<'All' | ProblemSource>('All');
  const [tierFilter, setTierFilter] = useState<'All' | ConceptTier>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unwatched' | 'Watched'>('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [selectedId, setSelectedId] = useState<string>('');
  const [seekRequest, setSeekRequest] = useState<{ seconds: number; nonce: number } | null>(null);

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
    const list = lectures.filter((l) => {
      if (branchFilter !== 'All' && l.branch !== branchFilter) return false;
      if (subtopicFilter !== 'All' && l.subtopic !== subtopicFilter) return false;
      if (sourceFilter !== 'All' && l.source !== sourceFilter) return false;
      if (tierFilter !== 'All' && l.tier !== tierFilter) return false;
      const watched = watchedLectureIds.includes(l.id);
      if (statusFilter === 'Watched' && !watched) return false;
      if (statusFilter === 'Unwatched' && watched) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortOrder === 'tier-asc') return TIER_RANK[a.tier] - TIER_RANK[b.tier];
      if (sortOrder === 'tier-desc') return TIER_RANK[b.tier] - TIER_RANK[a.tier];
      if (sortOrder === 'source') return a.source.localeCompare(b.source);
      return b.createdAt - a.createdAt;
    });
  }, [
    lectures,
    branchFilter,
    subtopicFilter,
    sourceFilter,
    tierFilter,
    statusFilter,
    sortOrder,
    watchedLectureIds,
  ]);

  const activeLecture = useMemo(
    () => filtered.find((l) => l.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  );

  const isWatched = activeLecture ? watchedLectureIds.includes(activeLecture.id) : false;

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
            ARCHIVE // LECTURE REEL
          </p>
          <h1 className="font-editorial mt-0.5 text-2xl font-semibold text-[#14181F] sm:text-3xl">
            Lecture Reel &amp; Timestamped Index
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-math text-[11px] text-[#475569]">
            {watchedLectureIds.length}/{lectures.length} WATCHED
          </span>
          <button
            type="button"
            onClick={openAdminOrPrompt}
            className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-3.5 py-2 font-math text-[11px] font-semibold tracking-wide text-white cursor-pointer hover:bg-[#162C49] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{role === 'admin' ? 'ADD LECTURE' : 'ADMIN UNLOCK'}</span>
          </button>
        </div>
      </div>

      {/* Cascading Multi-Axis Filter Bar */}
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
              SOURCE / SERIES
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
              onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Unwatched' | 'Watched')}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="All">All Reels</option>
              <option value="Unwatched">Unwatched</option>
              <option value="Watched">Watched</option>
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

      {/* Empty State vs Player */}
      {filtered.length === 0 ? (
        <div className="border border-[#14181F]/15 bg-white px-6 py-12 text-center">
          <PlayCircle className="mx-auto h-7 w-7 text-[#64748B]" aria-hidden="true" />
          <p className="font-math mt-3 text-xs font-semibold tracking-wider text-[#14181F]">
            {lectures.length > 0
              ? 'NO LECTURE REELS MATCH ACTIVE FILTERS'
              : 'LECTURE REEL EMPTY // NO MP4 OR YOUTUBE STREAMS INDEXED'}
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
              <span>{role === 'admin' ? 'ATTACH LECTURE STREAM' : 'SWITCH TO ADMIN MODE'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
          {/* Dense Lecture List */}
          <aside className="border border-[#14181F]/15 bg-white divide-y divide-[#14181F]/10">
            <div className="flex items-center justify-between bg-[#F3EFE8] px-3 py-2 font-math text-[10px] font-semibold tracking-wider text-[#475569]">
              <span>REEL INDEX ({filtered.length})</span>
              <span>TAG / STATUS</span>
            </div>
            {filtered.map((lec, idx) => {
              const selected = lec.id === activeLecture?.id;
              const watched = watchedLectureIds.includes(lec.id);
              return (
                <button
                  key={lec.id}
                  type="button"
                  onClick={() => setSelectedId(lec.id)}
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
                      {String(idx + 1).padStart(2, '0')} · [{BRANCH_CODE[lec.branch]}] ·{' '}
                      {SOURCE_TAG[lec.source]} {TIER_TAG[lec.tier]}
                    </div>
                    <div
                      className={`mt-0.5 text-xs font-semibold leading-snug truncate ${
                        selected ? 'text-white' : 'text-[#14181F]'
                      }`}
                    >
                      {lec.title}
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        selected ? 'text-white/70' : 'text-[#475569]'
                      }`}
                    >
                      {lec.subtopic}
                    </div>
                  </div>
                  {watched && (
                    <Check
                      className={`mt-1 h-3.5 w-3.5 shrink-0 ${
                        selected ? 'text-white' : 'text-[#166534]'
                      }`}
                      aria-label="Watched"
                    />
                  )}
                </button>
              );
            })}
          </aside>

          {/* Active Player + Timestamped Bookmarks */}
          {activeLecture && (
            <section className="space-y-4 min-w-0">
              <UnifiedVideoPlayer
                lectureId={activeLecture.id}
                title={activeLecture.title}
                sourceType={activeLecture.sourceType}
                videoUrl={activeLecture.videoUrl}
                chapters={activeLecture.bookmarks}
                seekRequest={seekRequest}
                onAttachSource={
                  role === 'admin'
                    ? (url, type) => updateLectureSource(activeLecture.id, url, type)
                    : undefined
                }
              />

              <div className="border border-[#14181F]/15 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-math text-[11px] text-[#475569]">
                      <span className="font-semibold text-[#1E3A5F]">
                        [{BRANCH_CODE[activeLecture.branch]}]
                      </span>
                      <span>{SOURCE_TAG[activeLecture.source]}</span>
                      <span>{TIER_TAG[activeLecture.tier]}</span>
                      <span>·</span>
                      <span>{activeLecture.subtopic}</span>
                    </div>
                    <h2 className="font-editorial mt-1.5 text-xl font-semibold text-[#14181F]">
                      {activeLecture.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleLectureWatched(activeLecture.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-math text-[11px] font-semibold cursor-pointer transition-colors ${
                        isWatched
                          ? 'bg-[#166534] text-white'
                          : 'border border-[#14181F]/20 bg-[#FAF8F5] text-[#14181F] hover:bg-[#F3EFE8]'
                      }`}
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                      <span>{isWatched ? 'WATCHED' : 'MARK WATCHED'}</span>
                    </button>

                    {role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => removeLecture(activeLecture.id)}
                        aria-label="Delete lecture"
                        className="border border-[#14181F]/15 p-1.5 text-[#64748B] hover:text-[#991B1B] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {activeLecture.notesLatex && (
                  <div className="mt-4 border-t border-[#14181F]/10 pt-3 text-sm text-[#475569]">
                    <MathText text={activeLecture.notesLatex} />
                  </div>
                )}
              </div>

              <div className="border border-[#14181F]/15 bg-white p-4">
                <div className="flex items-center justify-between border-b border-[#14181F]/10 pb-2.5">
                  <h3 className="font-math text-[11px] font-semibold tracking-wider text-[#14181F]">
                    TIMESTAMPED CONCEPT BOOKMARKS
                  </h3>
                  <Clock className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
                </div>

                {activeLecture.bookmarks.length > 0 ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {activeLecture.bookmarks.map((bm) => (
                      <button
                        key={`${bm.timeSeconds}-${bm.label}`}
                        type="button"
                        onClick={() =>
                          setSeekRequest({ seconds: bm.timeSeconds, nonce: Date.now() })
                        }
                        className="flex items-center gap-3 border border-[#14181F]/10 bg-[#FAF8F5] px-3 py-2 text-left text-xs cursor-pointer hover:border-[#1E3A5F]"
                      >
                        <span className="font-math font-semibold text-[#1E3A5F]">
                          {formatTimestamp(bm.timeSeconds)}
                        </span>
                        <span className="text-[#14181F] truncate">{bm.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="font-math mt-3 text-[11px] text-[#64748B]">
                    NO BOOKMARKS ATTACHED
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
