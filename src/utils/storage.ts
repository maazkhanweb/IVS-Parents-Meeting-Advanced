import { AppData, WaitingRoom } from '../types';

const STORAGE_KEY = 'ivs_parents_meeting_data_v1';

export const DEFAULT_APP_DATA: AppData = {
  waitingRooms: [],
  soundEnabled: true,
  schoolName: 'Iqra Virtual School',
  lastUpdated: new Date().toISOString(),
};

/**
 * Load app data from localStorage
 */
export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_APP_DATA;
    }
    const parsed = JSON.parse(raw);
    return {
      waitingRooms: Array.isArray(parsed.waitingRooms) ? parsed.waitingRooms : [],
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      schoolName: parsed.schoolName || 'Iqra Virtual School',
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error loading data from localStorage:', err);
    return DEFAULT_APP_DATA;
  }
}

/**
 * Save app data to localStorage
 */
export function saveAppData(data: AppData): void {
  try {
    const dataToSave: AppData = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error('Error saving data to localStorage:', err);
  }
}

/**
 * Generates an initial starter structure if requested (without fake queue entries)
 */
export function getStarterRooms(): WaitingRoom[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'wr-1',
      name: 'Waiting Room 1',
      createdAt: now,
      departments: [
        {
          id: 'dept-acc',
          name: 'Accounts',
          zoomLink: '',
          createdAt: now,
          queue: [],
        },
        {
          id: 'dept-it',
          name: 'IT Support',
          zoomLink: '',
          createdAt: now,
          queue: [],
        },
        {
          id: 'dept-acad',
          name: 'Academics',
          zoomLink: '',
          createdAt: now,
          queue: [],
        },
      ],
    },
  ];
}

/**
 * Export data as downloadable JSON file
 */
export function exportDataAsJson(data: AppData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `ivs-parents-meeting-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
