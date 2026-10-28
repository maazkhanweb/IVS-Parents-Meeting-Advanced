export type QueueStatus = 'waiting' | 'now_serving' | 'completed';

export interface ParentQueueItem {
  id: string;
  tokenNumber: string; // Manually assigned by staff (e.g. "A-01", "101", "AC-05")
  parentName: string;
  studentName: string;
  issue?: string;
  status: QueueStatus;
  createdAt: string;
  servedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface DepartmentRoom {
  id: string;
  name: string; // e.g. "Accounts", "Accounts 1", "IT Support", "Management", "Academics"
  zoomLink: string; // Configured Zoom link
  createdAt: string;
  queue: ParentQueueItem[];
}

export interface WaitingRoom {
  id: string;
  name: string; // e.g. "Waiting Room 1", "Waiting Room 2", "Primary Section"
  createdAt: string;
  departments: DepartmentRoom[];
}

export interface AppData {
  waitingRooms: WaitingRoom[];
  soundEnabled: boolean;
  schoolName: string;
  lastUpdated: string;
}
