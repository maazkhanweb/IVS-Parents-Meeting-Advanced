import { DepartmentRoom, ParentQueueItem } from '../types';

/**
 * Derives a clean uppercase prefix from department name
 * e.g. "Accounts" -> "ACC", "IT Support" -> "IT", "Academics" -> "ACAD"
 */
export function getDepartmentPrefix(deptName: string): string {
  if (!deptName) return 'TOK';
  const clean = deptName.trim().toUpperCase();

  if (clean.startsWith('ACC')) return 'ACC';
  if (clean.startsWith('IT')) return 'IT';
  if (clean.startsWith('ACAD')) return 'ACAD';
  if (clean.startsWith('MAN') || clean.startsWith('MGT')) return 'MGT';
  if (clean.startsWith('ADM')) return 'ADM';
  if (clean.startsWith('FEE')) return 'FEE';
  if (clean.startsWith('EXAM')) return 'EXAM';
  if (clean.startsWith('URDU')) return 'URD';
  if (clean.startsWith('ENG')) return 'ENG';
  if (clean.startsWith('ISL') || clean.startsWith('QUR')) return 'ISL';
  if (clean.startsWith('SCI')) return 'SCI';
  if (clean.startsWith('MATH')) return 'MATH';

  // Words initials e.g. "Primary Section" -> "PS"
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return words.map((w) => w[0]).join('').substring(0, 4);
  }

  // First 3-4 letters
  return clean.replace(/[^A-Z0-9]/g, '').substring(0, 3) || 'TOK';
}

/**
 * Automatically calculates the next available token number for a department
 * e.g. ACC-01, ACC-02, ACC-03...
 */
export function getNextTokenNumber(department: DepartmentRoom): string {
  const prefix = getDepartmentPrefix(department.name);

  // Scan all existing tokens in queue to find highest numeric suffix
  let maxNum = 0;
  for (const item of department.queue) {
    // Look for digits in tokenNumber
    const match = item.tokenNumber.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  return `${prefix}-${String(nextNum).padStart(2, '0')}`;
}

/**
 * Calculates live position and wait estimation for a parent
 */
export function getQueuePosition(department: DepartmentRoom, tokenIdOrNumber: string): {
  position: number;
  parentsAhead: number;
  status: 'now_serving' | 'waiting' | 'completed' | 'unknown';
  estimatedWaitMinutes: number;
  item: ParentQueueItem | null;
} {
  const item = department.queue.find(
    (q) => q.id === tokenIdOrNumber || q.tokenNumber.toUpperCase() === tokenIdOrNumber.toUpperCase()
  );

  if (!item) {
    return {
      position: 0,
      parentsAhead: 0,
      status: 'unknown',
      estimatedWaitMinutes: 0,
      item: null,
    };
  }

  if (item.status === 'now_serving') {
    return {
      position: 1,
      parentsAhead: 0,
      status: 'now_serving',
      estimatedWaitMinutes: 0,
      item,
    };
  }

  if (item.status === 'completed') {
    return {
      position: 0,
      parentsAhead: 0,
      status: 'completed',
      estimatedWaitMinutes: 0,
      item,
    };
  }

  // Waiting list
  const waitingList = department.queue.filter((q) => q.status === 'waiting');
  const index = waitingList.findIndex((q) => q.id === item.id);
  const isSomeoneServing = department.queue.some((q) => q.status === 'now_serving');

  const ahead = (index >= 0 ? index : 0) + (isSomeoneServing ? 1 : 0);
  const estimatedWaitMinutes = Math.max(5, ahead * 7);

  return {
    position: (index >= 0 ? index + 1 : 1),
    parentsAhead: ahead,
    status: 'waiting',
    estimatedWaitMinutes,
    item,
  };
}

/**
 * Formats a clean WhatsApp / SMS message slip for the parent
 */
export function formatWhatsAppSlip(params: {
  schoolName: string;
  tokenNumber: string;
  parentName: string;
  studentName: string;
  departmentName: string;
  waitingRoomName: string;
  parentsAhead: number;
  estimatedWaitMinutes: number;
  zoomLink?: string;
  issue?: string;
}): string {
  const {
    schoolName,
    tokenNumber,
    parentName,
    studentName,
    departmentName,
    waitingRoomName,
    parentsAhead,
    estimatedWaitMinutes,
    zoomLink,
    issue,
  } = params;

  let msg = `*${schoolName} - Parents Meeting*\n`;
  msg += `----------------------------------------\n`;
  msg += `🎫 *Token Number:* *${tokenNumber}*\n`;
  msg += `👤 *Parent:* ${parentName}\n`;
  msg += `🎓 *Student:* ${studentName}\n`;
  msg += `🏢 *Room / Section:* ${waitingRoomName}\n`;
  msg += `💼 *Department Desk:* ${departmentName}\n`;
  if (issue) {
    msg += `📝 *Agenda / Issue:* ${issue}\n`;
  }
  msg += `----------------------------------------\n`;

  if (parentsAhead === 0) {
    msg += `🟢 *Status:* NOW SERVING (Aap ki baari hai!)\n`;
  } else {
    msg += `⏳ *Status:* WAITING\n`;
    msg += `👥 *Aap ke aage:* ${parentsAhead} parent(s)\n`;
    msg += `⏱️ *Takhmeenan Intezar:* ~${estimatedWaitMinutes} minutes\n`;
  }

  if (zoomLink) {
    msg += `\n🔗 *Meeting Zoom Link:*\n${zoomLink}\n`;
    msg += `_(Barahe karam token screen par call hote hi meeting join karein)_\n`;
  } else {
    msg += `\n_(Zoom link staff jald activate karega)_\n`;
  }

  msg += `----------------------------------------\n`;
  msg += `Iqra Virtual School Parents-Teacher Conference 2026`;

  return msg;
}
