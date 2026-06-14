export default function Loading() {
  return (
    <section className="page">
      <div style={{ marginBottom: 20 }}>
        <div className="skel" style={{ width: 220, height: 28, marginBottom: 8 }} />
        <div className="skel" style={{ width: 160, height: 14 }} />
      </div>
      <div className="skel" style={{ height: 340, borderRadius: 16, marginBottom: 28 }} />
      <div className="skel" style={{ width: 100, height: 14, marginBottom: 12 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skel" style={{ height: 110, borderRadius: 12 }} />
        ))}
      </div>
      <div className="skel" style={{ height: 260, borderRadius: 12 }} />
    </section>
  );
}
