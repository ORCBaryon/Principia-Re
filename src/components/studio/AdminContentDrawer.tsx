import React, { useMemo, useRef, useState } from 'react';
import { Check, Copy, Download, FileUp, Plus, Upload, X } from 'lucide-react';
import {
  BOOK_CATEGORIES,
  BOOK_CATEGORY_TAG,
  BRANCH_CODE,
  BRANCH_SUBTOPICS,
  CONCEPT_TIERS,
  FORMAT_TAG,
  MARKING_SCHEMES,
  MARKING_TAG,
  PROBLEM_SOURCES,
  QUESTION_FORMATS,
  SOURCE_TAG,
  SYLLABUS_BRANCHES,
  TIER_TAG,
} from '../../data/syllabus';
import { useVaultStore } from '../../store/useVaultStore';
import {
  BookBranchScope,
  BookCategory,
  ConceptTier,
  MarkingScheme,
  PhysicsBranch,
  ProblemSource,
  QuestionFormat,
} from '../../types/physics';
import { parseBulkTextToProblems } from '../../utils/bulkParser';
import { MathText } from '../../utils/latex';
import { detectSourceType } from '../lectures/UnifiedVideoPlayer';

interface QueuedPdf {
  fileName: string;
  title: string;
  pdfUrl: string;
}

export const AdminContentDrawer: React.FC = () => {
  const {
    role,
    adminDrawerOpen,
    setAdminDrawerOpen,
    addMaterial,
    addMaterialsBatch,
    addBook,
    addBooksBatch,
    addLecture,
    addProblem,
    addProblemsBatch,
    exportDataJson,
    importDataJson,
    setActiveView,
  } = useVaultStore();

  const [tab, setTab] = useState<'material' | 'book' | 'lecture' | 'problem' | 'bulk' | 'json'>(
    'material'
  );
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Material / PDF Form + Multi-PDF Drag & Drop
  const [matBranch, setMatBranch] = useState<PhysicsBranch>('Mechanics');
  const [matSubtopic, setMatSubtopic] = useState(BRANCH_SUBTOPICS.Mechanics[0]);
  const [matSource, setMatSource] = useState<ProblemSource>('Coaching Sheet / Custom');
  const [matTier, setMatTier] = useState<ConceptTier>('Tier 3: JEE Advanced');
  const [matTitle, setMatTitle] = useState('');
  const [matPdfUrl, setMatPdfUrl] = useState('');
  const [matPdfName, setMatPdfName] = useState('');
  const [matFormulaLatex, setMatFormulaLatex] = useState('');
  const [pdfDragActive, setPdfDragActive] = useState(false);
  const [queuedPdfs, setQueuedPdfs] = useState<QueuedPdf[]>([]);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  // Book / Notes Form + Multi-PDF Drag & Drop
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookEdition, setBookEdition] = useState('');
  const [bookCategory, setBookCategory] = useState<BookCategory>('Full Textbook');
  const [bookScope, setBookScope] = useState<BookBranchScope>('All Branches (Complete Text)');
  const [bookTier, setBookTier] = useState<ConceptTier>('Tier 3: JEE Advanced');
  const [bookTotalPages, setBookTotalPages] = useState('');
  const [bookPdfUrl, setBookPdfUrl] = useState('');
  const [bookPdfName, setBookPdfName] = useState('');
  const [bookNotesLatex, setBookNotesLatex] = useState('');
  const [bookDragActive, setBookDragActive] = useState(false);
  const [queuedBooks, setQueuedBooks] = useState<QueuedPdf[]>([]);
  const bookFileInputRef = useRef<HTMLInputElement>(null);

  // Lecture Form
  const [lecBranch, setLecBranch] = useState<PhysicsBranch>('Mechanics');
  const [lecSubtopic, setLecSubtopic] = useState(BRANCH_SUBTOPICS.Mechanics[0]);
  const [lecSource, setLecSource] = useState<ProblemSource>('Coaching Sheet / Custom');
  const [lecTier, setLecTier] = useState<ConceptTier>('Tier 3: JEE Advanced');
  const [lecTitle, setLecTitle] = useState('');
  const [lecUrl, setLecUrl] = useState('');
  const [lecBookmarksRaw, setLecBookmarksRaw] = useState('00:00 Introduction\n06:30 Derivation');
  const [lecNotesLatex, setLecNotesLatex] = useState('');
  const mp4FileInputRef = useRef<HTMLInputElement>(null);

  // Single Problem Form
  const [probBranch, setProbBranch] = useState<PhysicsBranch>('Mechanics');
  const [probSubtopic, setProbSubtopic] = useState(BRANCH_SUBTOPICS.Mechanics[0]);
  const [probSource, setProbSource] = useState<ProblemSource>('I.E. Irodov');
  const [probFormat, setProbFormat] = useState<QuestionFormat>('Subjective / Olympiad Proof');
  const [probMarking, setProbMarking] = useState<MarkingScheme>('Subjective (Olympiad)');
  const [probTier, setProbTier] = useState<ConceptTier>('Tier 3: JEE Advanced');
  const [probTitle, setProbTitle] = useState('');
  const [probStem, setProbStem] = useState('');
  const [probHint, setProbHint] = useState('');
  const [probSolution, setProbSolution] = useState('');

  // Bulk Text Paste Form
  const [bulkTarget, setBulkTarget] = useState<'problems' | 'compendium'>('problems');
  const [bulkBranch, setBulkBranch] = useState<PhysicsBranch>('Mechanics');
  const [bulkSubtopic, setBulkSubtopic] = useState(BRANCH_SUBTOPICS.Mechanics[0]);
  const [bulkSource, setBulkSource] = useState<ProblemSource>('JEE Advanced PYQ');
  const [bulkFormat, setBulkFormat] = useState<QuestionFormat>('Multiple Correct (One or More)');
  const [bulkMarking, setBulkMarking] = useState<MarkingScheme>('+4 / -2 Partial (JEE Adv Multi)');
  const [bulkTier, setBulkTier] = useState<ConceptTier>('Tier 3: JEE Advanced');
  const [bulkRawText, setBulkRawText] = useState('');

  // Bulk JSON
  const [jsonText, setJsonText] = useState('');
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const parsedBulkItems = useMemo(() => parseBulkTextToProblems(bulkRawText), [bulkRawText]);

  if (role !== 'admin' || !adminDrawerOpen) return null;

  const cleanFileTitle = (name: string) =>
    name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim() || 'Untitled PDF';

  const processPdfFiles = (files: FileList | File[]) => {
    const pdfs = Array.from(files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (pdfs.length === 0) {
      setFeedback({ ok: false, text: 'No valid .pdf files detected.' });
      return;
    }
    if (pdfs.length === 1 && !matTitle.trim() && queuedPdfs.length === 0) {
      const f = pdfs[0];
      const url = URL.createObjectURL(f);
      setMatPdfUrl(url);
      setMatPdfName(f.name);
      setMatTitle(cleanFileTitle(f.name));
      setFeedback({ ok: true, text: `Attached ${f.name}. Review metadata and click ADD MATERIAL.` });
    } else {
      const nextQueue = pdfs.map((f) => ({
        fileName: f.name,
        title: cleanFileTitle(f.name),
        pdfUrl: URL.createObjectURL(f),
      }));
      setQueuedPdfs((prev) => [...prev, ...nextQueue]);
      setFeedback({
        ok: true,
        text: `Queued ${nextQueue.length} PDF(s) for batch ingestion under [${BRANCH_CODE[matBranch]}].`,
      });
    }
  };

  const handlePdfPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processPdfFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handlePdfDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setPdfDragActive(false);
    if (e.dataTransfer.files?.length) {
      processPdfFiles(e.dataTransfer.files);
    }
  };

  const handleIngestQueuedPdfs = () => {
    if (queuedPdfs.length === 0) return;
    addMaterialsBatch(
      queuedPdfs.map((q) => ({
        branch: matBranch,
        subtopic: matSubtopic,
        source: matSource,
        tier: matTier,
        title: q.title,
        formulaSheetLatex: '',
        pdfUrl: q.pdfUrl,
        pdfFileName: q.fileName,
      }))
    );
    const count = queuedPdfs.length;
    setQueuedPdfs([]);
    setFeedback({ ok: true, text: `Ingested ${count} PDF(s) into Derivation Compendium.` });
    setActiveView('compendium');
  };

  const processBookPdfFiles = (files: FileList | File[]) => {
    const pdfs = Array.from(files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (pdfs.length === 0) {
      setFeedback({ ok: false, text: 'No valid .pdf files detected.' });
      return;
    }
    if (pdfs.length === 1 && !bookTitle.trim() && queuedBooks.length === 0) {
      const f = pdfs[0];
      const url = URL.createObjectURL(f);
      setBookPdfUrl(url);
      setBookPdfName(f.name);
      setBookTitle(cleanFileTitle(f.name));
      setFeedback({ ok: true, text: `Attached ${f.name}. Review metadata and click ADD BOOK / NOTES.` });
    } else {
      const nextQueue = pdfs.map((f) => ({
        fileName: f.name,
        title: cleanFileTitle(f.name),
        pdfUrl: URL.createObjectURL(f),
      }));
      setQueuedBooks((prev) => [...prev, ...nextQueue]);
      setFeedback({
        ok: true,
        text: `Queued ${nextQueue.length} volume(s) for Books & Notes shelf.`,
      });
    }
  };

  const handleBookPdfPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processBookPdfFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleBookPdfDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setBookDragActive(false);
    if (e.dataTransfer.files?.length) {
      processBookPdfFiles(e.dataTransfer.files);
    }
  };

  const handleIngestQueuedBooks = () => {
    if (queuedBooks.length === 0) return;
    addBooksBatch(
      queuedBooks.map((q) => ({
        title: q.title,
        author: bookAuthor.trim() || 'Reference Author',
        edition: bookEdition.trim() || undefined,
        category: bookCategory,
        branchScope: bookScope,
        tier: bookTier,
        pdfUrl: q.pdfUrl,
        pdfFileName: q.fileName,
      }))
    );
    const count = queuedBooks.length;
    setQueuedBooks([]);
    setFeedback({ ok: true, text: `Ingested ${count} volume(s) into Books & Notes.` });
    setActiveView('books');
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) {
      setFeedback({ ok: false, text: 'Book or notes title required.' });
      return;
    }
    const pages = parseInt(bookTotalPages, 10);
    addBook({
      title: bookTitle.trim(),
      author: bookAuthor.trim() || 'Reference Author',
      edition: bookEdition.trim() || undefined,
      category: bookCategory,
      branchScope: bookScope,
      tier: bookTier,
      totalPages: Number.isFinite(pages) && pages > 0 ? pages : undefined,
      pdfUrl: bookPdfUrl.trim() || undefined,
      pdfFileName: bookPdfName || bookPdfUrl.trim().split('/').pop() || undefined,
      notesLatex: bookNotesLatex.trim() || undefined,
    });
    setFeedback({ ok: true, text: `Indexed "${bookTitle.trim()}" in Books & Notes.` });
    setBookTitle('');
    setBookAuthor('');
    setBookEdition('');
    setBookTotalPages('');
    setBookPdfUrl('');
    setBookPdfName('');
    setBookNotesLatex('');
    setActiveView('books');
  };

  const handleMp4Pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLecUrl(URL.createObjectURL(file));
    if (!lecTitle.trim()) {
      setLecTitle(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim());
    }
  };

  const parseBookmarks = (raw: string) =>
    raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(\d{1,2}):(\d{2})\s+(.+)$/);
        if (match) {
          return {
            timeSeconds: Number(match[1]) * 60 + Number(match[2]),
            label: match[3].trim(),
          };
        }
        return { timeSeconds: 0, label: line };
      });

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) {
      setFeedback({ ok: false, text: 'Title required.' });
      return;
    }
    addMaterial({
      branch: matBranch,
      subtopic: matSubtopic,
      source: matSource,
      tier: matTier,
      title: matTitle.trim(),
      formulaSheetLatex: matFormulaLatex.trim(),
      pdfUrl: matPdfUrl.trim() || undefined,
      pdfFileName: matPdfName || matPdfUrl.trim().split('/').pop() || undefined,
    });
    setFeedback({ ok: true, text: `Indexed "${matTitle.trim()}" in Derivation Compendium.` });
    setMatTitle('');
    setMatPdfUrl('');
    setMatPdfName('');
    setMatFormulaLatex('');
    setActiveView('compendium');
  };

  const handleSaveLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecTitle.trim() || !lecUrl.trim()) {
      setFeedback({ ok: false, text: 'Title and MP4/YouTube URL required.' });
      return;
    }
    addLecture({
      branch: lecBranch,
      subtopic: lecSubtopic,
      source: lecSource,
      tier: lecTier,
      title: lecTitle.trim(),
      sourceType: detectSourceType(lecUrl.trim()),
      videoUrl: lecUrl.trim(),
      bookmarks: parseBookmarks(lecBookmarksRaw),
      notesLatex: lecNotesLatex.trim() || undefined,
    });
    setFeedback({ ok: true, text: `Indexed "${lecTitle.trim()}" in Lecture Reel.` });
    setLecTitle('');
    setLecUrl('');
    setLecNotesLatex('');
    setActiveView('lectures');
  };

  const handleSaveProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!probTitle.trim() || !probStem.trim()) {
      setFeedback({ ok: false, text: 'Problem title and LaTeX stem required.' });
      return;
    }
    addProblem({
      branch: probBranch,
      subtopic: probSubtopic,
      source: probSource,
      format: probFormat,
      markingScheme: probMarking,
      tier: probTier,
      title: probTitle.trim(),
      stemLatex: probStem.trim(),
      hintLatex: probHint.trim() || 'Identify conserved quantities or constraints.',
      solutionLatex: probSolution.trim() || 'Derivation pending.',
    });
    setFeedback({ ok: true, text: `Indexed "${probTitle.trim()}" in Problem Archive.` });
    setProbTitle('');
    setProbStem('');
    setProbHint('');
    setProbSolution('');
    setActiveView('problems');
  };

  const handleBulkPasteIngest = () => {
    if (parsedBulkItems.length === 0) {
      setFeedback({ ok: false, text: 'Paste numbered questions or --- separated blocks.' });
      return;
    }
    if (bulkTarget === 'problems') {
      addProblemsBatch(
        parsedBulkItems.map((item) => ({
          branch: bulkBranch,
          subtopic: bulkSubtopic,
          source: bulkSource,
          format: bulkFormat,
          markingScheme: bulkMarking,
          tier: bulkTier,
          title: item.title,
          stemLatex: item.stemLatex,
          hintLatex: item.hintLatex,
          solutionLatex: item.solutionLatex,
        }))
      );
      setFeedback({
        ok: true,
        text: `Ingested ${parsedBulkItems.length} problem(s) into Problem Archive.`,
      });
      setBulkRawText('');
      setActiveView('problems');
    } else {
      addMaterialsBatch(
        parsedBulkItems.map((item) => ({
          branch: bulkBranch,
          subtopic: bulkSubtopic,
          source: bulkSource,
          tier: bulkTier,
          title: item.title,
          formulaSheetLatex: item.stemLatex,
        }))
      );
      setFeedback({
        ok: true,
        text: `Ingested ${parsedBulkItems.length} sheet(s) into Derivation Compendium.`,
      });
      setBulkRawText('');
      setActiveView('compendium');
    }
  };

  const handleExportDownload = () => {
    const blob = new Blob([exportDataJson()], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportDataJson());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore
    }
  };

  const handleBulkImport = () => {
    const res = importDataJson(jsonText);
    setFeedback({ ok: res.ok, text: res.message });
    if (res.ok) setJsonText('');
  };

  const handleJsonFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = importDataJson(text);
    setFeedback({ ok: res.ok, text: res.message });
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#14181F]/60 backdrop-blur-xs"
      onClick={() => setAdminDrawerOpen(false)}
    >
      <input
        ref={pdfFileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handlePdfPick}
      />
      <input
        ref={bookFileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handleBookPdfPick}
      />
      <input
        ref={mp4FileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/*"
        className="hidden"
        onChange={handleMp4Pick}
      />
      <input
        ref={jsonFileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleJsonFilePick}
      />

      <aside
        className="flex h-full w-full max-w-5xl flex-col border-l border-[#14181F]/20 bg-[#FAF8F5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#14181F]/15 bg-white px-5 py-3.5">
          <div>
            <p className="font-math text-[10px] tracking-wider text-[#1E3A5F]">
              ADMIN INGESTION CONSOLE
            </p>
            <h2 className="font-editorial text-lg font-semibold text-[#14181F]">
              Vault Authoring &amp; Bulk Ingest
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 border border-[#14181F]/15 bg-[#FAF8F5] px-3 py-1.5 font-math text-[11px] font-medium text-[#14181F] cursor-pointer hover:bg-[#F3EFE8]"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[#166534]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copied ? 'COPIED' : 'COPY JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportDownload}
              className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-3 py-1.5 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>EXPORT data.json</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminDrawerOpen(false)}
              aria-label="Close Admin Drawer"
              className="ml-1 p-1.5 text-[#64748B] hover:text-[#14181F] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-[#14181F]/15 bg-[#F3EFE8] px-5 py-2">
          {(
            [
              ['material', 'Add Material / PDF'],
              ['book', 'Add Book / Notes'],
              ['lecture', 'Add Lecture'],
              ['problem', 'Add Problem'],
              ['bulk', 'Bulk Text Paste'],
              ['json', 'Import data.json'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setFeedback(null);
              }}
              className={`px-3 py-1.5 font-math text-[11px] font-medium cursor-pointer transition-colors ${
                tab === id
                  ? 'bg-white text-[#14181F] border border-[#14181F]/15'
                  : 'text-[#64748B] hover:text-[#14181F]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {feedback && (
          <div
            className={`border-b px-5 py-2 font-math text-[11px] font-medium ${
              feedback.ok
                ? 'border-[#166534]/25 bg-[#DCFCE7]/60 text-[#14532D]'
                : 'border-[#991B1B]/25 bg-[#FEE2E2]/60 text-[#7F1D1D]'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: ADD MATERIAL / DRAG-AND-DROP PDF */}
          {tab === 'material' && (
            <div className="space-y-5">
              {/* Drag & Drop Multi-PDF Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setPdfDragActive(true);
                }}
                onDragLeave={() => setPdfDragActive(false)}
                onDrop={handlePdfDrop}
                onClick={() => pdfFileInputRef.current?.click()}
                className={`border border-dashed p-5 text-center cursor-pointer transition-colors ${
                  pdfDragActive
                    ? 'border-[#1E3A5F] bg-[#1E3A5F]/5'
                    : 'border-[#14181F]/25 bg-white hover:border-[#1E3A5F]'
                }`}
              >
                <FileUp className="mx-auto h-6 w-6 text-[#1E3A5F]" aria-hidden="true" />
                <p className="font-math mt-2 text-xs font-semibold text-[#14181F]">
                  DRAG &amp; DROP PDF HANDOUTS HERE (SINGLE OR BATCH)
                </p>
                <p className="font-math mt-1 text-[11px] text-[#64748B]">
                  OR CLICK TO BROWSE .PDF FILES · AUTO-INDEXED UNDER SELECTED BRANCH &amp; SUBTOPIC
                </p>
              </div>

              {/* Multi-PDF Batch Queue */}
              {queuedPdfs.length > 0 && (
                <div className="border border-[#14181F]/15 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#14181F]/10 pb-2">
                    <span className="font-math text-[11px] font-semibold text-[#1E3A5F]">
                      PDF BATCH QUEUE ({queuedPdfs.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQueuedPdfs([])}
                        className="font-math text-[11px] text-[#64748B] hover:text-[#991B1B] cursor-pointer"
                      >
                        CLEAR
                      </button>
                      <button
                        type="button"
                        onClick={handleIngestQueuedPdfs}
                        className="bg-[#1E3A5F] px-3 py-1.5 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49]"
                      >
                        INGEST {queuedPdfs.length} PDF(s)
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {queuedPdfs.map((q, i) => (
                      <div
                        key={`${q.fileName}-${i}`}
                        className="flex items-center justify-between border border-[#14181F]/10 bg-[#FAF8F5] px-2.5 py-1.5 text-xs"
                      >
                        <span className="truncate font-medium text-[#14181F]">{q.title}</span>
                        <span className="font-math text-[10px] text-[#64748B] ml-2 shrink-0">
                          [{BRANCH_CODE[matBranch]}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveMaterial} className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-math block text-[10px] font-semibold text-[#475569]">
                        BRANCH
                      </label>
                      <select
                        value={matBranch}
                        onChange={(e) => {
                          const b = e.target.value as PhysicsBranch;
                          setMatBranch(b);
                          setMatSubtopic(BRANCH_SUBTOPICS[b][0]);
                        }}
                        className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                      >
                        {SYLLABUS_BRANCHES.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-math block text-[10px] font-semibold text-[#475569]">
                        SUBTOPIC
                      </label>
                      <select
                        value={matSubtopic}
                        onChange={(e) => setMatSubtopic(e.target.value)}
                        className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                      >
                        {BRANCH_SUBTOPICS[matBranch].map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-math block text-[10px] font-semibold text-[#475569]">
                        SOURCE / TEXT
                      </label>
                      <select
                        value={matSource}
                        onChange={(e) => setMatSource(e.target.value as ProblemSource)}
                        className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                      >
                        {PROBLEM_SOURCES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-math block text-[10px] font-semibold text-[#475569]">
                        CONCEPT DEPTH
                      </label>
                      <select
                        value={matTier}
                        onChange={(e) => setMatTier(e.target.value as ConceptTier)}
                        className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                      >
                        {CONCEPT_TIERS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      TITLE
                    </label>
                    <input
                      type="text"
                      value={matTitle}
                      onChange={(e) => setMatTitle(e.target.value)}
                      placeholder="e.g. Instantaneous Axis of Rotation"
                      className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      PDF PATH / URL
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={matPdfUrl}
                        onChange={(e) => setMatPdfUrl(e.target.value)}
                        placeholder="/handouts/iaor.pdf or https://..."
                        className="flex-1 border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => pdfFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 border border-[#14181F]/15 bg-white px-2.5 py-1.5 font-math text-[11px] font-medium cursor-pointer hover:bg-[#F3EFE8]"
                      >
                        <Upload className="h-3 w-3" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      FORMULA SHEET (KaTeX $...$ / $$...$$)
                    </label>
                    <textarea
                      rows={5}
                      value={matFormulaLatex}
                      onChange={(e) => setMatFormulaLatex(e.target.value)}
                      placeholder="$$\tau_{\text{ext}} = I_c \alpha$$"
                      className="font-math mt-1 w-full border border-[#14181F]/15 bg-white p-2.5 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-4 py-2 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>ADD MATERIAL</span>
                  </button>
                </div>

                <div className="border border-[#14181F]/15 bg-white p-4">
                  <p className="font-math text-[10px] font-semibold tracking-wider text-[#1E3A5F]">
                    LIVE KaTeX PREVIEW
                  </p>
                  <h4 className="font-editorial mt-2 text-lg font-semibold text-[#14181F]">
                    {matTitle || 'Untitled Material'}
                  </h4>
                  <p className="font-math mt-1 text-[10px] text-[#64748B]">
                    [{BRANCH_CODE[matBranch]}] · {SOURCE_TAG[matSource]} {TIER_TAG[matTier]}
                  </p>
                  <div className="mt-3 text-sm">
                    {matFormulaLatex ? (
                      <MathText text={matFormulaLatex} />
                    ) : (
                      <p className="font-math text-[11px] text-[#64748B]">NO FORMULA INPUT</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ADD LECTURE */}
          {tab === 'lecture' && (
            <form onSubmit={handleSaveLecture} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      BRANCH
                    </label>
                    <select
                      value={lecBranch}
                      onChange={(e) => {
                        const b = e.target.value as PhysicsBranch;
                        setLecBranch(b);
                        setLecSubtopic(BRANCH_SUBTOPICS[b][0]);
                      }}
                      className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {SYLLABUS_BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      SUBTOPIC
                    </label>
                    <select
                      value={lecSubtopic}
                      onChange={(e) => setLecSubtopic(e.target.value)}
                      className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {BRANCH_SUBTOPICS[lecBranch].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      SOURCE / SERIES
                    </label>
                    <select
                      value={lecSource}
                      onChange={(e) => setLecSource(e.target.value as ProblemSource)}
                      className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {PROBLEM_SOURCES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      CONCEPT DEPTH
                    </label>
                    <select
                      value={lecTier}
                      onChange={(e) => setLecTier(e.target.value as ConceptTier)}
                      className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {CONCEPT_TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-math block text-[10px] font-semibold text-[#475569]">
                    LECTURE TITLE
                  </label>
                  <input
                    type="text"
                    value={lecTitle}
                    onChange={(e) => setLecTitle(e.target.value)}
                    placeholder="e.g. Method of Images & Conducting Spheres"
                    className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="font-math block text-[10px] font-semibold text-[#475569]">
                    STREAM URL (YOUTUBE OR .MP4)
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={lecUrl}
                      onChange={(e) => setLecUrl(e.target.value)}
                      placeholder="https://youtu.be/... or /lectures/lec01.mp4"
                      className="flex-1 border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => mp4FileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 border border-[#14181F]/15 bg-white px-2.5 py-1.5 font-math text-[11px] font-medium cursor-pointer hover:bg-[#F3EFE8]"
                    >
                      <Upload className="h-3 w-3" />
                      <span>MP4</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-math block text-[10px] font-semibold text-[#475569]">
                    TIMESTAMP BOOKMARKS (MM:SS LABEL)
                  </label>
                  <textarea
                    rows={4}
                    value={lecBookmarksRaw}
                    onChange={(e) => setLecBookmarksRaw(e.target.value)}
                    className="font-math mt-1 w-full border border-[#14181F]/15 bg-white p-2.5 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-4 py-2 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>ADD LECTURE</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-math block text-[10px] font-semibold text-[#475569]">
                    LECTURE NOTES (KaTeX)
                  </label>
                  <textarea
                    rows={6}
                    value={lecNotesLatex}
                    onChange={(e) => setLecNotesLatex(e.target.value)}
                    placeholder="$$q' = -\frac{R}{d}q$$"
                    className="font-math mt-1 w-full border border-[#14181F]/15 bg-white p-2.5 text-xs"
                  />
                </div>
                <div className="border border-[#14181F]/15 bg-white p-4">
                  <p className="font-math text-[10px] font-semibold tracking-wider text-[#1E3A5F]">
                    LIVE KaTeX PREVIEW
                  </p>
                  <div className="mt-2 text-sm">
                    {lecNotesLatex ? (
                      <MathText text={lecNotesLatex} />
                    ) : (
                      <p className="font-math text-[11px] text-[#64748B]">NO NOTES INPUT</p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: ADD SINGLE PROBLEM */}
          {tab === 'problem' && (
            <form onSubmit={handleSaveProblem} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      BRANCH
                    </label>
                    <select
                      value={probBranch}
                      onChange={(e) => {
                        const b = e.target.value as PhysicsBranch;
                        setProbBranch(b);
                        setProbSubtopic(BRANCH_SUBTOPICS[b][0]);
                      }}
                      className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {SYLLABUS_BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      SUBTOPIC
                    </label>
                    <select
                      value={probSubtopic}
                      onChange={(e) => setProbSubtopic(e.target.value)}
                      className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {BRANCH_SUBTOPICS[probBranch].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      SOURCE / TEXT
                    </label>
                    <select
                      value={probSource}
                      onChange={(e) => setProbSource(e.target.value as ProblemSource)}
                      className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {PROBLEM_SOURCES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      QUESTION FORMAT
                    </label>
                    <select
                      value={probFormat}
                      onChange={(e) => setProbFormat(e.target.value as QuestionFormat)}
                      className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {QUESTION_FORMATS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      MARKING SCHEME
                    </label>
                    <select
                      value={probMarking}
                      onChange={(e) => setProbMarking(e.target.value as MarkingScheme)}
                      className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {MARKING_SCHEMES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      CONCEPT DEPTH
                    </label>
                    <select
                      value={probTier}
                      onChange={(e) => setProbTier(e.target.value as ConceptTier)}
                      className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {CONCEPT_TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-math block text-[10px] font-semibold text-[#475569]">
                    TITLE / REF ID
                  </label>
                  <input
                    type="text"
                    value={probTitle}
                    onChange={(e) => setProbTitle(e.target.value)}
                    placeholder="e.g. Irodov 1.248 — Rolling Spool Critical Angle"
                    className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="font-math block text-[10px] font-semibold text-[#475569]">
                    STEM (LaTeX $...$ / $$...$$)
                  </label>
                  <textarea
                    rows={4}
                    value={probStem}
                    onChange={(e) => setProbStem(e.target.value)}
                    className="font-math mt-1 w-full border border-[#14181F]/15 bg-white p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="font-math block text-[10px] font-semibold text-[#475569]">
                    HINT (LaTeX)
                  </label>
                  <input
                    type="text"
                    value={probHint}
                    onChange={(e) => setProbHint(e.target.value)}
                    className="font-math mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="font-math block text-[10px] font-semibold text-[#475569]">
                    STEP-BY-STEP SOLUTION (LaTeX)
                  </label>
                  <textarea
                    rows={4}
                    value={probSolution}
                    onChange={(e) => setProbSolution(e.target.value)}
                    className="font-math mt-1 w-full border border-[#14181F]/15 bg-white p-2.5 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-4 py-2 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>ADD PROBLEM</span>
                </button>
              </div>

              <div className="border border-[#14181F]/15 bg-white p-4 space-y-3">
                <p className="font-math text-[10px] font-semibold tracking-wider text-[#1E3A5F]">
                  LIVE KaTeX PREVIEW
                </p>
                <p className="font-math text-[10px] text-[#64748B]">
                  [{BRANCH_CODE[probBranch]}] {SOURCE_TAG[probSource]} {FORMAT_TAG[probFormat]}{' '}
                  {MARKING_TAG[probMarking]} {TIER_TAG[probTier]}
                </p>
                <h4 className="font-editorial text-lg font-semibold text-[#14181F]">
                  {probTitle || 'Untitled Problem'}
                </h4>
                <div className="text-sm text-[#14181F]">
                  {probStem ? (
                    <MathText text={probStem} />
                  ) : (
                    <p className="font-math text-[11px] text-[#64748B]">NO STEM INPUT</p>
                  )}
                </div>
                {probSolution && (
                  <div className="border border-[#14181F]/10 bg-[#FAF8F5] p-3 text-xs">
                    <p className="font-math text-[10px] font-semibold text-[#475569] mb-1">
                      SOLUTION PREVIEW
                    </p>
                    <MathText text={probSolution} />
                  </div>
                )}
              </div>
            </form>
          )}

          {/* TAB 4: BULK TEXT PASTE */}
          {tab === 'bulk' && (
            <div className="space-y-4">
              <div className="border border-[#14181F]/15 bg-white p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#14181F]/10 pb-2.5">
                  <span className="font-math text-[11px] font-semibold text-[#14181F]">
                    BATCH METADATA ASSIGNMENT
                  </span>
                  <div className="flex items-center gap-1 border border-[#14181F]/15 bg-[#FAF8F5] p-0.5">
                    <button
                      type="button"
                      onClick={() => setBulkTarget('problems')}
                      className={`px-2.5 py-1 font-math text-[10px] font-semibold cursor-pointer ${
                        bulkTarget === 'problems'
                          ? 'bg-[#1E3A5F] text-white'
                          : 'text-[#475569]'
                      }`}
                    >
                      PROBLEM CARDS
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkTarget('compendium')}
                      className={`px-2.5 py-1 font-math text-[10px] font-semibold cursor-pointer ${
                        bulkTarget === 'compendium'
                          ? 'bg-[#1E3A5F] text-white'
                          : 'text-[#475569]'
                      }`}
                    >
                      COMPENDIUM NOTES
                    </button>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      BRANCH
                    </label>
                    <select
                      value={bulkBranch}
                      onChange={(e) => {
                        const b = e.target.value as PhysicsBranch;
                        setBulkBranch(b);
                        setBulkSubtopic(BRANCH_SUBTOPICS[b][0]);
                      }}
                      className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs"
                    >
                      {SYLLABUS_BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      SUBTOPIC
                    </label>
                    <select
                      value={bulkSubtopic}
                      onChange={(e) => setBulkSubtopic(e.target.value)}
                      className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs"
                    >
                      {BRANCH_SUBTOPICS[bulkBranch].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      SOURCE / TEXT
                    </label>
                    <select
                      value={bulkSource}
                      onChange={(e) => setBulkSource(e.target.value as ProblemSource)}
                      className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs"
                    >
                      {PROBLEM_SOURCES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {bulkTarget === 'problems' && (
                    <>
                      <div>
                        <label className="font-math block text-[10px] font-semibold text-[#475569]">
                          FORMAT
                        </label>
                        <select
                          value={bulkFormat}
                          onChange={(e) => setBulkFormat(e.target.value as QuestionFormat)}
                          className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs"
                        >
                          {QUESTION_FORMATS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-math block text-[10px] font-semibold text-[#475569]">
                          MARKING SCHEME
                        </label>
                        <select
                          value={bulkMarking}
                          onChange={(e) => setBulkMarking(e.target.value as MarkingScheme)}
                          className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs"
                        >
                          {MARKING_SCHEMES.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      CONCEPT DEPTH
                    </label>
                    <select
                      value={bulkTier}
                      onChange={(e) => setBulkTier(e.target.value as ConceptTier)}
                      className="mt-1 w-full border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs"
                    >
                      {CONCEPT_TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-math block text-[10px] font-semibold text-[#475569]">
                    RAW MULTI-QUESTION TEXT / LATEX (DELIMITED BY Q1., 1., ---, OR \item)
                  </label>
                  <textarea
                    rows={13}
                    value={bulkRawText}
                    onChange={(e) => setBulkRawText(e.target.value)}
                    placeholder={`1. A uniform rod of mass $M$ and length $L$ hinges at $O$. Find $\\alpha$.\nHint: Torque about hinge $\\tau = I_O \\alpha$.\nSolution: $$\\alpha = \\frac{3g}{2L}$$\n---\n2. A particle executes SHM with $x = A\\sin(\\omega t)$...`}
                    className="font-math w-full border border-[#14181F]/15 bg-white p-3 text-xs focus:border-[#1E3A5F] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleBulkPasteIngest}
                    disabled={parsedBulkItems.length === 0}
                    className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-4 py-2 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>
                      INGEST {parsedBulkItems.length}{' '}
                      {bulkTarget === 'problems' ? 'PROBLEM(S)' : 'NOTE(S)'}
                    </span>
                  </button>
                </div>

                <div className="border border-[#14181F]/15 bg-white p-3 flex flex-col max-h-[360px]">
                  <div className="border-b border-[#14181F]/10 pb-2 font-math text-[10px] font-semibold tracking-wider text-[#1E3A5F]">
                    PARSED PREVIEW ({parsedBulkItems.length} DETECTED)
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-[#14181F]/10 mt-2">
                    {parsedBulkItems.length === 0 ? (
                      <p className="font-math py-8 text-center text-[11px] text-[#64748B]">
                        PASTE RAW QUESTIONS OR LATEX BLOCKS ON LEFT
                      </p>
                    ) : (
                      parsedBulkItems.map((item, idx) => (
                        <div key={idx} className="py-2.5 space-y-1">
                          <div className="font-math text-[10px] text-[#64748B]">
                            #{String(idx + 1).padStart(2, '0')} · {item.title}
                          </div>
                          <div className="text-xs text-[#14181F]">
                            <MathText text={item.stemLatex} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADD BOOK / NOTES */}
          {tab === 'book' && (
            <div className="space-y-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setBookDragActive(true);
                }}
                onDragLeave={() => setBookDragActive(false)}
                onDrop={handleBookPdfDrop}
                onClick={() => bookFileInputRef.current?.click()}
                className={`border border-dashed p-5 text-center cursor-pointer transition-colors ${
                  bookDragActive
                    ? 'border-[#1E3A5F] bg-[#1E3A5F]/5'
                    : 'border-[#14181F]/25 bg-white hover:border-[#1E3A5F]'
                }`}
              >
                <FileUp className="mx-auto h-6 w-6 text-[#1E3A5F]" aria-hidden="true" />
                <p className="font-math mt-2 text-xs font-semibold text-[#14181F]">
                  DRAG &amp; DROP FULL BOOK OR NOTES PDFs HERE (SINGLE OR BATCH)
                </p>
                <p className="font-math mt-1 text-[11px] text-[#64748B]">
                  OR CLICK TO BROWSE .PDF VOLUMES · SUPPORTS MULTI-CHAPTER TEXTBOOKS &amp; HANDOUTS
                </p>
              </div>

              {queuedBooks.length > 0 && (
                <div className="border border-[#14181F]/15 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#14181F]/10 pb-2">
                    <span className="font-math text-[11px] font-semibold text-[#1E3A5F]">
                      VOLUME BATCH QUEUE ({queuedBooks.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQueuedBooks([])}
                        className="font-math text-[11px] text-[#64748B] hover:text-[#991B1B] cursor-pointer"
                      >
                        CLEAR
                      </button>
                      <button
                        type="button"
                        onClick={handleIngestQueuedBooks}
                        className="bg-[#1E3A5F] px-3 py-1.5 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49]"
                      >
                        INGEST {queuedBooks.length} VOLUME(S)
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {queuedBooks.map((q, i) => (
                      <div
                        key={`${q.fileName}-${i}`}
                        className="flex items-center justify-between border border-[#14181F]/10 bg-[#FAF8F5] px-2.5 py-1.5 text-xs"
                      >
                        <span className="truncate font-medium text-[#14181F]">{q.title}</span>
                        <span className="font-math text-[10px] text-[#64748B] ml-2 shrink-0">
                          {BOOK_CATEGORY_TAG[bookCategory]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveBook} className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-math block text-[10px] font-semibold text-[#475569]">
                        CATEGORY
                      </label>
                      <select
                        value={bookCategory}
                        onChange={(e) => setBookCategory(e.target.value as BookCategory)}
                        className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                      >
                        {BOOK_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-math block text-[10px] font-semibold text-[#475569]">
                        SCOPE / BRANCH
                      </label>
                      <select
                        value={bookScope}
                        onChange={(e) => setBookScope(e.target.value as BookBranchScope)}
                        className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                      >
                        <option value="All Branches (Complete Text)">
                          All Branches (Complete Text)
                        </option>
                        {SYLLABUS_BRANCHES.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-math block text-[10px] font-semibold text-[#475569]">
                        CONCEPT DEPTH
                      </label>
                      <select
                        value={bookTier}
                        onChange={(e) => setBookTier(e.target.value as ConceptTier)}
                        className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                      >
                        {CONCEPT_TIERS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-math block text-[10px] font-semibold text-[#475569]">
                        TOTAL PAGES (OPTIONAL)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={bookTotalPages}
                        onChange={(e) => setBookTotalPages(e.target.value)}
                        placeholder="e.g. 384"
                        className="font-math mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      BOOK / NOTES TITLE
                    </label>
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="e.g. Problems in General Physics"
                      className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-math block text-[10px] font-semibold text-[#475569]">
                        AUTHOR(S)
                      </label>
                      <input
                        type="text"
                        value={bookAuthor}
                        onChange={(e) => setBookAuthor(e.target.value)}
                        placeholder="e.g. I.E. Irodov"
                        className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-math block text-[10px] font-semibold text-[#475569]">
                        EDITION / YEAR (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        value={bookEdition}
                        onChange={(e) => setBookEdition(e.target.value)}
                        placeholder="e.g. Mir 1981 / Vol. 1"
                        className="mt-1 w-full border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      PDF PATH / URL
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={bookPdfUrl}
                        onChange={(e) => setBookPdfUrl(e.target.value)}
                        placeholder="/books/irodov.pdf or https://..."
                        className="flex-1 border border-[#14181F]/15 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => bookFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 border border-[#14181F]/15 bg-white px-2.5 py-1.5 font-math text-[11px] font-medium cursor-pointer hover:bg-[#F3EFE8]"
                      >
                        <Upload className="h-3 w-3" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-math block text-[10px] font-semibold text-[#475569]">
                      CHAPTER INDEX / ANNOTATIONS (KaTeX)
                    </label>
                    <textarea
                      rows={4}
                      value={bookNotesLatex}
                      onChange={(e) => setBookNotesLatex(e.target.value)}
                      placeholder="Part 1: Physical Fundamentals of Mechanics (pp. 7–68)..."
                      className="font-math mt-1 w-full border border-[#14181F]/15 bg-white p-2.5 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-4 py-2 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>ADD BOOK / NOTES</span>
                  </button>
                </div>

                <div className="border border-[#14181F]/15 bg-white p-4 space-y-2">
                  <p className="font-math text-[10px] font-semibold tracking-wider text-[#1E3A5F]">
                    VOLUME CARD PREVIEW
                  </p>
                  <p className="font-math text-[10px] text-[#64748B]">
                    {BOOK_CATEGORY_TAG[bookCategory]} [
                    {bookScope === 'All Branches (Complete Text)'
                      ? 'COMPLETE TEXT'
                      : BRANCH_CODE[bookScope]}
                    ] {TIER_TAG[bookTier]}
                  </p>
                  <h4 className="font-editorial text-lg font-semibold text-[#14181F]">
                    {bookTitle || 'Untitled Volume'}
                  </h4>
                  <p className="text-xs text-[#475569]">
                    {bookAuthor || 'Reference Author'}
                    {bookEdition ? ` · ${bookEdition}` : ''}
                    {bookTotalPages ? ` · ${bookTotalPages} pp.` : ''}
                  </p>
                  <div className="border-t border-[#14181F]/10 pt-3 text-sm">
                    {bookNotesLatex ? (
                      <MathText text={bookNotesLatex} />
                    ) : (
                      <p className="font-math text-[11px] text-[#64748B]">NO ANNOTATIONS INPUT</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: IMPORT / EXPORT JSON */}
          {tab === 'json' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border border-[#14181F]/15 bg-white p-3">
                <span className="font-math text-[11px] text-[#475569]">
                  SCHEMA: {'{ materials, books, lectures, problems, qaPosts }'}
                </span>
                <button
                  type="button"
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 border border-[#14181F]/20 bg-[#FAF8F5] px-3 py-1.5 font-math text-[11px] font-medium text-[#14181F] cursor-pointer hover:bg-[#F3EFE8]"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>LOAD .JSON FILE</span>
                </button>
              </div>

              <textarea
                rows={12}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{ "materials": [], "books": [], "lectures": [], "problems": [], "qaPosts": [] }'
                className="font-math w-full border border-[#14181F]/15 bg-white p-3 text-xs"
              />

              <button
                type="button"
                onClick={handleBulkImport}
                className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-4 py-2 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49]"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>IMPORT JSON PAYLOAD</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
