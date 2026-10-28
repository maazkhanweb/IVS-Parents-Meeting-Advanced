import React, { useState, useEffect } from 'react';
import { WaitingRoom, ParentQueueItem, DepartmentRoom } from '../types';
import { getQueuePosition } from '../utils/token';
import { 
  Search, 
  Clock, 
  Video, 
  ExternalLink, 
  Users, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Radio
} from 'lucide-react';

interface ParentTrackerViewProps {
  waitingRooms: WaitingRoom[];
  schoolName: string;
  onExit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onCallTokenChime: () => void;
  initialTokenNumber?: string;
}

export const ParentTrackerView: React.FC<ParentTrackerViewProps> = ({
  waitingRooms,
  schoolName,
  onExit,
  soundEnabled,
  onToggleSound,
  onCallTokenChime,
  initialTokenNumber = '',
}) => {
  const [tokenInput, setTokenInput] = useState(initialTokenNumber);
  const [searchedToken, setSearchedToken] = useState(initialTokenNumber.toUpperCase().trim());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasPlayedServingAlert, setHasPlayedServingAlert] = useState(false);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Look for the searched token across all rooms and departments
  let foundParent: ParentQueueItem | null = null;
  let foundDepartment: DepartmentRoom | null = null;
  let foundRoom: WaitingRoom | null = null;

  if (searchedToken) {
    for (const room of waitingRooms) {
      for (const dept of room.departments) {
        const item = dept.queue.find(
          (q) => q.tokenNumber.toUpperCase() === searchedToken
        );
        if (item) {
          foundParent = item;
          foundDepartment = dept;
          foundRoom = room;
          break;
        }
      }
      if (foundParent) break;
    }
  }

  // Calculate live position
  const queueInfo = foundDepartment && foundParent
    ? getQueuePosition(foundDepartment, foundParent.id)
    : null;

  // Auto trigger audio alert when parent is called to Now Serving
  useEffect(() => {
    if (foundParent?.status === 'now_serving' && !hasPlayedServingAlert) {
      if (soundEnabled) {
        onCallTokenChime();
      }
      setHasPlayedServingAlert(true);
    } else if (foundParent?.status !== 'now_serving') {
      setHasPlayedServingAlert(false);
    }
  }, [foundParent?.status, hasPlayedServingAlert, soundEnabled, onCallTokenChime]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedToken(tokenInput.trim().toUpperCase());
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-between selection:bg-[#800020] selection:text-white">
      {/* Top Header */}
      <header className="bg-stone-950 border-b border-stone-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </button>
          <div className="hidden sm:block text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            {schoolName} &bull; Live Token Tracker
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-300 border border-stone-700 transition-colors"
            title={soundEnabled ? 'Chime sound is active' : 'Chime is muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#D4AF37]" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
          </button>

          <div className="bg-stone-900 border border-stone-700 px-3 py-1.5 rounded-lg font-mono text-xs text-[#D4AF37] font-bold">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Token Search Box */}
        <div className="bg-stone-800/90 rounded-2xl border-2 border-stone-700 p-6 shadow-xl backdrop-blur-sm">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-xs font-bold text-[#D4AF37] border border-stone-700">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Real-Time Token Tracking Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Parents Meeting Live Queue
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-md mx-auto">
              Apna token number darj karein aur live check karein ke aap ki baari kab aane wali hai.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. ACC-01, IT-02, 101"
              className="flex-1 px-4 py-3 bg-stone-900 border-2 border-stone-600 rounded-xl text-center sm:text-left text-lg font-black tracking-wider text-white uppercase focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#800020] hover:bg-[#66001a] text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
              <span>Token Check Karein</span>
            </button>
          </form>

          {/* Quick active token pills for easy 1-click test */}
          {waitingRooms.some((r) => r.departments.some((d) => d.queue.length > 0)) && (
            <div className="mt-4 pt-4 border-t border-stone-700/60 text-center">
              <span className="text-[11px] text-stone-400 block mb-2 font-medium">
                Active Tokens in Meeting:
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {waitingRooms.flatMap((r) =>
                  r.departments.flatMap((d) =>
                    d.queue.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setTokenInput(q.tokenNumber);
                          setSearchedToken(q.tokenNumber.toUpperCase());
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                          searchedToken === q.tokenNumber.toUpperCase()
                            ? 'bg-[#D4AF37] text-[#800020]'
                            : q.status === 'now_serving'
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/50'
                            : q.status === 'completed'
                            ? 'bg-stone-700/50 text-stone-400'
                            : 'bg-stone-900 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        {q.tokenNumber} {q.status === 'now_serving' && '• Serving'}
                      </button>
                    ))
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Token Status Card */}
        {searchedToken && foundParent && foundDepartment && foundRoom && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Status Case 1: NOW SERVING (Active meeting alert) */}
            {foundParent.status === 'now_serving' && (
              <div className="bg-gradient-to-b from-emerald-950/80 to-stone-900 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-extrabold text-sm uppercase tracking-widest mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  AAP KI BAARI HAI &bull; NOW SERVING!
                </div>

                <div className="text-6xl sm:text-7xl font-black text-[#D4AF37] tracking-wider my-2 drop-shadow-[0_2px_15px_rgba(212,175,55,0.5)]">
                  {foundParent.tokenNumber}
                </div>

                <div className="text-2xl font-bold text-white mt-2">
                  {foundParent.parentName}
                </div>
                <div className="text-stone-300 text-sm mt-1">
                  Student: <strong className="text-white">{foundParent.studentName}</strong>
                </div>

                <div className="mt-4 p-3 bg-stone-900/80 rounded-xl border border-stone-700 inline-block text-xs text-stone-300">
                  Room: <strong className="text-white">{foundRoom.name}</strong> &bull; Desk:{' '}
                  <strong className="text-[#D4AF37]">{foundDepartment.name}</strong>
                </div>

                {/* Direct Zoom Join Action */}
                <div className="mt-6 pt-6 border-t border-emerald-800/40 space-y-3">
                  <p className="text-sm font-semibold text-emerald-200">
                    Desk par aap ko call kar liya gaya hai. Barahe karam neeche button par click kar ke foran Zoom meeting mein shamil hon:
                  </p>
                  {foundDepartment.zoomLink ? (
                    <a
                      href={foundDepartment.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base sm:text-lg shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Video className="w-6 h-6" />
                      <span>Join Zoom Meeting Now</span>
                      <ExternalLink className="w-5 h-5 ml-1" />
                    </a>
                  ) : (
                    <div className="bg-amber-900/40 border border-amber-600/50 p-3 rounded-lg text-xs text-amber-200 max-w-md mx-auto">
                      Desk staff Zoom meeting link ready kar raha hai. 1 minute intezar karein.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Case 2: WAITING */}
            {foundParent.status === 'waiting' && queueInfo && (
              <div className="bg-stone-800/90 border-2 border-[#D4AF37]/60 rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-[#D4AF37] text-amber-300 font-extrabold text-xs uppercase tracking-widest">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span>Waiting in Queue &bull; Baari ka Intezar</span>
                </div>

                <div>
                  <div className="text-5xl sm:text-6xl font-black text-white tracking-wider my-2">
                    {foundParent.tokenNumber}
                  </div>
                  <div className="text-xl font-bold text-stone-200">
                    {foundParent.parentName}
                  </div>
                  <div className="text-xs text-stone-400 mt-1">
                    Student: <span className="text-stone-200 font-semibold">{foundParent.studentName}</span>
                  </div>
                </div>

                {/* Queue Stats Cards */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="bg-stone-900/80 border border-stone-700 rounded-2xl p-4 text-center">
                    <span className="text-xs text-stone-400 block mb-1">Aap ke aage:</span>
                    <div className="text-3xl font-black text-[#D4AF37]">
                      {queueInfo.parentsAhead}
                    </div>
                    <span className="text-[11px] text-stone-400">Parent(s) waiting</span>
                  </div>

                  <div className="bg-stone-900/80 border border-stone-700 rounded-2xl p-4 text-center">
                    <span className="text-xs text-stone-400 block mb-1">Takhmeenan Waqt:</span>
                    <div className="text-3xl font-black text-white">
                      ~{queueInfo.estimatedWaitMinutes}
                    </div>
                    <span className="text-[11px] text-stone-400">Minutes</span>
                  </div>
                </div>

                <div className="bg-stone-900/50 border border-stone-700 rounded-xl p-4 text-xs text-stone-300 space-y-2">
                  <div>
                    Room: <strong className="text-white">{foundRoom.name}</strong> &bull; Desk:{' '}
                    <strong className="text-[#D4AF37]">{foundDepartment.name}</strong>
                  </div>

                  {foundDepartment.queue.some((q) => q.status === 'now_serving' && q.id !== foundParent?.id) ? (
                    <div className="p-2.5 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs">
                      ⏳ <strong>{foundDepartment.name}</strong> desk par abhi pehle se doosre parent ki meeting chal rahi hai.
                      <span className="block mt-0.5 text-stone-300">
                        Barahe karam Waiting Room mein wait karein. Jaise hi desk khali hogi, Waiting Room se Sir aap ko IT desk par move karenge.
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs">
                      🟢 <strong>{foundDepartment.name}</strong> desk bilkul FREE hai! Sir jald aap ko desk par move kar rahe hain.
                    </div>
                  )}

                  <p className="text-stone-400 text-[11px]">
                    Is screen ko open rakhein. Jaise hi Sir aap ko desk par move karenge, sound notification bajega aur Zoom Join button samne aa jayega!
                  </p>
                </div>
              </div>
            )}

            {/* Status Case 3: COMPLETED */}
            {foundParent.status === 'completed' && (
              <div className="bg-stone-800/90 border border-stone-700 rounded-3xl p-8 text-center shadow-xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-900/60 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Meeting Mukammal Ho Chuki Hai</h3>
                <p className="text-xs text-stone-300 max-w-sm mx-auto">
                  Token <strong className="text-[#D4AF37]">{foundParent.tokenNumber}</strong> ({foundParent.parentName}) ki meeting mukammal ho chuki hai. Iqra Virtual School meeting mein shamil hone ka shukriya.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Not Found Notice */}
        {searchedToken && !foundParent && (
          <div className="bg-stone-800/80 border border-stone-700 rounded-2xl p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Token "{searchedToken}" Nahi Mila</h4>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Barahe karam token number dobara check karein ya school reception staff se rabta karein.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-950 border-t border-stone-800 py-3 px-6 text-center text-xs text-stone-500">
        Iqra Virtual School &bull; Parents Meeting Token Management System
      </footer>
    </div>
  );
};
