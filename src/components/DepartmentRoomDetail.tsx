import React, { useState, useEffect } from 'react';
import { DepartmentRoom, ParentQueueItem, QueueStatus } from '../types';
import { getNextTokenNumber, getQueuePosition } from '../utils/token';
import { TokenPassModal } from './TokenPassModal';
import { 
  ArrowLeft, 
  Video, 
  ExternalLink, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  Volume2, 
  Trash2, 
  Edit2, 
  Search, 
  AlertCircle,
  Tv,
  Printer,
  ChevronRight,
  Save,
  Check,
  Sparkles,
  RotateCcw,
  Ticket,
  Radio,
  Share2
} from 'lucide-react';

interface DepartmentRoomDetailProps {
  department: DepartmentRoom;
  waitingRoomName: string;
  schoolName?: string;
  onBack: () => void;
  onUpdateZoomLink: (zoomLink: string) => void;
  onAddParent: (parent: Omit<ParentQueueItem, 'id' | 'createdAt'>) => ParentQueueItem;
  onUpdateParentStatus: (parentId: string, status: QueueStatus) => void;
  onUpdateParentDetails: (parentId: string, details: Partial<ParentQueueItem>) => void;
  onRemoveParent: (parentId: string) => void;
  onOpenPublicDisplay: () => void;
  onOpenParentTracker?: (token?: string) => void;
  onCallTokenChime: () => void;
  soundEnabled: boolean;
}

export const DepartmentRoomDetail: React.FC<DepartmentRoomDetailProps> = ({
  department,
  waitingRoomName,
  schoolName = 'Iqra Virtual School',
  onBack,
  onUpdateZoomLink,
  onAddParent,
  onUpdateParentStatus,
  onUpdateParentDetails,
  onRemoveParent,
  onOpenPublicDisplay,
  onOpenParentTracker,
  onCallTokenChime,
  soundEnabled,
}) => {
  // Form states - auto-generated token by default
  const [tokenNumber, setTokenNumber] = useState(() => getNextTokenNumber(department));
  const [parentName, setParentName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [issue, setIssue] = useState('');

  // Token Pass / Slip Modal state
  const [selectedPassParent, setSelectedPassParent] = useState<ParentQueueItem | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Sync auto-generated token if empty
  useEffect(() => {
    if (!tokenNumber.trim()) {
      setTokenNumber(getNextTokenNumber(department));
    }
  }, [department, tokenNumber]);

  // Zoom link editing state
  const [isEditingZoom, setIsEditingZoom] = useState(false);
  const [zoomInput, setZoomInput] = useState(department.zoomLink || '');
  const [zoomSavedNotice, setZoomSavedNotice] = useState(false);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<'all' | QueueStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Parent Modal
  const [editingParent, setEditingParent] = useState<ParentQueueItem | null>(null);

  // Delete Parent Confirm Modal
  const [deleteParentId, setDeleteParentId] = useState<string | null>(null);

  // Common quick issue tags for quick typing
  const quickIssues = [
    'Fee Clearance',
    'Report Card Discussion',
    'Academics / Grades',
    'Attendance Issue',
    'Virtual Portal Login',
    'General Inquiry',
  ];

  // Current Now Serving
  const nowServing = department.queue.find((item) => item.status === 'now_serving');
  // Waiting queue (sorted by registration order)
  const waitingTokens = department.queue.filter((item) => item.status === 'waiting');
  // Completed list
  const completedTokens = department.queue.filter((item) => item.status === 'completed');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = tokenNumber.trim().toUpperCase() || getNextTokenNumber(department);
    const cleanParent = parentName.trim();
    const cleanStudent = studentName.trim();

    if (!cleanParent || !cleanStudent) return;

    // Check if token number already exists and is not completed
    const existingActive = department.queue.find(
      (p) => p.tokenNumber.toUpperCase() === cleanToken && p.status !== 'completed'
    );
    if (existingActive) {
      const confirmAdd = window.confirm(
        `Token "${cleanToken}" is already assigned to ${existingActive.parentName} (${existingActive.status}). Do you still want to add this token?`
      );
      if (!confirmAdd) return;
    }

    const createdItem = onAddParent({
      tokenNumber: cleanToken,
      parentName: cleanParent,
      studentName: cleanStudent,
      issue: issue.trim(),
      status: 'waiting',
    });

    // Show Token Pass Modal immediately so staff can copy WhatsApp slip or print
    setSelectedPassParent(createdItem);
    setIsPassModalOpen(true);

    // Calculate next token and clear form
    const updatedDept = {
      ...department,
      queue: [...department.queue, createdItem],
    };
    setTokenNumber(getNextTokenNumber(updatedDept));
    setParentName('');
    setStudentName('');
    setIssue('');
  };

  const handleSaveZoom = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateZoomLink(zoomInput.trim());
    setIsEditingZoom(false);
    setZoomSavedNotice(true);
    setTimeout(() => setZoomSavedNotice(false), 2500);
  };

  const handleSaveParentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParent) return;
    onUpdateParentDetails(editingParent.id, {
      tokenNumber: editingParent.tokenNumber.trim().toUpperCase(),
      parentName: editingParent.parentName.trim(),
      studentName: editingParent.studentName.trim(),
      issue: editingParent.issue?.trim(),
      status: editingParent.status,
    });
    setEditingParent(null);
  };

  // Filtered Queue list
  const filteredQueue = department.queue.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch =
      item.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.issue && item.issue.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-5 sm:p-6 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1 font-semibold text-[#800020] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to {waitingRoomName}</span>
              </button>
              <span className="text-stone-300">•</span>
              <span className="uppercase tracking-wider font-semibold text-[#D4AF37]">
                Department Control
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                {department.name}
              </h2>
              <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
                Desk Room
              </span>
            </div>
            <p className="text-stone-700 text-sm mt-1">
              Manually register parents, assign tokens, connect via Zoom, and call tokens for consultation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Parent Tracker */}
            {onOpenParentTracker && (
              <button
                onClick={() => onOpenParentTracker()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D4AF37] bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                title="Open Parent Live Token Status Tracker"
              >
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Parent Tracker</span>
              </button>
            )}

            {/* Parent Screen Button */}
            <button
              onClick={onOpenPublicDisplay}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#D4AF37] bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 font-semibold text-xs sm:text-sm transition-colors cursor-pointer active:scale-95 shadow-xs"
              title="Open full-screen display for this department queue"
            >
              <Tv className="w-4 h-4 text-[#800020]" />
              <span>Parent Screen</span>
            </button>

            {/* Print queue */}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
              title="Print queue report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Queue</span>
            </button>
          </div>
        </div>

        {/* Section 5: Zoom Integration Controls */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="bg-stone-50 rounded-xl p-3.5 sm:p-4 border border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Zoom Meeting Link
                    </span>
                    {department.zoomLink ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        Not Configured
                      </span>
                    )}
                    {zoomSavedNotice && (
                      <span className="text-xs text-emerald-600 font-semibold animate-pulse">
                        Zoom Link Saved!
                      </span>
                    )}
                  </div>
                  {department.zoomLink ? (
                    <a
                      href={department.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline break-all max-w-lg inline-block font-mono"
                    >
                      {department.zoomLink}
                    </a>
                  ) : (
                    <p className="text-xs text-stone-500">
                      Add the official school Zoom meeting link for {department.name}.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Button to edit/change Zoom link */}
                <button
                  type="button"
                  onClick={() => {
                    setZoomInput(department.zoomLink || '');
                    setIsEditingZoom(!isEditingZoom);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer"
                >
                  {department.zoomLink ? 'Change Zoom Link' : 'Set Zoom Link'}
                </button>

                {/* Join Zoom Meeting button (Requirement 5) */}
                {department.zoomLink ? (
                  <a
                    href={department.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Zoom Meeting</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setZoomInput('');
                      setIsEditingZoom(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-200 text-stone-500 text-xs font-medium cursor-not-allowed"
                    title="Please configure the Zoom link first"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Zoom Meeting</span>
                  </button>
                )}
              </div>
            </div>

            {/* Inline Zoom Link Editor */}
            {isEditingZoom && (
              <form onSubmit={handleSaveZoom} className="mt-3 pt-3 border-t border-stone-200/80 flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  autoFocus
                  required
                  value={zoomInput}
                  onChange={(e) => setZoomInput(e.target.value)}
                  placeholder="Paste Zoom link: e.g. https://zoom.us/j/1234567890?pwd=..."
                  className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-3 py-2 bg-[#800020] hover:bg-[#66001a] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingZoom(false)}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Live Queue Display (Prominent Banner at the top) */}
      <div className="bg-gradient-to-r from-[#800020] to-[#590016] text-white rounded-xl shadow-md border-2 border-[#D4AF37] p-5 sm:p-6 overflow-hidden relative">
        {/* Subtle background ornamentation */}
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white/5 transform skew-x-12 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/20 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs uppercase tracking-wider font-bold text-[#D4AF37]">
                  Live Queue Board
                </span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-white/80">{department.name}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                Current Meeting Status
              </h3>
            </div>

            {/* Quick Chime Announcement button */}
            {nowServing && (
              <button
                onClick={onCallTokenChime}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#c49f2b] text-[#800020] font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95 cursor-pointer"
                title="Ring audio chime to notify parent"
              >
                <Volume2 className="w-4 h-4" />
                <span>Call Token Again (Chime)</span>
              </button>
            )}
          </div>

          {/* Now Serving vs Waiting Tokens Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* NOW SERVING CARD (Large, High-Visibility) */}
            <div className="lg:col-span-5 bg-black/25 backdrop-blur-xs rounded-xl p-4 sm:p-5 border border-white/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    NOW SERVING
                  </span>
                  {nowServing && (
                    <span className="text-[11px] text-white/70">
                      Started: {new Date(nowServing.servedAt || nowServing.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {nowServing ? (
                  <div className="space-y-2 mt-1">
                    <div className="text-4xl sm:text-5xl font-black text-[#D4AF37] tracking-wider drop-shadow-md">
                      {nowServing.tokenNumber}
                    </div>
                    <div className="text-lg font-bold text-white leading-snug">
                      {nowServing.parentName}
                    </div>
                    <div className="text-sm text-stone-200">
                      Student: <span className="font-semibold text-white">{nowServing.studentName}</span>
                    </div>
                    {nowServing.issue && (
                      <div className="text-xs text-stone-300 bg-white/10 p-2 rounded border border-white/10 mt-2">
                        <strong className="text-[#D4AF37]">Issue:</strong> {nowServing.issue}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-white/60">
                    <div className="text-3xl font-extrabold text-white/40 tracking-wider">
                      --
                    </div>
                    <p className="text-xs mt-1 text-white/70">
                      No parent is currently being served. Select a parent below to begin.
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons for currently serving parent */}
              {nowServing && (
                <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap gap-2">
                  <button
                    onClick={() => onUpdateParentStatus(nowServing.id, 'completed')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Completed</span>
                  </button>
                  <button
                    onClick={() => onUpdateParentStatus(nowServing.id, 'waiting')}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                    title="Return token back to waiting queue"
                  >
                    <span>Revert to Waiting</span>
                  </button>
                </div>
              )}
            </div>

            {/* WAITING TOKENS RIBBON (Section 4 requirement) */}
            <div className="lg:col-span-7 bg-black/25 backdrop-blur-xs rounded-xl p-4 sm:p-5 border border-white/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
                      WAITING TOKENS IN QUEUE
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
                      {waitingTokens.length}
                    </span>
                  </div>
                  <span className="text-xs text-white/60">Sequential queue order</span>
                </div>

                {waitingTokens.length === 0 ? (
                  <div className="py-8 text-center text-white/60 text-xs">
                    No parents currently waiting in the queue.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Visual chips of waiting tokens: e.g. A-06, A-07, A-08 */}
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                      {waitingTokens.map((item, idx) => (
                        <div
                          key={item.id}
                          className="group relative flex items-center gap-2 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 transition-all text-left"
                        >
                          <span className="text-[10px] text-[#D4AF37] font-extrabold">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-extrabold text-white tracking-wider">
                            {item.tokenNumber}
                          </span>
                          <span className="text-xs text-white/80 max-w-[100px] truncate hidden sm:inline">
                            {item.parentName}
                          </span>
                          {/* Quick Serve button on hover */}
                          <button
                            onClick={() => onUpdateParentStatus(item.id, 'now_serving')}
                            className="ml-1 text-[11px] font-bold text-emerald-300 hover:text-emerald-100 hover:underline cursor-pointer"
                            title="Call this parent to Now Serving"
                          >
                            Serve
                          </button>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-white/70 italic">
                      Staff manually selects which parent is being served. Click "Serve" on any token or use the table below.
                    </p>
                  </div>
                )}
              </div>

              {/* Next token quick call shortcut */}
              {waitingTokens.length > 0 && !nowServing && (
                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                  <span className="text-xs text-white/80">
                    Next in line: <strong className="text-[#D4AF37]">{waitingTokens[0].tokenNumber}</strong> ({waitingTokens[0].parentName})
                  </span>
                  <button
                    onClick={() => onUpdateParentStatus(waitingTokens[0].id, 'now_serving')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f2b] text-[#800020] font-bold text-xs transition-colors cursor-pointer"
                  >
                    <span>Call {waitingTokens[0].tokenNumber} Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Manual Add Form (Left) & Queue Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 3: Add Parent to Queue Form (Manual Token Entry) */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-xs border border-stone-200 p-5">
          <div className="flex items-center space-x-2 text-[#800020] mb-3">
            <UserPlus className="w-5 h-5 text-[#800020]" />
            <h3 className="font-bold text-base text-stone-900">
              Add Parent to Queue
            </h3>
          </div>

          <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-2.5 text-xs text-emerald-950 mb-4 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Automatic Token Generation:</strong> Token automatically calculate ho raha hai. Parent details enter karein aur button daba kar WhatsApp slip copy ya print karein.
            </div>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            {/* Token Number Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Token Number <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setTokenNumber(getNextTokenNumber(department))}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#800020] hover:underline cursor-pointer"
                  title="Reset to next sequential token"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Auto-Generate</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={tokenNumber}
                  onChange={(e) => setTokenNumber(e.target.value)}
                  placeholder="e.g. ACC-01, IT-02"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-[#D4AF37] rounded-lg text-sm text-stone-900 font-extrabold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
                <span className="absolute right-3 top-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#800020] text-[#D4AF37]">
                  Auto
                </span>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">
                System automatically assigns this token. You can also edit it if needed.
              </span>
            </div>

            {/* Parent Name Field */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Parent's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Dr. Muhammad Tariq"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              />
            </div>

            {/* Student Name Field */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Student's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Abdullah Tariq (Grade 7)"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              />
            </div>

            {/* Optional Issue Field */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Parent's Issue / Purpose <span className="text-stone-400 font-normal text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="e.g. Term fee discount query, Portal password"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              />

              {/* Quick Issue suggestions */}
              <div className="flex flex-wrap gap-1 mt-2">
                {quickIssues.map((qIssue) => (
                  <button
                    key={qIssue}
                    type="button"
                    onClick={() => setIssue(qIssue)}
                    className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200 transition-colors cursor-pointer"
                  >
                    {qIssue}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Parent Button */}
            <button
              type="submit"
              disabled={!parentName.trim() || !studentName.trim()}
              className="w-full py-3 px-4 rounded-xl bg-[#800020] hover:bg-[#66001a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] border-b-2 border-[#D4AF37] cursor-pointer flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4 text-[#D4AF37]" />
              <span>Issue Token &amp; Add to Queue ({tokenNumber || 'Auto'})</span>
            </button>
          </form>
        </div>

        {/* Section 3 & 4: Queue Table */}
        <div className="lg:col-span-8 space-y-4">
          {/* Table Controls (Filter Tabs & Search) */}
          <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Status Filter Tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-[#800020] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All ({department.queue.length})
                </button>
                <button
                  onClick={() => setStatusFilter('waiting')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'waiting'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Waiting ({waitingTokens.length})
                </button>
                <button
                  onClick={() => setStatusFilter('now_serving')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'now_serving'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Serving ({nowServing ? 1 : 0})
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'completed'
                      ? 'bg-stone-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Completed ({completedTokens.length})
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search token, parent, student..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#800020] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Queue Table */}
          <div className="bg-white rounded-xl shadow-xs border border-stone-200 overflow-hidden">
            {filteredQueue.length === 0 ? (
              <div className="p-8 text-center text-stone-500">
                <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="font-semibold text-stone-700 text-sm">No parents found in queue</p>
                <p className="text-xs text-stone-400 mt-1">
                  {department.queue.length === 0
                    ? 'Use the form on the left to add parents to this department.'
                    : 'Try selecting a different filter or clearing your search.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Token Number</th>
                      <th className="py-3 px-4">Parent Name</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Issue / Reason</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredQueue.map((item) => {
                      const isNowServing = item.status === 'now_serving';
                      const isWaiting = item.status === 'waiting';
                      const isCompleted = item.status === 'completed';

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            isNowServing
                              ? 'bg-emerald-50/60 font-medium'
                              : 'hover:bg-stone-50/60'
                          }`}
                        >
                          {/* 1. Token Number */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wider ${
                                isNowServing
                                  ? 'bg-[#800020] text-white border border-[#D4AF37]'
                                  : isWaiting
                                  ? 'bg-stone-900 text-white'
                                  : 'bg-stone-200 text-stone-600 line-through'
                              }`}
                            >
                              {item.tokenNumber}
                            </span>
                          </td>

                          {/* 2. Parent Name */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-stone-900">{item.parentName}</div>
                            <span className="text-[10px] text-stone-600">
                              Added {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>

                          {/* 3. Student Name */}
                          <td className="py-3 px-4 font-medium text-stone-800">
                            {item.studentName}
                          </td>

                          {/* 4. Issue */}
                          <td className="py-3 px-4 text-stone-600 max-w-xs">
                            {item.issue ? (
                              <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] inline-block">
                                {item.issue}
                              </span>
                            ) : (
                              <span className="text-stone-400 italic">None specified</span>
                            )}
                          </td>

                          {/* 5. Status with quick select */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <select
                              value={item.status}
                              onChange={(e) => onUpdateParentStatus(item.id, e.target.value as QueueStatus)}
                              className={`text-xs font-semibold py-1 px-2 rounded-md border cursor-pointer focus:outline-none ${
                                isNowServing
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : isWaiting
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-stone-100 text-stone-600 border-stone-300'
                              }`}
                            >
                              <option value="waiting">Waiting</option>
                              <option value="now_serving">Now Serving</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>

                          {/* 6. Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Quick Serve / Complete Button */}
                              {isWaiting && (
                                <button
                                  onClick={() => onUpdateParentStatus(item.id, 'now_serving')}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                  title="Serve this parent now"
                                >
                                  Serve Now
                                </button>
                              )}

                              {isNowServing && (
                                <button
                                  onClick={() => onUpdateParentStatus(item.id, 'completed')}
                                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                  title="Complete this consultation"
                                >
                                  Finish
                                </button>
                              )}

                              {isCompleted && (
                                <button
                                  onClick={() => onUpdateParentStatus(item.id, 'waiting')}
                                  className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition-colors cursor-pointer"
                                  title="Move back to waiting"
                                >
                                  Re-open
                                </button>
                              )}

                              {/* View Token Pass / WhatsApp Slip */}
                              <button
                                onClick={() => {
                                  setSelectedPassParent(item);
                                  setIsPassModalOpen(true);
                                }}
                                className="p-1 rounded text-[#800020] hover:bg-rose-50 transition-colors cursor-pointer"
                                title="View Token Pass & WhatsApp Slip"
                              >
                                <Ticket className="w-3.5 h-3.5 text-[#800020]" />
                              </button>

                              {/* Edit details */}
                              <button
                                onClick={() => setEditingParent(item)}
                                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                                title="Edit parent details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Remove from queue */}
                              <button
                                onClick={() => setDeleteParentId(item.id)}
                                className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Remove from queue"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Edit Parent Record */}
      {editingParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#800020] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-[#D4AF37]">
              <h3 className="font-bold text-sm">Edit Parent in Queue</h3>
              <button
                onClick={() => setEditingParent(null)}
                className="text-white/70 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveParentEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Token Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingParent.tokenNumber}
                  onChange={(e) =>
                    setEditingParent({ ...editingParent, tokenNumber: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Parent's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingParent.parentName}
                  onChange={(e) =>
                    setEditingParent({ ...editingParent, parentName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Student's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingParent.studentName}
                  onChange={(e) =>
                    setEditingParent({ ...editingParent, studentName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Issue / Purpose
                </label>
                <input
                  type="text"
                  value={editingParent.issue || ''}
                  onChange={(e) =>
                    setEditingParent({ ...editingParent, issue: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={editingParent.status}
                  onChange={(e) =>
                    setEditingParent({
                      ...editingParent,
                      status: e.target.value as QueueStatus,
                    })
                  }
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                >
                  <option value="waiting">Waiting</option>
                  <option value="now_serving">Now Serving</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingParent(null)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#800020] hover:bg-[#66001a] rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Update Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteParentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-stone-900">
                Remove Parent from Queue?
              </h4>
              <p className="text-xs text-stone-600 mt-1">
                Are you sure you want to remove this token from the department queue?
              </p>

              <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDeleteParentId(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveParent(deleteParentId);
                    setDeleteParentId(null);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Token Pass / Slip */}
      {selectedPassParent && (
        <TokenPassModal
          isOpen={isPassModalOpen}
          onClose={() => {
            setIsPassModalOpen(false);
            setSelectedPassParent(null);
          }}
          parentItem={selectedPassParent}
          departmentName={department.name}
          waitingRoomName={waitingRoomName}
          zoomLink={department.zoomLink}
          schoolName={schoolName || 'Iqra Virtual School'}
          parentsAhead={getQueuePosition(department, selectedPassParent.id).parentsAhead}
          estimatedWaitMinutes={getQueuePosition(department, selectedPassParent.id).estimatedWaitMinutes}
        />
      )}
    </div>
  );
};
