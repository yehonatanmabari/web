import React, { useMemo, useState } from "react";

const weekDataset = [
  { day: "יום א׳", addition: 8, subtraction: 6, multiplication: 4, division: 2, percent: 1 },
  { day: "יום ב׳", addition: 10, subtraction: 7, multiplication: 5, division: 3, percent: 2 },
  { day: "יום ג׳", addition: 12, subtraction: 8, multiplication: 6, division: 4, percent: 2 },
  { day: "יום ד׳", addition: 14, subtraction: 10, multiplication: 8, division: 5, percent: 3 },
  { day: "יום ה׳", addition: 15, subtraction: 12, multiplication: 9, division: 6, percent: 4 },
  { day: "יום ו׳", addition: 6, subtraction: 5, multiplication: 3, division: 2, percent: 1 },
  { day: "שבת", addition: 4, subtraction: 3, multiplication: 2, division: 1, percent: 0 },
];

// “דמו” בצורה מכובדת: הצלחה + זמן ממוצע לתרגיל
const weeklyPerformance = {
  addition: { accuracy: 92, avgSec: 18 },
  subtraction: { accuracy: 88, avgSec: 22 },
  multiplication: { accuracy: 81, avgSec: 28 },
  division: { accuracy: 74, avgSec: 34 },
  percent: { accuracy: 69, avgSec: 40 },
};

const subjectMeta = [
  { key: "addition", label: "חיבור", emoji: "➕" },
  { key: "subtraction", label: "חיסור", emoji: "➖" },
  { key: "multiplication", label: "כפל", emoji: "✖️" },
  { key: "division", label: "חילוק", emoji: "➗" },
  { key: "percent", label: "אחוזים", emoji: "％" },
];

function sum(arr, pick) {
  return arr.reduce((acc, x) => acc + (Number(x[pick]) || 0), 0);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function medalFromAccuracy(a) {
  if (a >= 90) return { emoji: "🥇", title: "מצוין" };
  if (a >= 80) return { emoji: "🥈", title: "טוב מאוד" };
  if (a >= 70) return { emoji: "🥉", title: "בכיוון נכון" };
  return { emoji: "🎯", title: "דורש חיזוק" };
}

function trendLabel(firstHalf, secondHalf) {
  if (secondHalf > firstHalf + 2) return { text: "מגמת עלייה", badge: "up" };
  if (secondHalf + 2 < firstHalf) return { text: "מגמת ירידה", badge: "down" };
  return { text: "יציב יחסית", badge: "flat" };
}

function badgeClass(kind) {
  if (kind === "up") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (kind === "down") return "bg-rose-100 text-rose-800 border-rose-200";
  return "bg-slate-100 text-slate-800 border-slate-200";
}

export default function ParentReport() {
  const [childName] = useState("מתי");
  const [rangeLabel] = useState("7 ימים אחרונים");

  const stats = useMemo(() => {
    const totals = {};
    for (const s of subjectMeta) totals[s.key] = sum(weekDataset, s.key);

    const totalAll = Object.values(totals).reduce((a, b) => a + b, 0);

    // מגמה לפי חצי ראשון/שני של השבוע (סה״כ תרגילים)
    const firstHalf = weekDataset.slice(0, 3).reduce((acc, d) => acc + d.addition + d.subtraction + d.multiplication + d.division + d.percent, 0) / 3;
    const secondHalf = weekDataset.slice(3).reduce((acc, d) => acc + d.addition + d.subtraction + d.multiplication + d.division + d.percent, 0) / 4;
    const trend = trendLabel(firstHalf, secondHalf);

    // יום שיא
    const dayTotals = weekDataset.map((d) => ({
      day: d.day,
      total: d.addition + d.subtraction + d.multiplication + d.division + d.percent,
    }));
    const bestDay = dayTotals.reduce((best, cur) => (cur.total > best.total ? cur : best), dayTotals[0]);

    // “מומלץ להתמקד”
    const focus = subjectMeta
      .map((s) => ({
        key: s.key,
        label: s.label,
        accuracy: weeklyPerformance[s.key]?.accuracy ?? 0,
        total: totals[s.key] ?? 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)[0];

    return { totals, totalAll, trend, bestDay, focus };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm text-slate-500">דוח הורה • {rangeLabel}</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                התקדמות שבועית — {childName} 😺
              </div>
              <div className="mt-2 text-slate-600">
                נתוני דמו להצגת מסך הורה (להדגמה של הפיצ’ר והחוויה).
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${badgeClass(stats.trend.badge)}`}>
                <span>📈</span>
                <span>{stats.trend.text}</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-800">
                🏆 יום שיא: <b>{stats.bestDay.day}</b> ({stats.bestDay.total} תרגילים)
              </span>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">סה״כ תרגילים בשבוע</div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">{stats.totalAll}</div>
            <div className="mt-2 text-slate-600">ממוצע יומי: {Math.round(stats.totalAll / 7)}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">נושא לתשומת לב</div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">
              {stats.focus.label} 🎯
            </div>
            <div className="mt-2 text-slate-600">
              הצלחה: <b>{stats.focus.accuracy}%</b> • תרגול שבועי: <b>{stats.totals[stats.focus.key]}</b>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">המלצה קצרה</div>
            <div className="mt-2 text-slate-800 leading-relaxed">
              מומלץ לשמור על <b>תרגול יומי קצר</b> ולהוסיף 5–10 תרגילים בנושאי{" "}
              <b>{stats.focus.label}</b>.
            </div>
          </div>
        </div>

        {/* Table: per-day */}
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-extrabold text-slate-900">כמה תרגילים נפתרו בכל יום</div>
              <div className="text-sm text-slate-500">פירוט לפי תחום — חיבור/חיסור/כפל/חילוק/אחוזים</div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-0">
              <thead>
                <tr className="text-right text-sm text-slate-600">
                  <th className="sticky left-0 bg-white p-3 border-b border-slate-200">יום</th>
                  <th className="p-3 border-b border-slate-200">חיבור</th>
                  <th className="p-3 border-b border-slate-200">חיסור</th>
                  <th className="p-3 border-b border-slate-200">כפל</th>
                  <th className="p-3 border-b border-slate-200">חילוק</th>
                  <th className="p-3 border-b border-slate-200">אחוזים</th>
                  <th className="p-3 border-b border-slate-200">סה״כ</th>
                </tr>
              </thead>
              <tbody>
                {weekDataset.map((d, idx) => {
                  const total = d.addition + d.subtraction + d.multiplication + d.division + d.percent;
                  return (
                    <tr key={d.day} className={idx % 2 ? "bg-slate-50/60" : ""}>
                      <td className="sticky left-0 bg-inherit p-3 font-bold text-slate-900 border-b border-slate-100">
                        {d.day}
                      </td>
                      <td className="p-3 border-b border-slate-100">{d.addition}</td>
                      <td className="p-3 border-b border-slate-100">{d.subtraction}</td>
                      <td className="p-3 border-b border-slate-100">{d.multiplication}</td>
                      <td className="p-3 border-b border-slate-100">{d.division}</td>
                      <td className="p-3 border-b border-slate-100">{d.percent}</td>
                      <td className="p-3 border-b border-slate-100 font-extrabold">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-white">
                  <td className="sticky left-0 bg-white p-3 font-extrabold text-slate-900 border-t border-slate-200">
                    סה״כ שבועי
                  </td>
                  <td className="p-3 font-extrabold border-t border-slate-200">{stats.totals.addition}</td>
                  <td className="p-3 font-extrabold border-t border-slate-200">{stats.totals.subtraction}</td>
                  <td className="p-3 font-extrabold border-t border-slate-200">{stats.totals.multiplication}</td>
                  <td className="p-3 font-extrabold border-t border-slate-200">{stats.totals.division}</td>
                  <td className="p-3 font-extrabold border-t border-slate-200">{stats.totals.percent}</td>
                  <td className="p-3 font-extrabold border-t border-slate-200">{stats.totalAll}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Per-subject cards */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-lg font-extrabold text-slate-900">סיכום לפי תחום</div>
            <div className="mt-3 grid gap-3">
              {subjectMeta.map((s) => {
                const total = stats.totals[s.key];
                const perf = weeklyPerformance[s.key];
                const medal = medalFromAccuracy(perf.accuracy);
                const bar = clamp(perf.accuracy, 0, 100);
                return (
                  <div key={s.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-extrabold text-slate-900">
                        {s.emoji} {s.label}
                      </div>
                      <div className="text-sm text-slate-700">
                        {medal.emoji} <b>{perf.accuracy}%</b> • {total} תרגילים
                      </div>
                    </div>

                    <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-slate-900"
                        style={{ width: `${bar}%` }}
                        aria-label={`${perf.accuracy}%`}
                      />
                    </div>

                    <div className="mt-2 text-sm text-slate-600">
                      זמן ממוצע לתרגיל: <b>{perf.avgSec}</b> שניות • סטטוס: <b>{medal.title}</b>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-lg font-extrabold text-slate-900">תובנות והמלצות להורה</div>

            <div className="mt-3 space-y-3 text-slate-700 leading-relaxed">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-bold text-slate-900">מה הולך טוב ✅</div>
                <ul className="mt-2 list-disc pr-5">
                  <li>תרגול עקבי לאורך השבוע.</li>
                  <li>חיבור וחיסור ברמת הצלחה גבוהה.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-bold text-slate-900">מה כדאי לחזק 🎯</div>
                <ul className="mt-2 list-disc pr-5">
                  <li>להוסיף תרגול קצר בכפל וחילוק.</li>
                  <li>באחוזים – להתחיל מתרגילים פשוטים והדרגתיים.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="font-bold text-slate-900">יעד לשבוע הבא ⭐</div>
                <div className="mt-2">
                  לשמור על ממוצע של <b>{Math.max(10, Math.round(stats.totalAll / 7))}</b> תרגילים ביום,
                  ולהוסיף <b>+5</b> תרגילים בנושאי <b>{stats.focus.label}</b>.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-4 text-center text-sm text-slate-500">
          * הנתונים מוצגים לצורך הדגמה של מסך הורה (Prototype) ויכולים להיות מחוברים בהמשך למסד הנתונים.
        </div>
      </div>
    </div>
  );
}
