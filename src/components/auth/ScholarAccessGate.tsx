import React, { useState } from 'react';
import { ArrowRight, KeyRound, Lock, X } from 'lucide-react';
import { useVaultStore } from '../../store/useVaultStore';

export const ScholarAccessGate: React.FC = () => {
  const { unlockWithCode } = useVaultStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = unlockWithCode(code);
    if (!res.ok) {
      setError(res.error ?? 'Invalid passkey.');
    } else {
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-[#14181F] text-[#FAF8F5] flex flex-col justify-between px-6 py-8">
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between border-b border-white/10 pb-4">
        <span className="font-editorial text-lg font-semibold tracking-tight text-[#FAF8F5]">
          Principia Archive
        </span>
        <span className="font-math text-[11px] tracking-wider text-[#FAF8F5]/60">
          ARCHIVE // JEE ADV &amp; INPhO
        </span>
      </header>

      <main className="mx-auto w-full max-w-md my-auto py-10">
        <div className="border border-white/15 bg-[#FAF8F5] p-7 text-[#14181F]">
          <div className="flex items-center justify-between border-b border-[#14181F]/10 pb-3">
            <span className="font-math text-[11px] font-medium tracking-wider text-[#1E3A5F]">
              ACCESS GATE // SESSION LOCK
            </span>
            <Lock className="h-3.5 w-3.5 text-[#1E3A5F]" aria-hidden="true" />
          </div>

          <h1 className="font-editorial mt-4 text-2xl font-semibold text-[#14181F]">
            Scholar Authentication
          </h1>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="invite-code-input"
                className="font-math block text-[11px] font-semibold tracking-wider text-[#475569]"
              >
                INVITE / ADMIN PASSKEY
              </label>
              <div className="relative mt-1.5">
                <KeyRound
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]"
                  aria-hidden="true"
                />
                <input
                  id="invite-code-input"
                  type="password"
                  autoFocus
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter passkey"
                  className="font-math w-full border border-[#14181F]/20 bg-white py-2 pl-9 pr-3 text-xs tracking-wider text-[#14181F] placeholder:text-[#64748B] focus:border-[#1E3A5F] focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="font-math text-[11px] font-medium text-[#991B1B]" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 bg-[#1E3A5F] px-4 py-2.5 text-xs font-semibold tracking-wide text-white cursor-pointer hover:bg-[#162C49] transition-colors"
            >
              <span>UNLOCK ARCHIVE</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between border-t border-[#14181F]/10 pt-3 font-math text-[11px] text-[#64748B]">
            <span>SESSION: LOCAL</span>
            <span>
              GUEST CODE: <strong className="text-[#14181F]">PHYSICS26</strong>
            </span>
          </div>
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-[1440px] items-center justify-between border-t border-white/10 pt-4 font-math text-[11px] text-[#FAF8F5]/50">
        <span>MECHANICS · WAVES · THERMODYNAMICS · ELECTRODYNAMICS · OPTICS · MODERN</span>
        <span>KaTeX // DETERMINISTIC</span>
      </footer>
    </div>
  );
};

export const AdminUnlockModal: React.FC = () => {
  const { adminUnlockModalOpen, setAdminUnlockModalOpen, unlockWithCode } = useVaultStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!adminUnlockModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = unlockWithCode(code);
    if (!res.ok || res.role !== 'admin') {
      setError('Invalid administrator passkey.');
    } else {
      setError('');
      setCode('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#14181F]/65 px-4 backdrop-blur-xs"
      onClick={() => setAdminUnlockModalOpen(false)}
    >
      <div
        className="w-full max-w-sm border border-[#14181F]/20 bg-[#FAF8F5] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#14181F]/15 pb-3">
          <h2 className="font-math text-xs font-semibold tracking-wider text-[#14181F]">
            ADMIN AUTHORIZATION
          </h2>
          <button
            type="button"
            onClick={() => setAdminUnlockModalOpen(false)}
            aria-label="Close modal"
            className="p-1 text-[#64748B] hover:text-[#14181F] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="font-math block text-[11px] font-semibold text-[#475569]">
            ADMIN PASSKEY
          </label>
          <input
            type="password"
            autoFocus
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError('');
            }}
            placeholder="Admin code"
            className="font-math w-full border border-[#14181F]/20 bg-white px-3 py-2 text-xs text-[#14181F] focus:border-[#1E3A5F] focus:outline-none"
          />

          {error && <p className="font-math text-[11px] font-medium text-[#991B1B]">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#1E3A5F] px-4 py-2 text-xs font-semibold tracking-wide text-white cursor-pointer hover:bg-[#162C49]"
          >
            ELEVATE SESSION
          </button>
        </form>
      </div>
    </div>
  );
};
