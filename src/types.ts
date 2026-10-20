export type EmployeeType = 'direct' | 'indirect';

export type SeatId = '男A' | '男B' | '男C' | '女A' | '女B' | '女C';

export interface SeatSlotStatus {
  seatId: SeatId;
  label: string;
  gender: 'male' | 'female';
  isBooked: boolean;
  bookedBy?: {
    name: string;
    employeeId: string;
    department: string;
    employeeType: EmployeeType;
    bookingId: string;
  };
}

export interface TimeSlotDef {
  id: string; // e.g. "12:00-12:30"
  startTime: string; // "12:00"
  endTime: string; // "12:30"
  isDirectOnly: boolean;
  label: string;
}

export interface Booking {
  id: string;
  date: string; // YYYY-MM-DD
  slotId: string; // "12:00-12:30"
  employeeName: string;
  employeeId: string;
  department: string;
  employeeType: EmployeeType;
  attendeeCount: number; // 1 to 4
  seats: SeatId[]; // ['男A', '男B', ...]
  companionNames?: string[];
  notes?: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
  hasFeedback?: boolean;
}

export interface SlotStatus {
  slot: TimeSlotDef;
  totalBooked: number;
  remainingCapacity: number; // max 4 - totalBooked
  isFull: boolean;
  seats: SeatSlotStatus[];
  bookings: Booking[];
}

export type FutureSupportType = 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend';
export type WeeklyFrequencyType = '1_2_times' | '3_plus' | 'occasional' | 'rare';
export type DurationSuitabilityType = 'perfect' | 'too_short' | 'too_long';
export type TimeSlotPreferenceType = 'keep_current' | 'prefer_morning' | 'prefer_afterwork' | 'lunch_only';
export type DrainageConvenienceType = 'smooth' | 'acceptable' | 'inconvenient';
export type WorkBenefitType = 'energy_boost' | 'muscle_relax' | 'drowsy' | 'none';
export type InitialBucketConditionType = 'clean' | 'minor_water' | 'uncleaned';

export interface ExperienceFeedback {
  id: string;
  bookingId?: string;
  date: string;
  slotId: string;
  seatId?: SeatId;
  employeeName: string;
  employeeId: string;
  department: string;
  employeeType: EmployeeType;

  // 1. 整體滿意度與常態落地評估
  overallRating: number; // 1 to 5
  futureSupport: FutureSupportType; // 是否支持正式落地常態設置
  weeklyFrequency: WeeklyFrequencyType; // 未來若落地預計每週使用頻率

  // 2. 時段與時長規劃
  durationSuitability: DurationSuitabilityType; // 30分鐘長度是否適宜
  preferredTimeSlot: TimeSlotPreferenceType; // 使用時段建議

  // 3. 現場設施與動線
  cleanlinessRating: number; // 1 to 5 環境整潔評分
  drainageConvenience: DrainageConvenienceType; // 裝水與倒水排水動線順暢度
  suppliesSatisfaction: number; // 1 to 5 現場周邊耗材（擦腳紙巾/拖鞋/置物）評分
  initialBucketCondition: InitialBucketConditionType; // 抵達時上一手復原狀況

  // 4. 身心復原與工作產能效益
  fatigueReliefFeeling: 'very_effective' | 'moderate' | 'neutral' | 'none'; // 下肢疲勞改善
  workBenefit: WorkBenefitType; // 對後續工作精神與專注的幫助

  // 5. 結束自主倒水復原確認
  cleanedUpAndRestored: boolean; // 是否已依流程將水倒掉並回復原樣

  // 6. 未來落地具體改善建議
  improvementTags?: string[]; // 改善項目標籤（如：增加擦腳布、加裝排水軟管、增加置物架、隱私隔簾等）
  comments?: string; // 開放式建議與真實心得
  createdAt: string;
}

