export default function Loading() {
  return (
    <section className="page">
      <div style={{ marginBottom: 24 }}>
        <div className="skel" style={{ width: 200, height: 28, marginBottom: 8 }} />
        <div className="skel" style={{ width: 340, height: 14 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skel" style={{ height: 80, borderRadius: 12 }} />
        ))}
      </div>
    </section>
  );
}
