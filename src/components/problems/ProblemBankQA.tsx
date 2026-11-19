import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Eye,
  Lightbulb,
  Plus,
  RotateCcw,
  Send,
  Trash2,
} from 'lucide-react';
import {
  BRANCH_CODE,
  BRANCH_SUBTOPICS,
  CONCEPT_TIERS,
  FORMAT_TAG,
  MARKING_SCHEMES,
  MARKING_TAG,
  PROBLEM_SOURCES,
  PROBLEM_STATUSES,
  QUESTION_FORMATS,
  SOURCE_TAG,
  SYLLABUS_BRANCHES,
  TIER_RANK,
  TIER_TAG,
} from '../../data/syllabus';
import { useVaultStore } from '../../store/useVaultStore';
import {
  ConceptTier,
  MarkingScheme,
  PhysicsBranch,
  ProblemSource,
  ProblemStatus,
  QuestionFormat,
  SortOrder,
} from '../../types/physics';
import { MathText } from '../../utils/latex';

interface ProblemBankQAProps {
  initialBranch?: 'All' | PhysicsBranch;
}

export const ProblemBankQA: React.FC<ProblemBankQAProps> = ({ initialBranch = 'All' }) => {
  const {
    role,
    problems,
    qaPosts,
    getProblemStatus,
    setProblemStatus,
    removeProblem,
    addQAPost,
    removeQAPost,
    openAdminOrPrompt,
  } = useVaultStore();

  // Exhaustive Multi-Axis Cascading Filters
  const [branchFilter, setBranchFilter] = useState<'All' | PhysicsBranch>(initialBranch);
  const [subtopicFilter, setSubtopicFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<'All' | ProblemSource>('All');
  const [formatFilter, setFormatFilter] = useState<'All' | QuestionFormat>('All');
  const [markingFilter, setMarkingFilter] = useState<'All' | MarkingScheme>('All');
  const [tierFilter, setTierFilter] = useState<'All' | ConceptTier>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ProblemStatus>('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [selectedId, setSelectedId] = useState<string>('');

  // Progressive Hint & Solution Toggles
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Doubt Desk Live LaTeX Equation Composer
  const [qaAuthor, setQaAuthor] = useState('Scholar');
  const [qaBranch, setQaBranch] = useState<PhysicsBranch>('Mechanics');
  const [qaBody, setQaBody] = useState('');

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
    setFormatFilter('All');
    setMarkingFilter('All');
    setTierFilter('All');
    setStatusFilter('All');
    setSortOrder('newest');
  };

  const filtered = useMemo(() => {
    const list = problems.filter((p) => {
      if (branchFilter !== 'All' && p.branch !== branchFilter) return false;
      if (subtopicFilter !== 'All' && p.subtopic !== subtopicFilter) return false;
      if (sourceFilter !== 'All' && p.source !== sourceFilter) return false;
      if (formatFilter !== 'All' && p.format !== formatFilter) return false;
      if (markingFilter !== 'All' && p.markingScheme !== markingFilter) return false;
      if (tierFilter !== 'All' && p.tier !== tierFilter) return false;
      if (statusFilter !== 'All' && getProblemStatus(p.id) !== statusFilter) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortOrder === 'tier-asc') return TIER_RANK[a.tier] - TIER_RANK[b.tier];
      if (sortOrder === 'tier-desc') return TIER_RANK[b.tier] - TIER_RANK[a.tier];
      if (sortOrder === 'source') return a.source.localeCompare(b.source);
      return b.createdAt - a.createdAt;
    });
  }, [
    problems,
    branchFilter,
    subtopicFilter,
    sourceFilter,
    formatFilter,
    markingFilter,
    tierFilter,
    statusFilter,
    sortOrder,
    getProblemStatus,
  ]);

  const activeProblem = useMemo(
    () => filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  );

  useEffect(() => {
    setShowHint(false);
    setShowSolution(false);
    if (activeProblem) {
      setQaBranch(activeProblem.branch);
    }
  }, [activeProblem?.id]);

  const visibleQaPosts = useMemo(() => {
    if (activeProblem) {
      return qaPosts.filter(
        (q) =>
          q.problemId === activeProblem.id ||
          (!q.problemId && q.branch === activeProblem.branch)
      );
    }
    if (branchFilter !== 'All') {
      return qaPosts.filter((q) => q.branch === branchFilter);
    }
    return qaPosts;
  }, [qaPosts, activeProblem, branchFilter]);

  const handlePostQa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaBody.trim()) return;
    addQAPost({
      problemId: activeProblem?.id,
      branch: activeProblem?.branch ?? qaBranch,
      author: qaAuthor.trim() || 'Scholar',
      bodyLatex: qaBody.trim(),
    });
    setQaBody('');
  };

  const hasActiveFilters =
    branchFilter !== 'All' ||
    subtopicFilter !== 'All' ||
    sourceFilter !== 'All' ||
    formatFilter !== 'All' ||
    markingFilter !== 'All' ||
    tierFilter !== 'All' ||
    statusFilter !== 'All';

  const solvedCount = useMemo(
    () => problems.filter((p) => getProblemStatus(p.id) === 'Solved').length,
    [problems, getProblemStatus]
  );

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 space-y-4">
      {/* Compact Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#14181F]/15 pb-4">
        <div>
          <p className="font-math text-[11px] tracking-wider text-[#1E3A5F]">
            ARCHIVE // PROBLEM ARCHIVE &amp; DOUBT DESK
          </p>
          <h1 className="font-editorial mt-0.5 text-2xl font-semibold text-[#14181F] sm:text-3xl">
            Problem Archive
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-math text-[11px] text-[#475569]">
            {filtered.length}/{problems.length} MATCHED · {solvedCount} SOLVED
          </span>
          <button
            type="button"
            onClick={openAdminOrPrompt}
            className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-3.5 py-2 font-math text-[11px] font-semibold tracking-wide text-white cursor-pointer hover:bg-[#162C49] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{role === 'admin' ? 'ADD / BULK PASTE' : 'ADMIN UNLOCK'}</span>
          </button>
        </div>
      </div>

      {/* Exhaustive 8-Control Multi-Axis Cascading Filter Matrix */}
      <div className="border border-[#14181F]/15 bg-white p-3">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
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
              QUESTION FORMAT
            </label>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value as 'All' | QuestionFormat)}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="All">All Formats</option>
              {QUESTION_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
              MARKING SCHEME
            </label>
            <select
              value={markingFilter}
              onChange={(e) => setMarkingFilter(e.target.value as 'All' | MarkingScheme)}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="All">All Marking Schemes</option>
              {MARKING_SCHEMES.map((m) => (
                <option key={m} value={m}>
                  {m}
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
              onChange={(e) => setStatusFilter(e.target.value as 'All' | ProblemStatus)}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {PROBLEM_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
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

      {/* Empty State vs Dense Problem Archive */}
      {filtered.length === 0 ? (
        <div className="border border-[#14181F]/15 bg-white px-6 py-12 text-center">
          <BookOpen className="mx-auto h-7 w-7 text-[#64748B]" aria-hidden="true" />
          <p className="font-math mt-3 text-xs font-semibold tracking-wider text-[#14181F]">
            {problems.length > 0
              ? 'NO PROBLEMS MATCH ACTIVE FILTERS'
              : 'PROBLEM ARCHIVE EMPTY // USE ADMIN MODE OR BULK TEXT PASTE'}
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
              <span>{role === 'admin' ? 'INGEST PROBLEMS' : 'SWITCH TO ADMIN MODE'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[380px_1fr] lg:items-start">
          {/* Dense Tabular Problem List */}
          <aside className="border border-[#14181F]/15 bg-white divide-y divide-[#14181F]/10">
            <div className="flex items-center justify-between bg-[#F3EFE8] px-3 py-2 font-math text-[10px] font-semibold tracking-wider text-[#475569]">
              <span>INDEX ({filtered.length})</span>
              <span>SOURCE / MARKING</span>
            </div>
            {filtered.map((prob, idx) => {
              const selected = prob.id === activeProblem?.id;
              const status = getProblemStatus(prob.id);
              return (
                <button
                  key={prob.id}
                  type="button"
                  onClick={() => setSelectedId(prob.id)}
                  className={`w-full px-3 py-2.5 text-left cursor-pointer transition-colors ${
                    selected ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-math text-[10px] truncate ${
                        selected ? 'text-white/80' : 'text-[#64748B]'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')} · {SOURCE_TAG[prob.source]}{' '}
                      {MARKING_TAG[prob.markingScheme]} {TIER_TAG[prob.tier]}
                    </span>
                    <span
                      className={`font-math text-[10px] shrink-0 ${
                        selected
                          ? 'text-white/90'
                          : status === 'Solved'
                            ? 'text-[#166534]'
                            : status === 'Needs Revision'
                              ? 'text-[#B45309]'
                              : status === 'Bookmarked'
                                ? 'text-[#1E3A5F]'
                                : 'text-[#64748B]'
                      }`}
                    >
                      [{status.toUpperCase()}]
                    </span>
                  </div>
                  <div
                    className={`mt-0.5 text-xs font-semibold leading-snug truncate ${
                      selected ? 'text-white' : 'text-[#14181F]'
                    }`}
                  >
                    {prob.title}
                  </div>
                  <div
                    className={`font-math text-[10px] truncate ${
                      selected ? 'text-white/70' : 'text-[#475569]'
                    }`}
                  >
                    [{BRANCH_CODE[prob.branch]}] {prob.subtopic} · {FORMAT_TAG[prob.format]}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Active Problem Card */}
          {activeProblem && (
            <article className="border border-[#14181F]/15 bg-white p-5 space-y-4 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#14181F]/10 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 font-math text-[11px] text-[#475569]">
                    <span className="font-semibold text-[#1E3A5F]">
                      [{BRANCH_CODE[activeProblem.branch]}]
                    </span>
                    <span>{SOURCE_TAG[activeProblem.source]}</span>
                    <span>{FORMAT_TAG[activeProblem.format]}</span>
                    <span>{MARKING_TAG[activeProblem.markingScheme]}</span>
                    <span>{TIER_TAG[activeProblem.tier]}</span>
                    <span>·</span>
                    <span className="font-sans text-xs">{activeProblem.subtopic}</span>
                  </div>
                  <h2 className="font-editorial mt-1.5 text-xl font-semibold text-[#14181F]">
                    {activeProblem.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    aria-label="Problem status"
                    value={getProblemStatus(activeProblem.id)}
                    onChange={(e) =>
                      setProblemStatus(activeProblem.id, e.target.value as ProblemStatus)
                    }
                    className="border border-[#14181F]/20 bg-[#FAF8F5] px-2.5 py-1.5 font-math text-[11px] font-medium text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
                  >
                    {PROBLEM_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  {role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => removeProblem(activeProblem.id)}
                      aria-label="Delete problem"
                      className="border border-[#14181F]/15 p-1.5 text-[#64748B] hover:text-[#991B1B] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[15px] leading-relaxed text-[#14181F]">
                <MathText text={activeProblem.stemLatex} />
              </div>

              {/* Progressive Hint -> Step-by-Step Solution Toggles */}
              <div className="border-t border-[#14181F]/10 pt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowHint((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 border border-[#14181F]/20 bg-[#FAF8F5] px-3.5 py-1.5 font-math text-[11px] font-medium text-[#14181F] cursor-pointer hover:bg-[#F3EFE8]"
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-[#B45309]" aria-hidden="true" />
                    <span>{showHint ? 'HIDE HINT' : 'HINT'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSolution((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 border border-[#1E3A5F]/30 bg-white px-3.5 py-1.5 font-math text-[11px] font-semibold text-[#1E3A5F] cursor-pointer hover:bg-[#1E3A5F] hover:text-white transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{showSolution ? 'HIDE SOLUTION' : 'STEP-BY-STEP SOLUTION'}</span>
                  </button>
                </div>

                {showHint && (
                  <div className="border border-[#14181F]/15 bg-[#FAF8F5] p-3.5">
                    <p className="font-math text-[10px] font-semibold tracking-wider text-[#B45309]">
                      HINT
                    </p>
                    <div className="mt-1 text-sm text-[#14181F]">
                      <MathText text={activeProblem.hintLatex} />
                    </div>
                  </div>
                )}

                {showSolution && (
                  <div className="border border-[#1E3A5F]/25 bg-[#F3EFE8]/70 p-4">
                    <p className="font-math text-[10px] font-semibold tracking-wider text-[#1E3A5F]">
                      SOLUTION
                    </p>
                    <div className="mt-2 text-sm text-[#14181F]">
                      <MathText text={activeProblem.solutionLatex} />
                    </div>
                  </div>
                )}
              </div>
            </article>
          )}
        </div>
      )}

      {/* DOUBT DESK & Live LaTeX Equation Composer */}
      <section className="border border-[#14181F]/15 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#14181F]/10 pb-3">
          <div>
            <p className="font-math text-[10px] tracking-wider text-[#1E3A5F]">DOUBT DESK</p>
            <h2 className="font-editorial text-lg font-semibold text-[#14181F]">
              LaTeX Derivation &amp; Doubt Log
            </h2>
          </div>
          <span className="font-math text-[11px] text-[#64748B]">
            SYNTAX: $...$ INLINE · $$...$$ DISPLAY
          </span>
        </div>

        <form onSubmit={handlePostQa} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
                AUTHOR
              </label>
              <input
                type="text"
                value={qaAuthor}
                onChange={(e) => setQaAuthor(e.target.value)}
                className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-3 py-1.5 text-xs"
              />
            </div>

            {!activeProblem && (
              <div>
                <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
                  BRANCH
                </label>
                <select
                  value={qaBranch}
                  onChange={(e) => setQaBranch(e.target.value as PhysicsBranch)}
                  className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-3 py-1.5 text-xs"
                >
                  {SYLLABUS_BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
                LATEX INPUT
              </label>
              <textarea
                rows={3}
                value={qaBody}
                onChange={(e) => setQaBody(e.target.value)}
                placeholder="$$\delta W = P_{\text{elec}}\,dA\,\delta x$$"
                className="font-math mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] p-2.5 text-xs focus:border-[#1E3A5F] focus:outline-none"
              />
            </div>

            <div>
              <p className="font-math text-[10px] font-semibold tracking-wider text-[#64748B]">
                KaTeX PREVIEW
              </p>
              <div className="mt-1 min-h-[82px] border border-[#14181F]/10 bg-[#FAF8F5]/70 p-2.5 text-sm">
                {qaBody.trim() ? (
                  <MathText text={qaBody} />
                ) : (
                  <p className="font-math text-[11px] text-[#64748B]">PREVIEW READY</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-3.5 py-1.5 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49]"
          >
            <Send className="h-3 w-3" aria-hidden="true" />
            <span>APPEND NOTE</span>
          </button>
        </form>

        {visibleQaPosts.length > 0 && (
          <div className="border-t border-[#14181F]/10 pt-4 space-y-2.5">
            {visibleQaPosts.map((post) => (
              <article
                key={post.id}
                className="border border-[#14181F]/10 bg-[#FAF8F5] p-3"
              >
                <div className="flex items-center justify-between font-math text-[11px] text-[#64748B]">
                  <span>
                    <strong className="text-[#14181F]">{post.author}</strong> · [
                    {BRANCH_CODE[post.branch]}]
                  </span>
                  {role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => removeQAPost(post.id)}
                      aria-label="Delete note"
                      className="text-[#64748B] hover:text-[#991B1B] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <div className="mt-1.5 text-sm text-[#14181F]">
                  <MathText text={post.bodyLatex} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
