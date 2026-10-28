import React, { useState, useEffect } from 'react';
import { WaitingRoom, DepartmentRoom } from '../types';
import { 
  ArrowLeft, 
  Tv, 
  Maximize2, 
  Minimize2, 
  Video, 
  ExternalLink, 
  Users, 
  Volume2, 
  VolumeX,
  Layers,
  Sparkles
} from 'lucide-react';

interface ParentDisplayViewProps {
  waitingRooms: WaitingRoom[];
  selectedWaitingRoomId?: string | null;
  selectedDepartmentId?: string | null;
  onExit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onCallTokenChime: () => void;
}

export const ParentDisplayView: React.FC<ParentDisplayViewProps> = ({
  waitingRooms,
  selectedWaitingRoomId,
  selectedDepartmentId,
  onExit,
  soundEnabled,
  onToggleSound,
  onCallTokenChime,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeWrFilter, setActiveWrFilter] = useState<string>(selectedWaitingRoomId || 'all');

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Determine departments to display
  let departmentsToDisplay: { roomName: string; department: DepartmentRoom }[] = [];

  if (selectedDepartmentId) {
    for (const wr of waitingRooms) {
      const found = wr.departments.find((d) => d.id === selectedDepartmentId);
      if (found) {
        departmentsToDisplay = [{ roomName: wr.name, department: found }];
        break;
      }
    }
  } else if (activeWrFilter !== 'all') {
    const wr = waitingRooms.find((r) => r.id === activeWrFilter);
    if (wr) {
      departmentsToDisplay = wr.departments.map((d) => ({
        roomName: wr.name,
        department: d,
      }));
    }
  } else {
    // All departments across all rooms
    waitingRooms.forEach((wr) => {
      wr.departments.forEach((dept) => {
        departmentsToDisplay.push({ roomName: wr.name, department: dept });
      });
    });
  }

  return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col font-sans select-none">
      {/* Top TV Header Bar */}
      <header className="bg-[#800020] border-b-4 border-[#D4AF37] px-4 sm:px-8 py-3.5 shadow-xl flex items-center justify-between flex-wrap gap-3">
        {/* Logo and title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-white/10 border border-[#D4AF37] flex items-center justify-center p-1.5 shadow-md">
            <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
              <path
                d="M32 4L10 13V30C10 44.5 19.5 57 32 60C44.5 57 54 44.5 54 30V13L32 4Z"
                fill="#800020"
                stroke="#D4AF37"
                strokeWidth="2.5"
              />
              <path
                d="M20 38C24 35 28 35 32 37C36 35 40 35 44 38V22C40 19 36 19 32 21C28 19 24 19 20 22V38Z"
                fill="#FFFFFF"
              />
              <circle cx="32" cy="14" r="2.5" fill="#D4AF37" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold">
                Iqra Virtual School
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs text-white/80">Parents Consultation Meeting</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">
              LIVE QUEUE DISPLAY MONITOR
            </h1>
          </div>
        </div>

        {/* Live Clock & Controls */}
        <div className="flex items-center space-x-3">
          {/* Waiting Room filter switch if not locked to single department */}
          {!selectedDepartmentId && waitingRooms.length > 1 && (
            <div className="hidden sm:flex items-center space-x-1 bg-black/30 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setActiveWrFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors font-semibold ${
                  activeWrFilter === 'all'
                    ? 'bg-[#D4AF37] text-[#800020]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                All Rooms
              </button>
              {waitingRooms.map((wr) => (
                <button
                  key={wr.id}
                  onClick={() => setActiveWrFilter(wr.id)}
                  className={`px-2.5 py-1 rounded transition-colors font-semibold ${
                    activeWrFilter === wr.id
                      ? 'bg-[#D4AF37] text-[#800020]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {wr.name}
                </button>
              ))}
            </div>
          )}

          {/* Clock Display */}
          <div className="bg-black/40 border border-white/15 px-3 py-1.5 rounded-lg text-right font-mono text-sm sm:text-base text-[#D4AF37] font-bold shadow-inner">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white border border-white/20 transition-colors cursor-pointer"
            title={soundEnabled ? 'Chime sound is active' : 'Chime is muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#D4AF37]" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/50" />
            )}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white border border-white/20 transition-colors cursor-pointer hidden md:block"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit / Return to Admin Button */}
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#800020] hover:bg-stone-100 font-bold text-xs sm:text-sm rounded-lg shadow transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#800020]" />
            <span>Admin Console</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {departmentsToDisplay.length === 0 ? (
          <div className="bg-stone-800/80 rounded-2xl border border-stone-700 p-12 text-center my-12">
            <Tv className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white">No Department Desks to Display</h2>
            <p className="text-stone-400 text-sm mt-1 max-w-md mx-auto">
              Please create waiting rooms and department rooms in the Admin Console.
            </p>
            <button
              onClick={onExit}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#800020] hover:bg-[#66001a] text-white font-bold text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin Console</span>
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              departmentsToDisplay.length === 1
                ? 'grid-cols-1 max-w-4xl mx-auto'
                : departmentsToDisplay.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {departmentsToDisplay.map(({ roomName, department }) => {
              const nowServing = department.queue.find((item) => item.status === 'now_serving');
              const waitingList = department.queue.filter((item) => item.status === 'waiting');

              return (
                <div
                  key={department.id}
                  className="bg-stone-800 rounded-2xl border-2 border-stone-700 shadow-2xl overflow-hidden flex flex-col justify-between"
                >
                  {/* Department Card Header */}
                  <div className="bg-gradient-to-r from-stone-900 to-stone-800 px-5 py-4 border-b border-stone-700 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                        {roomName}
                      </span>
                      <h3 className="text-xl font-extrabold text-white tracking-wide">
                        {department.name}
                      </h3>
                    </div>

                    {department.zoomLink && (
                      <a
                        href={department.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
                        title="Click to open this department's Zoom meeting"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Zoom</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Primary "NOW SERVING" Highlight Section */}
                  <div className="p-6 bg-gradient-to-b from-[#800020]/40 to-stone-900/90 text-center border-b border-stone-700">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-extrabold text-xs uppercase tracking-widest mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Now Serving
                    </span>

                    {nowServing ? (
                      <div className="space-y-2">
                        <div className="text-6xl sm:text-7xl font-black text-[#D4AF37] tracking-wider drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)]">
                          {nowServing.tokenNumber}
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-white mt-1">
                          {nowServing.parentName}
                        </div>
                        <div className="text-sm text-stone-300 font-medium">
                          Student: <span className="text-white font-bold">{nowServing.studentName}</span>
                        </div>
                        {nowServing.issue && (
                          <div className="inline-block bg-white/10 px-3 py-1 rounded text-xs text-stone-300 mt-2 border border-white/10 max-w-xs truncate">
                            {nowServing.issue}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-6">
                        <div className="text-5xl font-black text-stone-600">--</div>
                        <p className="text-xs text-stone-400 mt-2">
                          Please wait, next parent will be called shortly.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* WAITING TOKENS SECTION (Section 4) */}
                  <div className="p-5 flex-1 bg-stone-900/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase font-extrabold text-stone-300 tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Waiting In Line</span>
                        </span>
                        <span className="text-xs text-[#D4AF37] font-bold">
                          {waitingList.length} in queue
                        </span>
                      </div>

                      {waitingList.length === 0 ? (
                        <div className="py-4 text-center text-xs text-stone-500 italic">
                          Queue is clear. No waiting parents.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                          {waitingList.map((item, idx) => (
                            <div
                              key={item.id}
                              className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                                idx === 0
                                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                                  : 'bg-stone-800 border-stone-700 text-stone-300'
                              }`}
                            >
                              <span className="text-[10px] text-stone-400 font-mono">
                                #{idx + 1}
                              </span>
                              <span className="font-extrabold text-sm tracking-wider text-white">
                                {item.tokenNumber}
                              </span>
                              <span className="text-xs text-stone-400 max-w-[100px] truncate hidden sm:inline">
                                {item.parentName}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notice footer */}
                    <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                      <span>Have your Zoom camera ready</span>
                      <span className="text-[#D4AF37] font-semibold">Iqra Virtual School</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Screen Footer */}
      <footer className="bg-stone-950 border-t border-stone-800 py-3 px-6 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-stone-400">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Keep this screen open or share on Zoom meeting waiting room. Tokens update automatically.</span>
        </div>
        <div>
          Official System &bull; Iqra Virtual School Parents-Teacher Conference
        </div>
      </footer>
    </div>
  );
};
