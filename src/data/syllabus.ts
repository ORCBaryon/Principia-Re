import {
  BookCategory,
  BookReadStatus,
  ConceptTier,
  MarkingScheme,
  PhysicsBranch,
  ProblemSource,
  ProblemStatus,
  QuestionFormat,
} from '../types/physics';

export const SYLLABUS_BRANCHES: PhysicsBranch[] = [
  'Mechanics',
  'Waves & Oscillations',
  'Thermodynamics & KTG',
  'Electrodynamics',
  'Optics',
  'Modern Physics',
  'Experimental & Mathematical Physics',
];

export const BRANCH_SUBTOPICS: Record<PhysicsBranch, string[]> = {
  Mechanics: [
    'Units, Dimensions & Error Analysis',
    'Kinematics & Relative Motion',
    "Newton's Laws & Friction",
    'Circular Motion',
    'Work, Power & Energy',
    'Center of Mass, Momentum & Collisions',
    'Rotational Dynamics & IAOR',
    'Gravitation & Orbital Mechanics',
    'Fluid Mechanics',
    'Elasticity & Surface Tension',
  ],
  'Waves & Oscillations': [
    'Simple Harmonic Motion',
    'Damped & Forced Oscillations',
    'String Waves & Superposition',
    'Sound Waves',
    'Doppler & Organ Pipes',
  ],
  'Thermodynamics & KTG': [
    'Thermal Expansion & Calorimetry',
    'Kinetic Theory of Gases',
    'First Law & Thermodynamic Processes',
    'Second Law, Carnot & Entropy',
    'Heat Transfer (Conduction & Radiation)',
  ],
  Electrodynamics: [
    "Electrostatics & Gauss's Law",
    'Conductors & Capacitors',
    'Current Electricity & DC Circuits',
    'Magnetostatics & Biot-Savart / Ampere',
    'Electromagnetic Induction (EMI)',
    'Alternating Current (AC) & Phasors',
    'Electromagnetic Waves',
  ],
  Optics: [
    'Reflection & Plane/Spherical Mirrors',
    'Refraction, Prisms & Lenses',
    'Optical Instruments',
    'Wave Optics, Interference (YDSE)',
    'Diffraction & Polarization',
  ],
  'Modern Physics': [
    'Photoelectric Effect & Matter Waves',
    'Bohr Model & Atomic Spectra',
    'X-Rays',
    'Nuclear Physics & Radioactivity',
    'Semiconductors & Logic Gates',
  ],
  'Experimental & Mathematical Physics': [
    'Vernier, Screw Gauge & Lab Experiments',
    'Calculus & Differential Equations for Physics',
    'Dimensional & Symmetry Tricks',
  ],
};

export const PROBLEM_SOURCES: ProblemSource[] = [
  'JEE Main PYQ',
  'JEE Advanced PYQ',
  'I.E. Irodov',
  'S.S. Krotov',
  'Pathfinder',
  'Halliday Resnick Krane',
  'H.C. Verma',
  'INPhO / NSEP',
  'IPhO / APhO',
  'Coaching Sheet / Custom',
];

export const QUESTION_FORMATS: QuestionFormat[] = [
  'Single Correct MCQ',
  'Multiple Correct (One or More)',
  'Integer / Numerical',
  'Matrix Match',
  'Comprehension / Paragraph',
  'Subjective / Olympiad Proof',
];

export const MARKING_SCHEMES: MarkingScheme[] = [
  '+4 / -1 (JEE Main / Adv Single)',
  '+3 / -1 (JEE Adv Single)',
  '+4 / -2 Partial (JEE Adv Multi)',
  '+4 / 0 (Non-Negative Integer)',
  '+3 / 0 (Numerical)',
  'Subjective (Olympiad)',
];

export const CONCEPT_TIERS: ConceptTier[] = [
  'Tier 1: Foundation',
  'Tier 2: JEE Main+',
  'Tier 3: JEE Advanced',
  'Tier 4: INPhO / IPhO',
];

export const PROBLEM_STATUSES: ProblemStatus[] = [
  'Unsolved',
  'Solved',
  'Bookmarked',
  'Needs Revision',
];

export const SOURCE_TAG: Record<ProblemSource, string> = {
  'JEE Main PYQ': '[JEE MAIN]',
  'JEE Advanced PYQ': '[JEE ADV]',
  'I.E. Irodov': '[IRODOV]',
  'S.S. Krotov': '[KROTOV]',
  Pathfinder: '[PATHFINDER]',
  'Halliday Resnick Krane': '[HRK]',
  'H.C. Verma': '[HCV]',
  'INPhO / NSEP': '[INPhO]',
  'IPhO / APhO': '[IPhO]',
  'Coaching Sheet / Custom': '[SHEET]',
};

export const FORMAT_TAG: Record<QuestionFormat, string> = {
  'Single Correct MCQ': '[SCQ]',
  'Multiple Correct (One or More)': '[MCQ+]',
  'Integer / Numerical': '[INT]',
  'Matrix Match': '[MATRIX]',
  'Comprehension / Paragraph': '[PARA]',
  'Subjective / Olympiad Proof': '[PROOF]',
};

export const MARKING_TAG: Record<MarkingScheme, string> = {
  '+4 / -1 (JEE Main / Adv Single)': '[+4/-1]',
  '+3 / -1 (JEE Adv Single)': '[+3/-1]',
  '+4 / -2 Partial (JEE Adv Multi)': '[+4/-2]',
  '+4 / 0 (Non-Negative Integer)': '[+4/0]',
  '+3 / 0 (Numerical)': '[+3/0]',
  'Subjective (Olympiad)': '[SUBJ]',
};

export const TIER_TAG: Record<ConceptTier, string> = {
  'Tier 1: Foundation': '[T1]',
  'Tier 2: JEE Main+': '[T2]',
  'Tier 3: JEE Advanced': '[T3]',
  'Tier 4: INPhO / IPhO': '[T4]',
};

export const TIER_RANK: Record<ConceptTier, number> = {
  'Tier 1: Foundation': 1,
  'Tier 2: JEE Main+': 2,
  'Tier 3: JEE Advanced': 3,
  'Tier 4: INPhO / IPhO': 4,
};

export const BRANCH_CODE: Record<PhysicsBranch, string> = {
  Mechanics: 'MECH',
  'Waves & Oscillations': 'WAVE',
  'Thermodynamics & KTG': 'THERM',
  Electrodynamics: 'ELEC',
  Optics: 'OPT',
  'Modern Physics': 'MOD',
  'Experimental & Mathematical Physics': 'EXPMATH',
};

export const BOOK_CATEGORIES: BookCategory[] = [
  'Full Textbook',
  'Problem Book',
  'Lecture Notes',
  'Formula Handbook',
  'Olympiad Compendium',
];

export const BOOK_CATEGORY_TAG: Record<BookCategory, string> = {
  'Full Textbook': '[TEXT]',
  'Problem Book': '[PBOOK]',
  'Lecture Notes': '[NOTES]',
  'Formula Handbook': '[HNDBK]',
  'Olympiad Compendium': '[OLYMP]',
};

export const BOOK_READ_STATUSES: BookReadStatus[] = ['Unread', 'Reading', 'Completed'];

export function normalizeBranch(input?: string): PhysicsBranch {
  if (!input) return 'Mechanics';
  if ((SYLLABUS_BRANCHES as string[]).includes(input)) {
    return input as PhysicsBranch;
  }
  const lower = input.toLowerCase();
  if (lower.includes('wave')) return 'Waves & Oscillations';
  if (lower.includes('thermo') || lower.includes('ktg')) return 'Thermodynamics & KTG';
  if (lower.includes('electro')) return 'Electrodynamics';
  if (lower.includes('optic')) return 'Optics';
  if (lower.includes('modern')) return 'Modern Physics';
  if (lower.includes('exp') || lower.includes('math')) {
    return 'Experimental & Mathematical Physics';
  }
  return 'Mechanics';
}
