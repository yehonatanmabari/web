import React from "react";
import { NavLink } from "react-router-dom";

export default function Tab({ to, emoji, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold",
          "transition active:scale-[0.98]",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 dark:focus-visible:ring-sky-900/40",
          isActive
            ? [
                "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200",
                "dark:bg-slate-950/40 dark:text-slate-100 dark:ring-slate-700",
              ].join(" ")
            : [
                "bg-white/60 text-slate-700 hover:bg-white hover:text-slate-900 ring-1 ring-slate-200/60",
                "dark:bg-slate-950/25 dark:text-slate-200 dark:hover:bg-slate-900/60 dark:hover:text-slate-50 dark:ring-slate-700/70",
              ].join(" "),
        ].join(" ")
      }
    >
      <span className="text-base">{emoji}</span>
      <span className="whitespace-nowrap">{children}</span>
    </NavLink>
  );
}
