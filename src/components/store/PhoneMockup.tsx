export function PhoneMockup({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: 300,
        margin: "0 auto",
        background: "#0a0a1e",
        border: "3px solid #1e293b",
        borderRadius: 30,
        padding: 8,
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          borderRadius: 22,
          overflow: "hidden",
          height: 500,
          background: "var(--bg-base)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
