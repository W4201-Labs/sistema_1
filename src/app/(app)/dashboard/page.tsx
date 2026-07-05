export default function DashboardPage() {
  return (
    <section className="panel">
      <h1>Foundation dashboard</h1>
      <p className="muted">
        M0 is wired for Next.js, Clerk organization auth, Convex schema, Vitest, and Playwright.
      </p>
      <div className="grid">
        <div className="panel">
          <div className="muted">Tenant isolation</div>
          <div className="metric">orgId</div>
        </div>
        <div className="panel">
          <div className="muted">Schema tables</div>
          <div className="metric">generic</div>
        </div>
        <div className="panel">
          <div className="muted">Engine boundary</div>
          <div className="metric">empty</div>
        </div>
      </div>
    </section>
  );
}
