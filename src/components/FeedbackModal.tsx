import React, { useState, useEffect } from 'react';
import {
  Booking,
  EmployeeType,
  SeatId,
  FutureSupportType,
  WeeklyFrequencyType,
  DurationSuitabilityType,
  TimeSlotPreferenceType,
  DrainageConvenienceType,
  WorkBenefitType,
  InitialBucketConditionType,
} from '../types';
import { bookingManager } from '../services/bookingManager';
import {
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  Heart,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
  Tag,
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  onFeedbackSubmitted: () => void;
}

const COMMON_IMPROVEMENT_TAGS = [
  '增加更多擦腳毛巾/紙巾',
  '加裝排水導流管防噴濺',
  '增加座位靠枕與置物籃',
  '建議增設現場壁掛時鐘',
  '延長開放至下班時段 (17:00-18:30)',
  '增設上午時段 (10:00-12:00)',
  '加強現場洗手乳與消毒液',
  '維持現場直接人員專屬時段',
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  booking,
  onFeedbackSubmitted,
}) => {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [employeeType, setEmployeeType] = useState<EmployeeType>('direct');
  const [date, setDate] = useState('');
  const [slotId, setSlotId] = useState('');
  const [seatId, setSeatId] = useState<SeatId | undefined>(undefined);

  // 1. Overall & Permanent Deployment
  const [overallRating, setOverallRating] = useState<number>(5);
  const [futureSupport, setFutureSupport] = useState<FutureSupportType>('strongly_recommend');
  const [weeklyFrequency, setWeeklyFrequency] = useState<WeeklyFrequencyType>('1_2_times');

  // 2. Timing & Duration
  const [durationSuitability, setDurationSuitability] = useState<DurationSuitabilityType>('perfect');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<TimeSlotPreferenceType>('keep_current');

  // 3. Facility & Cleanliness
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(5);
  const [drainageConvenience, setDrainageConvenience] = useState<DrainageConvenienceType>('smooth');
  const [suppliesSatisfaction, setSuppliesSatisfaction] = useState<number>(5);
  const [initialBucketCondition, setInitialBucketCondition] = useState<InitialBucketConditionType>('clean');

  // 4. Wellbeing & Productivity
  const [fatigueReliefFeeling, setFatigueReliefFeeling] = useState<'very_effective' | 'moderate' | 'neutral' | 'none'>('very_effective');
  const [workBenefit, setWorkBenefit] = useState<WorkBenefitType>('energy_boost');

  // 5. Cleanup
  const [cleanedUpAndRestored, setCleanedUpAndRestored] = useState<boolean>(true);

  // 6. Suggestions
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comments, setComments] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (booking) {
      setEmployeeName(booking.employeeName);
      setEmployeeId(booking.employeeId);
      setDepartment(booking.department);
      setEmployeeType(booking.employeeType);
      setDate(booking.date);
      setSlotId(booking.slotId);
      setSeatId(booking.seats?.[0]);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setSlotId('12:00-12:30');
    }
    setSubmitted(false);
    setErrorMsg(null);
  }, [booking, isOpen]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName.trim() || !employeeId.trim()) {
      setErrorMsg('請輸入同仁姓名與工號');
      return;
    }

    if (!cleanedUpAndRestored) {
      setErrorMsg('請同仁確認已將水倒掉並將獨立足浴桶及座位回復原樣，以維護良好環境。');
      return;
    }

    bookingManager.createFeedback({
      bookingId: booking?.id,
      date: date || new Date().toISOString().split('T')[0],
      slotId: slotId || '12:00-12:30',
      seatId: seatId || booking?.seats?.[0],
      employeeName: employeeName.trim(),
      employeeId: employeeId.trim().toUpperCase(),
      department: department.trim() || '未填寫部門',
      employeeType,
      overallRating,
      futureSupport,
      weeklyFrequency,
      durationSuitability,
      preferredTimeSlot,
      cleanlinessRating,
      drainageConvenience,
      suppliesSatisfaction,
      initialBucketCondition,
      fatigueReliefFeeling,
      workBenefit,
      cleanedUpAndRestored,
      improvementTags: selectedTags,
      comments: comments.trim(),
    });

    setSubmitted(true);
    onFeedbackSubmitted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-900 to-neutral-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <h3 className="text-base font-bold">
                足浴體驗回饋表（常態落地評估調查）
              </h3>
            </div>
            <p className="text-xs text-neutral-300 mt-0.5">
              地點：六樓淋浴間 · 每時段 30 分鐘 · 本問卷為公司未來正式常態落地設置足浴坊之重要評估依據，感謝您的寶貴意見！
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-neutral-900">
              感謝您的寶貴回饋與落地建議！
            </h4>
            <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              您的評分、設施動線與每週使用意願已完整同步至管理後台。我們將彙整所有同仁反饋，作為推動公司常態落地足浴坊的關鍵依據！
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
              >
                完成並關閉
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Basic Info Bar */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
              <span className="font-bold text-neutral-800 block text-[11px] uppercase tracking-wide">
                預約體驗同仁基本資訊
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-neutral-700">
                <div>
                  <span className="text-neutral-400 block text-[10px]">體驗時段</span>
                  <span className="font-semibold">{date} {slotId}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">席位標示</span>
                  <span className="font-semibold text-teal-800">
                    {seatId || booking?.seats?.join('、') || '男A'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">姓名 / 工號</span>
                  <span className="font-semibold">{employeeName || '同仁'} ({employeeId || '-'})</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">人員類別</span>
                  <span className="font-semibold">
                    {employeeType === 'direct' ? '現場直接人員' : '辦公間接人員'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: Permanent Rollout & Overall Satisfaction */}
            <div className="space-y-3.5 border-b border-neutral-100 pb-5">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                <TrendingUp className="w-4 h-4 text-teal-700" />
                <span>一、常態落地設置評估與整體滿意度</span>
              </div>

              {/* Overall Star Rating */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  1. 本次足浴體驗整體滿意度 <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOverallRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= overallRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-neutral-700">
                    {overallRating === 5
                      ? '非常滿意 (5分)'
                      : overallRating === 4
                      ? '滿意 (4分)'
                      : overallRating === 3
                      ? '普通 (3分)'
                      : overallRating === 2
                      ? '需改善 (2分)'
                      : '很不滿意 (1分)'}
                  </span>
                </div>
              </div>

              {/* Future Support Intent */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  2. 您是否支持公司正式常態落地設置「員工足浴坊」？ <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { key: 'strongly_recommend', label: '強烈支持設置' },
                      { key: 'recommend', label: '贊成常態設置' },
                      { key: 'neutral', label: '尚可／保留觀望' },
                      { key: 'not_recommend', label: '不建議設置' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFutureSupport(item.key)}
                      className={`py-2 px-2.5 rounded-lg border font-medium text-center transition-all ${
                        futureSupport === item.key
                          ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-700'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Frequency */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  3. 未來若常態落地，您預期每週的使用頻率？ <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { key: '3_plus', label: '每週 3 次以上' },
                      { key: '1_2_times', label: '每週 1~2 次' },
                      { key: 'occasional', label: '工作疲勞時偶爾' },
                      { key: 'rare', label: '很少／不一定' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setWeeklyFrequency(item.key)}
                      className={`py-2 px-2.5 rounded-lg border font-medium text-center transition-all ${
                        weeklyFrequency === item.key
                          ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-700'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Timing & Duration */}
            <div className="space-y-3.5 border-b border-neutral-100 pb-5">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                <Clock className="w-4 h-4 text-teal-700" />
                <span>二、時長與使用時段規劃</span>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  4. 目前每梯次 30 分鐘（由同仁在 30 分鐘內自主掌握足浴享受與清潔倒水），時間長度是否合適？
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'perfect', label: '剛好合適 (30分鐘)' },
                      { key: 'too_short', label: '稍短，希望能泡更久' },
                      { key: 'too_long', label: '稍長，容易耽誤工作' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setDurationSuitability(item.key)}
                      className={`py-2 px-2 rounded-lg border font-medium text-center transition-all ${
                        durationSuitability === item.key
                          ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-700'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  5. 未來常態使用時段建議
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { key: 'keep_current', label: '維持 12:00-17:00' },
                      { key: 'prefer_afterwork', label: '建議延長至下班 17:00-18:30' },
                      { key: 'prefer_morning', label: '建議增設上午時段' },
                      { key: 'lunch_only', label: '僅午休時段需要' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setPreferredTimeSlot(item.key)}
                      className={`py-2 px-2 text-center rounded-lg border font-medium transition-all ${
                        preferredTimeSlot === item.key
                          ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-700'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Facilities, Drainage & Supplies */}
            <div className="space-y-3.5 border-b border-neutral-100 pb-5">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>三、現場硬體動線與備品維護（同仁自行調水溫）</span>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  6. 現場裝水與倒水排水動線順暢度
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'smooth', label: '裝水/倒水非常便利順暢' },
                      { key: 'acceptable', label: '動線尚可接受' },
                      { key: 'inconvenient', label: '倒水或水龍頭略顯不便' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setDrainageConvenience(item.key)}
                      className={`py-2 px-2 rounded-lg border font-medium text-center transition-all ${
                        drainageConvenience === item.key
                          ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-700'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    7. 獨立足浴桶與座位清潔評分
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCleanlinessRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= cleanlinessRating
                              ? 'text-teal-600 fill-teal-600'
                              : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-1 font-bold text-neutral-700">
                      {cleanlinessRating} 分
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    8. 現場耗材充足度（擦腳巾/紙巾/拖鞋）
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSuppliesSatisfaction(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= suppliesSatisfaction
                              ? 'text-teal-600 fill-teal-600'
                              : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-1 font-bold text-neutral-700">
                      {suppliesSatisfaction} 分
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  9. 入座時上一位同仁的復原狀況
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'clean', label: '桶乾淨整齊、無積水' },
                      { key: 'minor_water', label: '有輕微水滴但可接受' },
                      { key: 'uncleaned', label: '遇到上一手未倒水' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setInitialBucketCondition(item.key)}
                      className={`py-2 px-2 rounded-lg border font-medium text-center transition-all ${
                        initialBucketCondition === item.key
                          ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-700'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Fatigue Relief & Productivity Benefit */}
            <div className="space-y-3.5 border-b border-neutral-100 pb-5">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <span>四、身心放鬆與下午工作效益</span>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  10. 體驗後下肢緊繃/水腫改善感
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { key: 'very_effective', label: '非常有感 (雙腿輕盈)' },
                      { key: 'moderate', label: '明顯放鬆舒緩' },
                      { key: 'neutral', label: '感受普通' },
                      { key: 'none', label: '無明顯差異' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFatigueReliefFeeling(item.key)}
                      className={`py-2 px-2 rounded-lg border font-medium text-center transition-all ${
                        fatigueReliefFeeling === item.key
                          ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-700'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  11. 足浴對後續下午工作的幫助
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { key: 'energy_boost', label: '提神充電、精神變好' },
                      { key: 'muscle_relax', label: '肌肉放鬆、久站不痠' },
                      { key: 'drowsy', label: '略微放鬆想小睡' },
                      { key: 'none', label: '無特別影響' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setWorkBenefit(item.key)}
                      className={`py-2 px-2 rounded-lg border font-medium text-center transition-all ${
                        workBenefit === item.key
                          ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-700'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 5: Mandatory Cleanup Confirmation */}
            <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={cleanedUpAndRestored}
                  onChange={(e) => setCleanedUpAndRestored(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-teal-700 focus:ring-teal-600"
                />
                <div>
                  <span className="font-bold text-amber-950 text-xs block">
                    12. 結束後處理確認（把水倒掉回復原樣） <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] text-amber-900 leading-relaxed block mt-1">
                    我已於足浴體驗結束後，主動將獨立足浴桶內的水倒掉至排水孔、簡單沖洗清潔，並將水桶與座位回復原樣，維持下一位同仁良好的使用環境。
                  </span>
                </div>
              </label>
            </div>

            {/* Section 6: Improvement Suggestions & Feedback */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                <Tag className="w-4 h-4 text-teal-700" />
                <span>五、未來落地具體建議與同仁心得</span>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1.5">
                  快速勾選改善期待項目（可複選）：
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_IMPROVEMENT_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-md text-xs transition-colors border ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 font-semibold'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  其他詳細心得或具體建言（例如：現場動線配置、水龍頭水壓、預約規則等）：
                </label>
                <textarea
                  rows={3}
                  placeholder="請在此留下您對未來常態落地足浴坊的任何真實建議或回饋心得..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
              >
                提交體驗評估回饋
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
