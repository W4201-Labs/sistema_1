import { applicabilityRows, requirementTree, standards } from "@/lib/m1-demo-data";

export default function StandardsPage() {
  return (
    <div className="stack">
      <section className="panel page-heading">
        <div>
          <p className="eyebrow">M1 standards</p>
          <h1>Standard packs</h1>
          <p className="muted">Generic import shape, nested requirements, equivalence-ready packs, and applicability.</p>
        </div>
        <button className="primary-button">Import pack</button>
      </section>

      <section className="grid two">
        <div className="panel">
          <h2>Imported packs</h2>
          <div className="table-list">
            {standards.map((standard) => (
              <div className="table-row" key={`${standard.name}-${standard.version}`}>
                <div>
                  <strong>{standard.name}</strong>
                  <div className="muted">Version {standard.version}</div>
                </div>
                <span className="badge">{standard.requirements} requirements</span>
              </div>
            ))}
          </div>
        </div>

        <form className="panel form-panel">
          <h2>Import shape</h2>
          <label>
            Pack name
            <input defaultValue="Quality Management System" />
          </label>
          <label>
            Version
            <input defaultValue="2015" />
          </label>
          <label>
            Requirements JSON
            <textarea defaultValue={'{"standard":{"name":"..."}, "requirements":[{"key":"r1","number":"7","title":"..."}]}'} />
          </label>
        </form>
      </section>

      <section className="panel">
        <h2>Requirement tree</h2>
        <div className="requirement-tree">
          {requirementTree.map((section) => (
            <div className="tree-section" key={section.number}>
              <div className="table-row">
                <div>
                  <strong>
                    {section.number} {section.title}
                  </strong>
                  <div className="muted">{section.rollup}</div>
                </div>
                <span className="badge">rollup</span>
              </div>
              <div className="tree-children">
                {section.children.map((child) => (
                  <div className="table-row" key={child.number}>
                    <div>
                      <strong>
                        {child.number} {child.title}
                      </strong>
                      <div className="muted">{child.process}</div>
                    </div>
                    <span className="badge">{child.decision}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Applicability decisions</h2>
        <div className="table-list">
          {applicabilityRows.map((row) => (
            <div className="table-row tall" key={`${row.requirement}-${row.scope}`}>
              <div>
                <strong>
                  {row.requirement} · {row.scope}
                </strong>
                <div className="muted">{row.justification}</div>
                <div className="meta-line">Approved by {row.approver} · Review {row.review}</div>
              </div>
              <span className="badge">{row.decision}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
