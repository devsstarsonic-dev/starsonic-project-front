# RapidAPI — comportamento

Documento curto sobre como a RapidAPI é usada no Star Sonic: quando é chamada, o
que devolve, como falha e onde o dado é consumido.

## O que é

Uma única API via RapidAPI: **`spotify-extended-audio-features-api`**, usada para
puxar o "DNA numérico" real de uma faixa do Spotify (BPM, energia, humor, tom…).

- Implementação: [`src/lib/spotify/features.ts`](src/lib/spotify/features.ts)
- Helpers puros (client-safe): [`src/lib/compositor/spotify.ts`](src/lib/compositor/spotify.ts)
- Host: `spotify-extended-audio-features-api.p.rapidapi.com`
- Endpoints chamados:
  - `GET /v1/tracks/{trackId}` — **identifica** a faixa (título, artista, capa, ano)
  - `GET /v1/audio-features/{trackId}` — **descreve o som** (BPM, energia, tom…)
- Headers: `x-rapidapi-key`, `x-rapidapi-host`

No fluxo por **link** do Inspire-se, a RapidAPI é a **única** fonte: identifica a
música e alimenta o GPT, que monta título, style (com gênero) e a base da letra.
O MusicBrainz **não** participa desse fluxo.

## Configuração

`RAPIDAPI_KEY` no `.env` (ver `.env.example`). É **server-only** — nunca vai pro
browser. Toda chamada acontece dentro de `/api/inspire`.

## Quando é chamada

Só quando existe um **trackId do Spotify**. O id é extraído do texto pelo
`extractSpotifyTrackId()`, que aceita:

- `open.spotify.com/track/{id}`
- `open.spotify.com/intl-pt/track/{id}`
- `spotify:track:{id}`

O id é base62 de 22 caracteres. Consequência prática:

| Entrada | RapidAPI é usada? |
|---|---|
| Link de faixa do Spotify | ✅ sim |
| Link de álbum/playlist/artista do Spotify | ❌ não (não casa o regex de `track`) |
| Link do YouTube ou outro | ❌ não |
| Nome digitado no autocomplete | ❌ não |

Quando não há trackId, a análise degrada para GPT + MusicBrainz (título resolvido
via oEmbed) — sem métricas reais.

**Duas requisições por análise** (`/v1/tracks` + `/v1/audio-features`), disparadas
em paralelo com `Promise.all`.

## Cache

Dois `Map` em memória no processo do servidor (um por endpoint), indexados por
`trackId`, guardando **só sucessos**. A mesma faixa gasta cota **uma vez**;
repetições saem do cache. Não é persistido — reiniciar o servidor limpa.

## O que devolve

```ts
type SpotifyDNAResult =
  | { ok: true;  features: SpotifyAudioFeatures }
  | { ok: false; reason: "no-key" | "quota" | "unavailable" }

type SpotifyTrackResult =
  | { ok: true;  meta: SpotifyTrackMeta }
  | { ok: false; reason: "no-key" | "quota" | "unavailable" }
```

`SpotifyTrackMeta` (identificação): `title`, `artist`, `cover`, `year`,
`durationMs`, `popularity`. O parser é tolerante — aceita o objeto do Spotify
direto ou embrulhado em `track`/`data`, e artistas como array de objetos ou
strings.

`SpotifyAudioFeatures`:

| Campo | Faixa | Nota |
|---|---|---|
| `tempo` | BPM | |
| `energy`, `valence`, `danceability` | 0–1 | `valence` = humor (0 triste, 1 alegre) |
| `acousticness`, `instrumentalness` | 0–1 | |
| `liveness`, `speechiness` | 0–1 | |
| `loudness` | dB | negativo |
| `key` | 0–11 | `-1` se desconhecido |
| `mode` | 0/1 | 1 = maior, 0 = menor |
| `keyLabel` | texto | derivado: ex. `"Ré maior"` |
| `timeSignature` | número | |
| `durationMs` | ms | |

## Modos de falha

| `reason` | Quando |
|---|---|
| `no-key` | `RAPIDAPI_KEY` ausente **ou** `trackId` vazio |
| `quota` | HTTP **429** — cota diária do plano free estourou |
| `unavailable` | Erro de rede, timeout (**8s**) ou resposta sem `tempo` numérico |

Falha **nunca quebra a análise**: `/api/inspire` segue só com o GPT e devolve
`audio: null` + `audioError: <reason>`. A UI mostra o aviso correspondente
(mensagem específica para `quota`).

Robustez do parsing: campos não-finitos viram `0`; `key` cai para `-1` e `mode`
para `1` quando ausentes.

## Como o dado é consumido

Em [`src/app/api/inspire/route.ts`](src/app/api/inspire/route.ts), quando a
RapidAPI responde, o dado real **tem prioridade sobre o palpite do GPT**:

1. **Identificação** — `title`/`artist`/`year` do `/v1/tracks` viram a linha
   "Música IDENTIFICADA pela RapidAPI (use exatamente esta, não troque)". A
   resposta força `recognized: true` e devolve `cover` para a UI.
2. **Prompt** — o JSON cru (`{ track, audioFeatures }`) é injetado como a **única
   fonte de verdade**, seguido de uma leitura textual das métricas. É dele que o
   GPT deriva gênero (→ style da Suno), tema (→ base da letra), voz, tom,
   emoções, instrumentos e público.
3. **BPM** — `Math.round(tempo)` substitui o `bpm` estimado.
4. **Estrutura** — `structureFromDuration(durationMs)` substitui o palpite:
   `> 5 min` → `estendida`, `>= 3 min` → `completa`, senão `padrao`.
5. **Resposta** — `audio: features` e `audioError: null`.

Downstream:

- **Formulário** — `spotifyFeatures` é gravado no `formData` do compositor.
- **Style da Suno** — `buildMusicStyle()`
  ([`src/lib/compositor/lyricsPrompt.ts`](src/lib/compositor/lyricsPrompt.ts))
  converte as métricas em tags em inglês: `high/low energy`, `uplifting/
  melancholic mood`, `danceable`, `acoustic`/`electronic`, `in D major`.
- **UI do Inspire-se** — quando `audio` existe, o
  [`InspireBox`](src/components/Compositor/InspireBox.tsx) exibe **apenas** os
  dados da RapidAPI (stats + barras) e oculta o DNA estimado pela IA. Sem
  `audio`, mostra o DNA da IA + o aviso de indisponibilidade.

## Quem chama

- **Compositor › Inspire-se (link)** — `InspireBox` extrai o trackId do link
  colado e manda em `spotifyTrackId` para `/api/inspire`. **Só RapidAPI.**
- **Compositor › Inspire-se (nome digitado)** — o autocomplete continua no
  MusicBrainz (a RapidAPI é por `trackId`, não faz busca textual). A música
  escolhida vai como `mbTitle`/`mbArtist`.
- **Vocalista › Inspire-se** — `analyzeVoiceFromLink()`
  ([`src/lib/vocalista/inspireVoice.ts`](src/lib/vocalista/inspireVoice.ts)) usa o
  mesmo caminho para montar o DNA da voz de artista.

## Limitações conhecidas

- Plano free tem **cota diária baixa** — daí o cache e a regra de 1 request por
  análise.
- Só funciona com **link de faixa** do Spotify; qualquer outra entrada não gera
  métricas reais.
- O cache é por processo: em deploy serverless com várias instâncias, cada uma
  mantém o seu.
