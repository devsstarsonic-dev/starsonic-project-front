export default function Loading() {
  return (
    <section className="page">
      <div style={{ marginBottom: 24 }}>
        <div className="skel" style={{ width: 180, height: 28, marginBottom: 8 }} />
        <div className="skel" style={{ width: 300, height: 14 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skel" style={{ height: 400, borderRadius: 16 }} />
        ))}
      </div>
    </section>
  );
}
