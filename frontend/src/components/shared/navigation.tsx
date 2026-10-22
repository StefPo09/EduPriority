"use client";

import { NavLink } from "react-router";

const links = [
  { to: "/", label: "+ Cerere nouă", end: true },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/export", label: "Export CSV / Print" },
];

export default function Navigation() {
  return (
    <aside className="w-full shrink-0 border-b border-border bg-surface px-5 py-[18px] md:w-[220px] md:border-b-0 md:border-r md:px-[21px] md:py-[27px]">
      <NavLink to="/" className="mb-3 block text-lg font-bold tracking-[-.02em] text-ink md:mb-[34px]">
        EduPriority
      </NavLink>
      <nav className="flex gap-1.5 overflow-x-auto md:grid" aria-label="Navigație principală">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm text-muted transition-colors hover:bg-primary-soft hover:font-semibold hover:text-primary ${isActive ? "bg-primary-soft font-semibold text-primary" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
