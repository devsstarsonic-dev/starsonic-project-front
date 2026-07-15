"use client";

// Um canal da mesa: EQ (3 knobs c/ anel de progresso), reverb, pan, fader +
// VU real e mute/solo. Controlado — todo o estado vive no MixerStudio.
// Dimming automático quando outro canal está em solo (soloActive).

import { Knob, ControlSlider, VerticalFader } from "./MixerControls";
import { CHANNELS, panLabel, type ChannelId, type ChannelState, type EqBand } from "./mixerData";

const EQ_BANDS: EqBand[] = ["low", "mid", "high"];

export function ChannelStrip({
  id,
  index,
  state,
  soloActive,
  onChange,
}: {
  id: ChannelId;
  index: number;
  state: ChannelState;
  soloActive: boolean;
  onChange: (patch: Partial<ChannelState>) => void;
}) {
  const def = CHANNELS.find((c) => c.id === id)!;
  const audible = !state.mute && (!soloActive || state.solo);

  const setEq = (band: EqBand, v: number) => onChange({ eq: { ...state.eq, [band]: v } });

  return (
    <div className="mx-ch" style={{ opacity: audible ? 1 : 0.55, animationDelay: `${index * 70 + 100}ms` }}>
      <div className="mx-ch-head">
        <div
          className="mx-ch-ico"
          style={{
            background: `linear-gradient(145deg, ${def.color}, var(--purple))`,
            boxShadow: audible ? `0 4px 12px ${def.color}55` : `0 2px 8px ${def.color}25`,
          }}
        >
          <def.Icon width={17} height={17} color="#fff" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="mx-ch-name">{def.name}</div>
          <div className="mx-ch-sub">{def.sub}</div>
        </div>
      </div>

      {/* EQ 3 bandas */}
      <div className="mx-eq">
        {EQ_BANDS.map((band) => (
          <div className="mx-eq-band" key={band}>
            <Knob
              value={state.eq[band]}
              onChange={(v) => setEq(band, v)}
              ariaLabel={`${def.name} EQ ${band}`}
              accent={def.color}
            />
            <span className="mx-eq-lbl">{band.toUpperCase()}</span>
            <span className="mx-eq-val">{state.eq[band] > 0 ? `+${state.eq[band]}` : state.eq[band]}</span>
          </div>
        ))}
      </div>

      {/* Reverb */}
      <div className="mx-slider-row">
        <div className="mx-slider-head">
          <span className="mx-slider-lbl">REVERB</span>
          <span className="mx-slider-val">{state.reverb}%</span>
        </div>
        <ControlSlider value={state.reverb} min={0} max={100} accent={def.color} ariaLabel={`${def.name} reverb`} onChange={(v) => onChange({ reverb: Math.round(v) })} />
      </div>

      {/* Pan */}
      <div className="mx-slider-row">
        <div className="mx-slider-head">
          <span className="mx-slider-lbl">PAN</span>
          <span className="mx-slider-val">{panLabel(state.pan)}</span>
        </div>
        <ControlSlider value={state.pan} min={-50} max={50} accent={def.color} fromCenter ariaLabel={`${def.name} pan`} onChange={(v) => onChange({ pan: Math.round(v) })} />
      </div>

      {/* Fader + VU real */}
      <div className="mx-fader-zone">
        <VerticalFader value={state.volume} accent={def.color} active={audible} ariaLabel={`${def.name} volume`} onChange={(v) => onChange({ volume: Math.round(v) })} />
      </div>

      {/* Mute / Solo / valor */}
      <div className="mx-ch-foot">
        <div className="mx-ch-btns">
          <button
            type="button"
            className={`mx-chbtn${state.mute ? " mute-on" : ""}`}
            aria-pressed={state.mute}
            title="Mudo"
            onClick={() => onChange({ mute: !state.mute })}
          >
            M
          </button>
          <button
            type="button"
            className={`mx-chbtn${state.solo ? " solo-on" : ""}`}
            aria-pressed={state.solo}
            title="Solo"
            onClick={() => onChange({ solo: !state.solo })}
            style={state.solo ? { background: def.color, borderColor: def.color, boxShadow: `0 0 10px ${def.color}66` } : undefined}
          >
            S
          </button>
        </div>
        <span className="mx-ch-vol" style={{ color: def.color }}>{state.volume}</span>
      </div>
    </div>
  );
}
