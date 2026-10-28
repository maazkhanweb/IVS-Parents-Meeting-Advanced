import React, { useState } from 'react';
import { WaitingRoom } from '../types';
import { 
  Plus, 
  DoorOpen, 
  Edit3, 
  Trash2, 
  Tv, 
  Layers, 
  Users, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Search,
  Radio
} from 'lucide-react';

interface WaitingRoomsDashboardProps {
  waitingRooms: WaitingRoom[];
  onCreateWaitingRoom: (name: string) => void;
  onRenameWaitingRoom: (roomId: string, newName: string) => void;
  onDeleteWaitingRoom: (roomId: string) => void;
  onOpenWaitingRoom: (roomId: string) => void;
  onOpenPublicDisplay: (roomId?: string) => void;
  onOpenParentTracker?: () => void;
  onLoadStarterRooms: () => void;
}

export const WaitingRoomsDashboard: React.FC<WaitingRoomsDashboardProps> = ({
  waitingRooms,
  onCreateWaitingRoom,
  onRenameWaitingRoom,
  onDeleteWaitingRoom,
  onOpenWaitingRoom,
  onOpenPublicDisplay,
  onOpenParentTracker,
  onLoadStarterRooms,
}) => {
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  
  const [editingRoom, setEditingRoom] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmRoom, setDeleteConfirmRoom] = useState<WaitingRoom | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  // Example name suggestions
  const quickSuggestions = ['Waiting Room 1', 'Waiting Room 2', 'Waiting Room 3', 'Primary Section', 'Senior School'];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onCreateWaitingRoom(newRoomName.trim());
    setNewRoomName('');
    setIsCreateOpen(false);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.name.trim()) return;
    onRenameWaitingRoom(editingRoom.id, editingRoom.name.trim());
    setEditingRoom(null);
  };

  // Compute aggregate stats
  const totalDepartments = waitingRooms.reduce((acc, r) => acc + r.departments.length, 0);
  const totalWaiting = waitingRooms.reduce(
    (acc, r) => acc + r.departments.reduce((dAcc, d) => dAcc + d.queue.filter(q => q.status === 'waiting').length, 0),
    0
  );
  const totalNowServing = waitingRooms.reduce(
    (acc, r) => acc + r.departments.reduce((dAcc, d) => dAcc + d.queue.filter(q => q.status === 'now_serving').length, 0),
    0
  );
  const totalCompleted = waitingRooms.reduce(
    (acc, r) => acc + r.departments.reduce((dAcc, d) => dAcc + d.queue.filter(q => q.status === 'completed').length, 0),
    0
  );

  // Filtered rooms
  const filteredRooms = waitingRooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.departments.some(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero / Action Header */}
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-5 sm:p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-[#800020] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#800020]"></span>
              Live Session Control
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              IVS Parents Meeting Management
            </h2>
            <p className="text-stone-700 text-sm mt-1 max-w-2xl">
              Create and manage parent waiting rooms, configure department rooms with Zoom meeting links, and manage token queues in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenParentTracker && (
              <button
                onClick={onOpenParentTracker}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-[#D4AF37] bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm transition-colors cursor-pointer shadow-xs active:scale-95"
                title="Open Live Parent Token Tracker"
              >
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Parent Tracker</span>
              </button>
            )}

            {waitingRooms.length > 0 && (
              <button
                onClick={() => onOpenPublicDisplay()}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-[#D4AF37] bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 font-semibold text-sm transition-colors cursor-pointer shadow-xs active:scale-95"
                title="Open a full-screen display board for parents or Zoom screen share"
              >
                <Tv className="w-4 h-4 text-[#800020]" />
                <span>Parent Display Board</span>
              </button>
            )}

            {/* Prominent + Create Waiting Room button */}
            <button
              onClick={() => {
                setNewRoomName('');
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#800020] hover:bg-[#66001a] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 border-b-2 border-[#D4AF37] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Create Waiting Room</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-100">
          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#800020]/10 text-[#800020] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-stone-900">{waitingRooms.length}</div>
              <div className="text-xs text-stone-700 font-medium">Waiting Rooms</div>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-stone-900">{totalDepartments}</div>
              <div className="text-xs text-stone-700 font-medium">Department Desks</div>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-700">{totalNowServing}</div>
              <div className="text-xs text-stone-700 font-medium">Now Serving</div>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-stone-900">{totalWaiting}</div>
              <div className="text-xs text-stone-700 font-medium">Parents in Queue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Section Header */}
      {waitingRooms.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-stone-900">Active Waiting Rooms</h3>
            <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-xs font-semibold">
              {waitingRooms.length}
            </span>
          </div>

          {waitingRooms.length > 3 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms or departments..."
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {waitingRooms.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#800020] mb-4 shadow-inner">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">No Waiting Rooms Created Yet</h3>
          <p className="text-stone-700 text-sm mt-2 max-w-md mx-auto">
            Get started by creating your first waiting room for tomorrow's parents meeting. You can set up rooms like “Waiting Room 1” or “Primary Wing”.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setNewRoomName('Waiting Room 1');
                setIsCreateOpen(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#800020] hover:bg-[#66001a] text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Create Waiting Room</span>
            </button>

            <button
              onClick={onLoadStarterRooms}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-sm transition-colors cursor-pointer"
              title="Loads Waiting Room 1 with Accounts, IT Support & Academics desks (queue empty)"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Load Starter Template</span>
            </button>
          </div>
        </div>
      ) : (
        /* Waiting Rooms Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const roomWaiting = room.departments.reduce(
              (acc, d) => acc + d.queue.filter(q => q.status === 'waiting').length, 0
            );
            const roomServing = room.departments.reduce(
              (acc, d) => acc + d.queue.filter(q => q.status === 'now_serving').length, 0
            );
            const roomCompleted = room.departments.reduce(
              (acc, d) => acc + d.queue.filter(q => q.status === 'completed').length, 0
            );

            return (
              <div
                key={room.id}
                className="bg-white rounded-xl border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-[#800020]/30"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-stone-100 bg-gradient-to-b from-stone-50/50 to-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#800020] text-white flex items-center justify-center font-bold shadow-xs">
                        <DoorOpen className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-lg leading-snug group-hover:text-[#800020] transition-colors">
                          {room.name}
                        </h4>
                        <p className="text-xs text-stone-700">
                          {room.departments.length} department {room.departments.length === 1 ? 'desk' : 'desks'} configured
                        </p>
                      </div>
                    </div>

                    {/* Action buttons (Rename & Delete) */}
                    <div className="flex items-center space-x-1 text-stone-400">
                      <button
                        onClick={() => setEditingRoom({ id: room.id, name: room.name })}
                        className="p-1.5 rounded-md hover:text-[#800020] hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Rename this waiting room"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmRoom(room)}
                        className="p-1.5 rounded-md hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete waiting room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Department Tags Preview */}
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">
                      Departments
                    </span>
                    {room.departments.length === 0 ? (
                      <span className="text-xs text-stone-600 italic">
                        No department rooms yet. Click "Open Room" to add.
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                        {room.departments.map((dept) => (
                          <span
                            key={dept.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200"
                          >
                            {dept.name}
                            {dept.zoomLink && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-1.5" title="Zoom link active" />
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Live Stats */}
                <div className="px-5 py-3 bg-stone-50/70 border-b border-stone-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="font-bold text-emerald-700 text-sm">{roomServing}</div>
                    <div className="text-stone-700 text-[11px]">Serving</div>
                  </div>
                  <div>
                    <div className="font-bold text-amber-700 text-sm">{roomWaiting}</div>
                    <div className="text-stone-700 text-[11px]">Waiting</div>
                  </div>
                  <div>
                    <div className="font-bold text-stone-600 text-sm">{roomCompleted}</div>
                    <div className="text-stone-700 text-[11px]">Completed</div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-white flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenPublicDisplay(room.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                    title="Open screen view for parents"
                  >
                    <Tv className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Parent Screen</span>
                  </button>

                  {/* Primary "Open Room" button */}
                  <button
                    onClick={() => onOpenWaitingRoom(room.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#800020] hover:bg-[#66001a] text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Open Room</span>
                    <DoorOpen className="w-4 h-4 text-[#D4AF37]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Waiting Room */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#800020] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#D4AF37]">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-base">Create Waiting Room</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-white/70 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Waiting Room Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Waiting Room 1, Waiting Room 2"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
              </div>

              {/* Quick Suggestions */}
              <div>
                <span className="text-[11px] font-medium text-stone-600 block mb-1.5">
                  Quick suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setNewRoomName(suggestion)}
                      className="text-xs px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md border border-stone-200 transition-colors cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRoomName.trim()}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#800020] hover:bg-[#66001a] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Rename Waiting Room */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-stone-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Rename Waiting Room</h3>
              <button
                onClick={() => setEditingRoom(null)}
                className="text-white/70 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  New Room Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={editingRoom.name}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editingRoom.name.trim()}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#800020] hover:bg-[#66001a] rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteConfirmRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5">
              <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-stone-900">
                Delete "{deleteConfirmRoom.name}"?
              </h4>
              <p className="text-sm text-stone-600 mt-2">
                This will delete the waiting room along with its{' '}
                <strong className="text-stone-900">{deleteConfirmRoom.departments.length} department rooms</strong> and any parent queues inside. This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmRoom(null)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteWaitingRoom(deleteConfirmRoom.id);
                    setDeleteConfirmRoom(null);
                  }}
                  className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Delete Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
