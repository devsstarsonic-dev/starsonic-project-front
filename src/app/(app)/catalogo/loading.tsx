export default function Loading() {
  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="skel" style={{ width: 160, height: 18, marginBottom: 8 }} />
          <div className="skel" style={{ width: 260, height: 28, marginBottom: 8 }} />
          <div className="skel" style={{ width: 380, height: 14 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, marginTop: 20 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skel" style={{ width: 90, height: 32, borderRadius: 100 }} />
        ))}
      </div>
      <div className="skel" style={{ width: 180, height: 18, marginBottom: 14 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skel" style={{ height: 240, borderRadius: 12 }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skel" style={{ height: 68, borderRadius: 12 }} />
        ))}
      </div>
    </section>
  );
}
