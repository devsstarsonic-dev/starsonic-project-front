# StarSonic Typography System

## Principle: Separation of Concerns

Each font serves a distinct purpose based on size and context:

- **UI & Interface** → `Inter` (neutral, readable, functional)
- **Editorial & Marketing** → `Sora` (personality, only 24px+)
- **Code & Technical Data** → `JetBrains Mono` (monospace, IDs, timestamps)

---

## Font Stack Definitions

### 1. Interface (Primary: Inter)
- **Primary body text** (labels, buttons, inputs, navigation)
- **Size**: 11px–18px
- **Weight**: 400 (regular), 500 (medium), 600 (bold)
- **Use case**: All functional UI components

```css
font-family: var(--font-ui); /* 'Inter', -apple-system, sans-serif */
```

**CSS classes for UI:**
- `.ui-label` — uppercase, small 12px labels with letter-spacing

### 2. Editorial Content (Secondary: Sora)
- **Hero section titles**
- **Landing page headings**
- **Marketing headlines**
- **Size**: 24px–48px (never below 24px)
- **Weight**: 600 (semi-bold), 700 (bold)
- **Use case**: Large, expressive typography only

```css
font-family: var(--font-editorial); /* 'Sora', sans-serif */
```

**CSS classes for editorial:**
- `.editorial-title` — 28px, 700 weight
- `.editorial-headline` — 24px, 600 weight

**Note:** Sora is personality-driven and should never appear in compact UI like buttons, tooltips, or data tables.

### 3. Display (Accent: Orbitron)
- **Page titles** (28px+)
- **Auth section titles** (20px+)
- **Section headings** with brand personality

```css
font-family: var(--font-display); /* 'Orbitron', sans-serif */
```

### 4. Technical Data (Mono: JetBrains Mono)
- **IDs, hashes, timestamps** in tables
- **Code snippets or logs**
- **Song IDs, version numbers**
- **Size**: 11px–14px

```css
font-family: var(--font-mono); /* 'JetBrains Mono', monospace */
```

**CSS classes for data:**
- `.data-mono` — 12px, monospace text

---

## When to Use Each Font

| Context | Font | Size | Example |
|---------|------|------|---------|
| Button label | Inter | 13px | "Compor Música" |
| Input placeholder | Inter | 13px | "Pesquise aqui..." |
| Navigation item | Inter | 13px | "Dashboard" |
| Breadcrumb | Inter | 12px | "Compositor / Step 1" |
| Badge | Inter | 10px–12px | "⚡ 75 créditos" |
| Page title | Orbitron | 28px | "Criar Música" |
| Hero headline | Sora | 28px–36px | "AI-Powered Music Creation" |
| Song ID | JetBrains Mono | 12px | `id: song-2024-001` |
| Timestamp | JetBrains Mono | 11px | `2024-06-13 14:32` |

---

## Implementation

### In CSS (Recommended)
```css
/* Use CSS custom properties */
.my-component {
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 500;
}

.my-hero-title {
  font-family: var(--font-editorial);
  font-size: 28px;
  font-weight: 700;
}

.my-data-cell {
  font-family: var(--font-mono);
  font-size: 12px;
}
```

### In React Components
```jsx
// UI Component (Inter)
<button style={{ fontFamily: 'var(--font-ui)', fontSize: '13px' }}>
  Compor
</button>

// Editorial (Sora) — only for large titles
<h1 style={{ fontFamily: 'var(--font-editorial)', fontSize: '28px' }}>
  Crie Sua Música
</h1>

// Data (Mono)
<span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
  {songId}
</span>
```

---

## Anti-Patterns (Avoid)

❌ **Never:**
- Use Sora for UI components smaller than 24px
- Mix multiple fonts in the same UI component without clear hierarchy
- Use Sora for functional elements like buttons, inputs, or labels
- Use Orbitron outside of page titles or display headings
- Mix JetBrains Mono with body text (only for data/IDs)

❌ **Bad Example:**
```css
/* DON'T DO THIS */
.button {
  font-family: 'Sora', sans-serif; /* ← Sora is for editorial, not UI */
  font-size: 13px;
}
```

✅ **Good Example:**
```css
/* DO THIS */
.button {
  font-family: var(--font-ui); /* Inter */
  font-size: 13px;
}

.hero-title {
  font-family: var(--font-editorial); /* Sora */
  font-size: 28px;
}
```

---

## Font Loading

All fonts are loaded via system fonts (fallback) or CDN:

- **Inter** → Google Fonts (default stack includes system sans-serif)
- **Sora** → Google Fonts (large titles only, lazy-load safe)
- **Orbitron** → Google Fonts (display font)
- **JetBrains Mono** → System monospace fallback or CDN

No performance penalty: fonts use `font-display: swap` (text displays immediately with fallback, swaps when loaded).

---

## Checklist for Designers/Developers

Before committing typography changes:

- [ ] UI components use `var(--font-ui)` (Inter)
- [ ] Large titles (24px+) can use `var(--font-editorial)` (Sora) or `var(--font-display)` (Orbitron)
- [ ] Technical data uses `var(--font-mono)` (JetBrains Mono)
- [ ] No Sora in buttons, inputs, labels, or nav items
- [ ] No font-family hardcoding — use CSS variables
- [ ] Line-height is 1.2–1.8 depending on size (tighter for large, looser for small)
- [ ] Tested in both light and dark modes

---

## Questions?

Refer to `src/app/globals.css` for the complete design token definitions.
