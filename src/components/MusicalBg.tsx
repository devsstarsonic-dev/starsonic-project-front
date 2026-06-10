export default function MusicalBg() {
  return (
    <div className="musical-bg" aria-hidden="true">
      <svg
        className="musical-bg-waves"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <path
          d="M 0,400 Q 360,360 720,400 T 1440,400"
          stroke="rgba(0,212,255,0.3)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M 0,460 Q 360,500 720,460 T 1440,460"
          stroke="rgba(59,158,255,0.25)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      <span className="float-note fn1">♪</span>
      <span className="float-note fn2">♫</span>
      <span className="float-note fn3">♬</span>
      <span className="float-note fn4">♪</span>
      <span className="float-note fn5">♫</span>
      <span className="float-note fn6">♬</span>
      <span className="particle p1" />
      <span className="particle p2" />
      <span className="particle p3" />
      <span className="particle p4" />
      <span className="particle p5" />
      <span className="particle p6" />
    </div>
  );
}
