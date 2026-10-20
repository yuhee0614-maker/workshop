import {
  Booking,
  EmployeeType,
  ExperienceFeedback,
  SeatId,
  SeatSlotStatus,
  SlotStatus,
  TimeSlotDef,
} from '../types';
import {
  DIRECT_ONLY_PROMPT_MESSAGE,
  INITIAL_SAMPLE_BOOKINGS,
  MAX_CAPACITY_PER_SLOT,
  SLOT_SEAT_DEFS,
  TIME_SLOTS,
} from '../data/constants';
import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';

const STORAGE_KEY = 'footbath_bookings_v4';
const FEEDBACK_STORAGE_KEY = 'footbath_feedbacks_v4';
const WEBHOOK_STORAGE_KEY = 'footbath_webhook_url';

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
    comments:
      '上午站產線 4 小時腳底肌肉緊繃，泡完 20 多分鐘全身放鬆很多，下午作業精神明顯變好！強烈希望正式常態設置。結束後已將水倒淨擦乾。',
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
    comments:
      '獨立足浴桶清潔度很好，自己調水溫很直覺。每週固定來 1-2 次可以大幅緩解長時間坐著辦公的下肢水腫。',
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
    comments:
      '久坐寫程式腿部血液循環差，泡腳非常有感。如果未來常態落地，希望能增開下班後的 17:00~18:00 時段！',
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
    comments:
      '15:00 這個下午中場專屬時段對現場同仁幫助極大，泡完回去站產線到下班腳都不會痠麻，絕對支持公司正式常態落地設置！',
    createdAt: '2026-10-15T15:35:00Z',
  },
];

class BookingManager {
  private bookings: Booking[] = [];
  private feedbacks: ExperienceFeedback[] = [];
  private listeners: (() => void)[] = [];
  private isCloudConnected: boolean = false;
  private lastCloudSync: Date | null = null;
  private webhookUrl: string = '';

  constructor() {
    this.loadFromStorage();
    this.loadWebhookUrl();
    this.initFirestoreSync();
  }

  private loadWebhookUrl() {
    try {
      this.webhookUrl = localStorage.getItem(WEBHOOK_STORAGE_KEY) || '';
    } catch {
      this.webhookUrl = '';
    }
  }

  public getWebhookUrl(): string {
    return this.webhookUrl;
  }

  public setWebhookUrl(url: string) {
    this.webhookUrl = url.trim();
    try {
      localStorage.setItem(WEBHOOK_STORAGE_KEY, this.webhookUrl);
    } catch (e) {
      console.warn('Failed to save webhook URL to storage', e);
    }
    this.notifyListeners();
  }

  public getCloudStatus() {
    return {
      isCloudConnected: this.isCloudConnected,
      lastSync: this.lastCloudSync ? this.lastCloudSync.toLocaleTimeString() : '已即時連線',
      feedbackCount: this.feedbacks.length,
      hasWebhook: !!this.webhookUrl,
    };
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
        this.feedbacks = [];
        this.saveFeedbacksToStorage();
      }
    } catch {
      this.feedbacks = [];
    }
  }

  private initFirestoreSync() {
    // 1. Real-time sync for Feedbacks
    try {
      const feedbacksCol = collection(db, 'feedbacks');
      onSnapshot(
        feedbacksCol,
        (snapshot) => {
          this.isCloudConnected = true;
          this.lastCloudSync = new Date();

          const cloudFeedbacks: ExperienceFeedback[] = [];
          snapshot.forEach((docSnap) => {
            cloudFeedbacks.push(docSnap.data() as ExperienceFeedback);
          });

          this.feedbacks = cloudFeedbacks.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          this.saveFeedbacksToStorage();
          this.notifyListeners();
        },
        (error) => {
          console.warn('Firestore feedback sync note:', error.message);
        }
      );
    } catch (err) {
      console.warn('Init firestore feedback listener error:', err);
    }

    // 2. Real-time sync for Bookings
    try {
      const bookingsCol = collection(db, 'bookings');
      onSnapshot(
        bookingsCol,
        (snapshot) => {
          this.isCloudConnected = true;
          this.lastCloudSync = new Date();

          if (!snapshot.empty) {
            const cloudBookings: Booking[] = [];
            snapshot.forEach((docSnap) => {
              cloudBookings.push(docSnap.data() as Booking);
            });

            const mergedMap = new Map<string, Booking>();
            this.bookings.forEach((b) => mergedMap.set(b.id, b));
            cloudBookings.forEach((b) => mergedMap.set(b.id, b));

            this.bookings = this.normalizeBookings(Array.from(mergedMap.values()));
            this.saveBookingsToStorage();
          } else {
            // Seed sample bookings
            INITIAL_SAMPLE_BOOKINGS.forEach((bk) => {
              setDoc(doc(db, 'bookings', bk.id), bk).catch(() => {});
            });
          }
          this.notifyListeners();
        },
        (error) => {
          console.warn('Firestore booking sync note:', error.message);
        }
      );
    } catch (err) {
      console.warn('Init firestore booking listener error:', err);
    }
  }

  private normalizeBookings(list: any[]): Booking[] {
    const validSeats: SeatId[] = ['男A', '男B', '女A', '女B'];
    return list.map((b) => {
      let seats: SeatId[] = [];
      if (Array.isArray(b.seats)) {
        seats = b.seats
          .map((s: string) => {
            if (s === '1號桶') return '男A';
            if (s === '2號桶') return '男B';
            if (s === '3號桶') return '女A';
            if (s === '4號桶') return '女B';
            return s as SeatId;
          })
          .filter((s: SeatId) => validSeats.includes(s));
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

      return {
        slot,
        totalBooked,
        remainingCapacity: Math.max(0, MAX_CAPACITY_PER_SLOT - totalBooked),
        isFull: totalBooked >= MAX_CAPACITY_PER_SLOT,
        seats,
        bookings: slotBookings,
      };
    });
  }

  public getAvailableSeats(date: string, slotId: string): SeatSlotStatus[] {
    const slotList = this.getSlotStatusList(date);
    const targetSlot = slotList.find((s) => s.slot.id === slotId);
    if (!targetSlot) return [];
    return targetSlot.seats.filter((s) => !s.isBooked);
  }

  public validateBooking(params: {
    date: string;
    slotId: string;
    employeeType: EmployeeType;
    requestedCount: number;
    requestedSeats?: SeatId[];
  }): { valid: boolean; reason?: string } {
    const slotDef = TIME_SLOTS.find((s) => s.id === params.slotId);
    if (!slotDef) {
      return { valid: false, reason: '無效的預約時段' };
    }

    if (slotDef.isDirectOnly && params.employeeType === 'indirect') {
      return { valid: false, reason: DIRECT_ONLY_PROMPT_MESSAGE };
    }

    const availableSeats = this.getAvailableSeats(params.date, params.slotId);

    if (params.requestedSeats && params.requestedSeats.length > 0) {
      for (const seatId of params.requestedSeats) {
        const isFree = availableSeats.some((s) => s.seatId === seatId);
        if (!isFree) {
          return { valid: false, reason: `所選席位【${seatId}】已被其他同仁登記，請挑選其他席位。` };
        }
      }
      return { valid: true };
    }

    if (availableSeats.length < params.requestedCount) {
      return {
        valid: false,
        reason: `該時段剩餘容量不足（僅剩 ${availableSeats.length} 席，您需要 ${params.requestedCount} 席）。`,
      };
    }

    return { valid: true };
  }

  public getSlotRemainingCapacity(date: string, slotId: string): number {
    const slotList = this.getSlotStatusList(date);
    const targetSlot = slotList.find((s) => s.slot.id === slotId);
    return targetSlot ? targetSlot.remainingCapacity : 0;
  }

  public getAvailableAlternativeSlots(
    date: string,
    employeeType: EmployeeType,
    requiredSeats: number,
    currentSlotId?: string
  ): { slot: TimeSlotDef; remaining: number }[] {
    const slotList = this.getSlotStatusList(date);
    return slotList
      .filter((s) => {
        if (currentSlotId && s.slot.id === currentSlotId) return false;
        if (s.slot.isDirectOnly && employeeType === 'indirect') return false;
        return s.remainingCapacity >= requiredSeats;
      })
      .map((s) => ({
        slot: s.slot,
        remaining: s.remainingCapacity,
      }));
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
  }): { success: boolean; booking?: Booking; error?: string } {
    const validation = this.validateBooking({
      date: data.date,
      slotId: data.slotId,
      employeeType: data.employeeType,
      requestedCount: data.attendeeCount,
      requestedSeats: data.seats,
    });

    if (!validation.valid) {
      return { success: false, error: validation.reason };
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

    // Persist to Cloud Firestore in background
    setDoc(doc(db, 'bookings', newBooking.id), newBooking).catch((err) => {
      console.warn('Firestore booking persist note:', err);
    });

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

    // Sync cancellation to Firestore in background
    updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' }).catch((err) => {
      console.warn('Firestore booking cancel note:', err);
    });

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

  public async createFeedback(
    data: Omit<ExperienceFeedback, 'id' | 'createdAt'>
  ): Promise<ExperienceFeedback> {
    const newFeedback: ExperienceFeedback = {
      ...data,
      id: `FBK-${data.date.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
    };

    // Save locally
    this.feedbacks.unshift(newFeedback);
    this.saveFeedbacksToStorage();

    // Mark booking locally
    if (data.bookingId) {
      const bIdx = this.bookings.findIndex((b) => b.id === data.bookingId);
      if (bIdx !== -1) {
        this.bookings[bIdx].hasFeedback = true;
        this.saveBookingsToStorage();
        // Update booking in Firestore
        try {
          updateDoc(doc(db, 'bookings', data.bookingId), { hasFeedback: true }).catch(() => {});
        } catch {}
      }
    }

    // 1. Cloud Firestore Sync (Real-time centralized database)
    try {
      await setDoc(doc(db, 'feedbacks', newFeedback.id), newFeedback);
    } catch (err) {
      console.warn('Firestore feedback write note:', err);
    }

    // 2. Google Sheets / Webhook Forwarding (if configured)
    if (this.webhookUrl) {
      this.sendToWebhook(this.webhookUrl, newFeedback);
    }

    return newFeedback;
  }

  // Send single feedback row to Google Sheets Webhook / custom URL
  public sendToWebhook(url: string, feedback: ExperienceFeedback) {
    if (!url) return;
    try {
      // Format payload with human-readable keys for Google Sheets
      const payload = {
        action: 'footbath_feedback',
        id: feedback.id,
        createdAt: feedback.createdAt,
        date: feedback.date,
        slotId: feedback.slotId,
        seatId: feedback.seatId || '未指定',
        employeeName: feedback.employeeName,
        employeeId: feedback.employeeId,
        department: feedback.department,
        employeeType: feedback.employeeType === 'direct' ? '現場直接人員' : '辦公間接人員',
        overallRating: feedback.overallRating,
        futureSupport:
          feedback.futureSupport === 'strongly_recommend'
            ? '非常支持正式常態設置'
            : feedback.futureSupport === 'recommend'
            ? '支持常態設置'
            : '普通/無意見',
        weeklyFrequency:
          feedback.weeklyFrequency === '3_plus'
            ? '每週 3 次以上'
            : feedback.weeklyFrequency === '1_2_times'
            ? '每週 1~2 次'
            : '工作疲憊時偶爾',
        durationSuitability:
          feedback.durationSuitability === 'perfect' ? '30分鐘適中' : '其他建議',
        preferredTimeSlot: feedback.preferredTimeSlot,
        cleanlinessRating: feedback.cleanlinessRating,
        drainageConvenience:
          feedback.drainageConvenience === 'smooth' ? '順暢便利' : '尚可',
        suppliesSatisfaction: feedback.suppliesSatisfaction,
        fatigueReliefFeeling:
          feedback.fatigueReliefFeeling === 'very_effective'
            ? '非常顯著放鬆'
            : '輕度放鬆',
        workBenefit:
          feedback.workBenefit === 'energy_boost'
            ? '精神提振'
            : feedback.workBenefit === 'muscle_relax'
            ? '下肢肌肉放鬆'
            : '其他',
        cleanedUpAndRestored: feedback.cleanedUpAndRestored ? '已自主倒水復原' : '未確認',
        improvementTags: feedback.improvementTags?.join('、') || '',
        comments: feedback.comments || '',
      };

      // Use no-cors mode so Google Apps Script redirects don't block in browsers
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      }).catch((e) => {
        console.warn('Webhook transmission note:', e);
      });
    } catch (e) {
      console.warn('Webhook build error:', e);
    }
  }

  // Test webhook connection with sample payload
  public async testWebhook(url: string): Promise<{ success: boolean; message: string }> {
    if (!url.trim()) {
      return { success: false, message: '請先輸入有效的 Webhook 網址' };
    }

    try {
      const sample = this.feedbacks[0] || INITIAL_SAMPLE_FEEDBACKS[0];
      await fetch(url.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_connection',
          message: '【六樓淋浴間舒活足浴坊】體驗回饋串接測試成功！',
          timestamp: new Date().toISOString(),
          sampleFeedback: sample,
        }),
        mode: 'no-cors',
      });
      return { success: true, message: '已發送測試封包至指定 Webhook 網址！' };
    } catch (e: any) {
      return { success: false, message: `發送失敗：${e?.message || '網路異常'}` };
    }
  }

  // Delete a single feedback document from Firestore and local state
  public async deleteFeedback(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
    } catch (err) {
      console.warn('Failed to delete feedback from Firestore:', err);
    }
    this.feedbacks = this.feedbacks.filter((f) => f.id !== id);
    this.saveFeedbacksToStorage();
    this.notifyListeners();
    return true;
  }

  // Clear all feedback documents from Firestore and local state
  public async clearAllFeedbacks(): Promise<boolean> {
    try {
      const feedbacksCol = collection(db, 'feedbacks');
      const snapshot = await getDocs(feedbacksCol);
      const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      console.warn('Failed to clear all feedbacks from Firestore:', err);
    }
    this.feedbacks = [];
    this.saveFeedbacksToStorage();
    this.notifyListeners();
    return true;
  }

  public resetSampleData() {
    this.bookings = [...INITIAL_SAMPLE_BOOKINGS];
    this.feedbacks = [];
    this.saveBookingsToStorage();
    this.saveFeedbacksToStorage();

    // Reset bookings to cloud
    INITIAL_SAMPLE_BOOKINGS.forEach((bk) => {
      setDoc(doc(db, 'bookings', bk.id), bk).catch(() => {});
    });
  }
}

export const bookingManager = new BookingManager();
