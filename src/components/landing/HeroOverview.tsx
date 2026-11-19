import React, { useState } from 'react';
import { ArrowRight, BookMarked, BookOpen, FileText, Play, Plus } from 'lucide-react';
import {
  BRANCH_CODE,
  BRANCH_SUBTOPICS,
  SYLLABUS_BRANCHES,
} from '../../data/syllabus';
import { useVaultStore } from '../../store/useVaultStore';
import { PhysicsBranch, VaultModuleView } from '../../types/physics';

const HERO_FALLBACK_IMAGE = '/src/assets/images/hero_chalkboard_lecture_1795093216844.jpg';

interface HeroOverviewProps {
  onSelectBranchView?: (view: VaultModuleView, branch: PhysicsBranch) => void;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({ onSelectBranchView }) => {
  const {
    role,
    materials,
    books,
    lectures,
    problems,
    watchedLectureIds,
    setActiveView,
    openAdminOrPrompt,
  } = useVaultStore();

  const [videoFailed, setVideoFailed] = useState(false);

  const totalSubtopics = SYLLABUS_BRANCHES.reduce(
    (sum, b) => sum + BRANCH_SUBTOPICS[b].length,
    0
  );

  const jumpToModule = (view: VaultModuleView, branch?: PhysicsBranch) => {
    if (branch && onSelectBranchView) {
      onSelectBranchView(view, branch);
    } else {
      setActiveView(view);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#14181F]">
      {/* Chalkboard Hero Banner */}
      <section className="relative overflow-hidden bg-[#14181F] text-[#FAF8F5] border-b border-[#14181F]/20">
        <div className="absolute inset-0">
          {!videoFailed ? (
            <video
              className="h-full w-full object-cover opacity-45"
              src="/feynman-bg.mp4"
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoFailed(true)}
            />
          ) : (
            <img
              src={HERO_FALLBACK_IMAGE}
              alt="Physics lecture hall chalkboard with analytical mechanics and field equations"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-40"
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#14181F] via-[#14181F]/75 to-[#14181F]/60"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#14181F]/95 via-[#14181F]/65 to-transparent"
            aria-hidden="true"
          />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-6 py-16 md:py-22">
          <div className="max-w-3xl">
            <p className="font-math text-[11px] tracking-widest text-[#FAF8F5]/75">
              ARCHIVE // JEE ADV &amp; INPhO · SESSION: {role === 'admin' ? 'ADMIN' : 'SCHOLAR'}
            </p>

            <h1 className="font-editorial mt-3 text-3xl font-semibold leading-[1.12] tracking-tight text-[#FAF8F5] sm:text-5xl [text-wrap:balance]">
              Theoretical Physics Compendium &amp; Olympiad Problem Archive
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#FAF8F5]/80">
              {SYLLABUS_BRANCHES.length} branches · {totalSubtopics} syllabus units · KaTeX
              derivation sheets, MP4/YouTube lecture reel, and multi-format problem index.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('problems')}
                className="inline-flex items-center gap-2 bg-[#FAF8F5] px-4 py-2 text-xs font-semibold tracking-wide text-[#14181F] cursor-pointer transition-colors hover:bg-white whitespace-nowrap shrink-0"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>PROBLEM ARCHIVE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('compendium')}
                className="inline-flex items-center gap-2 border border-white/25 bg-[#14181F]/70 px-4 py-2 text-xs font-medium tracking-wide text-[#FAF8F5] cursor-pointer transition-colors hover:bg-white/10 whitespace-nowrap shrink-0"
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                <span>DERIVATION COMPENDIUM</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('books')}
                className="inline-flex items-center gap-2 border border-white/25 bg-[#14181F]/70 px-4 py-2 text-xs font-medium tracking-wide text-[#FAF8F5] cursor-pointer transition-colors hover:bg-white/10 whitespace-nowrap shrink-0"
              >
                <BookMarked className="h-3.5 w-3.5" aria-hidden="true" />
                <span>BOOKS &amp; NOTES</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('lectures')}
                className="inline-flex items-center gap-2 border border-white/25 bg-[#14181F]/70 px-4 py-2 text-xs font-medium tracking-wide text-[#FAF8F5] cursor-pointer transition-colors hover:bg-white/10 whitespace-nowrap shrink-0"
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>LECTURE REEL</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dense Archive Telemetry Strip */}
      <section className="border-b border-[#14181F]/15 bg-[#F3EFE8]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-y sm:divide-y-0 sm:grid-cols-5 sm:divide-x divide-[#14181F]/15">
          <div className="px-5 py-3.5">
            <p className="font-math text-[10px] tracking-wider text-[#64748B]">
              DERIVATION COMPENDIUM
            </p>
            <p className="font-math mt-1 text-lg font-semibold text-[#14181F]">
              {materials.length}{' '}
              <span className="text-xs font-normal text-[#475569]">SHEETS / PDFs</span>
            </p>
          </div>

          <div className="px-5 py-3.5">
            <p className="font-math text-[10px] tracking-wider text-[#64748B]">
              BOOKS &amp; NOTES
            </p>
            <p className="font-math mt-1 text-lg font-semibold text-[#14181F]">
              {books.length}{' '}
              <span className="text-xs font-normal text-[#475569]">VOLUMES</span>
            </p>
          </div>

          <div className="px-5 py-3.5">
            <p className="font-math text-[10px] tracking-wider text-[#64748B]">LECTURE REEL</p>
            <p className="font-math mt-1 text-lg font-semibold text-[#14181F]">
              {watchedLectureIds.length}/{lectures.length}{' '}
              <span className="text-xs font-normal text-[#475569]">WATCHED</span>
            </p>
          </div>

          <div className="px-5 py-3.5">
            <p className="font-math text-[10px] tracking-wider text-[#64748B]">PROBLEM ARCHIVE</p>
            <p className="font-math mt-1 text-lg font-semibold text-[#14181F]">
              {problems.length}{' '}
              <span className="text-xs font-normal text-[#475569]">INDEXED ITEMS</span>
            </p>
          </div>

          <div className="px-5 py-3.5 flex items-center justify-between gap-3">
            <div>
              <p className="font-math text-[10px] tracking-wider text-[#64748B]">AUTHORING</p>
              <p className="font-math mt-1 text-xs font-semibold text-[#14181F]">
                {role === 'admin' ? '[ADMIN UNLOCKED]' : '[READ ONLY]'}
              </p>
            </div>
            <button
              type="button"
              onClick={openAdminOrPrompt}
              className="inline-flex items-center gap-1.5 bg-[#1E3A5F] px-3 py-1.5 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49] whitespace-nowrap shrink-0"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              <span>{role === 'admin' ? 'INGEST' : 'ADMIN'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* High-Density 7-Branch Curriculum Index */}
      <main className="mx-auto max-w-[1440px] px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#14181F]/15 pb-3">
          <div>
            <p className="font-math text-[11px] tracking-wider text-[#1E3A5F]">CURRICULUM INDEX</p>
            <h2 className="font-editorial mt-0.5 text-2xl font-semibold text-[#14181F]">
              Syllabus Taxonomy ({SYLLABUS_BRANCHES.length} Branches · {totalSubtopics} Subtopics)
            </h2>
          </div>

          <div className="flex items-center gap-2 font-math text-[11px] text-[#475569]">
            <span>[TIER 1–4]</span>
            <span>·</span>
            <span>[IRODOV / KROTOV / PATHFINDER / PYQ]</span>
          </div>
        </div>

        {/* Dense Tabular Curriculum Matrix */}
        <div className="border border-[#14181F]/15 bg-white divide-y divide-[#14181F]/15">
          {SYLLABUS_BRANCHES.map((branch, idx) => {
            const subtopics = BRANCH_SUBTOPICS[branch];
            const matCount = materials.filter((m) => m.branch === branch).length;
            const lecCount = lectures.filter((l) => l.branch === branch).length;
            const probCount = problems.filter((p) => p.branch === branch).length;

            return (
              <div
                key={branch}
                className="grid gap-4 p-4 lg:grid-cols-[260px_1fr_auto] lg:items-start"
              >
                <div>
                  <div className="flex items-center gap-2 font-math text-[11px] text-[#64748B]">
                    <span className="font-semibold text-[#1E3A5F]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span>[{BRANCH_CODE[branch]}]</span>
                    <span>· {subtopics.length} UNITS</span>
                  </div>
                  <h3 className="font-editorial mt-1 text-lg font-semibold text-[#14181F]">
                    {branch}
                  </h3>
                  <div className="mt-1.5 font-math text-[11px] text-[#475569]">
                    {matCount} Notes · {lecCount} Reels · {probCount} Problems
                  </div>
                </div>

                {/* Dense Subtopic Index */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#475569] leading-relaxed">
                  {subtopics.map((sub, sIdx) => (
                    <span key={sub} className="inline-flex items-baseline gap-1">
                      <span className="font-math text-[10px] text-[#64748B]">
                        {idx + 1}.{sIdx + 1}
                      </span>
                      <span className="text-[#14181F]">{sub}</span>
                      {sIdx < subtopics.length - 1 && (
                        <span className="ml-2 text-[#14181F]/20">/</span>
                      )}
                    </span>
                  ))}
                </div>

                {/* Direct Module Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => jumpToModule('compendium', branch)}
                    className="border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 font-math text-[11px] font-medium text-[#14181F] cursor-pointer hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
                  >
                    COMPENDIUM
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToModule('lectures', branch)}
                    className="border border-[#14181F]/15 bg-[#FAF8F5] px-2.5 py-1.5 font-math text-[11px] font-medium text-[#14181F] cursor-pointer hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
                  >
                    REEL
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToModule('problems', branch)}
                    className="inline-flex items-center gap-1 bg-[#1E3A5F] px-2.5 py-1.5 font-math text-[11px] font-semibold text-white cursor-pointer hover:bg-[#162C49]"
                  >
                    <span>PROBLEMS</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
