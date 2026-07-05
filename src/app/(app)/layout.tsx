import Link from "next/link";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

const nav = [
  ["Dashboard", "/dashboard"],
  ["Standards", "/standards"],
  ["Coverage", "/coverage"],
  ["Documents", "/documents"],
  ["Processes", "/processes"],
  ["Controls", "/controls"],
  ["Cycles", "/cycles"],
  ["Forms", "/forms"],
  ["Findings", "/findings"],
  ["Actions", "/actions"],
  ["Admin", "/admin"]
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Agnostic QMS</div>
        <nav className="nav">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <strong>Quality workspace</strong>
            <div className="muted">Tenant-scoped foundation</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {hasClerk ? (
              <>
                <OrganizationSwitcher hidePersonal />
                <UserButton />
              </>
            ) : (
              <span className="muted">Clerk env pending</span>
            )}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
