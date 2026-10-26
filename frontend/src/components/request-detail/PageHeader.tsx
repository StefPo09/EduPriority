import type { ComponentProps } from "react";
import { Link as RouterLink } from "react-router";

function Link({
  href,
  ...props
}: Omit<ComponentProps<typeof RouterLink>, "to"> & { href: string }) {
  return <RouterLink to={href} {...props} />;
}

export default function PageHeader() {
  return (
    <>
      <Link
        className="mb-6 inline-block text-sm text-primary"
        href="/frontend/src/components/dashboard"
      >
        ← Înapoi la dashboard
      </Link>
      <header className="mb-7">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Test vineri: inecuații cu modul
        </h1>
        <p className="leading-6 text-muted">
          Maria Ionescu, 10B · Întrebare · Deadline: azi
        </p>
      </header>
    </>
  );
}
