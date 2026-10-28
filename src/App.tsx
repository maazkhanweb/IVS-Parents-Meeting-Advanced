import React, { useState, useEffect, useCallback } from 'react';
import { AppData, WaitingRoom, DepartmentRoom, ParentQueueItem, QueueStatus } from './types';
import { 
  loadAppData, 
  saveAppData, 
  exportDataAsJson, 
  getStarterRooms,
  DEFAULT_APP_DATA 
} from './utils/storage';
import { playChime } from './utils/audio';
import { Header } from './components/Header';
import { Breadcrumb } from './components/Breadcrumb';
import { WaitingRoomsDashboard } from './components/WaitingRoomsDashboard';
import { WaitingRoomDetail } from './components/WaitingRoomDetail';
import { DepartmentRoomDetail } from './components/DepartmentRoomDetail';
import { ParentDisplayView } from './components/ParentDisplayView';
import { ParentTrackerView } from './components/ParentTrackerView';
import { InstructionsModal } from './components/InstructionsModal';

export default function App() {
  const [appData, setAppData] = useState<AppData>(loadAppData);
  const [activeWaitingRoomId, setActiveWaitingRoomId] = useState<string | null>(null);
  const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(null);
  const [isPublicDisplay, setIsPublicDisplay] = useState(false);
  const [isParentTracker, setIsParentTracker] = useState(false);
  const [trackingToken, setTrackingToken] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Sync state to localStorage whenever appData changes
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // URL Hash handling for direct links (#token=ACC-01, #track, #display)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#token=')) {
        const token = decodeURIComponent(hash.replace('#token=', '').trim());
        setTrackingToken(token);
        setIsParentTracker(true);
        setIsPublicDisplay(false);
      } else if (hash === '#track') {
        setIsParentTracker(true);
        setIsPublicDisplay(false);
      } else if (hash === '#display') {
        setIsPublicDisplay(true);
        setIsParentTracker(false);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // ── Browser Back Button Fix ──────────────────────────────────────────────
  // Push a history entry whenever the user navigates deeper inside the app,
  // then intercept popstate so the PC back button works within the SPA
  // instead of navigating away from the page entirely.

  // Push a history state entry whenever the "page" changes
  useEffect(() => {
    // Determine current depth level
    if (isParentTracker) {
      window.history.pushState({ page: 'tracker' }, '');
    } else if (isPublicDisplay) {
      window.history.pushState({ page: 'display' }, '');
    } else if (activeDepartmentId) {
      window.history.pushState({ page: 'department', id: activeDepartmentId }, '');
    } else if (activeWaitingRoomId) {
      window.history.pushState({ page: 'waitingRoom', id: activeWaitingRoomId }, '');
    } else {
      // Home – replace so there is always at least one entry
      window.history.replaceState({ page: 'home' }, '');
    }
  }, [activeWaitingRoomId, activeDepartmentId, isPublicDisplay, isParentTracker]);

  // Intercept browser back/forward button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { page?: string } | null;
      const page = state?.page ?? 'home';

      if (page === 'home') {
        setActiveWaitingRoomId(null);
        setActiveDepartmentId(null);
        setIsPublicDisplay(false);
        setIsParentTracker(false);
      } else if (page === 'waitingRoom') {
        setActiveDepartmentId(null);
        setIsPublicDisplay(false);
        setIsParentTracker(false);
      } else if (page === 'department') {
        setIsPublicDisplay(false);
        setIsParentTracker(false);
      } else if (page === 'display' || page === 'tracker') {
        setIsPublicDisplay(false);
        setIsParentTracker(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync changes from other tabs in the same browser (live multi-screen sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ivs_parents_meeting_data_v1' && e.newValue) {
        try {
          const incoming = JSON.parse(e.newValue);
          if (incoming && Array.isArray(incoming.waitingRooms)) {
            setAppData(incoming);
          }
        } catch {
          // Ignore invalid parse
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Audio helper
  const triggerChime = useCallback(() => {
    if (appData.soundEnabled) {
      playChime();
    }
  }, [appData.soundEnabled]);

  // Toggle sound
  const handleToggleSound = () => {
    setAppData((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  // Find active room & department
  const activeWaitingRoom = appData.waitingRooms.find((r) => r.id === activeWaitingRoomId);
  const activeDepartment = activeWaitingRoom?.departments.find((d) => d.id === activeDepartmentId);

  // Navigation handlers
  const handleGoHome = () => {
    setActiveWaitingRoomId(null);
    setActiveDepartmentId(null);
    setIsPublicDisplay(false);
    setIsParentTracker(false);
  };

  const handleGoToWaitingRoom = () => {
    setActiveDepartmentId(null);
    setIsPublicDisplay(false);
    setIsParentTracker(false);
  };

  const handleBack = () => {
    if (isParentTracker) {
      setIsParentTracker(false);
      return;
    }
    if (isPublicDisplay) {
      setIsPublicDisplay(false);
      return;
    }
    if (activeDepartmentId) {
      setActiveDepartmentId(null);
      return;
    }
    if (activeWaitingRoomId) {
      setActiveWaitingRoomId(null);
    }
  };

  // Waiting Room CRUD
  const handleCreateWaitingRoom = (name: string) => {
    const newRoom: WaitingRoom = {
      id: 'wr-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      name,
      createdAt: new Date().toISOString(),
      departments: [],
    };
    setAppData((prev) => ({
      ...prev,
      waitingRooms: [...prev.waitingRooms, newRoom],
    }));
  };

  const handleRenameWaitingRoom = (roomId: string, newName: string) => {
    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === roomId ? { ...r, name: newName } : r
      ),
    }));
  };

  const handleDeleteWaitingRoom = (roomId: string) => {
    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.filter((r) => r.id !== roomId),
    }));
    if (activeWaitingRoomId === roomId) {
      setActiveWaitingRoomId(null);
      setActiveDepartmentId(null);
    }
  };

  // Department CRUD
  const handleCreateDepartment = (waitingRoomId: string, name: string, zoomLink: string) => {
    const newDept: DepartmentRoom = {
      id: 'dept-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      name,
      zoomLink,
      createdAt: new Date().toISOString(),
      queue: [],
    };

    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === waitingRoomId
          ? { ...r, departments: [...r.departments, newDept] }
          : r
      ),
    }));
  };

  const handleRenameDepartment = (
    waitingRoomId: string,
    departmentId: string,
    newName: string
  ) => {
    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === waitingRoomId
          ? {
              ...r,
              departments: r.departments.map((d) =>
                d.id === departmentId ? { ...d, name: newName } : d
              ),
            }
          : r
      ),
    }));
  };

  const handleUpdateZoomLink = (
    waitingRoomId: string,
    departmentId: string,
    zoomLink: string
  ) => {
    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === waitingRoomId
          ? {
              ...r,
              departments: r.departments.map((d) =>
                d.id === departmentId ? { ...d, zoomLink } : d
              ),
            }
          : r
      ),
    }));
  };

  const handleDeleteDepartment = (waitingRoomId: string, departmentId: string) => {
    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === waitingRoomId
          ? {
              ...r,
              departments: r.departments.filter((d) => d.id !== departmentId),
            }
          : r
      ),
    }));
    if (activeDepartmentId === departmentId) {
      setActiveDepartmentId(null);
    }
  };

  // Queue Item CRUD (Auto or Manual Token)
  const handleAddParent = (
    parentData: Omit<ParentQueueItem, 'id' | 'createdAt'>
  ): ParentQueueItem => {
    if (!activeWaitingRoomId || !activeDepartmentId) {
      throw new Error('No active department selected');
    }

    const newItem: ParentQueueItem = {
      ...parentData,
      id: 'pq-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };

    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === activeWaitingRoomId
          ? {
              ...r,
              departments: r.departments.map((d) =>
                d.id === activeDepartmentId
                  ? { ...d, queue: [...d.queue, newItem] }
                  : d
              ),
            }
          : r
      ),
    }));

    return newItem;
  };

  const handleUpdateParentStatus = (parentId: string, status: QueueStatus) => {
    if (!activeWaitingRoomId || !activeDepartmentId) return;

    // If changing to 'now_serving', ring the chime!
    if (status === 'now_serving') {
      triggerChime();
    }

    const now = new Date().toISOString();

    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === activeWaitingRoomId
          ? {
              ...r,
              departments: r.departments.map((d) => {
                if (d.id !== activeDepartmentId) return d;

                return {
                  ...d,
                  queue: d.queue.map((item) => {
                    // If setting a new item to now_serving, we can either set previous serving to waiting or keep it
                    if (status === 'now_serving' && item.status === 'now_serving' && item.id !== parentId) {
                      // Automatically demote previously serving to completed or keep waiting
                      return {
                        ...item,
                        status: 'completed' as QueueStatus,
                        completedAt: now,
                      };
                    }

                    if (item.id === parentId) {
                      return {
                        ...item,
                        status,
                        servedAt: status === 'now_serving' ? now : item.servedAt,
                        completedAt: status === 'completed' ? now : undefined,
                      };
                    }
                    return item;
                  }),
                };
              }),
            }
          : r
      ),
    }));
  };

  const handleUpdateParentDetails = (
    parentId: string,
    details: Partial<ParentQueueItem>
  ) => {
    if (!activeWaitingRoomId || !activeDepartmentId) return;

    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === activeWaitingRoomId
          ? {
              ...r,
              departments: r.departments.map((d) =>
                d.id === activeDepartmentId
                  ? {
                      ...d,
                      queue: d.queue.map((item) =>
                        item.id === parentId ? { ...item, ...details } : item
                      ),
                    }
                  : d
              ),
            }
          : r
      ),
    }));
  };

  const handleRemoveParent = (parentId: string) => {
    if (!activeWaitingRoomId || !activeDepartmentId) return;

    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === activeWaitingRoomId
          ? {
              ...r,
              departments: r.departments.map((d) =>
                d.id === activeDepartmentId
                  ? {
                      ...d,
                      queue: d.queue.filter((item) => item.id !== parentId),
                    }
                  : d
              ),
            }
          : r
      ),
    }));
  };

  // Waiting Room Level: Add parent to a specific department from the Waiting Room
  const handleAddParentToDepartment = (
    waitingRoomId: string,
    departmentId: string,
    parentData: Omit<ParentQueueItem, 'id' | 'createdAt'>
  ): ParentQueueItem => {
    const newItem: ParentQueueItem = {
      ...parentData,
      id: 'pq-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };

    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === waitingRoomId
          ? {
              ...r,
              departments: r.departments.map((d) =>
                d.id === departmentId
                  ? { ...d, queue: [...d.queue, newItem] }
                  : d
              ),
            }
          : r
      ),
    }));

    return newItem;
  };

  // Waiting Room Level: Move a waiting parent into their department desk (sets Now Serving)
  const handleMoveParentToDepartment = (
    waitingRoomId: string,
    departmentId: string,
    parentId: string
  ) => {
    const now = new Date().toISOString();
    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === waitingRoomId
          ? {
              ...r,
              departments: r.departments.map((d) => {
                if (d.id !== departmentId) return d;
                return {
                  ...d,
                  queue: d.queue.map((item) => {
                    if (item.id === parentId) {
                      return {
                        ...item,
                        status: 'now_serving' as QueueStatus,
                        servedAt: now,
                      };
                    }
                    return item;
                  }),
                };
              }),
            }
          : r
      ),
    }));

    triggerChime();
  };

  // GLOBAL Move: Move parent from any dept/room to any other dept/room (cross-room support)
  const handleMoveParentGlobal = (
    fromWaitingRoomId: string,
    fromDeptId: string,
    parentId: string,
    toWaitingRoomId: string,
    toDeptId: string
  ) => {
    const now = new Date().toISOString();
    setAppData((prev) => {
      // Find the parent item
      const fromRoom = prev.waitingRooms.find((r) => r.id === fromWaitingRoomId);
      if (!fromRoom) return prev;
      const fromDept = fromRoom.departments.find((d) => d.id === fromDeptId);
      if (!fromDept) return prev;
      const parentItem = fromDept.queue.find((q) => q.id === parentId);
      if (!parentItem) return prev;

      return {
        ...prev,
        waitingRooms: prev.waitingRooms.map((r) => {
          // Remove from source room/dept
          if (r.id === fromWaitingRoomId) {
            const updatedDepts = r.departments.map((d) => {
              if (d.id === fromDeptId) {
                return { ...d, queue: d.queue.filter((q) => q.id !== parentId) };
              }
              // If same room AND same target dept, also add here
              if (r.id === toWaitingRoomId && d.id === toDeptId) {
                return {
                  ...d,
                  queue: [
                    ...d.queue,
                    { ...parentItem, status: 'now_serving' as QueueStatus, servedAt: now },
                  ],
                };
              }
              return d;
            });
            return { ...r, departments: updatedDepts };
          }
          // Add to target room/dept (if different room)
          if (r.id === toWaitingRoomId && r.id !== fromWaitingRoomId) {
            return {
              ...r,
              departments: r.departments.map((d) => {
                if (d.id === toDeptId) {
                  return {
                    ...d,
                    queue: [
                      ...d.queue,
                      { ...parentItem, status: 'now_serving' as QueueStatus, servedAt: now },
                    ],
                  };
                }
                return d;
              }),
            };
          }
          return r;
        }),
      };
    });
    triggerChime();
  };

  // Waiting Room Level: Move parent from one department to any other department desk (cross-dept)
  const handleMoveCrossDepartment = (
    waitingRoomId: string,
    fromDeptId: string,
    parentId: string,
    toDeptId: string
  ) => {
    const now = new Date().toISOString();
    setAppData((prev) => {
      // Find the parent item in the source department
      const room = prev.waitingRooms.find((r) => r.id === waitingRoomId);
      if (!room) return prev;
      const fromDept = room.departments.find((d) => d.id === fromDeptId);
      if (!fromDept) return prev;
      const parentItem = fromDept.queue.find((q) => q.id === parentId);
      if (!parentItem) return prev;

      return {
        ...prev,
        waitingRooms: prev.waitingRooms.map((r) => {
          if (r.id !== waitingRoomId) return r;
          return {
            ...r,
            departments: r.departments.map((d) => {
              if (d.id === fromDeptId) {
                // Remove parent from source department
                return { ...d, queue: d.queue.filter((q) => q.id !== parentId) };
              }
              if (d.id === toDeptId) {
                // Add parent to target department as now_serving
                return {
                  ...d,
                  queue: [
                    ...d.queue,
                    {
                      ...parentItem,
                      status: 'now_serving' as QueueStatus,
                      servedAt: now,
                    },
                  ],
                };
              }
              return d;
            }),
          };
        }),
      };
    });
    triggerChime();
  };

  // Waiting Room Level: Update parent status
  const handleUpdateParentStatusInRoom = (
    waitingRoomId: string,
    departmentId: string,
    parentId: string,
    status: QueueStatus
  ) => {
    const now = new Date().toISOString();
    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === waitingRoomId
          ? {
              ...r,
              departments: r.departments.map((d) => {
                if (d.id !== departmentId) return d;
                return {
                  ...d,
                  queue: d.queue.map((item) => {
                    if (item.id === parentId) {
                      return {
                        ...item,
                        status,
                        servedAt: status === 'now_serving' ? now : item.servedAt,
                        completedAt: status === 'completed' ? now : undefined,
                      };
                    }
                    return item;
                  }),
                };
              }),
            }
          : r
      ),
    }));

    if (status === 'now_serving') {
      triggerChime();
    }
  };

  // Waiting Room Level: Remove parent
  const handleRemoveParentFromRoom = (
    waitingRoomId: string,
    departmentId: string,
    parentId: string
  ) => {
    setAppData((prev) => ({
      ...prev,
      waitingRooms: prev.waitingRooms.map((r) =>
        r.id === waitingRoomId
          ? {
              ...r,
              departments: r.departments.map((d) =>
                d.id === departmentId
                  ? { ...d, queue: d.queue.filter((p) => p.id !== parentId) }
                  : d
              ),
            }
          : r
      ),
    }));
  };

  // Backup & Restore
  const handleExportData = () => {
    exportDataAsJson(appData);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.waitingRooms)) {
          setAppData(parsed);
          saveAppData(parsed);
          alert('Data restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch {
        alert('Failed to read file. Please check the JSON format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadStarterRooms = () => {
    const starters = getStarterRooms();
    setAppData((prev) => ({
      ...prev,
      waitingRooms: starters,
    }));
  };

  // Public display triggers
  const handleOpenPublicDisplay = (roomId?: string) => {
    if (roomId) {
      setActiveWaitingRoomId(roomId);
    }
    setIsPublicDisplay(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      {/* If in Parent Tracker Mode, show live mobile/desktop tracking screen */}
      {isParentTracker ? (
        <ParentTrackerView
          waitingRooms={appData.waitingRooms}
          schoolName={appData.schoolName}
          onExit={() => setIsParentTracker(false)}
          soundEnabled={appData.soundEnabled}
          onToggleSound={handleToggleSound}
          onCallTokenChime={triggerChime}
          initialTokenNumber={trackingToken}
        />
      ) : isPublicDisplay ? (
        /* If in Public Display Mode, show full-screen board */
        <ParentDisplayView
          waitingRooms={appData.waitingRooms}
          selectedWaitingRoomId={activeWaitingRoomId}
          selectedDepartmentId={activeDepartmentId}
          onExit={() => setIsPublicDisplay(false)}
          soundEnabled={appData.soundEnabled}
          onToggleSound={handleToggleSound}
          onCallTokenChime={triggerChime}
        />
      ) : (
        <>
          {/* Main App Navigation Bar */}
          <Header
            soundEnabled={appData.soundEnabled}
            onToggleSound={handleToggleSound}
            onOpenGuide={() => setIsGuideOpen(true)}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onNavigateHome={handleGoHome}
            onOpenParentTracker={() => {
              setTrackingToken('');
              setIsParentTracker(true);
            }}
            isHome={!activeWaitingRoomId && !activeDepartmentId}
          />

          {/* Breadcrumbs with Back button (Requirement 6) */}
          <Breadcrumb
            waitingRoomName={activeWaitingRoom?.name}
            departmentName={activeDepartment?.name}
            onGoHome={handleGoHome}
            onGoToWaitingRoom={handleGoToWaitingRoom}
            onBack={handleBack}
          />

          {/* Body views */}
          <main className="flex-1 pb-12">
            {/* Level 3: Department Room Detail */}
            {activeWaitingRoom && activeDepartment ? (
              <DepartmentRoomDetail
                department={activeDepartment}
                waitingRoomName={activeWaitingRoom.name}
                schoolName={appData.schoolName}
                onBack={handleGoToWaitingRoom}
                onUpdateZoomLink={(link) =>
                  handleUpdateZoomLink(activeWaitingRoom.id, activeDepartment.id, link)
                }
                onAddParent={handleAddParent}
                onUpdateParentStatus={handleUpdateParentStatus}
                onUpdateParentDetails={handleUpdateParentDetails}
                onRemoveParent={handleRemoveParent}
                onOpenPublicDisplay={() => setIsPublicDisplay(true)}
                onOpenParentTracker={(token) => {
                  setTrackingToken(token || '');
                  setIsParentTracker(true);
                }}
                onCallTokenChime={triggerChime}
                soundEnabled={appData.soundEnabled}
              />
            ) : /* Level 2: Waiting Room Detail */
            activeWaitingRoom ? (
              <WaitingRoomDetail
                waitingRoom={activeWaitingRoom}
                schoolName={appData.schoolName}
                allWaitingRooms={appData.waitingRooms}
                onBack={handleGoHome}
                onCreateDepartment={handleCreateDepartment}
                onRenameDepartment={handleRenameDepartment}
                onUpdateZoomLink={handleUpdateZoomLink}
                onDeleteDepartment={handleDeleteDepartment}
                onOpenDepartment={(deptId) => setActiveDepartmentId(deptId)}
                onOpenPublicDisplay={(roomId) => handleOpenPublicDisplay(roomId)}
                onRenameWaitingRoom={handleRenameWaitingRoom}
                onAddParentToDepartment={(deptId, parentData) =>
                  handleAddParentToDepartment(activeWaitingRoom.id, deptId, parentData)
                }
                onMoveParentToDepartment={(deptId, parentId) =>
                  handleMoveParentToDepartment(activeWaitingRoom.id, deptId, parentId)
                }
                onMoveCrossDepartment={(fromDeptId, parentId, toDeptId) =>
                  handleMoveCrossDepartment(activeWaitingRoom.id, fromDeptId, parentId, toDeptId)
                }
                onMoveParentGlobal={(fromDeptId, parentId, toWaitingRoomId, toDeptId) =>
                  handleMoveParentGlobal(activeWaitingRoom.id, fromDeptId, parentId, toWaitingRoomId, toDeptId)
                }
                onUpdateParentStatus={(deptId, parentId, status) =>
                  handleUpdateParentStatusInRoom(activeWaitingRoom.id, deptId, parentId, status)
                }
                onRemoveParent={(deptId, parentId) =>
                  handleRemoveParentFromRoom(activeWaitingRoom.id, deptId, parentId)
                }
                onOpenParentTracker={(token) => {
                  setTrackingToken(token || '');
                  setIsParentTracker(true);
                }}
                onCallTokenChime={triggerChime}
                soundEnabled={appData.soundEnabled}
              />
            ) : (
              /* Level 1: Main Dashboard */
              <WaitingRoomsDashboard
                waitingRooms={appData.waitingRooms}
                onCreateWaitingRoom={handleCreateWaitingRoom}
                onRenameWaitingRoom={handleRenameWaitingRoom}
                onDeleteWaitingRoom={handleDeleteWaitingRoom}
                onOpenWaitingRoom={(roomId) => {
                  setActiveWaitingRoomId(roomId);
                  setActiveDepartmentId(null);
                }}
                onOpenPublicDisplay={handleOpenPublicDisplay}
                onOpenParentTracker={() => {
                  setTrackingToken('');
                  setIsParentTracker(true);
                }}
                onLoadStarterRooms={handleLoadStarterRooms}
              />
            )}
          </main>

          {/* App Footer */}
          <footer className="bg-white border-t border-stone-200 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-stone-600 no-print">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#800020]">Iqra Virtual School</span>
                <span>•</span>
                <span>Parents Meeting – Waiting Room &amp; Token Management System</span>
              </div>
              <div className="text-stone-600">
                Persistent Local Storage Enabled &bull; No Server Setup Required
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Staff Instructions Modal */}
      <InstructionsModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
