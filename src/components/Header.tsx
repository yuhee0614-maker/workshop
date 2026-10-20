import React from 'react';
import { TicketCheck, Sparkles, ClipboardList } from 'lucide-react';

interface HeaderProps {
  activeTab: 'timetable' | 'rules';
  setActiveTab: (tab: 'timetable' | 'rules') => void;
  onOpenBooking: () => void;
  onOpenMyBookings: () => void;
  onOpenFeedback?: () => void;
  onOpenAdmin?: () => void;
  bookingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenBooking,
  onOpenMyBookings,
  bookingCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900 tracking-tight leading-none flex items-center gap-2">
              <span>公司員工足浴預約</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-full">
                六樓淋浴間
              </span>
            </h1>
            <p className="text-xs text-neutral-500 mt-1 hidden sm:block">
              地點：六樓淋浴間 · 使用時間 12:00 - 17:00 · 每時段 30 分鐘足浴（男A、男B、男C、女A、女B、女C）
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1">
          {activeTab === 'rules' ? (
            <button
              onClick={() => setActiveTab('timetable')}
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>← 返回預約時段</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('rules')}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            >
              <ClipboardList className="w-4 h-4 text-teal-600" />
              <span>使用流程與規則</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMyBookings}
            className="px-3 py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5 border border-neutral-200"
            title="查閱或取消預約"
          >
            <TicketCheck className="w-4 h-4 text-teal-600" />
            <span className="hidden sm:inline">我的預約</span>
            {bookingCount > 0 && (
              <span className="ml-1 text-xs font-semibold px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded">
                {bookingCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenBooking}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            + 登記預約
          </button>
        </div>
      </div>
    </header>
  );
};
