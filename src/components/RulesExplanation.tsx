import React from 'react';
import { TIME_SLOTS, DIRECT_ONLY_PROMPT_MESSAGE } from '../data/constants';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';

export const RulesExplanation: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* 3-Step Process Highlight Section */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-2xs space-y-5">
        <div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">
            Usage Guidelines
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-neutral-900 mt-1">
              足浴坊完整使用流程
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-teal-50 text-teal-800 rounded-md border border-teal-200 mt-1">
              地點：六樓淋浴間 · 每時段 30 分鐘足浴
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            請同仁遵守三步驟使用規範，在 30 分鐘時段內自主掌握足浴放鬆與清潔回復原樣
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  1
                </span>
                <h4 className="font-bold text-neutral-900 text-sm">
                  線上登記預約
                </h4>
              </div>
              <ul className="text-xs text-neutral-600 space-y-1.5 leading-relaxed pl-1">
                <li>• 使用時間為每日 12:00 至 17:00，地點位於六樓淋浴間。</li>
                <li>• 於即時看板選擇日期、時段與席位（男A、男B、女A、女B）。</li>
                <li>• 請核對身分：12:00~13:00 及 15:00~15:30 為直接人員（現場作業員）專屬時段。</li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  2
                </span>
                <h4 className="font-bold text-neutral-900 text-sm">
                  至六樓淋浴間入座
                </h4>
              </div>
              <ul className="text-xs text-neutral-600 space-y-1.5 leading-relaxed pl-1">
                <li>• 請準時抵達六樓淋浴間。</li>
                <li>• 依照預約之席位標示（男A、男B、女A、女B）對應入座。</li>
                <li>• 每位同仁使用專屬「獨立檜木足浴桶」，享有 30 分鐘完整足浴時段，由同仁自主處理享受與各項足浴事宜。</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  3
                </span>
                <h4 className="font-bold text-neutral-900 text-sm">
                  結束後的處理（倒水復原）
                </h4>
              </div>
              <ul className="text-xs text-neutral-600 space-y-1.5 leading-relaxed pl-1">
                <li>• 30 分鐘時段內體驗結束後，請將足浴桶內的水倒入排水孔。</li>
                <li>• 清水簡單沖淨獨立足浴桶後置回原處。</li>
                <li>• 將個人座位周邊擦拭整潔回復原樣，方便下一位同仁使用。</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Identity Restrictions Table */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              時段身分限制與預約權限表
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              落實員工關懷：優先體貼產線現場長時站立作業同仁下肢循環疲勞
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-800 rounded-md border border-teal-200">
            全日 10 個時段 · 每時段 4 席
          </span>
        </div>

        {/* Highlighted Warning Box */}
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs sm:text-sm text-amber-950 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">友善提醒機制說明：</span>
            <p className="mt-1 leading-relaxed">
              若「間接人員（如：辦公室同仁、內勤、研發、企劃）」嘗試預約直接人員專屬時段，系統將自動提供親切提醒：
              <br />
              <strong className="text-amber-900 font-semibold mt-1 inline-block bg-white/70 px-2 py-0.5 rounded border border-amber-200">
                「{DIRECT_ONLY_PROMPT_MESSAGE}」
              </strong>
            </p>
          </div>
        </div>

        {/* Slot Table */}
        <div className="overflow-x-auto border border-neutral-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">時段代號</th>
                <th className="py-3 px-4">時間區間</th>
                <th className="py-3 px-4">時段類別</th>
                <th className="py-3 px-4">直接人員可否預約</th>
                <th className="py-3 px-4">間接人員可否預約</th>
                <th className="py-3 px-4">席位配置</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              {TIME_SLOTS.map((slot, idx) => {
                const isDirect = slot.isDirectOnly;
                return (
                  <tr
                    key={slot.id}
                    className={isDirect ? 'bg-teal-50/30' : 'bg-white'}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-neutral-500">
                      T{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold tabular-nums">
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td className="py-3 px-4">
                      {isDirect ? (
                        <span className="font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                          直接人員專屬時段
                        </span>
                      ) : (
                        <span className="text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                          全體開放時段
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      允許預約
                    </td>
                    <td className="py-3 px-4">
                      {isDirect ? (
                        <span className="text-amber-800 font-medium">
                          不開放（請選其他時段）
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          允許預約
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 tabular-nums font-semibold">
                      男A、男B、女A、女B (共 4 席)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
