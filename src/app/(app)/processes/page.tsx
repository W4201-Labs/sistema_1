import { lines, processes } from "@/lib/m1-demo-data";

const typeLabel = {
  strategic: "Strategic",
  core: "Core",
  support: "Support",
  evaluation: "Evaluation"
};

export default function ProcessesPage() {
  return (
    <div className="stack">
      <section className="panel page-heading">
        <div>
          <p className="eyebrow">M1 process map</p>
          <h1>Processes</h1>
          <p className="muted">Hierarchy by line, type, owner, and user-visible scope.</p>
        </div>
      </section>

      <section className="process-board">
        {Object.entries(typeLabel).map(([type, label]) => (
          <div className="panel process-column" key={type}>
            <h2>{label}</h2>
            {processes
              .filter((process) => process.type === type)
              .map((process) => (
                <article className="process-card" key={process.id}>
                  <div className="table-row compact">
                    <strong>{process.name}</strong>
                    <span className="badge">{lines.find((line) => line.id === process.lineId)?.name}</span>
                  </div>
                  <p className="muted">Owner: {process.owner}</p>
                  <ul className="node-list">
                    {process.children.map((child) => (
                      <li key={child}>{child}</li>
                    ))}
                  </ul>
                </article>
              ))}
          </div>
        ))}
      </section>
    </div>
  );
}
