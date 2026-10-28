import React from 'react';
import { Volume2, VolumeX, HelpCircle, Download, Upload, ShieldCheck, Home, Radio } from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenGuide: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNavigateHome: () => void;
  onOpenParentTracker: () => void;
  isHome: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenGuide,
  onExportData,
  onImportData,
  onNavigateHome,
  onOpenParentTracker,
  isHome,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="bg-[#800020] text-white shadow-md border-b-2 border-[#D4AF37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & School Branding */}
          <div className="flex items-center space-x-3.5 cursor-pointer" onClick={onNavigateHome}>
            {/* Custom IVS Emblem */}
            <div className="relative flex-shrink-0 w-11 h-11 rounded-lg bg-white/10 border border-[#D4AF37]/60 flex items-center justify-center p-1.5 shadow-inner backdrop-blur-sm">
              <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                {/* Shield background */}
                <path
                  d="M32 4L10 13V30C10 44.5 19.5 57 32 60C44.5 57 54 44.5 54 30V13L32 4Z"
                  fill="#800020"
                  stroke="#D4AF37"
                  strokeWidth="2.5"
                />
                {/* Book pages */}
                <path
                  d="M20 38C24 35 28 35 32 37C36 35 40 35 44 38V22C40 19 36 19 32 21C28 19 24 19 20 22V38Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M32 21V37"
                  stroke="#800020"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Star / Torch */}
                <circle cx="32" cy="14" r="2.5" fill="#D4AF37" />
              </svg>
              <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#800020] text-[9px] font-extrabold px-1 rounded-sm shadow">
                IVS
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Iqra Virtual School
                </span>
                <span className="text-white/40 text-xs">•</span>
                <span className="text-xs text-white/80 font-medium">Session Portal</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                IVS Parents Meeting <span className="font-light text-white/90">Management</span>
              </h1>
            </div>
          </div>

          {/* Quick Actions & Utility controls */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Live Parent Token Tracker Button */}
            <button
              onClick={onOpenParentTracker}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#D4AF37] hover:bg-[#c49f2b] text-[#800020] font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Parent Live Token Tracker (Check token status & join Zoom)"
            >
              <Radio className="w-3.5 h-3.5 text-[#800020] animate-pulse" />
              <span>Parent Tracker</span>
            </button>

            {!isHome && (
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 transition-colors"
                title="Go to main dashboard"
              >
                <Home className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}

            {/* Sound Chime Toggle */}
            <button
              onClick={onToggleSound}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-colors ${
                soundEnabled
                  ? 'bg-emerald-950/40 border-emerald-400/40 text-emerald-200 hover:bg-emerald-900/50'
                  : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
              }`}
              title={soundEnabled ? 'Calling chime enabled' : 'Calling chime muted'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Chime: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Chime: OFF</span>
                </>
              )}
            </button>

            {/* Staff User Guide */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium border border-[#D4AF37]/40 transition-colors"
              title="Staff instructions for running parents meeting"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Staff Guide</span>
            </button>

            {/* Export Backup */}
            <button
              onClick={onExportData}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/90 transition-colors border border-white/15"
              title="Backup current meeting data to JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Backup</span>
            </button>

            {/* Import Data */}
            <label
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/90 transition-colors border border-white/15 cursor-pointer"
              title="Restore meeting data from JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Restore</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={onImportData}
              />
            </label>

            {/* Offline/Local indicator */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-black/20 text-stone-200 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Offline Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
