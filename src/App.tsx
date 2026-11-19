/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AdminUnlockModal, ScholarAccessGate } from './components/auth/ScholarAccessGate';
import { BooksLibrary } from './components/books/BooksLibrary';
import { CompendiumVault } from './components/compendium/CompendiumVault';
import { HeroOverview } from './components/landing/HeroOverview';
import { TopBar } from './components/layout/TopBar';
import { LectureTheatre } from './components/lectures/LectureTheatre';
import { ProblemBankQA } from './components/problems/ProblemBankQA';
import { AdminContentDrawer } from './components/studio/AdminContentDrawer';
import { useVaultStore, VaultProvider } from './store/useVaultStore';
import { PhysicsBranch, VaultModuleView } from './types/physics';

const VaultShell: React.FC = () => {
  const { role, activeView, setActiveView } = useVaultStore();
  const [branchShortcut, setBranchShortcut] = useState<'All' | PhysicsBranch>('All');

  if (role === 'locked') {
    return <ScholarAccessGate />;
  }

  const handleSelectBranchView = (view: VaultModuleView, branch: PhysicsBranch) => {
    setBranchShortcut(branch);
    setActiveView(view);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#14181F] flex flex-col">
      <TopBar />

      <div className="flex-1">
        {activeView === 'overview' && (
          <HeroOverview onSelectBranchView={handleSelectBranchView} />
        )}
        {activeView === 'compendium' && (
          <CompendiumVault initialBranch={branchShortcut} />
        )}
        {activeView === 'books' && (
          <BooksLibrary initialBranch={branchShortcut} />
        )}
        {activeView === 'lectures' && (
          <LectureTheatre initialBranch={branchShortcut} />
        )}
        {activeView === 'problems' && (
          <ProblemBankQA initialBranch={branchShortcut} />
        )}
      </div>

      <footer className="border-t border-[#14181F]/15 bg-[#F3EFE8] py-4">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 font-math text-[11px] text-[#64748B]">
          <span className="font-semibold text-[#14181F]">PRINCIPIA ARCHIVE</span>
          <span>
            ARCHIVE // JEE ADV &amp; INPhO · MODE: {role === 'admin' ? 'ADMIN' : 'SCHOLAR'}
          </span>
        </div>
      </footer>

      <AdminContentDrawer />
      <AdminUnlockModal />
    </div>
  );
};

export default function App() {
  return (
    <VaultProvider>
      <VaultShell />
    </VaultProvider>
  );
}
