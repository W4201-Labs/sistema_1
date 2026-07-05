import { documentLifecycle, documents } from "@/lib/m1-demo-data";

export default function DocumentsPage() {
  return (
    <div className="stack">
      <section className="panel page-heading">
        <div>
          <p className="eyebrow">M2 documents</p>
          <h1>Controlled documents</h1>
          <p className="muted">Candidate review, approval segregation, official PDF lock, and typed requirement links.</p>
        </div>
        <button className="primary-button">New document</button>
      </section>

      <section className="grid two">
        {documents.map((document) => (
          <article className="panel document-card" key={document.code}>
            <div className="page-heading">
              <div>
                <p className="eyebrow">{document.docType}</p>
                <h2>{document.name}</h2>
                <p className="muted">
                  {document.code} · {document.process}
                </p>
              </div>
              <span className="badge">{document.status}</span>
            </div>

            <div className="document-meta">
              <div>
                <span className="muted">Editable source</span>
                <strong>{document.externalEditableUrl}</strong>
              </div>
              <div>
                <span className="muted">Version</span>
                <strong>{document.currentVersion}</strong>
              </div>
              <div>
                <span className="muted">Owner</span>
                <strong>{document.owner}</strong>
              </div>
              <div>
                <span className="muted">Official file</span>
                <strong>{document.official}</strong>
              </div>
            </div>

            <div className="table-list">
              {document.links.map((link) => (
                <div className="table-row compact" key={`${document.code}-${link.requirement}-${link.type}`}>
                  <span>{link.requirement}</span>
                  <span className="badge">{link.type}</span>
                </div>
              ))}
            </div>

            <div className={document.immutable ? "integrity-box locked" : "integrity-box"}>
              {document.immutable ? "Effective version immutable" : "Editable until approval"}
            </div>
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>Lifecycle and audit trail</h2>
        <div className="lifecycle-grid">
          {documentLifecycle.map((item) => (
            <div className="lifecycle-step" key={item.step}>
              <strong>{item.step}</strong>
              <span className="muted">{item.actor}</span>
              <span className="meta-line">{item.audit}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid two">
        <form className="panel form-panel">
          <h2>Version workflow</h2>
          <label>
            Candidate upload
            <input defaultValue="candidate-file.pdf" />
          </label>
          <label>
            Reviewer decision
            <select defaultValue="approve">
              <option value="approve">approve</option>
              <option value="request_changes">request changes</option>
              <option value="reject">reject</option>
            </select>
          </label>
          <label>
            Official PDF
            <input defaultValue="controlled-official.pdf" />
          </label>
        </form>

        <section className="panel">
          <h2>Governance checks</h2>
          <div className="table-list">
            <div className="table-row">
              <strong>Preparer and approver</strong>
              <span className="badge">different users</span>
            </div>
            <div className="table-row">
              <strong>Effective official</strong>
              <span className="badge">immutable</span>
            </div>
            <div className="table-row">
              <strong>Requirement links</strong>
              <span className="badge">multi-standard</span>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
