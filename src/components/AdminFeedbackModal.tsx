import React, { useState } from 'react';
import { ExperienceFeedback } from '../types';
import {
  X,
  Star,
  Download,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Heart,
  Clock,
  ShieldCheck,
  Sparkles,
  Tag,
  Building2,
  ThumbsUp,
} from 'lucide-react';

interface AdminFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbacks: ExperienceFeedback[];
}

export const AdminFeedbackModal: React.FC<AdminFeedbackModalProps> = ({
  isOpen,
  onClose,
  feedbacks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [supportFilter, setSupportFilter] = useState<'all' | 'strongly_recommend' | 'recommend' | 'other'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'direct' | 'indirect'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | 'low'>('all');

  if (!isOpen) return null;

  // Filter calculations
  const filtered = feedbacks.filter((f) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        f.employeeName.toLowerCase().includes(q) ||
        f.employeeId.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q) ||
        (f.comments && f.comments.toLowerCase().includes(q)) ||
        (f.improvementTags && f.improvementTags.some((t) => t.toLowerCase().includes(q)));
      if (!match) return false;
    }

    // Support filter
    if (supportFilter === 'strongly_recommend' && f.futureSupport !== 'strongly_recommend') return false;
    if (supportFilter === 'recommend' && f.futureSupport !== 'recommend') return false;
    if (supportFilter === 'other' && (f.futureSupport === 'strongly_recommend' || f.futureSupport === 'recommend')) return false;

    // Type filter
    if (typeFilter !== 'all' && f.employeeType !== typeFilter) return false;

    // Rating filter
    if (ratingFilter === '5' && f.overallRating !== 5) return false;
    if (ratingFilter === '4' && f.overallRating !== 4) return false;
    if (ratingFilter === 'low' && f.overallRating > 3) return false;

    return true;
  });

  // Analytics Stats
  const totalCount = feedbacks.length;
  const avgOverall =
    totalCount > 0
      ? (feedbacks.reduce((sum, f) => sum + f.overallRating, 0) / totalCount).toFixed(1)
      : '0.0';

  const strongSupportCount = feedbacks.filter(
    (f) => f.futureSupport === 'strongly_recommend' || f.futureSupport === 'recommend'
  ).length;
  const supportRate = totalCount > 0 ? Math.round((strongSupportCount / totalCount) * 100) : 0;

  const restoredCount = feedbacks.filter((f) => f.cleanedUpAndRestored).length;
  const restoredRate = totalCount > 0 ? Math.round((restoredCount / totalCount) * 100) : 100;

  const frequentUsersCount = feedbacks.filter(
    (f) => f.weeklyFrequency === '3_plus' || f.weeklyFrequency === '1_2_times'
  ).length;
  const frequentRate = totalCount > 0 ? Math.round((frequentUsersCount / totalCount) * 100) : 0;

  const durationPerfectCount = feedbacks.filter((f) => f.durationSuitability === 'perfect').length;
  const durationPerfectRate = totalCount > 0 ? Math.round((durationPerfectCount / totalCount) * 100) : 0;

  const smoothDrainageCount = feedbacks.filter((f) => f.drainageConvenience === 'smooth').length;
  const smoothDrainageRate = totalCount > 0 ? Math.round((smoothDrainageCount / totalCount) * 100) : 0;

  const avgCleanliness =
    totalCount > 0
      ? (feedbacks.reduce((sum, f) => sum + (f.cleanlinessRating || 5), 0) / totalCount).toFixed(1)
      : '5.0';

  const avgSupplies =
    totalCount > 0
      ? (feedbacks.reduce((sum, f) => sum + (f.suppliesSatisfaction || 5), 0) / totalCount).toFixed(1)
      : '5.0';

  // Direct vs Indirect breakdown
  const directList = feedbacks.filter((f) => f.employeeType === 'direct');
  const indirectList = feedbacks.filter((f) => f.employeeType === 'indirect');
  const directAvg =
    directList.length > 0
      ? (directList.reduce((sum, f) => sum + f.overallRating, 0) / directList.length).toFixed(1)
      : '-';
  const indirectAvg =
    indirectList.length > 0
      ? (indirectList.reduce((sum, f) => sum + f.overallRating, 0) / indirectList.length).toFixed(1)
      : '-';

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      '回饋編號',
      '填寫時間',
      '體驗日期',
      '時段代號',
      '席位代號',
      '同仁姓名',
      '工號',
      '部門',
      '人員類別',
      '整體滿意度(1-5)',
      '正式常態落地意願',
      '預期每週使用頻率',
      '30分鐘時長評估',
      '使用時段建議',
      '裝水倒水動線順暢度',
      '環境清潔度(1-5)',
      '耗材充足度(1-5)',
      '入座時上一手桶況',
      '疲勞減輕感',
      '下午工作效益',
      '自主倒水復原確認',
      '具體改善標籤',
      '同仁詳細建言與心得',
    ];

    const rows = filtered.map((f) => [
      f.id,
      new Date(f.createdAt).toLocaleString(),
      f.date,
      f.slotId,
      f.seatId || '',
      f.employeeName,
      f.employeeId,
      f.department,
      f.employeeType === 'direct' ? '現場直接人員' : '辦公間接人員',
      f.overallRating,
      f.futureSupport === 'strongly_recommend'
        ? '強烈支持設置'
        : f.futureSupport === 'recommend'
        ? '贊成常態設置'
        : f.futureSupport === 'neutral'
        ? '尚可/保留觀望'
        : '不建議設置',
      f.weeklyFrequency === '3_plus'
        ? '每週3次以上'
        : f.weeklyFrequency === '1_2_times'
        ? '每週1~2次'
        : f.weeklyFrequency === 'occasional'
        ? '偶爾疲勞時'
        : '很少',
      f.durationSuitability === 'perfect'
        ? '剛好合適(30分)'
        : f.durationSuitability === 'too_short'
        ? '稍短想泡更久'
        : '稍長',
      f.preferredTimeSlot === 'keep_current'
        ? '維持12:00-17:00'
        : f.preferredTimeSlot === 'prefer_afterwork'
        ? '建議延長至下班'
        : f.preferredTimeSlot === 'prefer_morning'
        ? '建議增設上午'
        : '僅午休需要',
      f.drainageConvenience === 'smooth'
        ? '非常順暢便利'
        : f.drainageConvenience === 'acceptable'
        ? '尚可接受'
        : '略顯不便',
      f.cleanlinessRating,
      f.suppliesSatisfaction || 5,
      f.initialBucketCondition === 'clean'
        ? '乾淨整齊'
        : f.initialBucketCondition === 'minor_water'
        ? '輕微水漬'
        : '未倒水',
      f.fatigueReliefFeeling === 'very_effective'
        ? '非常有感'
        : f.fatigueReliefFeeling === 'moderate'
        ? '明顯放鬆'
        : '感受普通',
      f.workBenefit === 'energy_boost'
        ? '提神充電精神好'
        : f.workBenefit === 'muscle_relax'
        ? '肌肉放鬆久站不痠'
        : f.workBenefit === 'drowsy'
        ? '略微想睡'
        : '無特別影響',
      f.cleanedUpAndRestored ? '已自主倒水復原' : '未勾選',
      `"${(f.improvementTags || []).join('; ')}"`,
      `"${(f.comments || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `公司足浴坊常態落地評估與體驗報表_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-900 via-neutral-900 to-teal-950 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400" />
              <h3 className="text-base font-bold">
                足浴常態落地推動管理後台與體驗分析
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                評估專用
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-0.5">
              彙整同仁正式落地支持度、每週使用意願、時段長度評價、動線設施回饋與自主倒水落實度
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top 4 Primary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl">
              <span className="text-xs text-teal-900 font-bold block flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5 text-teal-700" />
                正式落地支持率
              </span>
              <div className="text-2xl font-bold text-teal-950 mt-1">
                {supportRate}%
              </div>
              <span className="text-[11px] text-teal-700 mt-0.5 block">
                {strongSupportCount} / {totalCount} 位同仁強烈支持/贊成常態設置
              </span>
            </div>

            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
              <span className="text-xs text-amber-900 font-bold block flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                整體舒活滿意度
              </span>
              <div className="text-2xl font-bold text-amber-950 mt-1 flex items-baseline gap-1">
                <span>{avgOverall}</span>
                <span className="text-xs font-normal text-amber-700">/ 5.0</span>
              </div>
              <span className="text-[11px] text-amber-800 mt-0.5 block">
                現場直接 {directAvg} 分 · 辦公間接 {indirectAvg} 分
              </span>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <span className="text-xs text-emerald-900 font-bold block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                倒水復原達成率
              </span>
              <div className="text-2xl font-bold text-emerald-950 mt-1">
                {restoredRate}%
              </div>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">
                自主將水倒淨並回復座位原樣
              </span>
            </div>

            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl">
              <span className="text-xs text-indigo-900 font-bold block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                常態固定使用意願
              </span>
              <div className="text-2xl font-bold text-indigo-950 mt-1">
                {frequentRate}%
              </div>
              <span className="text-[11px] text-indigo-700 mt-0.5 block">
                每週預計使用 1 次以上同仁比率
              </span>
            </div>
          </div>

          {/* Secondary Operational Evaluation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
            <div className="flex items-center justify-between px-2">
              <span className="text-neutral-600 font-medium">30 分鐘梯次時長適宜度：</span>
              <span className="font-bold text-neutral-900 bg-white border border-neutral-200 px-2 py-0.5 rounded">
                {durationPerfectRate}% 認為剛好合適
              </span>
            </div>
            <div className="flex items-center justify-between px-2 border-t sm:border-t-0 sm:border-l border-neutral-200 pt-2 sm:pt-0">
              <span className="text-neutral-600 font-medium">裝水/排水動線順暢度：</span>
              <span className="font-bold text-neutral-900 bg-white border border-neutral-200 px-2 py-0.5 rounded">
                {smoothDrainageRate}% 評價便利順暢
              </span>
            </div>
            <div className="flex items-center justify-between px-2 border-t sm:border-t-0 sm:border-l border-neutral-200 pt-2 sm:pt-0">
              <span className="text-neutral-600 font-medium">現場耗材備品評分：</span>
              <span className="font-bold text-neutral-900 bg-white border border-neutral-200 px-2 py-0.5 rounded">
                {avgSupplies} / 5.0 (擦腳巾/拖鞋)
              </span>
            </div>
          </div>

          {/* Filter & Action Toolbar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="搜尋姓名、工號、部門或關鍵字..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-lg pl-8 pr-3 py-1.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Support Filter */}
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setSupportFilter('all')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    supportFilter === 'all'
                      ? 'bg-white font-bold text-neutral-900 shadow-2xs'
                      : 'text-neutral-600'
                  }`}
                >
                  全部支持度
                </button>
                <button
                  onClick={() => setSupportFilter('strongly_recommend')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    supportFilter === 'strongly_recommend'
                      ? 'bg-white font-bold text-teal-800 shadow-2xs'
                      : 'text-neutral-600'
                  }`}
                >
                  強烈支持
                </button>
                <button
                  onClick={() => setSupportFilter('recommend')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    supportFilter === 'recommend'
                      ? 'bg-white font-bold text-neutral-900 shadow-2xs'
                      : 'text-neutral-600'
                  }`}
                >
                  贊成設置
                </button>
                <button
                  onClick={() => setSupportFilter('other')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    supportFilter === 'other'
                      ? 'bg-white font-bold text-amber-700 shadow-2xs'
                      : 'text-neutral-600'
                  }`}
                >
                  保留觀望
                </button>
              </div>

              {/* Personnel Type Filter */}
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    typeFilter === 'all'
                      ? 'bg-white font-bold text-neutral-900 shadow-2xs'
                      : 'text-neutral-600'
                  }`}
                >
                  全員
                </button>
                <button
                  onClick={() => setTypeFilter('direct')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    typeFilter === 'direct'
                      ? 'bg-white font-bold text-teal-800 shadow-2xs'
                      : 'text-neutral-600'
                  }`}
                >
                  直接 (現場)
                </button>
                <button
                  onClick={() => setTypeFilter('indirect')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    typeFilter === 'indirect'
                      ? 'bg-white font-bold text-neutral-900 shadow-2xs'
                      : 'text-neutral-600'
                  }`}
                >
                  間接 (辦公)
                </button>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 text-xs font-bold text-neutral-800 hover:text-neutral-950 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span>匯出常態落地評估 CSV 報表</span>
            </button>
          </div>

          {/* Feedback Records Table */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">填寫日期</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">體驗時段 / 席位</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">同仁工號 / 姓名</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">部門 / 類別</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">滿意度 & 支持度</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">預期每週頻率</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">動線與倒水復原</th>
                    <th className="py-2.5 px-3 min-w-[220px]">改善標籤與同仁建言</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-400">
                        查無符合篩選條件的同仁體驗回饋
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/70">
                        <td className="py-2.5 px-3 text-neutral-500 tabular-nums whitespace-nowrap">
                          {item.createdAt.slice(0, 10)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium">
                          <span>{item.date} {item.slotId}</span>
                          {item.seatId && (
                            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-800">
                              {item.seatId}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-semibold text-neutral-900">
                            {item.employeeName}
                          </span>
                          <span className="text-neutral-500 ml-1">
                            ({item.employeeId})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-neutral-600">
                          <div>{item.department}</div>
                          <span
                            className={`text-[10px] px-1 rounded inline-block mt-0.5 ${
                              item.employeeType === 'direct'
                                ? 'bg-teal-100 text-teal-800 font-semibold'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {item.employeeType === 'direct' ? '現場作業員' : '辦公同仁'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-bold text-neutral-900">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{item.overallRating}.0</span>
                          </div>
                          <div className="mt-0.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                item.futureSupport === 'strongly_recommend'
                                  ? 'bg-teal-100 text-teal-900'
                                  : item.futureSupport === 'recommend'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              {item.futureSupport === 'strongly_recommend'
                                ? '強烈支持落地'
                                : item.futureSupport === 'recommend'
                                ? '贊成常態設置'
                                : '尚可保留'}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-neutral-700">
                          <div className="font-medium">
                            {item.weeklyFrequency === '3_plus'
                              ? '每週 3 次以上'
                              : item.weeklyFrequency === '1_2_times'
                              ? '每週 1~2 次'
                              : '工作疲憊時偶爾'}
                          </div>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">
                            {item.durationSuitability === 'perfect'
                              ? '30分長度適宜'
                              : item.durationSuitability === 'too_short'
                              ? '希望更長'
                              : '稍長'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {item.cleanedUpAndRestored ? (
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              已倒水復原
                            </span>
                          ) : (
                            <span className="text-[11px] text-rose-600 font-semibold">
                              未勾選確認
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-500 block mt-0.5">
                            動線：{item.drainageConvenience === 'smooth' ? '順暢便利' : '尚可'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-700">
                          {item.improvementTags && item.improvementTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {item.improvementTags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded border border-neutral-200"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.comments ? (
                            <p className="line-clamp-2 text-xs leading-relaxed text-neutral-800">
                              {item.comments}
                            </p>
                          ) : (
                            <span className="text-neutral-400 italic">無額外留言</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-500">
            目前共顯示 {filtered.length} 筆體驗評估回饋紀錄
          </span>
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
