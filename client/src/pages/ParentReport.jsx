import React, { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

// 0=Sunday ... 6=Saturday (same convention as we used on server)
const HEB_DAYS = ["יום א׳", "יום ב׳", "יום ג׳", "יום ד׳", "יום ה׳", "יום ו׳", "שבת"];

const subjectMeta = [
  { key: "addition", label: "חיבור", emoji: "➕" },
  { key: "subtraction", label: "חיסור", emoji: "➖" },
  { key: "multiplication", label: "כפל", emoji: "✖️" },
  { key: "division", label: "חילוק", emoji: "➗" },
  { key: "percent", label: "אחוזים", emoji: "％" },
];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function sumNumbers(arr) {
  if (!Array.isArray(arr)) return 0;
  return arr.reduce((acc, x) => acc + (Number.isFinite(Number(x)) ? Number(x) : 0), 0);
}

function dailyTotal(d) {
  return d.addition + d.subtraction + d.multiplication + d.division + d.percent;
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

function pickBestDay(dataset) {
  const dayTotals = dataset.map((d) => ({
    day: d.day,
    total: dailyTotal(d),
  }));
  return dayTotals.reduce((best, cur) => (cur.total > best.total ? cur : best), dayTotals[0]);
}

/**
 * Build weekDataset from DB arrays.
 * Ensures length=7 and converts everything to safe numbers.
 */
function buildWeekDataset(user) {
  const safeArr = (a) => {
    if (!Array.isArray(a) || a.length !== 7) return Array(7).fill(0);
    return a.map((x) => (Number.isFinite(Number(x)) ? Number(x) : 0));
  };

  const addition = safeArr(user?.addition);
  const subtraction = safeArr(user?.subtraction);
  const multiplication = safeArr(user?.multiplication);
  const division = safeArr(user?.division);
  const percent = safeArr(user?.percent);

  return Array.from({ length: 7 }, (_, i) => ({
    day: HEB_DAYS[i],
    addition: addition[i],
    subtraction: subtraction[i],
    multiplication: multiplication[i],
    division: division[i],
    percent: percent[i],
  }));
}

export default function ParentReport() {
  // Take from localStorage (change to your real auth store if needed)
  const username = useMemo(() => localStorage.getItem("username") || "", []);

  const [childName, setChildName] = useState("הילד/ה"); // optional: you can replace with real user name
  const [rangeLabel] = useState("7 ימים אחרונים");

  const [weekDataset, setWeekDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        if (!username) {
          throw new Error("NO_USERNAME_IN_LOCALSTORAGE");
        }

        const res = await fetch(`${API_BASE}/user/stats-week`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || `HTTP_${res.status}`);
        }

        const user = data.user || {};
        const dataset = buildWeekDataset(user);

        if (!alive) return;

        setWeekDataset(dataset);

        // optional: show actual username as childName
        setChildName(user.username || "הילד/ה");
      } catch (e) {
        if (!alive) return;
        setErr(String(e?.message || e));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
//fix
    load();
    return () => {
      alive = false;
    };
  }, [username]);

  const stats = useMemo(() => {
    if (!weekDataset) return null;

    const totals = {};
    for (const s of subjectMeta) {
      totals[s.key] = sumNumbers(weekDataset.map((d) => d[s.key]));
    }

    const totalAll = Object.values(totals).reduce((a, b) => a + b, 0);

    const firstHalf = weekDataset.slice(0, 3).reduce((acc, d) => acc + dailyTotal(d), 0) / 3;
    const secondHalf = weekDataset.slice(3).reduce((acc, d) => acc + dailyTotal(d), 0) / 4;

    const trend = trendLabel(firstHalf, secondHalf);
    const bestDay = pickBestDay(weekDataset);

    // "Focus" now means: the subject with the LOWEST weekly practice (real data)
    const focus = subjectMeta
      .map((s) => ({ key: s.key, label: s.label, total: totals[s.key] ?? 0 }))
      .sort((a, b) => a.total - b.total)[0];

    // "Strongest" means: the subject with the HIGHEST weekly practice (real data)
    const strongest = subjectMeta
      .map((s) => ({ key: s.key, label: s.label, total: totals[s.key] ?? 0 }))
      .sort((a, b) => b.total - a.total)[0];

    // Progress bar can be based on “weekly goal”
    const weeklyGoal = 15 * 7; // example goal: 15 exercises per day across all subjects
    const goalPct = weeklyGoal ? clamp((totalAll / weeklyGoal) * 100, 0, 100) : 0;

    return { totals, totalAll, trend, bestDay, focus, strongest, weeklyGoal, goalPct };
  }, [weekDataset]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-extrabold text-slate-900">טוען נתונים…</div>
          <div className="mt-2 text-slate-600">מביא נתוני שבוע מהשרת.</div>
        </div>
      </div>
    );
  }

  if (err || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="mx-auto max-w-5xl rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-extrabold text-rose-700">שגיאה בטעינת הדוח</div>
          <div className="mt-2 text-slate-700">
            {err || "UNKNOWN_ERROR"}
          </div>
          <div className="mt-3 text-sm text-slate-600">
            בדוק שהשרת רץ ושיש endpoint <b>/user/stats-week</b>, וש־username קיים ב־localStorage.
          </div>
        </div>
      </div>
    );
  }

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
              <div className="mt-2 text-slate-600">הדוח מבוסס על נתוני שבוע אמיתיים מהשרת.</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${badgeClass(
                  stats.trend.badge
                )}`}
              >
                <span>📈</span>
                <span>{stats.trend.text}</span>
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-800">
                🏆 יום שיא: <b>{stats.bestDay.day}</b> ({stats.bestDay.total} תרגילים)
              </span>
            </div>
          </div>

          {/* Weekly goal progress (real, based on totalAll) */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>התקדמות ליעד שבועי (סה״כ):</span>
              <span>
                <b>{stats.totalAll}</b> / {stats.weeklyGoal}
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-slate-900" style={{ width: `${stats.goalPct}%` }} />
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
            <div className="mt-2 text-xl font-extrabold text-slate-900">{stats.focus.label} 🎯</div>
            <div className="mt-2 text-slate-600">
              תרגול שבועי: <b>{stats.totals[stats.focus.key]}</b> (הכי נמוך השבוע)
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">המלצה לשבוע הבא</div>
            <div className="mt-2 text-slate-800 leading-relaxed">
              להוסיף תרגול קצר יומי בנושא <b>{stats.focus.label}</b> ולהביא אותו לרמה דומה לשאר התחומים.
            </div>
          </div>
        </div>

        {/* Table: per-day */}
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <div className="text-lg font-extrabold text-slate-900">תרגול יומי לפי תחום</div>
            <div className="text-sm text-slate-500">מבוסס על מערכי השבוע מה־DB</div>
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
                  const total = dailyTotal(d);
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

        {/* Per-subject summary (REAL: totals only) */}
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-lg font-extrabold text-slate-900">סיכום לפי תחום (אמיתי)</div>
          <div className="mt-3 grid gap-3">
            {subjectMeta.map((s) => {
              const total = stats.totals[s.key] ?? 0;
              const pct = stats.totalAll ? clamp((total / stats.totalAll) * 100, 0, 100) : 0;

              return (
                <div key={s.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-extrabold text-slate-900">
                      {s.emoji} {s.label}
                    </div>
                    <div className="text-sm text-slate-700">
                      <b>{total}</b> תרגילים • {pct.toFixed(0)}%
                    </div>
                  </div>

                  <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
                  </div>

                  <div className="mt-2 text-sm text-slate-600">
                    חלק יחסי מסך התרגול השבועי בתחום הזה.
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
