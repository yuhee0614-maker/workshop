import { TimeSlotDef, Booking, SeatId } from '../types';

export const MAX_CAPACITY_PER_SLOT = 4;

export const SLOT_SEAT_DEFS: {
  id: SeatId;
  label: string;
  gender: 'male' | 'female';
}[] = [
  { id: '男A', label: '男A', gender: 'male' },
  { id: '男B', label: '男B', gender: 'male' },
  { id: '女A', label: '女A', gender: 'female' },
  { id: '女B', label: '女B', gender: 'female' },
];

export const DIRECT_ONLY_PROMPT_MESSAGE =
  '12:00~13:00 及 15:00~15:30 為直接人員優先預約時段，請選擇其他開放時段，謝謝！';

export const TIME_SLOTS: TimeSlotDef[] = [
  {
    id: '12:00-12:30',
    startTime: '12:00',
    endTime: '12:30',
    isDirectOnly: true,
    label: '12:00 - 12:30 (直接人員專屬)',
  },
  {
    id: '12:30-13:00',
    startTime: '12:30',
    endTime: '13:00',
    isDirectOnly: true,
    label: '12:30 - 13:00 (直接人員專屬)',
  },
  {
    id: '13:00-13:30',
    startTime: '13:00',
    endTime: '13:30',
    isDirectOnly: false,
    label: '13:00 - 13:30 (全體同仁開放)',
  },
  {
    id: '13:30-14:00',
    startTime: '13:30',
    endTime: '14:00',
    isDirectOnly: false,
    label: '13:30 - 14:00 (全體同仁開放)',
  },
  {
    id: '14:00-14:30',
    startTime: '14:00',
    endTime: '14:30',
    isDirectOnly: false,
    label: '14:00 - 14:30 (全體同仁開放)',
  },
  {
    id: '14:30-15:00',
    startTime: '14:30',
    endTime: '15:00',
    isDirectOnly: false,
    label: '14:30 - 15:00 (全體同仁開放)',
  },
  {
    id: '15:00-15:30',
    startTime: '15:00',
    endTime: '15:30',
    isDirectOnly: true,
    label: '15:00 - 15:30 (直接人員專屬)',
  },
  {
    id: '15:30-16:00',
    startTime: '15:30',
    endTime: '16:00',
    isDirectOnly: false,
    label: '15:30 - 16:00 (全體同仁開放)',
  },
  {
    id: '16:00-16:30',
    startTime: '16:00',
    endTime: '16:30',
    isDirectOnly: false,
    label: '16:00 - 16:30 (全體同仁開放)',
  },
  {
    id: '16:30-17:00',
    startTime: '16:30',
    endTime: '17:00',
    isDirectOnly: false,
    label: '16:30 - 17:00 (全體同仁開放)',
  },
];

export const INITIAL_SAMPLE_BOOKINGS: Booking[] = [
  {
    id: 'FB-20261006-001',
    date: new Date().toISOString().split('T')[0],
    slotId: '12:00-12:30',
    employeeName: '李志剛',
    employeeId: 'D1088',
    department: '製造二部 產線組',
    employeeType: 'direct',
    attendeeCount: 2,
    seats: ['男A', '男B'],
    companionNames: ['張建華'],
    notes: '產線輪班前舒緩',
    createdAt: '2026-10-06T08:30:00Z',
    status: 'confirmed',
  },
  {
    id: 'FB-20261006-002',
    date: new Date().toISOString().split('T')[0],
    slotId: '13:30-14:00',
    employeeName: '王曉婷',
    employeeId: 'I2045',
    department: '人力資源部',
    employeeType: 'indirect',
    attendeeCount: 1,
    seats: ['女A'],
    notes: '',
    createdAt: '2026-10-06T09:15:00Z',
    status: 'confirmed',
  },
  {
    id: 'FB-20261006-003',
    date: new Date().toISOString().split('T')[0],
    slotId: '14:00-14:30',
    employeeName: '陳冠宇',
    employeeId: 'I3021',
    department: '研發處 軟體組',
    employeeType: 'indirect',
    attendeeCount: 3,
    seats: ['男A', '男B', '女A'],
    companionNames: ['林子翔', '黃佩佩'],
    notes: '部門專案放鬆',
    createdAt: '2026-10-06T09:40:00Z',
    status: 'confirmed',
  },
  {
    id: 'FB-20261006-004',
    date: new Date().toISOString().split('T')[0],
    slotId: '15:00-15:30',
    employeeName: '周世傑',
    employeeId: 'D1104',
    department: '品管處 現場檢驗組',
    employeeType: 'direct',
    attendeeCount: 1,
    seats: ['男A'],
    notes: '巡檢雙腳疲勞',
    createdAt: '2026-10-06T10:00:00Z',
    status: 'confirmed',
  },
];
