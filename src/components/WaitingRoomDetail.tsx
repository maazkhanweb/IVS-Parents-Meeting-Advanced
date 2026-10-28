import React, { useState, useEffect } from 'react';
import { WaitingRoom, DepartmentRoom, ParentQueueItem, QueueStatus } from '../types';
import { getNextTokenNumber, getQueuePosition } from '../utils/token';
import { TokenPassModal } from './TokenPassModal';
import { 
  Plus, 
  ArrowLeft, 
  Building2, 
  Video, 
  Edit3, 
  Trash2, 
  Tv, 
  Users, 
  Clock, 
  ExternalLink,
  Copy,
  Check,
  Link as LinkIcon,
  UserPlus,
  Sparkles,
  RotateCcw,
  Ticket,
  Radio,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  Search,
  Filter,
  Eye
} from 'lucide-react';

interface WaitingRoomDetailProps {
  waitingRoom: WaitingRoom;
  allWaitingRooms: WaitingRoom[];
  schoolName?: string;
  onBack: () => void;
  onCreateDepartment: (waitingRoomId: string, name: string, zoomLink: string) => void;
  onRenameDepartment: (waitingRoomId: string, departmentId: string, newName: string) => void;
  onUpdateZoomLink: (waitingRoomId: string, departmentId: string, zoomLink: string) => void;
  onDeleteDepartment: (waitingRoomId: string, departmentId: string) => void;
  onOpenDepartment: (departmentId: string) => void;
  onOpenPublicDisplay: (waitingRoomId: string) => void;
  onRenameWaitingRoom: (waitingRoomId: string, newName: string) => void;
  onAddParentToDepartment: (
    departmentId: string,
    parentData: Omit<ParentQueueItem, 'id' | 'createdAt'>
  ) => ParentQueueItem;
  onMoveParentToDepartment: (departmentId: string, parentId: string) => void;
  onMoveCrossDepartment: (fromDeptId: string, parentId: string, toDeptId: string) => void;
  onMoveParentGlobal: (fromDeptId: string, parentId: string, toWaitingRoomId: string, toDeptId: string) => void;
  onUpdateParentStatus: (departmentId: string, parentId: string, status: QueueStatus) => void;
  onRemoveParent: (departmentId: string, parentId: string) => void;
  onOpenParentTracker?: (token?: string) => void;
  onCallTokenChime: () => void;
  soundEnabled: boolean;
}

export const WaitingRoomDetail: React.FC<WaitingRoomDetailProps> = ({
  waitingRoom,
  allWaitingRooms,
  schoolName = 'Iqra Virtual School',
  onBack,
  onCreateDepartment,
  onRenameDepartment,
  onUpdateZoomLink,
  onDeleteDepartment,
  onOpenDepartment,
  onOpenPublicDisplay,
  onRenameWaitingRoom,
  onAddParentToDepartment,
  onMoveParentToDepartment,
  onMoveCrossDepartment,
  onMoveParentGlobal,
  onUpdateParentStatus,
  onRemoveParent,
  onOpenParentTracker,
  onCallTokenChime,
  soundEnabled,
}) => {
  // Department CRUD states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptZoom, setDeptZoom] = useState('');
  const [editingDept, setEditingDept] = useState<DepartmentRoom | null>(null);
  const [editName, setEditName] = useState('');
  const [editZoom, setEditZoom] = useState('');
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<DepartmentRoom | null>(null);

  // Waiting Room Rename state
  const [isRenamingWR, setIsRenamingWR] = useState(false);
  const [wrNewName, setWrNewName] = useState(waitingRoom.name);

  // Link copy feedback
  const [copiedDeptId, setCopiedDeptId] = useState<string | null>(null);

  // --- RECEPTION DESK / TOKEN ISSUING FORM (WAITING ROOM LEVEL) ---
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    waitingRoom.departments[0]?.id || ''
  );
  const [tokenNumber, setTokenNumber] = useState('');
  const [parentName, setParentName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [issue, setIssue] = useState('');

  // Selected department object
  const selectedDept = waitingRoom.departments.find((d) => d.id === selectedDeptId) || waitingRoom.departments[0];

  // Auto-update tokenNumber when selected department changes
  useEffect(() => {
    if (selectedDept) {
      setTokenNumber(getNextTokenNumber(selectedDept));
    }
  }, [selectedDeptId]);

  // Pass Modal state
  const [passParent, setPassParent] = useState<ParentQueueItem | null>(null);
  const [passDept, setPassDept] = useState<DepartmentRoom | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Queue Filter & Search
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'now_serving' | 'completed'>('waiting');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Per-parent selected target department for dispatch dropdown
  // stores { roomId, deptId } per parentId
  const [dispatchTargetMap, setDispatchTargetMap] = useState<Record<string, { roomId: string; deptId: string }>>({});

  // Quick issues suggestions
  const quickIssues = [
    'Fee Clearance',
    'Report Card Discussion',
    'Academics / Grades',
    'Virtual Portal Login',
    'Attendance Issue',
    'General Inquiry',
  ];

  const departmentSuggestions = [
    'Accounts',
    'Accounts 1',
    'Accounts 2',
    'IT Support',
    'IT Support 1',
    'Management',
    'Academics',
    'Admissions',
  ];

  // Aggregate all queue parents in this Waiting Room
  const allParents = waitingRoom.departments.flatMap((dept) =>
    dept.queue.map((item) => {
      const activeServing = dept.queue.find((q) => q.status === 'now_serving');
      const isDeptBusy = !!activeServing && activeServing.id !== item.id;
      return {
        ...item,
        departmentId: dept.id,
        departmentName: dept.name,
        departmentZoom: dept.zoomLink,
        isDeptBusy,
        currentlyServingParent: activeServing,
      };
    })
  );

  const waitingWithSir = allParents.filter((p) => p.status === 'waiting');
  const nowInMeetingDesks = allParents.filter((p) => p.status === 'now_serving');
  const completedInRoom = allParents.filter((p) => p.status === 'completed');

  // Filtered queue
  const filteredParents = allParents.filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesDept = filterDept === 'all' || p.departmentId === filterDept;
    const matchesSearch =
      p.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.issue && p.issue.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesDept && matchesSearch;
  });

  // Handle Token Issuance by Sir
  const handleIssueTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) {
      alert('Barahe karam pehle ek Department Desk add karein.');
      return;
    }

    const cleanToken = tokenNumber.trim().toUpperCase() || getNextTokenNumber(selectedDept);
    const cleanParent = parentName.trim();
    const cleanStudent = studentName.trim();

    if (!cleanParent || !cleanStudent) return;

    // Issue parent to department queue with 'waiting' status
    const createdItem = onAddParentToDepartment(selectedDept.id, {
      tokenNumber: cleanToken,
      parentName: cleanParent,
      studentName: cleanStudent,
      issue: issue.trim(),
      status: 'waiting',
    });

    // Show Token Pass Modal
    setPassParent(createdItem);
    setPassDept(selectedDept);
    setIsPassModalOpen(true);

    // Clear form and advance token
    setParentName('');
    setStudentName('');
    setIssue('');

    const updatedDept = {
      ...selectedDept,
      queue: [...selectedDept.queue, createdItem],
    };
    setTokenNumber(getNextTokenNumber(updatedDept));
  };

  // Handle Sir moving parent to a selected department desk (any room, any dept)
  const handleSirMoveParent = (
    fromDeptId: string,
    parentId: string,
    toWaitingRoomId: string,
    toDeptId: string,
    toDeptName: string,
    isBusy: boolean
  ) => {
    if (isBusy) {
      const confirmMove = window.confirm(
        `${toDeptName} desk par is waqt pehle se ek parent ki meeting chal rahi hai. Kya aap phir bhi is parent ko desk par bhejna chahte hain?`
      );
      if (!confirmMove) return;
    }

    onMoveParentGlobal(fromDeptId, parentId, toWaitingRoomId, toDeptId);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    onCreateDepartment(waitingRoom.id, deptName.trim(), deptZoom.trim());
    setDeptName('');
    setDeptZoom('');
    setIsCreateOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !editName.trim()) return;
    onRenameDepartment(waitingRoom.id, editingDept.id, editName.trim());
    onUpdateZoomLink(waitingRoom.id, editingDept.id, editZoom.trim());
    setEditingDept(null);
  };

  const handleCopyLink = (deptId: string, link: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedDeptId(deptId);
    setTimeout(() => setCopiedDeptId(null), 2000);
  };

  const handleRenameWRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wrNewName.trim()) return;
    onRenameWaitingRoom(waitingRoom.id, wrNewName.trim());
    setIsRenamingWR(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-5 sm:p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#800020] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </button>
              <span className="text-stone-300">•</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37]">
                Waiting Room Level
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                {waitingRoom.name}
              </h2>
              <button
                onClick={() => {
                  setWrNewName(waitingRoom.name);
                  setIsRenamingWR(true);
                }}
                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Rename this waiting room"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl">
              Sir is waiting room se parents ko tokens issue karenge aur desk khali hone par parent ko department desk par move karenge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Parent Tracker */}
            {onOpenParentTracker && (
              <button
                onClick={() => onOpenParentTracker()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D4AF37] bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
                title="Open Live Parent Token Tracker"
              >
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Parent Tracker</span>
              </button>
            )}

            {/* Parent Screen Button */}
            <button
              onClick={() => onOpenPublicDisplay(waitingRoom.id)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#D4AF37] bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 font-semibold text-xs sm:text-sm transition-colors cursor-pointer active:scale-95 shadow-xs"
              title="Open full-screen public display for this waiting room"
            >
              <Tv className="w-4 h-4 text-[#800020]" />
              <span>Parent Screen</span>
            </button>

            {/* + Add Department Desk Button */}
            <button
              onClick={() => {
                setDeptName('');
                setDeptZoom('');
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#800020] hover:bg-[#66001a] text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-95 border-b-2 border-[#D4AF37] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Department Desk</span>
            </button>
          </div>
        </div>

        {/* Quick Room Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-stone-100 text-xs">
          <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
            <span className="text-stone-500 font-medium block">Department Desks</span>
            <span className="text-xl font-bold text-stone-900">{waitingRoom.departments.length}</span>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <span className="text-amber-800 font-medium block">Waiting in Waiting Room</span>
            <span className="text-xl font-bold text-amber-900">{waitingWithSir.length}</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <span className="text-emerald-800 font-medium block">Now in Meeting Desks</span>
            <span className="text-xl font-bold text-emerald-900">{nowInMeetingDesks.length}</span>
          </div>
          <div className="bg-stone-100 p-3 rounded-lg border border-stone-200">
            <span className="text-stone-600 font-medium block">Completed Meetings</span>
            <span className="text-xl font-bold text-stone-700">{completedInRoom.length}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: SIR'S TOKEN ISSUANCE STATION (Waiting Room Reception Form) */}
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#800020] to-[#590016] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#D4AF37]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-[#D4AF37]/50">
              <UserPlus className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                Sir's Reception Desk &bull; {waitingRoom.name}
              </div>
              <h3 className="text-lg font-bold text-white">
                Issue Token to Parent
              </h3>
            </div>
          </div>
          <span className="text-xs bg-white/15 px-3 py-1 rounded-full text-stone-200 border border-white/20 self-start sm:self-center">
            Token waiting room se issue hoga &bull; Desk khali hone par Sir move karenge
          </span>
        </div>

        {waitingRoom.departments.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="font-bold text-stone-800">No Department Desks in this Room</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Parents ko token issue karne ke liye pehle kam az kam ek Department Desk (jaise Accounts, IT Support ya Academics) create karein.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#800020] hover:bg-[#66001a] text-white font-bold text-xs rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Department</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleIssueTokenSubmit} className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* 1. Select Target Department */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Target Department Desk <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] cursor-pointer"
                >
                  {waitingRoom.departments.map((d) => {
                    const isBusy = d.queue.some((q) => q.status === 'now_serving');
                    const servingItem = d.queue.find((q) => q.status === 'now_serving');
                    return (
                      <option key={d.id} value={d.id}>
                        {d.name} {isBusy ? `(⏳ Busy - Serving ${servingItem?.tokenNumber})` : '(🟢 Desk Free)'}
                      </option>
                    );
                  })}
                </select>

                {/* Desk Live Status Pill */}
                {selectedDept && (
                  <div className="mt-1 text-xs">
                    {selectedDept.queue.some((q) => q.status === 'now_serving') ? (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                        <span>
                          <strong>{selectedDept.name}</strong> desk par abhi meeting chal rahi hai. Parent Waiting Room mein intezar karega.
                        </span>
                      </div>
                    ) : (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                        <span>
                          <strong>{selectedDept.name}</strong> desk bilkul <strong>FREE</strong> hai!
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Token Number Field (Auto-Generated) */}
              <div className="md:col-span-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Token Number <span className="text-red-500">*</span>
                  </label>
                  {selectedDept && (
                    <button
                      type="button"
                      onClick={() => setTokenNumber(getNextTokenNumber(selectedDept))}
                      className="text-[10px] text-[#800020] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                      title="Reset to next auto token"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Auto</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={tokenNumber}
                    onChange={(e) => setTokenNumber(e.target.value)}
                    placeholder="e.g. IT-03"
                    className="w-full px-3.5 py-2.5 bg-amber-50/50 border border-[#D4AF37] rounded-lg text-sm text-stone-900 font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                  />
                  <span className="absolute right-2.5 top-2.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#800020] text-[#D4AF37]">
                    Auto Next
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 block">
                  Department ke hisab se automatic token.
                </span>
              </div>

              {/* 3. Parent Name */}
              <div className="md:col-span-5 space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Parent's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Muhammad Tariq Khan"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* 4. Student Name */}
              <div className="md:col-span-5 space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Student's Name &amp; Grade <span className="text-red-500">*</span>
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

              {/* 5. Issue / Remarks */}
              <div className="md:col-span-7 space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Parent's Issue / Agenda <span className="text-stone-400 font-normal text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="e.g. Virtual portal login issue, Fee discussion"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {quickIssues.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setIssue(q)}
                      className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200 cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
              <span className="text-xs text-stone-500">
                Token issue hote hi parent <strong>Waiting Room Queue</strong> mein shamil ho jayega.
              </span>
              <button
                type="submit"
                disabled={!parentName.trim() || !studentName.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#800020] hover:bg-[#66001a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] border-b-2 border-[#D4AF37] cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-[#D4AF37]" />
                <span>Issue Token &amp; Place in Waiting Room ({tokenNumber || 'Auto'})</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECTION 2: SIR'S DISPATCH BOARD & WAITING ROOM QUEUE */}
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#800020]">
              <Users className="w-4 h-4 text-[#800020]" />
              <span>Sir's Waiting Room Queue &bull; Live Movement Dispatch</span>
            </div>
            <h3 className="text-lg font-bold text-stone-900 mt-0.5">
              Parents Waiting in {waitingRoom.name}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Sir yahan dekh sakte hain ke kaunsa department khali hai aur kis parent ko desk par bhejna hai.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterStatus('waiting')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                filterStatus === 'waiting'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Waiting with Sir ({waitingWithSir.length})
            </button>
            <button
              onClick={() => setFilterStatus('now_serving')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                filterStatus === 'now_serving'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              In Meeting Desks ({nowInMeetingDesks.length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                filterStatus === 'completed'
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Completed ({completedInRoom.length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All ({allParents.length})
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 cursor-pointer"
            >
              <option value="all">All Department Desks</option>
              {waitingRoom.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
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

        {/* Dispatch Table */}
        <div className="border border-stone-200 rounded-xl overflow-hidden">
          {filteredParents.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs">
              <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="font-semibold text-stone-700">No parents in this list</p>
              <p className="text-stone-400 mt-1">
                {allParents.length === 0
                  ? 'Use the form above to issue tokens to waiting parents.'
                  : 'Try selecting a different filter tab.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Token</th>
                    <th className="py-3 px-4">Parent &amp; Student</th>
                    <th className="py-3 px-4">Target Desk</th>
                    <th className="py-3 px-4">Desk Live Status</th>
                    <th className="py-3 px-4 text-center">Sir's Dispatch Action</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredParents.map((item) => {
                    const isWaiting = item.status === 'waiting';
                    const isNowServing = item.status === 'now_serving';
                    const isCompleted = item.status === 'completed';

                    return (
                      <tr
                        key={item.id}
                        className={
                          isNowServing
                            ? 'bg-emerald-50/70 font-medium'
                            : 'hover:bg-stone-50/70'
                        }
                      >
                        {/* Token Number */}
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

                        {/* Parent & Student */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{item.parentName}</div>
                          <div className="text-stone-600 text-[11px]">
                            Student: <strong className="text-stone-800">{item.studentName}</strong>
                          </div>
                          {item.issue && (
                            <span className="inline-block mt-1 bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded text-[10px]">
                              {item.issue}
                            </span>
                          )}
                        </td>

                        {/* Target Desk */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold text-stone-800 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#800020]" />
                            <span>{item.departmentName}</span>
                          </span>
                        </td>

                        {/* Desk Live Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isNowServing ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                              Active in Meeting
                            </span>
                          ) : isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
                              Meeting Done
                            </span>
                          ) : item.isDeptBusy ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-700" />
                                Desk Busy ({item.currentlyServingParent?.tokenNumber})
                              </span>
                              <span className="text-[10px] text-stone-500 block">
                                Waiting Room mein wait kar raha hai
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                              Desk FREE &amp; Ready!
                            </span>
                          )}
                        </td>

                        {/* Sir's Dispatch Action */}
                        <td className="py-3 px-4 text-center">
                          {isWaiting ? (() => {
                            // Build flat list of all depts across all rooms
                            const allDepts = allWaitingRooms.flatMap((room) =>
                              room.departments.map((d) => ({
                                roomId: room.id,
                                roomName: room.name,
                                deptId: d.id,
                                deptName: d.name,
                                busy: d.queue.some((q) => q.status === 'now_serving'),
                                compositeKey: `${room.id}||${d.id}`,
                              }))
                            );

                            // Default: current dept in current room
                            const defaultKey = `${waitingRoom.id}||${item.departmentId}`;
                            const selectedKey = dispatchTargetMap[item.id] ?? defaultKey;
                            const target = allDepts.find((d) => d.compositeKey === selectedKey)
                              ?? allDepts.find((d) => d.compositeKey === defaultKey)
                              ?? allDepts[0];

                            return (
                              <div className="flex flex-col items-stretch gap-1.5 min-w-[210px]">
                                {/* Room + Dept grouped selector */}
                                <select
                                  value={selectedKey}
                                  onChange={(e) =>
                                    setDispatchTargetMap((prev) => ({
                                      ...prev,
                                      [item.id]: e.target.value,
                                    }))
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#800020] cursor-pointer"
                                >
                                  {allWaitingRooms.map((room) => (
                                    <optgroup key={room.id} label={`📍 ${room.name}`}>
                                      {room.departments.map((d) => {
                                        const busy = d.queue.some((q) => q.status === 'now_serving');
                                        const key = `${room.id}||${d.id}`;
                                        return (
                                          <option key={key} value={key}>
                                            {d.name} {busy ? '(⏳ Busy)' : '(🟢 Free)'}
                                          </option>
                                        );
                                      })}
                                    </optgroup>
                                  ))}
                                </select>

                                {/* Move / Force Move button */}
                                {!target?.busy ? (
                                  <button
                                    onClick={() =>
                                      handleSirMoveParent(
                                        item.departmentId,
                                        item.id,
                                        target?.roomId ?? waitingRoom.id,
                                        target?.deptId ?? item.departmentId,
                                        target?.deptName ?? '',
                                        false
                                      )
                                    }
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Move → {target?.deptName ?? 'Desk'}</span>
                                  </button>
                                ) : (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-[11px] text-amber-700 font-medium italic">
                                      {target?.deptName} abhi busy hai
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleSirMoveParent(
                                          item.departmentId,
                                          item.id,
                                          target?.roomId ?? waitingRoom.id,
                                          target?.deptId ?? item.departmentId,
                                          target?.deptName ?? '',
                                          true
                                        )
                                      }
                                      className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold cursor-pointer transition-colors"
                                    >
                                      Move Anyway
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })() : isNowServing ? (
                            <button
                              onClick={() =>
                                onUpdateParentStatus(item.departmentId, item.id, 'completed')
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                              title="Mark meeting complete (Frees up desk)"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Finish Meeting (Free Desk)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                onUpdateParentStatus(item.departmentId, item.id, 'waiting')
                              }
                              className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold cursor-pointer"
                              title="Move back to waiting"
                            >
                              Re-open
                            </button>
                          )}
                        </td>

                        {/* Extra Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            {/* View Token Slip / Pass Modal */}
                            <button
                              onClick={() => {
                                const deptObj = waitingRoom.departments.find(
                                  (d) => d.id === item.departmentId
                                );
                                setPassParent(item);
                                setPassDept(deptObj || null);
                                setIsPassModalOpen(true);
                              }}
                              className="p-1 rounded text-[#800020] hover:bg-rose-50 transition-colors cursor-pointer"
                              title="View Token Pass & WhatsApp Slip"
                            >
                              <Ticket className="w-3.5 h-3.5 text-[#800020]" />
                            </button>

                            {/* Remove from queue */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Remove token ${item.tokenNumber} from queue?`)) {
                                  onRemoveParent(item.departmentId, item.id);
                                }
                              }}
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

      {/* SECTION 3: DEPARTMENT DESKS IN THIS ROOM */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-stone-900">
              Department Meeting Desks ({waitingRoom.departments.length})
            </h3>
            <p className="text-xs text-stone-500">
              Each department desk has its own Zoom meeting link. Click on any desk to view detailed room controls.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {waitingRoom.departments.map((dept) => {
            const servingItem = dept.queue.find((q) => q.status === 'now_serving');
            const waitingCount = dept.queue.filter((q) => q.status === 'waiting').length;
            const completedCount = dept.queue.filter((q) => q.status === 'completed').length;

            return (
              <div
                key={dept.id}
                className="bg-white rounded-xl shadow-xs border border-stone-200 hover:border-[#D4AF37] transition-all p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-lg bg-[#800020]/10 text-[#800020] flex items-center justify-center font-bold flex-shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm leading-tight">
                          {dept.name}
                        </h4>
                        <span className="text-[11px] text-stone-500">Desk Console</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingDept(dept);
                          setEditName(dept.name);
                          setEditZoom(dept.zoomLink || '');
                        }}
                        className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Edit desk details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmDept(dept)}
                        className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete desk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Live Status Pill */}
                  <div className="mt-3">
                    {servingItem ? (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            NOW SERVING
                          </span>
                          <span className="text-sm font-black text-[#800020]">
                            {servingItem.tokenNumber}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-800 truncate">
                          {servingItem.parentName} ({servingItem.studentName})
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
                        <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Desk is FREE
                        </span>
                        <span className="text-[11px] text-stone-400">Available</span>
                      </div>
                    )}
                  </div>

                  {/* Zoom Link Info */}
                  <div className="mt-3 text-xs flex items-center justify-between bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <div className="flex items-center space-x-1.5 text-stone-600 truncate">
                      <Video className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="truncate max-w-[140px]">
                        {dept.zoomLink ? dept.zoomLink : 'No Zoom link configured'}
                      </span>
                    </div>
                    {dept.zoomLink && (
                      <button
                        onClick={() => handleCopyLink(dept.id, dept.zoomLink)}
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
                        title="Copy Zoom link"
                      >
                        {copiedDeptId === dept.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDeptId === dept.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Queue Summary & Open Desk Button */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-600">
                    <strong>{waitingCount}</strong> waiting &bull; <strong>{completedCount}</strong> done
                  </span>

                  <button
                    onClick={() => onOpenDepartment(dept.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#800020] hover:bg-[#66001a] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <span>Desk Console</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: TOKEN PASS (SINGLE SLIP ONLY PRINTABLE) */}
      {passParent && passDept && (
        <TokenPassModal
          isOpen={isPassModalOpen}
          onClose={() => {
            setIsPassModalOpen(false);
            setPassParent(null);
            setPassDept(null);
          }}
          parentItem={passParent}
          departmentName={passDept.name}
          waitingRoomName={waitingRoom.name}
          zoomLink={passDept.zoomLink}
          schoolName={schoolName}
          parentsAhead={getQueuePosition(passDept, passParent.id).parentsAhead}
          estimatedWaitMinutes={getQueuePosition(passDept, passParent.id).estimatedWaitMinutes}
        />
      )}

      {/* MODAL 2: Create Department Desk */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden my-auto">
            <div className="bg-[#800020] text-white p-4 flex items-center justify-between border-b-2 border-[#D4AF37]">
              <h3 className="font-bold text-sm">Add New Department Desk</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-white/70 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Desk Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Accounts 1, IT Support, Academics"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {departmentSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setDeptName(sug)}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded text-[10px] text-stone-600 border border-stone-200"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Zoom Meeting Link <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={deptZoom}
                  onChange={(e) => setDeptZoom(e.target.value)}
                  placeholder="https://zoom.us/j/1234567890?pwd=..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!deptName.trim()}
                  className="px-5 py-2 bg-[#800020] hover:bg-[#66001a] disabled:opacity-50 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Create Desk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Department Desk */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden my-auto">
            <div className="bg-[#800020] text-white p-4 flex items-center justify-between border-b-2 border-[#D4AF37]">
              <h3 className="font-bold text-sm">Edit Desk: {editingDept.name}</h3>
              <button
                onClick={() => setEditingDept(null)}
                className="text-white/70 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Desk Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Zoom Meeting Link
                </label>
                <input
                  type="url"
                  value={editZoom}
                  onChange={(e) => setEditZoom(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editName.trim()}
                  className="px-5 py-2 bg-[#800020] hover:bg-[#66001a] disabled:opacity-50 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Rename Waiting Room */}
      {isRenamingWR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-sm overflow-hidden my-auto">
            <div className="bg-[#800020] text-white p-4 flex items-center justify-between border-b-2 border-[#D4AF37]">
              <h3 className="font-bold text-sm">Rename Waiting Room</h3>
              <button
                onClick={() => setIsRenamingWR(false)}
                className="text-white/70 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenameWRSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Waiting Room Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={wrNewName}
                  onChange={(e) => setWrNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsRenamingWR(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!wrNewName.trim()}
                  className="px-5 py-2 bg-[#800020] hover:bg-[#66001a] text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Delete Department Confirm */}
      {deleteConfirmDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-sm overflow-hidden my-auto">
            <div className="p-5 space-y-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-stone-900">
                Delete {deleteConfirmDept.name}?
              </h4>
              <p className="text-xs text-stone-600">
                Are you sure you want to remove this department desk and all its queue records?
              </p>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmDept(null)}
                  className="px-4 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteDepartment(waitingRoom.id, deleteConfirmDept.id);
                    setDeleteConfirmDept(null);
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Delete Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
