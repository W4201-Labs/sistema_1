import { controlEvaluations, controls } from "@/lib/m1-demo-data";

function RulePreview({ rule }: { rule: unknown }) {
  return <pre className="rule-preview">{JSON.stringify(rule, null, 2)}</pre>;
}

export default function ControlsPage() {
  return (
    <div className="stack">
      <section className="panel page-heading">
        <div>
          <p className="eyebrow">M3 controls</p>
          <h1>Controls</h1>
          <p className="muted">Data-first control definitions, editable rule JSON, and many-to-many requirement mapping.</p>
        </div>
        <button className="primary-button">New control</button>
      </section>

      <section className="grid two">
        {controls.map((control) => (
          <article className="panel control-card" key={control.code}>
            <div className="page-heading">
              <div>
                <p className="eyebrow">{control.phase}</p>
                <h2>{control.name}</h2>
                <p className="muted">
                  {control.code} · {control.process}
                </p>
              </div>
              <span className="badge">{control.complianceMode}</span>
            </div>

            <div className="control-flags">
              <span className="badge">{control.criticality}</span>
              <span className="badge">{control.blocksClosure ? "blocks closure" : "non-blocking"}</span>
              <span className="badge">{control.allowsNA ? "allows N/A" : "N/A disabled"}</span>
            </div>

            <RulePreview rule={control.rule} />

            <div className="table-list">
              {control.requirements.map((requirement) => (
                <div className="table-row compact" key={`${control.code}-${requirement}`}>
                  <span>{requirement}</span>
                  <span className="badge">controlRequirements</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="grid two">
        <form className="panel form-panel">
          <h2>Rule builder</h2>
          <label>
            Field
            <input defaultValue="documentStatus" />
          </label>
          <label>
            Operator
            <select defaultValue="eq">
              <option value="eq">eq</option>
              <option value="gte">gte</option>
              <option value="lte">lte</option>
              <option value="exists">exists</option>
              <option value="empty">empty</option>
            </select>
          </label>
          <label>
            Value
            <input defaultValue="effective" />
          </label>
        </form>

        <section className="panel">
          <h2>Latest evaluations</h2>
          <div className="table-list">
            {controlEvaluations.map((evaluation) => (
              <div className="table-row tall" key={evaluation.control}>
                <div>
                  <strong>{evaluation.control}</strong>
                  <p className="muted">{evaluation.reason}</p>
                  <span className="meta-line">{evaluation.evidence}</span>
                </div>
                <span className="badge">{evaluation.result}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
