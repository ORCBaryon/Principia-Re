export type PhysicsBranch =
  | 'Mechanics'
  | 'Waves & Oscillations'
  | 'Thermodynamics & KTG'
  | 'Electrodynamics'
  | 'Optics'
  | 'Modern Physics'
  | 'Experimental & Mathematical Physics';

export type AccessRole = 'locked' | 'guest' | 'admin';

export type VaultModuleView = 'overview' | 'compendium' | 'books' | 'lectures' | 'problems';

export type VideoSourceType = 'mp4' | 'youtube' | 'external';

export type ProblemSource =
  | 'JEE Main PYQ'
  | 'JEE Advanced PYQ'
  | 'I.E. Irodov'
  | 'S.S. Krotov'
  | 'Pathfinder'
  | 'Halliday Resnick Krane'
  | 'H.C. Verma'
  | 'INPhO / NSEP'
  | 'IPhO / APhO'
  | 'Coaching Sheet / Custom';

export type QuestionFormat =
  | 'Single Correct MCQ'
  | 'Multiple Correct (One or More)'
  | 'Integer / Numerical'
  | 'Matrix Match'
  | 'Comprehension / Paragraph'
  | 'Subjective / Olympiad Proof';

export type MarkingScheme =
  | '+4 / -1 (JEE Main / Adv Single)'
  | '+3 / -1 (JEE Adv Single)'
  | '+4 / -2 Partial (JEE Adv Multi)'
  | '+4 / 0 (Non-Negative Integer)'
  | '+3 / 0 (Numerical)'
  | 'Subjective (Olympiad)';

export type ConceptTier =
  | 'Tier 1: Foundation'
  | 'Tier 2: JEE Main+'
  | 'Tier 3: JEE Advanced'
  | 'Tier 4: INPhO / IPhO';

export type ProblemStatus = 'Unsolved' | 'Solved' | 'Bookmarked' | 'Needs Revision';

export type BookCategory =
  | 'Full Textbook'
  | 'Problem Book'
  | 'Lecture Notes'
  | 'Formula Handbook'
  | 'Olympiad Compendium';

export type BookBranchScope = 'All Branches (Complete Text)' | PhysicsBranch;

export type BookReadStatus = 'Unread' | 'Reading' | 'Completed';

export type SortOrder = 'newest' | 'tier-asc' | 'tier-desc' | 'source';

export interface MaterialItem {
  id: string;
  branch: PhysicsBranch;
  subtopic: string;
  source: ProblemSource;
  tier: ConceptTier;
  title: string;
  formulaSheetLatex: string;
  pdfUrl?: string;
  pdfFileName?: string;
  createdAt: number;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  edition?: string;
  category: BookCategory;
  branchScope: BookBranchScope;
  tier: ConceptTier;
  totalPages?: number;
  pdfUrl?: string;
  pdfFileName?: string;
  notesLatex?: string;
  createdAt: number;
}

export interface LectureBookmark {
  timeSeconds: number;
  label: string;
}

export interface LectureItem {
  id: string;
  branch: PhysicsBranch;
  subtopic: string;
  source: ProblemSource;
  tier: ConceptTier;
  title: string;
  sourceType: VideoSourceType;
  videoUrl: string;
  bookmarks: LectureBookmark[];
  notesLatex?: string;
  createdAt: number;
}

export interface ProblemItem {
  id: string;
  branch: PhysicsBranch;
  subtopic: string;
  source: ProblemSource;
  format: QuestionFormat;
  markingScheme: MarkingScheme;
  tier: ConceptTier;
  title: string;
  stemLatex: string;
  hintLatex: string;
  solutionLatex: string;
  createdAt: number;
}

export interface QAPost {
  id: string;
  problemId?: string;
  branch: PhysicsBranch;
  author: string;
  bodyLatex: string;
  createdAt: number;
}

export interface VaultDataExport {
  materials: MaterialItem[];
  books: BookItem[];
  lectures: LectureItem[];
  problems: ProblemItem[];
  qaPosts: QAPost[];
}
