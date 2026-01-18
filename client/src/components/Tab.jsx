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
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200",
          isActive
            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
            : "bg-white/60 text-slate-700 hover:bg-white hover:text-slate-900 ring-1 ring-slate-200/60",
        ].join(" ")
      }
    >
      <span className="text-base">{emoji}</span>
      <span className="whitespace-nowrap">{children}</span>
    </NavLink>
  );
}
