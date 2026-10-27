import type { ComponentProps } from "react";
import { Link as RouterLink } from "react-router";
import { useParams } from "react-router";
import { getRequest } from "@/lib/requests";
import { useEffect, useState } from "react";

function Link({
  href,
  ...props
}: Omit<ComponentProps<typeof RouterLink>, "to"> & { href: string }) {
  return <RouterLink to={href} {...props} />;
}

export default function PageHeader() {
  const { id } = useParams();
  const [request, setRequest] = useState<Awaited<ReturnType<typeof getRequest>>>();
  useEffect(() => {
    if (id) void getRequest(id).then(setRequest);
  }, [id]);

  return (
    <>
      <Link
        className="mb-6 inline-block text-sm text-primary"
        href="/dashboard"
      >
        ← Înapoi la dashboard
      </Link>
      <header className="mb-7">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          {request?.text ?? "Cerere"}
        </h1>
        <p className="leading-6 text-muted">
          {request
            ? `${request.student} · ${request.type} · Deadline: ${request.deadline}`
            : "Cererea nu a fost găsită"}
        </p>
      </header>
    </>
  );
}
