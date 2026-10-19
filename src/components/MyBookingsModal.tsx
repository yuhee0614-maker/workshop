import React, { useState } from 'react';
import { Booking } from '../types';
import { bookingManager } from '../services/bookingManager';
import {
  X,
  Search,
  Calendar,
  Clock,
  User,
  Trash2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Ticket,
  Heart,
  MapPin,
} from 'lucide-react';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onCancelled: () => void;
  onOpenFeedback: (booking: Booking) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onCancelled,
  onOpenFeedback,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPass, setSelectedPass] = useState<Booking | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  if (!isOpen) return null;

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');

  const filteredBookings = confirmedBookings.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.employeeName.toLowerCase().includes(q) ||
      b.employeeId.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.department.toLowerCase().includes(q)
    );
  });

  const handleCancel = (bookingId: string) => {
    bookingManager.cancelBooking(bookingId);
    setConfirmCancelId(null);
    if (selectedPass?.id === bookingId) {
      setSelectedPass(null);
    }
    onCancelled();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                同仁預約紀錄與憑證管理
              </h3>
              <p className="text-xs text-neutral-500">
                可輸入工號、姓名查詢目前登記中的預約時段
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="搜尋工號 (如 D1088)、姓名或部門..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm border border-neutral-200 rounded-xl pl-9 pr-3 py-2 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Booking Cards List */}
          <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 space-y-2">
                <Ticket className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-sm font-medium">查無符合的預約紀錄</p>
                <p className="text-xs text-neutral-400">
                  可於即時看板或對話小幫手預約新的足浴時段
                </p>
              </div>
            ) : (
              filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-300 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-600 bg-white border border-neutral-200 px-2 py-0.5 rounded">
                        {b.id}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          b.employeeType === 'direct'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {b.employeeType === 'direct' ? '直接人員' : '間接人員'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm font-bold text-neutral-900 pt-1">
                      <span className="flex items-center gap-1 text-teal-700">
                        <Calendar className="w-4 h-4" />
                        {b.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-neutral-500" />
                        {b.slotId}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-600 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-neutral-800">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        {b.employeeName} ({b.employeeId})
                      </span>
                      <span>·</span>
                      <span>{b.department}</span>
                      <span>·</span>
                      <span className="font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                        席位：{b.seats?.join('、') || `${b.attendeeCount} 位`}
                      </span>
                      <span>·</span>
                      <span className="text-neutral-500">獨立足浴桶</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenFeedback(b);
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                      title="填寫體驗滿意度回饋"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-600" />
                      <span>{b.hasFeedback ? '已回饋' : '填寫回饋'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedPass(b)}
                      className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5 text-teal-600" />
                      <span>查看憑證</span>
                    </button>

                    {confirmCancelId === b.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="px-2.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                        >
                          確認取消
                        </button>
                        <button
                          onClick={() => setConfirmCancelId(null)}
                          className="px-2 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200 rounded-lg"
                        >
                          返回
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancelId(b.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="取消預約"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Digital Pass View Modal */}
          {selectedPass && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  足浴電子報到憑證（入場出示）
                </span>
                <button
                  onClick={() => setSelectedPass(null)}
                  className="text-xs text-teal-700 hover:text-teal-900"
                >
                  收起
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-teal-700 block text-[11px]">預約時間</span>
                  <span className="font-bold text-neutral-900">
                    {selectedPass.date} {selectedPass.slotId}
                  </span>
                </div>
                <div>
                  <span className="text-teal-700 block text-[11px]">體驗地點</span>
                  <span className="font-bold text-teal-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-700" />
                    六樓淋浴間
                  </span>
                </div>
                <div>
                  <span className="text-teal-700 block text-[11px]">預約席位</span>
                  <span className="font-bold text-teal-900">
                    {selectedPass.seats?.join('、') || '已指定'} ({selectedPass.attendeeCount} 席)
                  </span>
                </div>
                <div>
                  <span className="text-teal-700 block text-[11px]">時段長度</span>
                  <span className="font-bold text-neutral-900">
                    30 分鐘足浴時段
                  </span>
                </div>
                <div>
                  <span className="text-teal-700 block text-[11px]">預約同仁</span>
                  <span className="font-bold text-neutral-900">
                    {selectedPass.employeeName} ({selectedPass.employeeId})
                  </span>
                </div>
                <div>
                  <span className="text-teal-700 block text-[11px]">人員身分</span>
                  <span className="font-bold text-neutral-900">
                    {selectedPass.employeeType === 'direct' ? '直接人員' : '間接人員'} · {selectedPass.department}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-teal-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    VERIFIED TOKEN: {selectedPass.id}
                  </div>
                  <div className="text-xs font-semibold text-neutral-800">
                    地點：六樓淋浴間 · 依席位【{selectedPass.seats?.join('、')}】入座享受 30 分鐘足浴；結束後請倒水回復原樣
                  </div>
                </div>
                <div className="w-10 h-10 border border-neutral-300 rounded flex items-center justify-center bg-neutral-50">
                  <QrCode className="w-7 h-7 text-neutral-700" />
                </div>
              </div>

              <button
                onClick={() => {
                  const target = selectedPass;
                  onClose();
                  onOpenFeedback(target);
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-rose-50 to-amber-50 hover:from-rose-100 hover:to-amber-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Heart className="w-4 h-4 text-rose-600" />
                <span>填寫本次足浴體驗回饋表單（評分與倒水確認）</span>
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
