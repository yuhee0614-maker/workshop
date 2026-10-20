import React, { useState, useEffect } from 'react';
import { TimeSlotDef, EmployeeType, Booking, SeatId } from '../types';
import {
  DIRECT_ONLY_PROMPT_MESSAGE,
  MAX_CAPACITY_PER_SLOT,
  SLOT_SEAT_DEFS,
  TIME_SLOTS,
} from '../data/constants';
import { bookingManager } from '../services/bookingManager';
import {
  X,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  User,
  Building,
  Users,
  Info,
  CheckSquare,
  MapPin,
  Heart,
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultSlot?: TimeSlotDef | null;
  defaultSeat?: SeatId | null;
  defaultEmployeeType?: EmployeeType;
  onBookingSuccess: (booking: Booking) => void;
  onOpenFeedback?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  defaultSlot,
  defaultSeat,
  defaultEmployeeType = 'direct',
  onBookingSuccess,
  onOpenFeedback,
}) => {
  const [date, setDate] = useState<string>(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [slotId, setSlotId] = useState<string>(
    defaultSlot ? defaultSlot.id : TIME_SLOTS[0].id
  );
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [employeeType, setEmployeeType] = useState<EmployeeType>(defaultEmployeeType);
  const [selectedSeats, setSelectedSeats] = useState<SeatId[]>(
    defaultSeat ? [defaultSeat] : ['男A']
  );
  const [companion1, setCompanion1] = useState('');
  const [companion2, setCompanion2] = useState('');
  const [companion3, setCompanion3] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Sync state when props change
  useEffect(() => {
    if (defaultDate) setDate(defaultDate);
    if (defaultSlot) setSlotId(defaultSlot.id);
    if (defaultEmployeeType) setEmployeeType(defaultEmployeeType);

    const available = bookingManager.getAvailableSeats(
      defaultDate || date,
      defaultSlot ? defaultSlot.id : slotId
    );
    if (defaultSeat && available.some((s) => s.seatId === defaultSeat)) {
      setSelectedSeats([defaultSeat]);
    } else if (available.length > 0) {
      setSelectedSeats([available[0].seatId]);
    } else {
      setSelectedSeats([]);
    }

    setErrorMsg(null);
    setSuccessBooking(null);
    setCountdown(null);
  }, [defaultDate, defaultSlot, defaultSeat, defaultEmployeeType, isOpen]);

  // When slot or date changes, ensure selected seats are still available
  useEffect(() => {
    const available = bookingManager.getAvailableSeats(date, slotId);
    const availableIds = available.map((s) => s.seatId);

    const stillValid = selectedSeats.filter((s) => availableIds.includes(s));
    if (stillValid.length > 0) {
      setSelectedSeats(stillValid);
    } else if (available.length > 0) {
      setSelectedSeats([available[0].seatId]);
    } else {
      setSelectedSeats([]);
    }
  }, [date, slotId]);

  // Auto-prompt feedback after successful booking
  useEffect(() => {
    if (!successBooking || !isOpen) {
      setCountdown(null);
      return;
    }
    setCountdown(8);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          onOpenFeedback?.(successBooking);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [successBooking, isOpen]);

  if (!isOpen) return null;

  const currentSlotDef = TIME_SLOTS.find((s) => s.id === slotId);
  const availableSeats = bookingManager.getAvailableSeats(date, slotId);
  const availableSeatIds = availableSeats.map((s) => s.seatId);
  const remainingCapacity = availableSeats.length;

  const isDirectSlot = currentSlotDef?.isDirectOnly ?? false;
  const isIndirectTryingDirect = isDirectSlot && employeeType === 'indirect';
  const attendeeCount = selectedSeats.length;
  const isZeroSeats = attendeeCount === 0;

  // Available alternative slots for recommendations
  const alternativeSlots = bookingManager.getAvailableAlternativeSlots(
    date,
    employeeType,
    Math.max(1, attendeeCount),
    slotId
  );

  const toggleSeat = (seatId: SeatId) => {
    if (!availableSeatIds.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      if (selectedSeats.length > 1) {
        setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
      }
    } else {
      if (selectedSeats.length < MAX_CAPACITY_PER_SLOT) {
        setSelectedSeats([...selectedSeats, seatId]);
      }
    }
    setErrorMsg(null);
  };

  const handleQuickCount = (count: number) => {
    const pick = availableSeatIds.slice(0, count);
    if (pick.length > 0) {
      setSelectedSeats(pick);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!employeeName.trim()) {
      setErrorMsg('請輸入同仁姓名');
      return;
    }
    if (!employeeId.trim()) {
      setErrorMsg('請輸入同仁工號');
      return;
    }
    if (!department.trim()) {
      setErrorMsg('請輸入所屬部門');
      return;
    }

    if (isIndirectTryingDirect) {
      setErrorMsg(DIRECT_ONLY_PROMPT_MESSAGE);
      return;
    }

    if (selectedSeats.length === 0) {
      setErrorMsg('請至少點選一個預約席位（獨立足浴 1~4 號桶）。');
      return;
    }

    for (const seat of selectedSeats) {
      if (!availableSeatIds.includes(seat)) {
        setErrorMsg(`席位【${seat}】已被登記，請更換席位。`);
        return;
      }
    }

    const companions: string[] = [];
    if (selectedSeats.length >= 2 && companion1.trim()) companions.push(companion1.trim());
    if (selectedSeats.length >= 3 && companion2.trim()) companions.push(companion2.trim());
    if (selectedSeats.length >= 4 && companion3.trim()) companions.push(companion3.trim());

    const result = bookingManager.createBooking({
      date,
      slotId,
      employeeName,
      employeeId,
      department,
      employeeType,
      attendeeCount: selectedSeats.length,
      seats: selectedSeats,
      companionNames: companions,
      notes,
    });

    if (result.success && result.booking) {
      setSuccessBooking(result.booking);
      onBookingSuccess(result.booking);
    } else {
      setErrorMsg(result.error || '預約失敗，請重新確認資訊。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              {successBooking ? '預約成功確認' : '登記舒活足浴預約'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              地點：六樓淋浴間 · 每時段 4 席（男A、男B、女A、女B）· 30 分鐘足浴時段
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {successBooking ? (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900">
                預約登記完成！
              </h4>
              <p className="text-xs text-neutral-600">
                您的預約已記錄於系統，請準時至<strong>六樓淋浴間</strong>依標示席位入座體驗。
              </p>
            </div>

            {/* Ticket Card */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <span className="text-xs text-neutral-500">預約編號</span>
                <span className="font-mono font-bold text-neutral-800">
                  {successBooking.id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px]">預約日期與時間</span>
                  <span className="font-semibold text-neutral-900">
                    {successBooking.date} {successBooking.slotId}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">體驗地點</span>
                  <span className="font-bold text-teal-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-700" />
                    六樓淋浴間
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">預約席位</span>
                  <span className="font-bold text-teal-800">
                    {successBooking.seats?.join('、') || '已分配'} (共 {successBooking.attendeeCount} 席)
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">時段長度</span>
                  <span className="font-semibold text-neutral-900">
                    30 分鐘（自主處理足浴與清潔）
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">預約同仁與工號</span>
                  <span className="font-semibold text-neutral-900">
                    {successBooking.employeeName} ({successBooking.employeeId})
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">人員身分與部門</span>
                  <span className="font-semibold text-neutral-900">
                    {successBooking.employeeType === 'direct'
                      ? '直接人員 (現場作業)'
                      : '間接人員 (辦公室)'}{' '}
                    · {successBooking.department}
                  </span>
                </div>
              </div>

              {successBooking.companionNames &&
                successBooking.companionNames.length > 0 && (
                  <div className="pt-2 border-t border-neutral-200 text-xs">
                    <span className="text-neutral-500">同行同仁：</span>
                    <span className="font-medium text-neutral-800 ml-1">
                      {successBooking.companionNames.join('、')}
                    </span>
                  </div>
                )}

              {/* 3-Step Reminder Inside Ticket */}
              <div className="p-3 bg-white border border-neutral-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-neutral-900 block flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                  現場使用 3 步驟提醒（每時段 30 分鐘）：
                </span>
                <p className="text-neutral-600">
                  1. <strong>預約</strong>：完成登記（已分配席位：{successBooking.seats?.join('、')}）。
                </p>
                <p className="text-neutral-600">
                  2. <strong>依照現場標示使用</strong>：準時抵達六樓淋浴間，依席位標示入座並使用獨立足浴桶，享受 30 分鐘足浴時段。
                </p>
                <p className="text-teal-800 font-semibold">
                  3. <strong>結束後的處理</strong>：30 分鐘內請將水倒掉、沖洗乾淨並回復原樣。
                </p>
              </div>
            </div>

            {/* Experience Feedback Prompt Card */}
            <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <h5 className="text-xs font-bold text-teal-950">
                      填寫足浴體驗回饋（常態落地評估）
                    </h5>
                    {countdown !== null && (
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                        {countdown} 秒後自動為您跳出表單
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-teal-800/90 mt-0.5 leading-relaxed">
                    預約資料已自動帶入！您的回饋為公司未來評估六樓足浴坊常態設置的重要依據。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCountdown(null);
                  onClose();
                  onOpenFeedback?.(successBooking);
                }}
                className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-rose-300" />
                <span>立即填寫體驗回饋</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCountdown(null);
                  onClose();
                }}
                className="py-2.5 px-4 text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors text-center"
              >
                稍後再填 / 關閉
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Direct Only Warning */}
            {isIndirectTryingDirect && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-900">
                      時段身分限制提醒
                    </p>
                    <p className="mt-0.5 font-medium leading-relaxed">
                      {DIRECT_ONLY_PROMPT_MESSAGE}
                    </p>
                  </div>
                </div>

                {alternativeSlots.length > 0 && (
                  <div className="pt-2 border-t border-amber-200">
                    <span className="font-semibold block mb-1.5 text-amber-900">
                      為您推薦本日尚有空位的開放時段（點擊立即切換）：
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {alternativeSlots.slice(0, 4).map((alt) => (
                        <button
                          key={alt.slot.id}
                          type="button"
                          onClick={() => {
                            setSlotId(alt.slot.id);
                            setErrorMsg(null);
                          }}
                          className="px-2 py-1 bg-white hover:bg-teal-50 border border-amber-300 rounded text-xs font-semibold text-teal-800 transition-colors"
                        >
                          {alt.slot.startTime}-{alt.slot.endTime} (剩 {alt.remaining} 席)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {remainingCapacity === 0 && !isIndirectTryingDirect && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-950 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-rose-900">時段已額滿</p>
                    <p className="mt-0.5">
                      該時段 4 個席位（男A、男B、女A、女B）已全數預約額滿。
                    </p>
                  </div>
                </div>
                {alternativeSlots.length > 0 && (
                  <div className="pt-2 border-t border-rose-200">
                    <span className="font-semibold block mb-1 text-rose-900">
                      推薦尚有空席的替代時段：
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {alternativeSlots.slice(0, 4).map((alt) => (
                        <button
                          key={alt.slot.id}
                          type="button"
                          onClick={() => setSlotId(alt.slot.id)}
                          className="px-2 py-1 bg-white hover:bg-neutral-100 border border-rose-300 rounded text-xs font-medium text-neutral-800"
                        >
                          {alt.slot.startTime}-{alt.slot.endTime} (剩 {alt.remaining} 席)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {errorMsg && !isIndirectTryingDirect && remainingCapacity > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Field: Employee Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                人員類別 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEmployeeType('direct')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    employeeType === 'direct'
                      ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-neutral-900">
                      直接人員
                    </span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-medium">
                      全時段專屬
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    現場作業員、產線技術員等
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setEmployeeType('indirect')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    employeeType === 'indirect'
                      ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-neutral-900">
                      間接人員
                    </span>
                    <span className="text-[10px] bg-neutral-100 text-neutral-700 px-1.5 py-0.2 rounded font-medium">
                      全體開放時段
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    辦公室同仁、內勤、研發等
                  </p>
                </button>
              </div>
            </div>

            {/* Field: Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  預約日期 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs border border-neutral-200 rounded-lg pl-9 pr-3 py-2 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  預約時段 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <select
                    value={slotId}
                    onChange={(e) => setSlotId(e.target.value)}
                    className="w-full text-xs border border-neutral-200 rounded-lg pl-9 pr-3 py-2 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    {TIME_SLOTS.map((slot) => {
                      const rem = bookingManager.getSlotRemainingCapacity(date, slot.id);
                      return (
                        <option key={slot.id} value={slot.id}>
                          {slot.startTime} - {slot.endTime} (
                          {slot.isDirectOnly ? '直接專屬' : '全體開放'} · 剩 {rem}/4 席)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Field: Designated 4 Seats Selector (男A, 男B, 女A, 女B) */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">
                    選擇席位（每時段 4 席：男A、男B、女A、女B） <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    點擊選擇席位（已選擇 {selectedSeats.length} 席）
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleQuickCount(num)}
                      className="px-2 py-0.5 text-[11px] bg-white border border-neutral-300 rounded hover:bg-neutral-100 font-medium text-neutral-700"
                    >
                      {num}人
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Seat Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SLOT_SEAT_DEFS.map((seatDef) => {
                  const isAvailable = availableSeatIds.includes(seatDef.id);
                  const isSelected = selectedSeats.includes(seatDef.id);
                  const isMale = seatDef.id === '男A' || seatDef.id === '男B';

                  return (
                    <button
                      key={seatDef.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => toggleSeat(seatDef.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        !isAvailable
                          ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed opacity-60'
                          : isSelected
                          ? isMale
                            ? 'bg-sky-700 border-sky-800 text-white shadow-xs font-bold ring-2 ring-sky-300'
                            : 'bg-rose-700 border-rose-800 text-white shadow-xs font-bold ring-2 ring-rose-300'
                          : isMale
                          ? 'bg-sky-50/50 border-sky-200 hover:border-sky-400 hover:bg-sky-100/60 text-neutral-800 cursor-pointer'
                          : 'bg-rose-50/50 border-rose-200 hover:border-rose-400 hover:bg-rose-100/60 text-neutral-800 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : isMale
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isMale ? '男席' : '女席'}
                        </span>
                        <span className="text-sm font-bold">{seatDef.label}</span>
                      </div>
                      <div className="text-[10px] mt-1">
                        {!isAvailable
                          ? '已被登記'
                          : isSelected
                          ? '已選取 ✓'
                          : '空席 (可選)'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedSeats.length > 0 && (
                <div className="text-xs text-neutral-600 flex items-center justify-between pt-1">
                  <span>已選席位：<strong className="text-teal-800">{selectedSeats.join('、')}</strong></span>
                  <span className="text-neutral-500">共 {selectedSeats.length} 位同仁</span>
                </div>
              )}
            </div>

            {/* Field: Name, Employee ID & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  姓名 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="例如：王大明"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full text-xs border border-neutral-200 rounded-lg pl-9 pr-3 py-2 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  工號 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：D1088"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-lg px-3 py-2 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  所屬部門 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="例如：製造二部產線"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs border border-neutral-200 rounded-lg pl-9 pr-3 py-2 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Companion inputs if > 1 */}
            {selectedSeats.length >= 2 && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  同行同仁姓名（選填）
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="同行同仁 1 姓名"
                    value={companion1}
                    onChange={(e) => setCompanion1(e.target.value)}
                    className="text-xs border border-neutral-200 rounded-md px-3 py-1.5 bg-white"
                  />
                  {selectedSeats.length >= 3 && (
                    <input
                      type="text"
                      placeholder="同行同仁 2 姓名"
                      value={companion2}
                      onChange={(e) => setCompanion2(e.target.value)}
                      className="text-xs border border-neutral-200 rounded-md px-3 py-1.5 bg-white"
                    />
                  )}
                  {selectedSeats.length >= 4 && (
                    <input
                      type="text"
                      placeholder="同行同仁 3 姓名"
                      value={companion3}
                      onChange={(e) => setCompanion3(e.target.value)}
                      className="text-xs border border-neutral-200 rounded-md px-3 py-1.5 bg-white"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                備註需求（選填）
              </label>
              <input
                type="text"
                placeholder="例如：輪班空檔放鬆"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded-lg px-3 py-2 bg-neutral-50 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Process Reminder Box */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 leading-relaxed">
              <span className="font-semibold block mb-0.5">現場自主維護約定：</span>
              使用獨立足浴桶放鬆完畢後，請記得將水倒至排水孔並將桶子與座位回復原樣，感謝配合！
            </div>

            {/* Footer Submit Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                取消
              </button>

              <button
                type="submit"
                disabled={isIndirectTryingDirect || isZeroSeats}
                className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  isIndirectTryingDirect || isZeroSeats
                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
                }`}
              >
                確認並完成預約 ({selectedSeats.length} 席)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
