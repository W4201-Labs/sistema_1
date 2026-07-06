import { auditCycle, controlEvaluations, controls } from "@/lib/m1-demo-data";

export default function CyclesPage() {
  return (
    <div className="stack">
      <section className="panel page-heading">
        <div>
          <p className="eyebrow">M3 cycles</p>
          <h1>Audit cycles</h1>
          <p className="muted">Default workflow, control evaluations, closure guard, and frozen close snapshot.</p>
        </div>
        <button className="primary-button">Open cycle</button>
      </section>

      <section className="grid two">
        <article className="panel cycle-card">
          <div className="page-heading">
            <div>
              <h2>{auditCycle.name}</h2>
              <p className="muted">{auditCycle.process}</p>
            </div>
            <span className="badge">{auditCycle.state}</span>
          </div>
          <div className="workflow-rail" aria-label="Workflow states">
            <span>open</span>
            <span>in_progress</span>
            <span>closed</span>
          </div>
          <div className={auditCycle.canClose ? "integrity-box locked" : "integrity-box"}>
            {auditCycle.canClose ? "Closure guard passing" : "Closure blocked"}
          </div>
          <p className="muted">{auditCycle.snapshot}</p>
        </article>

        <section className="panel">
          <h2>Closure guard</h2>
          <div className="table-list">
            {controls.filter((control) => control.blocksClosure).map((control) => (
              <div className="table-row" key={control.code}>
                <div>
                  <strong>{control.name}</strong>
                  <p className="muted">{control.code} · {control.criticality}</p>
                </div>
                <span className="badge">required to close</span>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="panel">
        <h2>Cycle evaluations</h2>
        <div className="table-list">
          {controlEvaluations.map((evaluation) => (
            <div className="table-row tall" key={evaluation.control}>
              <div>
                <strong>{evaluation.control}</strong>
                <p className="muted">{evaluation.reason}</p>
                <span className="meta-line">{evaluation.evidence}</span>
              </div>
              <span className="badge">{evaluation.frozen ? "frozen" : evaluation.result}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid two">
        <form className="panel form-panel">
          <h2>Evaluate control</h2>
          <label>
            Control
            <select defaultValue="CTRL-DOC-APP">
              {controls.map((control) => (
                <option key={control.code} value={control.code}>{control.code}</option>
              ))}
            </select>
          </label>
          <label>
            Evidence reference
            <input defaultValue="official PDF QMS-DOC-01 v2.0" />
          </label>
          <label>
            Status
            <select defaultValue="pass">
              <option value="pass">pass</option>
              <option value="warning">warning</option>
              <option value="blocker">blocker</option>
              <option value="not_applicable">not_applicable</option>
            </select>
          </label>
        </form>

        <section className="panel">
          <h2>Workflow invariants</h2>
          <div className="table-list">
            <div className="table-row">
              <strong>Close role</strong>
              <span className="badge">manager only</span>
            </div>
            <div className="table-row">
              <strong>Reopen</strong>
              <span className="badge">reason required</span>
            </div>
            <div className="table-row">
              <strong>Closed cycle</strong>
              <span className="badge">snapshot frozen</span>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
