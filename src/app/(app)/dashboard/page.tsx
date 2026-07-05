export default function DashboardPage() {
  return (
    <section className="panel">
      <p className="eyebrow">M1 active</p>
      <h1>Foundation dashboard</h1>
      <p className="muted">Tenant setup and standard-pack import are now represented end to end.</p>
      <div className="grid">
        <div className="panel">
          <div className="muted">Tenant objects</div>
          <div className="metric">scoped</div>
        </div>
        <div className="panel">
          <div className="muted">Standard packs</div>
          <div className="metric">2</div>
        </div>
        <div className="panel">
          <div className="muted">Applicability</div>
          <div className="metric">audited</div>
        </div>
      </div>
    </section>
  );
}
