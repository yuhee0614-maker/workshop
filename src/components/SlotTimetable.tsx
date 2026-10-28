import React, { useState } from 'react';
import { TimeSlotDef, SlotStatus, EmployeeType, SeatId } from '../types';
import { DIRECT_ONLY_PROMPT_MESSAGE, MAX_CAPACITY_PER_SLOT } from '../data/constants';
import {
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
} from 'lucide-react';

interface SlotTimetableProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  slotStatuses: SlotStatus[];
  onSelectSlotToBook: (slot: TimeSlotDef, preSelectedSeat?: SeatId) => void;
  activeEmployeeType: EmployeeType | 'all';
  setActiveEmployeeType: (type: EmployeeType | 'all') => void;
}

export const SlotTimetable: React.FC<SlotTimetableProps> = ({
  selectedDate,
  setSelectedDate,
  slotStatuses,
  onSelectSlotToBook,
  activeEmployeeType,
  setActiveEmployeeType,
}) => {
  const [restrictionAlert, setRestrictionAlert] = useState<{
    slotId: string;
    message: string;
  } | null>(null);

  const changeDateByDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1 * days);
    setSelectedDate(d.toISOString().split('T')[0]);
    setRestrictionAlert(null);
  };

  const getDayLabel = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const tmrwStr = tmrw.toISOString().split('T')[0];

    if (dateStr === today) return '今天';
    if (dateStr === tmrwStr) return '明天';

    const dateObj = new Date(dateStr);
    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return weekdays[dateObj.getDay()];
  };

  const handleSlotClick = (status: SlotStatus) => {
    const { slot, isFull } = status;

    if (slot.isDirectOnly && activeEmployeeType === 'indirect') {
      setRestrictionAlert({
        slotId: slot.id,
        message: DIRECT_ONLY_PROMPT_MESSAGE,
      });
      return;
    }

    if (isFull) {
      setRestrictionAlert({
        slotId: slot.id,
        message: `時段 ${slot.startTime}-${slot.endTime} 目前已預約額滿（男A~男C、女A~女C 共 6 席已全數滿席）。請選擇其他時段。`,
      });
      return;
    }

    setRestrictionAlert(null);
    onSelectSlotToBook(slot);
  };

  const handleSeatClick = (status: SlotStatus, seatId: SeatId) => {
    const { slot } = status;

    if (slot.isDirectOnly && activeEmployeeType === 'indirect') {
      setRestrictionAlert({
        slotId: slot.id,
        message: DIRECT_ONLY_PROMPT_MESSAGE,
      });
      return;
    }

    setRestrictionAlert(null);
    onSelectSlotToBook(slot, seatId);
  };

  // Find recommended alternative open slots with vacancy
  const openAvailableSlots = slotStatuses.filter(
    (s) => !s.slot.isDirectOnly && s.remainingCapacity > 0
  );

  return (
    <div className="space-y-6">
      {/* Date & Filter Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Date Picker Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => changeDateByDays(-1)}
                className="p-1.5 hover:bg-white rounded-md text-neutral-600 hover:text-neutral-900 transition-colors"
                title="前一天"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>{selectedDate}</span>
                <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-normal">
                  {getDayLabel(selectedDate)}
                </span>
              </div>
              <button
                onClick={() => changeDateByDays(1)}
                className="p-1.5 hover:bg-white rounded-md text-neutral-600 hover:text-neutral-900 transition-colors"
                title="後一天"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedDate === new Date().toISOString().split('T')[0]
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                今天
              </button>
              <button
                onClick={() => {
                  const tmrw = new Date();
                  tmrw.setDate(tmrw.getDate() + 1);
                  setSelectedDate(tmrw.toISOString().split('T')[0]);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedDate ===
                  new Date(Date.now() + 86400000).toISOString().split('T')[0]
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                明天
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className="text-xs border border-neutral-200 rounded-md px-2 py-1.5 bg-neutral-50 text-neutral-700 hover:bg-white transition-colors cursor-pointer"
              />
              <div className="hidden lg:flex items-center gap-1 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-1 rounded-md">
                <MapPin className="w-3.5 h-3.5 text-teal-700" />
                <span>地點：六樓淋浴間</span>
              </div>
            </div>
          </div>

          {/* Interactive Role Simulator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 hidden sm:inline whitespace-nowrap">
              模擬我的身分資格：
            </span>
            <div className="flex items-center bg-neutral-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  setActiveEmployeeType('all');
                  setRestrictionAlert(null);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeEmployeeType === 'all'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                全視角
              </button>
              <button
                onClick={() => {
                  setActiveEmployeeType('direct');
                  setRestrictionAlert(null);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeEmployeeType === 'direct'
                    ? 'bg-white text-teal-800 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                直接人員 (產線/現場)
              </button>
              <button
                onClick={() => {
                  setActiveEmployeeType('indirect');
                  setRestrictionAlert(null);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeEmployeeType === 'indirect'
                    ? 'bg-white text-amber-800 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                間接人員 (辦公室/內勤)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Alert for Ineligible or Full Slots */}
      {restrictionAlert && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-950 mb-1">
                預約資格與時段提醒
              </h4>
              <p className="text-sm font-medium leading-relaxed">
                {restrictionAlert.message}
              </p>

              {/* Show recommended alternative slots right away */}
              {openAvailableSlots.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <span className="text-xs font-semibold text-amber-900 block mb-2">
                    為您推薦本日尚有空位的開放時段（點擊立即預約）：
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {openAvailableSlots.map((item) => (
                      <button
                        key={item.slot.id}
                        onClick={() => {
                          setRestrictionAlert(null);
                          onSelectSlotToBook(item.slot);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-amber-300 hover:border-teal-400 rounded-md text-xs font-medium text-teal-800 transition-colors flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{item.slot.startTime} - {item.slot.endTime}</span>
                        <span className="text-teal-600 font-semibold">
                          (剩 {item.remainingCapacity} 席)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setRestrictionAlert(null)}
              className="text-amber-700 hover:text-amber-900 text-xs px-2 py-1 rounded"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      {/* Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {slotStatuses.map((item) => {
          const { slot, totalBooked, remainingCapacity, isFull, seats } = item;
          const isDirectSlot = slot.isDirectOnly;
          const isBlockedForIndirect =
            activeEmployeeType === 'indirect' && isDirectSlot;

          return (
            <div
              key={slot.id}
              className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                isBlockedForIndirect
                  ? 'bg-neutral-50/80 border-neutral-200 opacity-80'
                  : isFull
                  ? 'bg-neutral-50 border-neutral-200'
                  : isDirectSlot
                  ? 'bg-teal-50/40 border-teal-200 hover:border-teal-400 hover:shadow-xs'
                  : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
              }`}
            >
              {/* Card Header: Slot Time & Direct badge */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-900 tabular-nums">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>

                  {isDirectSlot ? (
                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-100/90 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      直接專屬
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                      全體開放
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-500 mb-2.5">
                  <span>{isDirectSlot ? '現場產線優先' : '全體同仁皆可'}</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      isFull
                        ? 'text-rose-600'
                        : remainingCapacity <= 1
                        ? 'text-amber-600'
                        : 'text-teal-700'
                    }`}
                  >
                    {isFull ? `已滿席 (${MAX_CAPACITY_PER_SLOT}/${MAX_CAPACITY_PER_SLOT})` : `剩 ${remainingCapacity} 席 (${totalBooked}/${MAX_CAPACITY_PER_SLOT})`}
                  </span>
                </div>

                {/* 6 Designated Seats Grid: 男A, 男B, 男C, 女A, 女B, 女C */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-3">
                  {seats.map((seat) => {
                    const isMale = seat.gender === 'male' || seat.seatId.startsWith('男');
                    return (
                      <button
                        key={seat.seatId}
                        type="button"
                        disabled={seat.isBooked || isBlockedForIndirect}
                        onClick={() => handleSeatClick(item, seat.seatId)}
                        title={
                          seat.isBooked
                            ? `${seat.label} 已被預約：${seat.bookedBy?.name} (${seat.bookedBy?.department})`
                            : `點擊直接預約席位：${seat.label}`
                        }
                        className={`p-2 rounded-lg border text-left transition-all ${
                          seat.isBooked
                            ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed opacity-90'
                            : isBlockedForIndirect
                            ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed'
                            : isMale
                            ? 'bg-sky-50/70 border-sky-200 text-sky-950 hover:bg-sky-100 hover:border-sky-300 cursor-pointer shadow-2xs'
                            : 'bg-rose-50/70 border-rose-200 text-rose-950 hover:bg-rose-100 hover:border-rose-300 cursor-pointer shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold flex items-center gap-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isMale ? 'bg-sky-500' : 'bg-rose-500'
                              }`}
                            />
                            {seat.label}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                              seat.isBooked
                                ? 'bg-neutral-200 text-neutral-600'
                                : isMale
                                ? 'bg-sky-100 text-sky-800 font-semibold'
                                : 'bg-rose-100 text-rose-800 font-semibold'
                            }`}
                          >
                            {seat.isBooked ? '已登記' : '空席'}
                          </span>
                        </div>
                        <div className="truncate text-[10px] mt-0.5">
                          {seat.isBooked && seat.bookedBy ? (
                            <span className="text-neutral-500">
                              {seat.bookedBy.name.charAt(0)}*
                              {seat.bookedBy.name.slice(2) || seat.bookedBy.name.slice(1)} ({seat.bookedBy.department.split(' ')[0]})
                            </span>
                          ) : (
                            <span
                              className={`font-medium ${
                                isMale ? 'text-sky-700' : 'text-rose-700'
                              }`}
                            >
                              點擊預約
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isBlockedForIndirect ? (
                  <button
                    onClick={() => handleSlotClick(item)}
                    className="w-full py-1.5 text-xs font-semibold text-neutral-500 bg-neutral-100 hover:bg-amber-100 hover:text-amber-900 border border-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>間接人員受限</span>
                  </button>
                ) : isFull ? (
                  <button
                    disabled
                    className="w-full py-1.5 text-xs font-medium text-neutral-400 bg-neutral-100 rounded-lg cursor-not-allowed text-center"
                  >
                    時段已滿 (6席全滿)
                  </button>
                ) : (
                  <button
                    onClick={() => handleSlotClick(item)}
                    className={`w-full py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5 ${
                      isDirectSlot
                        ? 'bg-teal-700 hover:bg-teal-800 text-white'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>預約此時段</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Notes on Schedule */}
      <div className="flex flex-wrap items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-200 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
            男席 (男A、男B、男C)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            女席 (女A、女B、女C)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-neutral-300 inline-block" />
            已被預約席位
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
            直接人員專屬 (12:00-13:00, 15:30-16:00)
          </span>
        </div>
        <span>地點：六樓淋浴間 · 每時段 6 席（男A、男B、男C、女A、女B、女C）· 30 分鐘足浴時段（含足浴與自主清潔）</span>
      </div>
    </div>
  );
};
