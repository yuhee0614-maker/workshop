import React, { useState } from 'react';
import { ShieldCheck, Users, Clock, AlertCircle, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';

interface WellnessHeroProps {
  onQuickBook: () => void;
  onViewProcess: () => void;
}

export const WellnessHero: React.FC<WellnessHeroProps> = ({
  onQuickBook,
  onViewProcess,
}) => {
  const [imageError, setImageError] = useState(false);
  const heroImagePath = '/src/assets/images/bright_zen_lounge_1792374327616.jpg';

  return (
    <div className="relative overflow-hidden bg-[#faf8f5] text-stone-900 rounded-2xl mb-8 shadow-sm border border-stone-200/90">
      {/* Background Image / Daylight Zen Fallback */}
      <div className="absolute inset-0 z-0">
        {!imageError ? (
          <img
            src={heroImagePath}
            alt="六樓淋浴間員工足浴休閒空間"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-right md:object-center brightness-100 contrast-95"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-amber-50/80 via-stone-100/80 to-teal-50/80" />
        )}
        {/* Soft luminous scrim ensuring high contrast without overpowering font color */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f5]/97 via-[#faf8f5]/92 sm:via-[#faf8f5]/85 md:to-[#faf8f5]/35 to-[#faf8f5]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5]/90 via-transparent to-transparent sm:hidden" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-4xl">
        <div className="inline-flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-teal-800 bg-teal-50/95 border border-teal-200/80 rounded-full px-3.5 py-1 mb-3 shadow-2xs">
          <span className="flex items-center gap-1 font-bold text-teal-900">
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            地點：六樓淋浴間
          </span>
          <span aria-hidden="true" className="text-teal-400">·</span>
          <span>每日 12:00 - 17:00</span>
          <span aria-hidden="true" className="text-teal-400">·</span>
          <span className="font-bold text-teal-900">每時段 4 席 (男A、男B、女A、女B)</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900 mb-3 leading-tight">
          下肢舒活·放鬆身心 <br className="hidden sm:inline" />
          員工專屬舒活足浴坊
        </h2>

        <p className="text-stone-700 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl font-normal">
          設置於<strong>六樓淋浴間</strong>，配置獨立檜木足浴桶與舒適座椅，提供同仁在 30 分鐘完整時段內自主掌握足浴舒緩與用畢清潔。
          每時段上限 4 位同仁（設有男A、男B、女A、女B 專屬席位）。
        </p>

        {/* 3-Step Process Card */}
        <div className="bg-white/92 backdrop-blur-md border border-stone-200/90 rounded-xl p-4 sm:p-5 mb-6 shadow-xs">
          <span className="text-xs font-bold text-teal-800 block mb-3 uppercase tracking-wider">
            【足浴坊使用 3 步驟流程 · 每時段 30 分鐘】
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-stone-50/90 rounded-lg p-3 border border-stone-200/70 hover:border-teal-300 transition-colors">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-xs mb-1">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                  1
                </span>
                <span>線上預約</span>
              </div>
              <p className="text-xs text-stone-600 leading-normal">
                選擇日期、時段與專屬席位（男A、男B、女A、女B）完成線上登記。
              </p>
            </div>

            <div className="bg-stone-50/90 rounded-lg p-3 border border-stone-200/70 hover:border-teal-300 transition-colors">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-xs mb-1">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                  2
                </span>
                <span>至六樓淋浴間入座</span>
              </div>
              <p className="text-xs text-stone-600 leading-normal">
                準時抵達六樓淋浴間，依預約席位入座並使用獨立足浴桶，享有 30 分鐘足浴時段。
              </p>
            </div>

            <div className="bg-stone-50/90 rounded-lg p-3 border border-stone-200/70 hover:border-teal-300 transition-colors">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-xs mb-1">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                  3
                </span>
                <span>結束後的處理</span>
              </div>
              <p className="text-xs text-stone-600 leading-normal">
                30 分鐘時段內請將水倒掉、沖洗清潔並回復原樣，維持環境整潔。
              </p>
            </div>
          </div>
        </div>

        {/* Highlighted Policy Banner */}
        <div className="bg-amber-50/90 backdrop-blur-xs border border-amber-300/80 rounded-xl p-3.5 mb-6 text-xs text-amber-950">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-amber-950 font-bold">【直接人員專屬時段提醒】：</strong>
              <span className="text-amber-900 font-bold bg-amber-200/60 px-1 py-0.5 rounded">12:00~13:00</span> 及{' '}
              <span className="text-amber-900 font-bold bg-amber-200/60 px-1 py-0.5 rounded">15:00~15:30</span> 為現場作業員、產線同仁優先專屬時段；辦公室/內勤等間接同仁請選擇其他 7 個開放時段。
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onQuickBook}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
          >
            立即登記預約
          </button>
          <button
            onClick={onViewProcess}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>完整流程與規範</span>
            <ArrowRight className="w-3.5 h-3.5 text-teal-700" />
          </button>
          <div className="hidden sm:flex items-center gap-4 text-xs text-stone-600 ml-2 font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-700" />
              六樓淋浴間
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-700" />
              每時段 30 分鐘足浴
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-700" />
              每時段 4 席
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessHero;
