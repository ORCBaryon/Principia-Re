import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  Download,
  ExternalLink,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import {
  BOOK_CATEGORIES,
  BOOK_CATEGORY_TAG,
  BOOK_READ_STATUSES,
  BRANCH_CODE,
  CONCEPT_TIERS,
  SYLLABUS_BRANCHES,
  TIER_RANK,
  TIER_TAG,
} from '../../data/syllabus';
import { useVaultStore } from '../../store/useVaultStore';
import {
  BookBranchScope,
  BookCategory,
  BookReadStatus,
  ConceptTier,
  PhysicsBranch,
} from '../../types/physics';
import { MathText } from '../../utils/latex';

type BookSortOrder = 'newest' | 'title' | 'author' | 'tier-asc' | 'tier-desc';

interface BooksLibraryProps {
  initialBranch?: 'All' | PhysicsBranch;
}

export const BooksLibrary: React.FC<BooksLibraryProps> = ({ initialBranch = 'All' }) => {
  const {
    role,
    books,
    getBookStatus,
    setBookStatus,
    getBookPageBookmark,
    setBookPageBookmark,
    updateBookNotes,
    removeBook,
    openAdminOrPrompt,
  } = useVaultStore();

  const [query, setQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'All' | BookBranchScope>(
    initialBranch === 'All' ? 'All' : initialBranch
  );
  const [categoryFilter, setCategoryFilter] = useState<'All' | BookCategory>('All');
  const [tierFilter, setTierFilter] = useState<'All' | ConceptTier>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | BookReadStatus>('All');
  const [sortOrder, setSortOrder] = useState<BookSortOrder>('newest');
  const [selectedId, setSelectedId] = useState('');

  // Page jump & inline notes editing
  const [pageDraft, setPageDraft] = useState('1');
  const [activePdfPage, setActivePdfPage] = useState(1);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    setScopeFilter(initialBranch === 'All' ? 'All' : initialBranch);
  }, [initialBranch]);

  const resetFilters = () => {
    setQuery('');
    setScopeFilter('All');
    setCategoryFilter('All');
    setTierFilter('All');
    setStatusFilter('All');
    setSortOrder('newest');
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = books.filter((b) => {
      if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) {
        return false;
      }
      if (scopeFilter !== 'All' && b.branchScope !== scopeFilter) return false;
      if (categoryFilter !== 'All' && b.category !== categoryFilter) return false;
      if (tierFilter !== 'All' && b.tier !== tierFilter) return false;
      if (statusFilter !== 'All' && getBookStatus(b.id) !== statusFilter) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortOrder === 'title') return a.title.localeCompare(b.title);
      if (sortOrder === 'author') return a.author.localeCompare(b.author);
      if (sortOrder === 'tier-asc') return TIER_RANK[a.tier] - TIER_RANK[b.tier];
      if (sortOrder === 'tier-desc') return TIER_RANK[b.tier] - TIER_RANK[a.tier];
      return b.createdAt - a.createdAt;
    });
  }, [books, query, scopeFilter, categoryFilter, tierFilter, statusFilter, sortOrder, getBookStatus]);

  const activeBook = useMemo(
    () => filtered.find((b) => b.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  );

  useEffect(() => {
    if (!activeBook) return;
    const savedPage = getBookPageBookmark(activeBook.id);
    setPageDraft(String(savedPage));
    setActivePdfPage(savedPage);
    setEditingNotes(false);
    setNotesDraft(activeBook.notesLatex ?? '');
  }, [activeBook?.id]);

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBook) return;
    const parsed = Math.max(1, parseInt(pageDraft, 10) || 1);
    setBookPageBookmark(activeBook.id, parsed);
    setActivePdfPage(parsed);
    setPageDraft(String(parsed));
  };

  const handleSaveNotes = () => {
    if (!activeBook) return;
    updateBookNotes(activeBook.id, notesDraft.trim());
    setEditingNotes(false);
  };

  const buildPdfViewerSrc = (url: string, page: number) => {
    if (!url || page <= 1 || url.includes('#')) return url;
    return `${url}#page=${page}`;
  };

  const hasActiveFilters =
    query.trim() !== '' ||
    scopeFilter !== 'All' ||
    categoryFilter !== 'All' ||
    tierFilter !== 'All' ||
    statusFilter !== 'All';

  const completedCount = useMemo(
    () => books.filter((b) => getBookStatus(b.id) === 'Completed').length,
    [books, getBookStatus]
  );

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#14181F]/15 pb-4">
        <div>
          <p className="font-math text-[11px] tracking-wider text-[#1E3A5F]">
            ARCHIVE // BOOKS &amp; NOTES
          </p>
          <h1 className="font-editorial mt-0.5 text-2xl font-semibold text-[#14181F] sm:text-3xl">
            Textbooks, Problem Volumes &amp; Annotated Notes
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-math text-[11px] text-[#475569]">
            {filtered.length}/{books.length} VOLUMES · {completedCount} COMPLETED
          </span>
          <button
            type="button"
            onClick={openAdminOrPrompt}
            className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-3.5 py-2 font-math text-[11px] font-semibold tracking-wide text-white cursor-pointer hover:bg-[#162C49] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{role === 'admin' ? 'ADD BOOK / NOTES' : 'ADMIN UNLOCK'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Axis Filter Grid */}
      <div className="border border-[#14181F]/15 bg-white p-3">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
              TITLE / AUTHOR
            </label>
            <div className="relative mt-1">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#64748B]"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Irodov, HRK, Landau..."
                className="w-full border border-[#14181F]/15 bg-[#FAF8F5] py-1.5 pl-7 pr-2.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
              CATEGORY
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'All' | BookCategory)}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="All">All Categories</option>
              {BOOK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-math block text-[10px] font-semibold tracking-wider text-[#64748B]">
              SCOPE / BRANCH
            </label>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as 'All' | BookBranchScope)}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="All">All Scopes</option>
              <option value="All Branches (Complete Text)">All Branches (Complete Text)</option>
              {SYLLABUS_BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
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
              onChange={(e) => setStatusFilter(e.target.value as 'All' | BookReadStatus)}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {BOOK_READ_STATUSES.map((st) => (
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
              onChange={(e) => setSortOrder(e.target.value as BookSortOrder)}
              className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="title">Title (A–Z)</option>
              <option value="author">Author (A–Z)</option>
              <option value="tier-asc">Tier (1 → 4)</option>
              <option value="tier-desc">Tier (4 → 1)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State vs Library Shelf + Full Volume Reader */}
      {filtered.length === 0 ? (
        <div className="border border-[#14181F]/15 bg-white px-6 py-12 text-center">
          <BookOpen className="mx-auto h-7 w-7 text-[#64748B]" aria-hidden="true" />
          <p className="font-math mt-3 text-xs font-semibold tracking-wider text-[#14181F]">
            {books.length > 0
              ? 'NO BOOKS OR NOTES MATCH ACTIVE FILTERS'
              : 'BOOKS & NOTES SHELF EMPTY // SWITCH TO ADMIN MODE TO UPLOAD FULL TEXTS OR PDFs'}
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
              <span>{role === 'admin' ? 'UPLOAD BOOK / NOTES' : 'SWITCH TO ADMIN MODE'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
          {/* Dense Volume Index */}
          <aside className="border border-[#14181F]/15 bg-white divide-y divide-[#14181F]/10">
            <div className="flex items-center justify-between bg-[#F3EFE8] px-3 py-2 font-math text-[10px] font-semibold tracking-wider text-[#475569]">
              <span>SHELF ({filtered.length})</span>
              <span>TYPE / STATUS</span>
            </div>
            {filtered.map((book, idx) => {
              const selected = book.id === activeBook?.id;
              const status = getBookStatus(book.id);
              const savedPage = getBookPageBookmark(book.id);
              const scopeCode =
                book.branchScope === 'All Branches (Complete Text)'
                  ? 'ALL'
                  : BRANCH_CODE[book.branchScope];

              return (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => setSelectedId(book.id)}
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
                      {String(idx + 1).padStart(2, '0')} · {BOOK_CATEGORY_TAG[book.category]} [
                      {scopeCode}] {TIER_TAG[book.tier]}
                    </span>
                    <span
                      className={`font-math text-[10px] shrink-0 ${
                        selected
                          ? 'text-white/90'
                          : status === 'Completed'
                            ? 'text-[#166534]'
                            : status === 'Reading'
                              ? 'text-[#B45309]'
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
                    {book.title}
                  </div>
                  <div
                    className={`flex items-center justify-between font-math text-[10px] mt-0.5 ${
                      selected ? 'text-white/75' : 'text-[#475569]'
                    }`}
                  >
                    <span className="truncate">{book.author}</span>
                    <span className="shrink-0 ml-2">
                      p.{savedPage}
                      {book.totalPages ? `/${book.totalPages}` : ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Active Book Reader + Page Bookmark + KaTeX Annotations */}
          {activeBook && (
            <section className="space-y-4 min-w-0">
              <div className="border border-[#14181F]/15 bg-white p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#14181F]/10 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 font-math text-[11px] text-[#475569]">
                      <span className="font-semibold text-[#1E3A5F]">
                        {BOOK_CATEGORY_TAG[activeBook.category]}
                      </span>
                      <span>
                        [
                        {activeBook.branchScope === 'All Branches (Complete Text)'
                          ? 'COMPLETE TEXT'
                          : BRANCH_CODE[activeBook.branchScope]}
                        ]
                      </span>
                      <span>{TIER_TAG[activeBook.tier]}</span>
                      {activeBook.edition && <span>· {activeBook.edition}</span>}
                      {activeBook.totalPages && <span>· {activeBook.totalPages} pp.</span>}
                    </div>
                    <h2 className="font-editorial mt-1.5 text-xl font-semibold text-[#14181F]">
                      {activeBook.title}
                    </h2>
                    <p className="text-xs font-medium text-[#475569] mt-0.5">
                      {activeBook.author}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label="Reading status"
                      value={getBookStatus(activeBook.id)}
                      onChange={(e) =>
                        setBookStatus(activeBook.id, e.target.value as BookReadStatus)
                      }
                      className="border border-[#14181F]/20 bg-[#FAF8F5] px-2.5 py-1.5 font-math text-[11px] font-medium text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
                    >
                      {BOOK_READ_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    {activeBook.pdfUrl && (
                      <>
                        <a
                          href={activeBook.pdfUrl}
                          download={activeBook.pdfFileName || `${activeBook.title}.pdf`}
                          className="inline-flex items-center gap-1 border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 font-math text-[11px] font-medium text-[#14181F] hover:bg-[#F3EFE8]"
                        >
                          <Download className="h-3 w-3" aria-hidden="true" />
                          <span>DOWNLOAD</span>
                        </a>
                        <a
                          href={buildPdfViewerSrc(activeBook.pdfUrl, activePdfPage)}
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
                        onClick={() => removeBook(activeBook.id)}
                        aria-label="Delete book"
                        className="border border-[#14181F]/15 p-1.5 text-[#64748B] hover:text-[#991B1B] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Page Bookmark & KaTeX Annotations Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <form onSubmit={handleSavePage} className="flex items-center gap-2">
                    <Bookmark className="h-3.5 w-3.5 text-[#1E3A5F]" aria-hidden="true" />
                    <label
                      htmlFor="book-page-input"
                      className="font-math text-[11px] font-medium text-[#475569]"
                    >
                      PAGE BOOKMARK:
                    </label>
                    <input
                      id="book-page-input"
                      type="number"
                      min={1}
                      max={activeBook.totalPages || 9999}
                      value={pageDraft}
                      onChange={(e) => setPageDraft(e.target.value)}
                      className="font-math w-20 border border-[#14181F]/20 bg-[#FAF8F5] px-2 py-1 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="border border-[#14181F]/20 bg-[#FAF8F5] px-2.5 py-1 font-math text-[11px] font-semibold text-[#14181F] cursor-pointer hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
                    >
                      JUMP / SAVE
                    </button>
                  </form>

                  {role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => setEditingNotes((prev) => !prev)}
                      className="inline-flex items-center gap-1 font-math text-[11px] font-medium text-[#1E3A5F] hover:underline cursor-pointer"
                    >
                      <Pencil className="h-3 w-3" aria-hidden="true" />
                      <span>{editingNotes ? 'CANCEL EDIT' : 'EDIT TOC / NOTES'}</span>
                    </button>
                  )}
                </div>

                {editingNotes ? (
                  <div className="space-y-2 border border-[#14181F]/15 bg-[#FAF8F5] p-3">
                    <textarea
                      rows={5}
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Chapter index, errata, or KaTeX key formulas..."
                      className="font-math w-full border border-[#14181F]/15 bg-white p-2.5 text-xs focus:border-[#1E3A5F] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-3 py-1.5 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49]"
                    >
                      <Save className="h-3 w-3" />
                      <span>SAVE NOTES</span>
                    </button>
                  </div>
                ) : (
                  activeBook.notesLatex && (
                    <div className="border-t border-[#14181F]/10 pt-3 text-sm text-[#14181F]">
                      <p className="font-math text-[10px] font-semibold tracking-wider text-[#64748B] mb-1.5">
                        VOLUME NOTES / CHAPTER INDEX
                      </p>
                      <MathText text={activeBook.notesLatex} />
                    </div>
                  )
                )}
              </div>

              {activeBook.pdfUrl && (
                <div className="border border-[#14181F]/15 bg-white overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#14181F]/10 bg-[#F3EFE8] px-4 py-2 font-math text-[11px] font-semibold text-[#14181F]">
                    <span>
                      VOLUME READER // {activeBook.pdfFileName || activeBook.title}
                    </span>
                    <span className="text-[#475569]">p.{activePdfPage}</span>
                  </div>
                  <iframe
                    key={`${activeBook.id}-${activePdfPage}`}
                    title={activeBook.title}
                    src={buildPdfViewerSrc(activeBook.pdfUrl, activePdfPage)}
                    className="h-[760px] w-full border-0 bg-[#FAF8F5]"
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
