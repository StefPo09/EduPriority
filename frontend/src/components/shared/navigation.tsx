"use client";

import { NavLink } from "react-router";
import BrandLogo from "./BrandLogo";

const links = [
  { to: "/home", label: "Acasa", end: true },
  { to: "/dashboard", label: "Cereri" },
  { to: "/calendar", label: "Calendar" },
  { to: "/materials", label: "Materiale" },
  { to: "/schedule", label: "Orar" },
  { to: "/class", label: "Clasa" },
  { to: "/settings", label: "Setari" },
];

export default function Navigation() {
  return (
    <aside className="w-full shrink-0 border-b border-border bg-surface p-4 shadow-sm md:min-h-screen md:w-72 md:border-b-0 md:border-r md:p-6 md:shadow-none">
      <NavLink
        to="/"
        className="mb-3 block md:mb-8"
      >
        <BrandLogo width={260} height={65} />
      </NavLink>
      <nav
        className="flex gap-1.5 overflow-x-auto md:grid"
        aria-label="Navigație principală"
      >
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
      <NavLink
        to="/requests/new"
        className="mt-4 block rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-surface hover:brightness-90"
      >
        + Cerere noua
      </NavLink>
      <NavLink
        to="/export"
        className="mt-2 block px-3 py-2 text-center text-sm text-muted hover:text-primary"
      >
        Export CSV / Print
      </NavLink>
    </aside>
  );
}
