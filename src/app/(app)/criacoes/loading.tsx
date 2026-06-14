export default function Loading() {
  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="skel" style={{ width: 160, height: 18, marginBottom: 8 }} />
          <div className="skel" style={{ width: 240, height: 28, marginBottom: 8 }} />
          <div className="skel" style={{ width: 340, height: 14 }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24, marginTop: 20 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="skel" style={{ height: 80, borderRadius: 12 }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skel" style={{ height: 72, borderRadius: 12 }} />
        ))}
      </div>
    </section>
  );
}
