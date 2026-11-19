import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_BOOKS } from '../data/books';
import { INITIAL_LECTURES } from '../data/lectures';
import { INITIAL_MATERIALS } from '../data/notes';
import { INITIAL_PROBLEMS } from '../data/problems';
import {
  BOOK_CATEGORIES,
  BRANCH_SUBTOPICS,
  CONCEPT_TIERS,
  MARKING_SCHEMES,
  PROBLEM_SOURCES,
  QUESTION_FORMATS,
  SYLLABUS_BRANCHES,
  normalizeBranch,
} from '../data/syllabus';
import {
  AccessRole,
  BookBranchScope,
  BookCategory,
  BookItem,
  BookReadStatus,
  ConceptTier,
  LectureItem,
  MarkingScheme,
  MaterialItem,
  PhysicsBranch,
  ProblemItem,
  ProblemSource,
  ProblemStatus,
  QAPost,
  QuestionFormat,
  VaultDataExport,
  VaultModuleView,
  VideoSourceType,
} from '../types/physics';

const SESSION_ROLE_KEY = 'principia_vault_role_v1';
const STORAGE_DATA_KEY = 'principia_vault_data_v1';
const STORAGE_WATCHED_KEY = 'principia_vault_watched_v1';
const STORAGE_READ_MATERIALS_KEY = 'principia_vault_read_materials_v1';
const STORAGE_PROBLEM_STATUS_KEY = 'principia_vault_problem_status_v1';
const STORAGE_BOOK_STATUS_KEY = 'principia_vault_book_status_v1';
const STORAGE_BOOK_PAGE_KEY = 'principia_vault_book_page_v1';

const GUEST_CODE = 'PHYSICS26';
const ADMIN_CODE = 'ADMIN26';

function migrateMaterial(raw: Record<string, unknown>): MaterialItem {
  const branch = normalizeBranch((raw.branch ?? raw.chapter) as string | undefined);
  const validSubtopics = BRANCH_SUBTOPICS[branch];
  const subtopic =
    typeof raw.subtopic === 'string' && validSubtopics.includes(raw.subtopic)
      ? raw.subtopic
      : typeof raw.subtopic === 'string' && raw.subtopic.trim()
        ? raw.subtopic
        : validSubtopics[0];
  const source = PROBLEM_SOURCES.includes(raw.source as ProblemSource)
    ? (raw.source as ProblemSource)
    : 'Coaching Sheet / Custom';
  const tier = CONCEPT_TIERS.includes(raw.tier as ConceptTier)
    ? (raw.tier as ConceptTier)
    : 'Tier 3: JEE Advanced';

  return {
    id: String(raw.id ?? `mat-${Date.now()}`),
    branch,
    subtopic,
    source,
    tier,
    title: String(raw.title ?? 'Untitled Compendium Note'),
    formulaSheetLatex: String(raw.formulaSheetLatex ?? ''),
    pdfUrl: typeof raw.pdfUrl === 'string' ? raw.pdfUrl : undefined,
    pdfFileName: typeof raw.pdfFileName === 'string' ? raw.pdfFileName : undefined,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  };
}

function migrateBook(raw: Record<string, unknown>): BookItem {
  const category = BOOK_CATEGORIES.includes(raw.category as BookCategory)
    ? (raw.category as BookCategory)
    : 'Full Textbook';
  const branchScope: BookBranchScope =
    raw.branchScope === 'All Branches (Complete Text)'
      ? 'All Branches (Complete Text)'
      : (SYLLABUS_BRANCHES as string[]).includes(String(raw.branchScope))
        ? (raw.branchScope as PhysicsBranch)
        : 'All Branches (Complete Text)';
  const tier = CONCEPT_TIERS.includes(raw.tier as ConceptTier)
    ? (raw.tier as ConceptTier)
    : 'Tier 3: JEE Advanced';

  return {
    id: String(raw.id ?? `book-${Date.now()}`),
    title: String(raw.title ?? 'Untitled Volume'),
    author: String(raw.author ?? 'Unknown Author'),
    edition: typeof raw.edition === 'string' && raw.edition.trim() ? raw.edition : undefined,
    category,
    branchScope,
    tier,
    totalPages: typeof raw.totalPages === 'number' && raw.totalPages > 0 ? raw.totalPages : undefined,
    pdfUrl: typeof raw.pdfUrl === 'string' ? raw.pdfUrl : undefined,
    pdfFileName: typeof raw.pdfFileName === 'string' ? raw.pdfFileName : undefined,
    notesLatex: typeof raw.notesLatex === 'string' ? raw.notesLatex : undefined,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  };
}

function migrateLecture(raw: Record<string, unknown>): LectureItem {
  const branch = normalizeBranch((raw.branch ?? raw.chapter) as string | undefined);
  const validSubtopics = BRANCH_SUBTOPICS[branch];
  const subtopic =
    typeof raw.subtopic === 'string' && raw.subtopic.trim()
      ? raw.subtopic
      : validSubtopics[0];
  const source = PROBLEM_SOURCES.includes(raw.source as ProblemSource)
    ? (raw.source as ProblemSource)
    : 'Coaching Sheet / Custom';
  const tier = CONCEPT_TIERS.includes(raw.tier as ConceptTier)
    ? (raw.tier as ConceptTier)
    : 'Tier 3: JEE Advanced';
  const sourceType: VideoSourceType =
    raw.sourceType === 'youtube' || raw.sourceType === 'external' ? raw.sourceType : 'mp4';

  return {
    id: String(raw.id ?? `lec-${Date.now()}`),
    branch,
    subtopic,
    source,
    tier,
    title: String(raw.title ?? 'Untitled Lecture'),
    sourceType,
    videoUrl: String(raw.videoUrl ?? ''),
    bookmarks: Array.isArray(raw.bookmarks) ? raw.bookmarks : [],
    notesLatex: typeof raw.notesLatex === 'string' ? raw.notesLatex : undefined,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  };
}

function migrateProblem(raw: Record<string, unknown>): ProblemItem {
  const branch = normalizeBranch((raw.branch ?? raw.chapter) as string | undefined);
  const validSubtopics = BRANCH_SUBTOPICS[branch];
  const subtopic =
    typeof raw.subtopic === 'string' && raw.subtopic.trim()
      ? raw.subtopic
      : validSubtopics[0];

  let source: ProblemSource = 'Coaching Sheet / Custom';
  if (PROBLEM_SOURCES.includes(raw.source as ProblemSource)) {
    source = raw.source as ProblemSource;
  } else if (raw.source === 'Irodov') {
    source = 'I.E. Irodov';
  } else if (raw.source === 'Krotov') {
    source = 'S.S. Krotov';
  } else if (raw.source === 'JEE Adv PYQs') {
    source = 'JEE Advanced PYQ';
  } else if (raw.source === 'INPhO/IPhO') {
    source = 'INPhO / NSEP';
  }

  const format = QUESTION_FORMATS.includes(raw.format as QuestionFormat)
    ? (raw.format as QuestionFormat)
    : 'Subjective / Olympiad Proof';

  const markingScheme = MARKING_SCHEMES.includes(raw.markingScheme as MarkingScheme)
    ? (raw.markingScheme as MarkingScheme)
    : '+4 / -1 (JEE Main / Adv Single)';

  let tier: ConceptTier = 'Tier 3: JEE Advanced';
  if (CONCEPT_TIERS.includes(raw.tier as ConceptTier)) {
    tier = raw.tier as ConceptTier;
  } else if (raw.difficulty === 'Foundation') {
    tier = 'Tier 1: Foundation';
  } else if (raw.difficulty === 'Olympiad') {
    tier = 'Tier 4: INPhO / IPhO';
  }

  return {
    id: String(raw.id ?? `prob-${Date.now()}`),
    branch,
    subtopic,
    source,
    format,
    markingScheme,
    tier,
    title: String(raw.title ?? 'Untitled Problem'),
    stemLatex: String(raw.stemLatex ?? ''),
    hintLatex: String(raw.hintLatex ?? ''),
    solutionLatex: String(raw.solutionLatex ?? ''),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  };
}

function migrateQAPost(raw: Record<string, unknown>): QAPost {
  return {
    id: String(raw.id ?? `qa-${Date.now()}`),
    problemId: typeof raw.problemId === 'string' ? raw.problemId : undefined,
    branch: normalizeBranch((raw.branch ?? raw.chapter) as string | undefined),
    author: String(raw.author ?? 'Scholar'),
    bodyLatex: String(raw.bodyLatex ?? ''),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  };
}

function readInitialRole(): AccessRole {
  try {
    const val = sessionStorage.getItem(SESSION_ROLE_KEY);
    if (val === 'guest' || val === 'admin') return val;
    return 'locked';
  } catch {
    return 'locked';
  }
}

function readInitialData(): VaultDataExport {
  try {
    const raw = localStorage.getItem(STORAGE_DATA_KEY);
    if (!raw) {
      return {
        materials: [...INITIAL_MATERIALS],
        books: [...INITIAL_BOOKS],
        lectures: [...INITIAL_LECTURES],
        problems: [...INITIAL_PROBLEMS],
        qaPosts: [],
      };
    }
    const parsed = JSON.parse(raw) as Partial<VaultDataExport>;
    return {
      materials: Array.isArray(parsed.materials)
        ? parsed.materials.map((m) => migrateMaterial(m as unknown as Record<string, unknown>))
        : [],
      books: Array.isArray(parsed.books)
        ? parsed.books.map((b) => migrateBook(b as unknown as Record<string, unknown>))
        : [],
      lectures: Array.isArray(parsed.lectures)
        ? parsed.lectures.map((l) => migrateLecture(l as unknown as Record<string, unknown>))
        : [],
      problems: Array.isArray(parsed.problems)
        ? parsed.problems.map((p) => migrateProblem(p as unknown as Record<string, unknown>))
        : [],
      qaPosts: Array.isArray(parsed.qaPosts)
        ? parsed.qaPosts.map((q) => migrateQAPost(q as unknown as Record<string, unknown>))
        : [],
    };
  } catch {
    return {
      materials: [...INITIAL_MATERIALS],
      books: [...INITIAL_BOOKS],
      lectures: [...INITIAL_LECTURES],
      problems: [...INITIAL_PROBLEMS],
      qaPosts: [],
    };
  }
}

function readInitialIdArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readInitialMap<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

interface VaultContextValue {
  role: AccessRole;
  unlockWithCode: (code: string) => { ok: boolean; role?: AccessRole; error?: string };
  lockVault: () => void;
  adminUnlockModalOpen: boolean;
  setAdminUnlockModalOpen: (open: boolean) => void;

  activeView: VaultModuleView;
  setActiveView: (view: VaultModuleView) => void;

  materials: MaterialItem[];
  books: BookItem[];
  lectures: LectureItem[];
  problems: ProblemItem[];
  qaPosts: QAPost[];
  watchedLectureIds: string[];
  readMaterialIds: string[];
  problemStatuses: Record<string, ProblemStatus>;
  bookStatuses: Record<string, BookReadStatus>;
  bookPageBookmarks: Record<string, number>;

  adminDrawerOpen: boolean;
  setAdminDrawerOpen: (open: boolean) => void;
  openAdminOrPrompt: () => void;

  addMaterial: (item: Omit<MaterialItem, 'id' | 'createdAt'>) => MaterialItem;
  addMaterialsBatch: (items: Omit<MaterialItem, 'id' | 'createdAt'>[]) => MaterialItem[];
  removeMaterial: (id: string) => void;
  toggleMaterialRead: (id: string) => void;

  addBook: (item: Omit<BookItem, 'id' | 'createdAt'>) => BookItem;
  addBooksBatch: (items: Omit<BookItem, 'id' | 'createdAt'>[]) => BookItem[];
  removeBook: (id: string) => void;
  updateBookNotes: (id: string, notesLatex: string) => void;
  getBookStatus: (id: string) => BookReadStatus;
  setBookStatus: (id: string, status: BookReadStatus) => void;
  getBookPageBookmark: (id: string) => number;
  setBookPageBookmark: (id: string, page: number) => void;

  addLecture: (item: Omit<LectureItem, 'id' | 'createdAt'>) => LectureItem;
  updateLectureSource: (id: string, videoUrl: string, sourceType: VideoSourceType) => void;
  removeLecture: (id: string) => void;
  toggleLectureWatched: (id: string) => void;

  addProblem: (item: Omit<ProblemItem, 'id' | 'createdAt'>) => ProblemItem;
  addProblemsBatch: (items: Omit<ProblemItem, 'id' | 'createdAt'>[]) => ProblemItem[];
  removeProblem: (id: string) => void;
  getProblemStatus: (id: string) => ProblemStatus;
  setProblemStatus: (id: string, status: ProblemStatus) => void;

  addQAPost: (post: Omit<QAPost, 'id' | 'createdAt'>) => void;
  removeQAPost: (id: string) => void;

  exportDataJson: () => string;
  importDataJson: (rawJson: string) => { ok: boolean; message: string };
}

const VaultContext = createContext<VaultContextValue | null>(null);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<AccessRole>(() => readInitialRole());
  const [activeView, setActiveView] = useState<VaultModuleView>('overview');
  const [data, setData] = useState<VaultDataExport>(() => readInitialData());
  const [watchedLectureIds, setWatchedLectureIds] = useState<string[]>(() =>
    readInitialIdArray(STORAGE_WATCHED_KEY)
  );
  const [readMaterialIds, setReadMaterialIds] = useState<string[]>(() =>
    readInitialIdArray(STORAGE_READ_MATERIALS_KEY)
  );
  const [problemStatuses, setProblemStatuses] = useState<Record<string, ProblemStatus>>(() =>
    readInitialMap<ProblemStatus>(STORAGE_PROBLEM_STATUS_KEY)
  );
  const [bookStatuses, setBookStatuses] = useState<Record<string, BookReadStatus>>(() =>
    readInitialMap<BookReadStatus>(STORAGE_BOOK_STATUS_KEY)
  );
  const [bookPageBookmarks, setBookPageBookmarks] = useState<Record<string, number>>(() =>
    readInitialMap<number>(STORAGE_BOOK_PAGE_KEY)
  );

  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);
  const [adminUnlockModalOpen, setAdminUnlockModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage quota errors
    }
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WATCHED_KEY, JSON.stringify(watchedLectureIds));
    } catch {
      // Ignore
    }
  }, [watchedLectureIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_READ_MATERIALS_KEY, JSON.stringify(readMaterialIds));
    } catch {
      // Ignore
    }
  }, [readMaterialIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROBLEM_STATUS_KEY, JSON.stringify(problemStatuses));
    } catch {
      // Ignore
    }
  }, [problemStatuses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BOOK_STATUS_KEY, JSON.stringify(bookStatuses));
    } catch {
      // Ignore
    }
  }, [bookStatuses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BOOK_PAGE_KEY, JSON.stringify(bookPageBookmarks));
    } catch {
      // Ignore
    }
  }, [bookPageBookmarks]);

  const unlockWithCode = (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (normalized === ADMIN_CODE) {
      setRole('admin');
      try {
        sessionStorage.setItem(SESSION_ROLE_KEY, 'admin');
      } catch {
        // Ignore
      }
      setAdminUnlockModalOpen(false);
      return { ok: true, role: 'admin' as AccessRole };
    }
    if (normalized === GUEST_CODE) {
      setRole('guest');
      try {
        sessionStorage.setItem(SESSION_ROLE_KEY, 'guest');
      } catch {
        // Ignore
      }
      return { ok: true, role: 'guest' as AccessRole };
    }
    return {
      ok: false,
      error: 'Invalid passkey.',
    };
  };

  const lockVault = () => {
    setRole('locked');
    setAdminDrawerOpen(false);
    setAdminUnlockModalOpen(false);
    setActiveView('overview');
    try {
      sessionStorage.removeItem(SESSION_ROLE_KEY);
    } catch {
      // Ignore
    }
  };

  const openAdminOrPrompt = () => {
    if (role === 'admin') {
      setAdminDrawerOpen(true);
    } else {
      setAdminUnlockModalOpen(true);
    }
  };

  const addMaterial = (item: Omit<MaterialItem, 'id' | 'createdAt'>): MaterialItem => {
    const created: MaterialItem = {
      ...item,
      id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, materials: [created, ...prev.materials] }));
    return created;
  };

  const addMaterialsBatch = (items: Omit<MaterialItem, 'id' | 'createdAt'>[]): MaterialItem[] => {
    const base = Date.now();
    const created = items.map((item, idx) => ({
      ...item,
      id: `mat-${base + idx}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: base + idx,
    }));
    setData((prev) => ({ ...prev, materials: [...created, ...prev.materials] }));
    return created;
  };

  const removeMaterial = (id: string) => {
    setData((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
    }));
  };

  const toggleMaterialRead = (id: string) => {
    setReadMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addBook = (item: Omit<BookItem, 'id' | 'createdAt'>): BookItem => {
    const created: BookItem = {
      ...item,
      id: `book-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, books: [created, ...prev.books] }));
    return created;
  };

  const addBooksBatch = (items: Omit<BookItem, 'id' | 'createdAt'>[]): BookItem[] => {
    const base = Date.now();
    const created = items.map((item, idx) => ({
      ...item,
      id: `book-${base + idx}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: base + idx,
    }));
    setData((prev) => ({ ...prev, books: [...created, ...prev.books] }));
    return created;
  };

  const removeBook = (id: string) => {
    setData((prev) => ({
      ...prev,
      books: prev.books.filter((b) => b.id !== id),
    }));
  };

  const updateBookNotes = (id: string, notesLatex: string) => {
    setData((prev) => ({
      ...prev,
      books: prev.books.map((b) => (b.id === id ? { ...b, notesLatex } : b)),
    }));
  };

  const getBookStatus = (id: string): BookReadStatus => bookStatuses[id] ?? 'Unread';

  const setBookStatus = (id: string, status: BookReadStatus) => {
    setBookStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const getBookPageBookmark = (id: string): number => bookPageBookmarks[id] ?? 1;

  const setBookPageBookmark = (id: string, page: number) => {
    const safePage = Math.max(1, Math.floor(page) || 1);
    setBookPageBookmarks((prev) => ({ ...prev, [id]: safePage }));
  };

  const addLecture = (item: Omit<LectureItem, 'id' | 'createdAt'>): LectureItem => {
    const created: LectureItem = {
      ...item,
      id: `lec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, lectures: [created, ...prev.lectures] }));
    return created;
  };

  const updateLectureSource = (id: string, videoUrl: string, sourceType: VideoSourceType) => {
    setData((prev) => ({
      ...prev,
      lectures: prev.lectures.map((l) => (l.id === id ? { ...l, videoUrl, sourceType } : l)),
    }));
  };

  const removeLecture = (id: string) => {
    setData((prev) => ({
      ...prev,
      lectures: prev.lectures.filter((l) => l.id !== id),
    }));
  };

  const toggleLectureWatched = (id: string) => {
    setWatchedLectureIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addProblem = (item: Omit<ProblemItem, 'id' | 'createdAt'>): ProblemItem => {
    const created: ProblemItem = {
      ...item,
      id: `prob-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, problems: [created, ...prev.problems] }));
    return created;
  };

  const addProblemsBatch = (items: Omit<ProblemItem, 'id' | 'createdAt'>[]): ProblemItem[] => {
    const base = Date.now();
    const created = items.map((item, idx) => ({
      ...item,
      id: `prob-${base + idx}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: base + idx,
    }));
    setData((prev) => ({ ...prev, problems: [...created, ...prev.problems] }));
    return created;
  };

  const removeProblem = (id: string) => {
    setData((prev) => ({
      ...prev,
      problems: prev.problems.filter((p) => p.id !== id),
    }));
  };

  const getProblemStatus = (id: string): ProblemStatus => problemStatuses[id] ?? 'Unsolved';

  const setProblemStatus = (id: string, status: ProblemStatus) => {
    setProblemStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const addQAPost = (post: Omit<QAPost, 'id' | 'createdAt'>) => {
    const created: QAPost = {
      ...post,
      id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, qaPosts: [created, ...prev.qaPosts] }));
  };

  const removeQAPost = (id: string) => {
    setData((prev) => ({
      ...prev,
      qaPosts: prev.qaPosts.filter((q) => q.id !== id),
    }));
  };

  const exportDataJson = () => JSON.stringify(data, null, 2);

  const importDataJson = (rawJson: string) => {
    try {
      const parsed = JSON.parse(rawJson) as Partial<VaultDataExport>;
      if (!parsed || typeof parsed !== 'object') {
        return { ok: false, message: 'JSON root must be an object.' };
      }
      const nextMaterials = Array.isArray(parsed.materials)
        ? parsed.materials.map((m) => migrateMaterial(m as unknown as Record<string, unknown>))
        : [];
      const nextBooks = Array.isArray(parsed.books)
        ? parsed.books.map((b) => migrateBook(b as unknown as Record<string, unknown>))
        : [];
      const nextLectures = Array.isArray(parsed.lectures)
        ? parsed.lectures.map((l) => migrateLecture(l as unknown as Record<string, unknown>))
        : [];
      const nextProblems = Array.isArray(parsed.problems)
        ? parsed.problems.map((p) => migrateProblem(p as unknown as Record<string, unknown>))
        : [];
      const nextQa = Array.isArray(parsed.qaPosts)
        ? parsed.qaPosts.map((q) => migrateQAPost(q as unknown as Record<string, unknown>))
        : [];

      setData((prev) => {
        const mergeById = <T extends { id: string }>(cur: T[], inc: T[]) => {
          const map = new Map<string, T>();
          cur.forEach((x) => map.set(x.id, x));
          inc.forEach((x) => map.set(x.id, x));
          return Array.from(map.values());
        };
        return {
          materials: mergeById(prev.materials, nextMaterials),
          books: mergeById(prev.books, nextBooks),
          lectures: mergeById(prev.lectures, nextLectures),
          problems: mergeById(prev.problems, nextProblems),
          qaPosts: mergeById(prev.qaPosts, nextQa),
        };
      });

      return {
        ok: true,
        message: `Ingested: ${nextMaterials.length} Compendium, ${nextBooks.length} Books/Notes, ${nextLectures.length} Lectures, ${nextProblems.length} Problems, ${nextQa.length} Notes.`,
      };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : 'Malformed JSON.',
      };
    }
  };

  return (
    <VaultContext.Provider
      value={{
        role,
        unlockWithCode,
        lockVault,
        adminUnlockModalOpen,
        setAdminUnlockModalOpen,
        activeView,
        setActiveView,
        materials: data.materials,
        books: data.books,
        lectures: data.lectures,
        problems: data.problems,
        qaPosts: data.qaPosts,
        watchedLectureIds,
        readMaterialIds,
        problemStatuses,
        bookStatuses,
        bookPageBookmarks,
        adminDrawerOpen,
        setAdminDrawerOpen,
        openAdminOrPrompt,
        addMaterial,
        addMaterialsBatch,
        removeMaterial,
        toggleMaterialRead,
        addBook,
        addBooksBatch,
        removeBook,
        updateBookNotes,
        getBookStatus,
        setBookStatus,
        getBookPageBookmark,
        setBookPageBookmark,
        addLecture,
        updateLectureSource,
        removeLecture,
        toggleLectureWatched,
        addProblem,
        addProblemsBatch,
        removeProblem,
        getProblemStatus,
        setProblemStatus,
        addQAPost,
        removeQAPost,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export function useVaultStore(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) {
    throw new Error('useVaultStore must be used inside VaultProvider');
  }
  return ctx;
}
