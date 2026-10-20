import React, { useState, useEffect } from 'react';
import {
  Booking,
  EmployeeType,
  ExperienceFeedback,
  SeatId,
  SlotStatus,
  TimeSlotDef,
} from './types';
import { bookingManager } from './services/bookingManager';
import { Header } from './components/Header';
import { WellnessHero } from './components/WellnessHero';
import { SlotTimetable } from './components/SlotTimetable';
import { RulesExplanation } from './components/RulesExplanation';
import { BookingModal } from './components/BookingModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { FeedbackModal } from './components/FeedbackModal';
import { AdminFeedbackModal } from './components/AdminFeedbackModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import {
  Calendar,
  ClipboardList,
  Sparkles,
  CheckCircle,
  RotateCcw,
  Heart,
  Lock,
  Star,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'timetable' | 'rules'>('timetable');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [activeEmployeeType, setActiveEmployeeType] = useState<EmployeeType | 'all'>('all');
  const [slotStatuses, setSlotStatuses] = useState<SlotStatus[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allFeedbacks, setAllFeedbacks] = useState<ExperienceFeedback[]>([]);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<TimeSlotDef | null>(null);
  const [selectedSeatForBooking, setSelectedSeatForBooking] = useState<SeatId | null>(null);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedBookingForFeedback, setSelectedBookingForFeedback] = useState<Booking | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminFeedbackOpen, setIsAdminFeedbackOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize with bookingManager
  const refreshData = () => {
    setSlotStatuses(bookingManager.getSlotStatusList(selectedDate));
    setAllBookings(bookingManager.getAllBookings());
    setAllFeedbacks(bookingManager.getAllFeedbacks());
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = bookingManager.subscribe(refreshData);
    return () => unsubscribe();
  }, [selectedDate]);

  // Keyboard shortcut for administrator entry (Ctrl+Shift+A or Cmd+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenBookingModal = (slot?: TimeSlotDef, preSelectedSeat?: SeatId) => {
    setSelectedSlotForBooking(slot || null);
    setSelectedSeatForBooking(preSelectedSeat || null);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    const seatsText = booking.seats?.join('、') || `${booking.attendeeCount} 位`;
    showToast(`預約成功！編號：${booking.id} (${booking.slotId} ${seatsText} ${booking.employeeName})`);
    refreshData();
  };

  // Compute daily stats
  const activeTodayBookings = allBookings.filter(
    (b) => b.date === selectedDate && b.status === 'confirmed'
  );
  const totalBookedPeopleToday = activeTodayBookings.reduce(
    (sum, b) => sum + (b.seats?.length || b.attendeeCount || 0),
    0
  );
  const directCount = activeTodayBookings
    .filter((b) => b.employeeType === 'direct')
    .reduce((sum, b) => sum + (b.seats?.length || b.attendeeCount || 0), 0);
  const indirectCount = activeTodayBookings
    .filter((b) => b.employeeType === 'indirect')
    .reduce((sum, b) => sum + (b.seats?.length || b.attendeeCount || 0), 0);

  const totalSeats = 40; // 10 slots * 4 seats (男A、男B、女A、女B)
  const remainingSeatsToday = Math.max(0, totalSeats - totalBookedPeopleToday);

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-neutral-800 flex flex-col font-sans relative selection:bg-teal-100 selection:text-teal-900">
      {/* Ambient zen spa warm sunlight background glow */}
      <div className="absolute top-0 inset-x-0 h-[480px] bg-gradient-to-b from-amber-100/40 via-stone-100/30 to-transparent pointer-events-none -z-10" />

      {/* Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBooking={() => handleOpenBookingModal()}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenFeedback={() => {
          setSelectedBookingForFeedback(null);
          setIsFeedbackOpen(true);
        }}
        bookingCount={
          allBookings.filter((b) => b.status === 'confirmed').length
        }
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg border border-neutral-700 flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hero Banner with 3-Step Process Highlight */}
        <WellnessHero
          onQuickBook={() => handleOpenBookingModal()}
          onViewProcess={() => setActiveTab('rules')}
        />

        {/* Daily Utilization Stats Bar */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/90 backdrop-blur-xs border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <div className="px-2">
            <span className="text-[11px] text-neutral-500 block">本日已預約席位</span>
            <div className="text-lg font-bold text-neutral-900 tabular-nums">
              {totalBookedPeopleToday}{' '}
              <span className="text-xs font-normal text-neutral-500">/ 40 席</span>
            </div>
          </div>

          <div className="px-2 border-l border-neutral-100">
            <span className="text-[11px] text-neutral-500 block">剩餘可預約席位</span>
            <div className="text-lg font-bold text-teal-700 tabular-nums">
              {remainingSeatsToday}{' '}
              <span className="text-xs font-normal text-neutral-500">席可約</span>
            </div>
          </div>

          <div className="px-2 border-l border-neutral-100">
            <span className="text-[11px] text-neutral-500 block">直接人員登記 (現場)</span>
            <div className="text-lg font-bold text-teal-900 tabular-nums">
              {directCount}{' '}
              <span className="text-xs font-normal text-neutral-500">人次</span>
            </div>
          </div>

          <div className="px-2 border-l border-neutral-100">
            <span className="text-[11px] text-neutral-500 block">間接人員登記 (辦公)</span>
            <div className="text-lg font-bold text-neutral-700 tabular-nums">
              {indirectCount}{' '}
              <span className="text-xs font-normal text-neutral-500">人次</span>
            </div>
          </div>
        </div>

        {/* Navigation Tab Body */}
        {activeTab === 'timetable' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  預約時段
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  12:00 至 17:00 共 10 個時段 · 每時段 4 席（男A、男B、女A、女B）
                </p>
              </div>

              <button
                onClick={() => handleOpenBookingModal()}
                className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-2xs items-center gap-1"
              >
                + 登記預約
              </button>
            </div>

            <SlotTimetable
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              slotStatuses={slotStatuses}
              onSelectSlotToBook={handleOpenBookingModal}
              activeEmployeeType={activeEmployeeType}
              setActiveEmployeeType={setActiveEmployeeType}
            />
          </section>
        )}

        {activeTab === 'rules' && (
          <section>
            <RulesExplanation />
          </section>
        )}
      </main>

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        defaultDate={selectedDate}
        defaultSlot={selectedSlotForBooking}
        defaultSeat={selectedSeatForBooking}
        defaultEmployeeType={
          activeEmployeeType === 'all' ? 'direct' : activeEmployeeType
        }
        onBookingSuccess={handleBookingSuccess}
        onOpenFeedback={(booking) => {
          setSelectedBookingForFeedback(booking);
          setIsFeedbackOpen(true);
        }}
      />

      {/* My Bookings Modal */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        bookings={allBookings}
        onCancelled={() => {
          refreshData();
          showToast('已成功取消該筆預約，名額已重新釋出。');
        }}
        onOpenFeedback={(booking) => {
          setSelectedBookingForFeedback(booking);
          setIsFeedbackOpen(true);
        }}
      />

      {/* Experience Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => {
          setIsFeedbackOpen(false);
          setSelectedBookingForFeedback(null);
        }}
        booking={selectedBookingForFeedback}
        onFeedbackSubmitted={() => {
          refreshData();
          showToast('感謝您的體驗回饋！資料已同步記錄。');
        }}
      />

      {/* Admin Password Login Modal (Protected manager access) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminFeedbackOpen(true);
          showToast('管理者身分驗證成功，已進入後台分析系統。');
        }}
      />

      {/* Admin Experience Feedback & Analytics Modal (Protected) */}
      <AdminFeedbackModal
        isOpen={isAdminFeedbackOpen}
        onClose={() => setIsAdminFeedbackOpen(false)}
        feedbacks={allFeedbacks}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white/95 backdrop-blur-xs py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-neutral-700">
              公司員工舒活足浴坊
            </span>
            <span aria-hidden="true">·</span>
            <span>開放時間：12:00 - 17:00</span>
            <span aria-hidden="true">·</span>
            <span>自主使用維護：使用後請倒水回復原樣</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
            <button
              onClick={() => {
                bookingManager.resetSampleData();
                refreshData();
                showToast('已重設為示範預約與體驗回饋資料');
              }}
              className="text-neutral-400 hover:text-neutral-700 flex items-center gap-1 transition-colors"
              title="重設為預設展示資料"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置示範資料</span>
            </button>
            <span className="text-neutral-300">|</span>
            {/* Discreet Manager Entry with Lock Protection */}
            <button
              onClick={() => setIsAdminLoginOpen(true)}
              className="text-neutral-400 hover:text-teal-700 flex items-center gap-1 transition-colors cursor-pointer"
              title="管理者登入專區"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>管理者專區</span>
            </button>
            <span className="text-neutral-300 hidden md:inline">|</span>
            <span className="hidden md:inline">健康職場·樂活同仁</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
