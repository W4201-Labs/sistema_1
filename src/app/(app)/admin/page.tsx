import { lines, processes, users } from "@/lib/m1-demo-data";

export default function AdminPage() {
  return (
    <div className="stack">
      <section className="panel page-heading">
        <div>
          <p className="eyebrow">M1 tenancy</p>
          <h1>Organization setup</h1>
          <p className="muted">Tenant profile, operating lines, process ownership, and user scoping.</p>
        </div>
        <button className="primary-button">Sync from Clerk</button>
      </section>

      <section className="grid two">
        <div className="panel">
          <h2>Lines</h2>
          <div className="table-list">
            {lines.map((line) => (
              <div className="table-row" key={line.id}>
                <div>
                  <strong>{line.name}</strong>
                  <div className="muted">Manager: {line.manager}</div>
                </div>
                <span className="badge">active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Users</h2>
          <div className="table-list">
            {users.map((user) => (
              <div className="table-row" key={user.name}>
                <div>
                  <strong>{user.name}</strong>
                  <div className="muted">{user.scope}</div>
                </div>
                <span className="badge">{user.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Process scope assignment</h2>
        <div className="table-list">
          {processes.map((process) => (
            <div className="table-row" key={process.id}>
              <div>
                <strong>{process.name}</strong>
                <div className="muted">
                  {process.owner} · {process.type}
                </div>
              </div>
              <span className="badge">{process.children.length} nodes</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
