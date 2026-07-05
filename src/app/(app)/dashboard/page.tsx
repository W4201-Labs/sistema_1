export default function DashboardPage() {
  return (
    <section className="panel">
      <p className="eyebrow">M2 active</p>
      <h1>Foundation dashboard</h1>
      <p className="muted">Tenant setup, standard-pack import, applicability, and controlled documents are represented end to end.</p>
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
        <div className="panel">
          <div className="muted">Documents</div>
          <div className="metric">controlled</div>
        </div>
      </div>
    </section>
  );
}
