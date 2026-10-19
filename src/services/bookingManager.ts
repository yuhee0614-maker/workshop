import { Booking, EmployeeType, ExperienceFeedback, SeatId, SeatSlotStatus, SlotStatus, TimeSlotDef } from '../types';
import {
  DIRECT_ONLY_PROMPT_MESSAGE,
  INITIAL_SAMPLE_BOOKINGS,
  MAX_CAPACITY_PER_SLOT,
  SLOT_SEAT_DEFS,
  TIME_SLOTS,
} from '../data/constants';

const STORAGE_KEY = 'footbath_bookings_v4';
const FEEDBACK_STORAGE_KEY = 'footbath_feedbacks_v4';

const INITIAL_SAMPLE_FEEDBACKS: ExperienceFeedback[] = [
  {
    id: 'FBK-20261015-001',
    bookingId: 'FB-20261006-001',
    date: new Date().toISOString().split('T')[0],
    slotId: '12:00-12:30',
    seatId: '男A',
    employeeName: '李志剛',
    employeeId: 'D1088',
    department: '製造二部 產線組',
    employeeType: 'direct',
    overallRating: 5,
    futureSupport: 'strongly_recommend',
    weeklyFrequency: '3_plus',
    durationSuitability: 'perfect',
    preferredTimeSlot: 'keep_current',
    cleanlinessRating: 5,
    drainageConvenience: 'smooth',
    suppliesSatisfaction: 5,
    initialBucketCondition: 'clean',
    fatigueReliefFeeling: 'very_effective',
    workBenefit: 'energy_boost',
    cleanedUpAndRestored: true,
    improvementTags: ['增加更多擦腳毛巾', '建議現場增設壁掛式時鐘'],
    comments: '上午站產線 4 小時腳底肌肉緊繃，泡完 20 多分鐘全身放鬆很多，下午作業精神明顯變好！強烈希望正式常態設置。結束後已將水倒淨擦乾。',
    createdAt: '2026-10-15T12:35:00Z',
  },
  {
    id: 'FBK-20261015-002',
    bookingId: 'FB-20261006-002',
    date: new Date().toISOString().split('T')[0],
    slotId: '13:30-14:00',
    seatId: '女A',
    employeeName: '王曉婷',
    employeeId: 'I2045',
    department: '人力資源部',
    employeeType: 'indirect',
    overallRating: 5,
    futureSupport: 'strongly_recommend',
    weeklyFrequency: '1_2_times',
    durationSuitability: 'perfect',
    preferredTimeSlot: 'keep_current',
    cleanlinessRating: 5,
    drainageConvenience: 'smooth',
    suppliesSatisfaction: 4,
    initialBucketCondition: 'clean',
    fatigueReliefFeeling: 'moderate',
    workBenefit: 'muscle_relax',
    cleanedUpAndRestored: true,
    improvementTags: ['增設座位靠枕', '增加置物籃置放包包'],
    comments: '獨立足浴桶清潔度很好，自己調水溫很直覺。每週固定來 1-2 次可以大幅緩解長時間坐著辦公的下肢水腫。',
    createdAt: '2026-10-15T14:05:00Z',
  },
  {
    id: 'FBK-20261015-003',
    bookingId: 'FB-20261006-003',
    date: new Date().toISOString().split('T')[0],
    slotId: '14:00-14:30',
    seatId: '男B',
    employeeName: '陳冠宇',
    employeeId: 'I3021',
    department: '研發處 軟體組',
    employeeType: 'indirect',
    overallRating: 4,
    futureSupport: 'recommend',
    weeklyFrequency: '1_2_times',
    durationSuitability: 'perfect',
    preferredTimeSlot: 'prefer_afterwork',
    cleanlinessRating: 4,
    drainageConvenience: 'acceptable',
    suppliesSatisfaction: 4,
    initialBucketCondition: 'clean',
    fatigueReliefFeeling: 'very_effective',
    workBenefit: 'energy_boost',
    cleanedUpAndRestored: true,
    improvementTags: ['建議延長至下班時段 (17:00-18:30)', '加裝排水軟管防噴濺'],
    comments: '久坐寫程式腿部血液循環差，泡腳非常有感。如果未來常態落地，希望能增開下班後的 17:00~18:00 時段！',
    createdAt: '2026-10-15T14:35:00Z',
  },
  {
    id: 'FBK-20261015-004',
    bookingId: 'FB-20261006-004',
    date: new Date().toISOString().split('T')[0],
    slotId: '15:00-15:30',
    seatId: '女B',
    employeeName: '林雅慧',
    employeeId: 'D1120',
    department: '製造一部 封裝線',
    employeeType: 'direct',
    overallRating: 5,
    futureSupport: 'strongly_recommend',
    weeklyFrequency: '3_plus',
    durationSuitability: 'perfect',
    preferredTimeSlot: 'keep_current',
    cleanlinessRating: 5,
    drainageConvenience: 'smooth',
    suppliesSatisfaction: 5,
    initialBucketCondition: 'clean',
    fatigueReliefFeeling: 'very_effective',
    workBenefit: 'energy_boost',
    cleanedUpAndRestored: true,
    improvementTags: ['維持直接人員專屬時段保護'],
    comments: '15:00 這個下午中場專屬時段對現場同仁幫助極大，泡完回去站產線到下班腳都不會痠麻，絕對支持公司正式常態落地設置！',
    createdAt: '2026-10-15T15:35:00Z',
  },
];

class BookingManager {
  private bookings: Booking[] = [];
  private feedbacks: ExperienceFeedback[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.bookings = this.normalizeBookings(parsed);
      } else {
        this.bookings = [...INITIAL_SAMPLE_BOOKINGS];
        this.saveBookingsToStorage();
      }
    } catch {
      this.bookings = [...INITIAL_SAMPLE_BOOKINGS];
    }

    try {
      const storedFb = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (storedFb) {
        this.feedbacks = JSON.parse(storedFb);
      } else {
        this.feedbacks = [...INITIAL_SAMPLE_FEEDBACKS];
        this.saveFeedbacksToStorage();
      }
    } catch {
      this.feedbacks = [...INITIAL_SAMPLE_FEEDBACKS];
    }
  }

  private normalizeBookings(list: any[]): Booking[] {
    const validSeats: SeatId[] = ['男A', '男B', '女A', '女B'];
    return list.map((b) => {
      let seats: SeatId[] = [];
      if (Array.isArray(b.seats)) {
        seats = b.seats.map((s: string) => {
          if (s === '1號桶') return '男A';
          if (s === '2號桶') return '男B';
          if (s === '3號桶') return '女A';
          if (s === '4號桶') return '女B';
          return s as SeatId;
        }).filter((s: SeatId) => validSeats.includes(s));
      }

      if (seats.length === 0) {
        const count = Math.min(b.attendeeCount || 1, 4);
        seats = validSeats.slice(0, count);
      }

      return {
        ...b,
        attendeeCount: seats.length || b.attendeeCount || 1,
        seats,
      };
    });
  }

  private saveBookingsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookings));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save bookings to localStorage', e);
    }
  }

  private saveFeedbacksToStorage() {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(this.feedbacks));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save feedbacks to localStorage', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }

  public getAllBookings(): Booking[] {
    return [...this.bookings];
  }

  public getBookingsForDate(date: string): Booking[] {
    return this.bookings.filter(
      (b) => b.date === date && b.status === 'confirmed'
    );
  }

  public getSlotStatusList(date: string): SlotStatus[] {
    const activeBookings = this.getBookingsForDate(date);

    return TIME_SLOTS.map((slot) => {
      const slotBookings = activeBookings.filter((b) => b.slotId === slot.id);

      const seats: SeatSlotStatus[] = SLOT_SEAT_DEFS.map((def) => {
        const bookingWithSeat = slotBookings.find(
          (b) => b.seats && b.seats.includes(def.id)
        );

        if (bookingWithSeat) {
          return {
            seatId: def.id,
            label: def.label,
            gender: def.gender,
            isBooked: true,
            bookedBy: {
              name: bookingWithSeat.employeeName,
              employeeId: bookingWithSeat.employeeId,
              department: bookingWithSeat.department,
              employeeType: bookingWithSeat.employeeType,
              bookingId: bookingWithSeat.id,
            },
          };
        }

        return {
          seatId: def.id,
          label: def.label,
          gender: def.gender,
          isBooked: false,
        };
      });

      const totalBooked = seats.filter((s) => s.isBooked).length;
      const remainingCapacity = Math.max(0, MAX_CAPACITY_PER_SLOT - totalBooked);

      return {
        slot,
        totalBooked,
        remainingCapacity,
        isFull: remainingCapacity <= 0,
        seats,
        bookings: slotBookings,
      };
    });
  }

  public getSlotDefinition(slotId: string): TimeSlotDef | undefined {
    return TIME_SLOTS.find((s) => s.id === slotId);
  }

  public getAvailableSeats(date: string, slotId: string): SeatSlotStatus[] {
    const slotList = this.getSlotStatusList(date);
    const target = slotList.find((s) => s.slot.id === slotId);
    if (!target) return [];
    return target.seats.filter((s) => !s.isBooked);
  }

  public getSlotRemainingCapacity(date: string, slotId: string): number {
    const available = this.getAvailableSeats(date, slotId);
    return available.length;
  }

  public checkEligibility(
    employeeType: EmployeeType,
    slot: TimeSlotDef
  ): { eligible: boolean; message?: string } {
    if (slot.isDirectOnly && employeeType === 'indirect') {
      return {
        eligible: false,
        message: DIRECT_ONLY_PROMPT_MESSAGE,
      };
    }
    return { eligible: true };
  }

  public getAvailableAlternativeSlots(
    date: string,
    employeeType: EmployeeType,
    neededSpots: number = 1,
    excludeSlotId?: string
  ): { slot: TimeSlotDef; remaining: number; availableSeats: SeatId[] }[] {
    const allSlots = this.getSlotStatusList(date);

    return allSlots
      .filter((item) => {
        if (excludeSlotId && item.slot.id === excludeSlotId) return false;
        if (item.slot.isDirectOnly && employeeType === 'indirect') return false;
        return item.remainingCapacity >= neededSpots;
      })
      .map((item) => ({
        slot: item.slot,
        remaining: item.remainingCapacity,
        availableSeats: item.seats.filter((s) => !s.isBooked).map((s) => s.seatId),
      }));
  }

  public validateBooking(
    date: string,
    slotId: string,
    employeeType: EmployeeType,
    attendeeCount: number,
    requestedSeats?: SeatId[]
  ): {
    valid: boolean;
    reason?: string;
    suggestedSlots?: { slot: TimeSlotDef; remaining: number; availableSeats: SeatId[] }[];
  } {
    const slotDef = this.getSlotDefinition(slotId);
    if (!slotDef) {
      return { valid: false, reason: '未找到所選時段，請重新選擇。' };
    }

    if (attendeeCount < 1 || attendeeCount > MAX_CAPACITY_PER_SLOT) {
      return {
        valid: false,
        reason: `每時段預約人數限 1 至 ${MAX_CAPACITY_PER_SLOT} 人（可選席位：男A、男B、女A、女B）。`,
      };
    }

    if (slotDef.isDirectOnly && employeeType === 'indirect') {
      const alternatives = this.getAvailableAlternativeSlots(
        date,
        employeeType,
        attendeeCount,
        slotId
      );
      return {
        valid: false,
        reason: DIRECT_ONLY_PROMPT_MESSAGE,
        suggestedSlots: alternatives,
      };
    }

    const availableSeats = this.getAvailableSeats(date, slotId);
    const availableSeatIds = availableSeats.map((s) => s.seatId);

    if (requestedSeats && requestedSeats.length > 0) {
      if (requestedSeats.length !== attendeeCount) {
        return {
          valid: false,
          reason: `選擇的席位數量（${requestedSeats.length} 席）與預約人數（${attendeeCount} 位）不符。`,
        };
      }

      for (const seat of requestedSeats) {
        if (!availableSeatIds.includes(seat)) {
          const alternatives = this.getAvailableAlternativeSlots(
            date,
            employeeType,
            attendeeCount,
            slotId
          );
          return {
            valid: false,
            reason: `所選席位【${seat}】在此時段已被其他同仁登記，請改選其他席位或其他時段。`,
            suggestedSlots: alternatives,
          };
        }
      }
    } else {
      const remaining = availableSeats.length;
      if (remaining < attendeeCount) {
        const alternatives = this.getAvailableAlternativeSlots(
          date,
          employeeType,
          attendeeCount,
          slotId
        );
        return {
          valid: false,
          reason:
            remaining === 0
              ? `時段 ${slotDef.startTime}-${slotDef.endTime} 目前已額滿（男A、男B、女A、女B 共 4 席已滿席）。`
              : `時段 ${slotDef.startTime}-${slotDef.endTime} 目前僅剩 ${remaining} 個席位（剩餘：${availableSeatIds.join('、')}），無法容納預約的 ${attendeeCount} 位同仁。`,
          suggestedSlots: alternatives,
        };
      }
    }

    return { valid: true };
  }

  public createBooking(data: {
    date: string;
    slotId: string;
    employeeName: string;
    employeeId: string;
    department: string;
    employeeType: EmployeeType;
    attendeeCount: number;
    seats?: SeatId[];
    companionNames?: string[];
    notes?: string;
  }): {
    success: boolean;
    booking?: Booking;
    error?: string;
    suggestedSlots?: { slot: TimeSlotDef; remaining: number; availableSeats: SeatId[] }[];
  } {
    const validation = this.validateBooking(
      data.date,
      data.slotId,
      data.employeeType,
      data.attendeeCount,
      data.seats
    );

    if (!validation.valid) {
      return {
        success: false,
        error: validation.reason,
        suggestedSlots: validation.suggestedSlots,
      };
    }

    let finalSeats: SeatId[] = data.seats || [];
    if (finalSeats.length === 0) {
      const available = this.getAvailableSeats(data.date, data.slotId);
      finalSeats = available.slice(0, data.attendeeCount).map((s) => s.seatId);
    }

    const newBooking: Booking = {
      id: `FB-${data.date.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      date: data.date,
      slotId: data.slotId,
      employeeName: data.employeeName.trim(),
      employeeId: data.employeeId.trim().toUpperCase(),
      department: data.department.trim(),
      employeeType: data.employeeType,
      attendeeCount: finalSeats.length,
      seats: finalSeats,
      companionNames: data.companionNames?.filter((n) => n.trim().length > 0) || [],
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      hasFeedback: false,
    };

    this.bookings.push(newBooking);
    this.saveBookingsToStorage();

    return {
      success: true,
      booking: newBooking,
    };
  }

  public cancelBooking(bookingId: string): boolean {
    const index = this.bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) return false;

    this.bookings[index].status = 'cancelled';
    this.saveBookingsToStorage();
    return true;
  }

  public findBookings(query: string): Booking[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.bookings.filter(
      (b) =>
        b.status === 'confirmed' &&
        (b.employeeId.toLowerCase().includes(q) ||
          b.employeeName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.department.toLowerCase().includes(q) ||
          b.seats?.some((s) => s.toLowerCase().includes(q)))
    );
  }

  // --- Feedback Management ---
  public getAllFeedbacks(): ExperienceFeedback[] {
    return [...this.feedbacks];
  }

  public getFeedbackForBooking(bookingId: string): ExperienceFeedback | undefined {
    return this.feedbacks.find((f) => f.bookingId === bookingId);
  }

  public createFeedback(data: Omit<ExperienceFeedback, 'id' | 'createdAt'>): ExperienceFeedback {
    const newFeedback: ExperienceFeedback = {
      ...data,
      id: `FBK-${data.date.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
    };

    this.feedbacks.unshift(newFeedback);
    this.saveFeedbacksToStorage();

    // Mark booking as having feedback
    if (data.bookingId) {
      const bIdx = this.bookings.findIndex((b) => b.id === data.bookingId);
      if (bIdx !== -1) {
        this.bookings[bIdx].hasFeedback = true;
        this.saveBookingsToStorage();
      }
    }

    return newFeedback;
  }

  public resetSampleData() {
    this.bookings = [...INITIAL_SAMPLE_BOOKINGS];
    this.feedbacks = [...INITIAL_SAMPLE_FEEDBACKS];
    this.saveBookingsToStorage();
    this.saveFeedbacksToStorage();
  }
}

export const bookingManager = new BookingManager();
