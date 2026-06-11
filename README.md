# Star Sonic - Frontend

Plataforma de criação de músicas com IA. Interface moderna para composição musical assistida com múltiplos modos de criação.

## 🎵 Features

- **Compositor Inteligente**: Ferramenta wizard para criação de músicas com múltiplos passos
- **3 Modos de Criação**:
  - 🚀 **Quick**: Criação rápida com tema e gênero
  - 📝 **Detailed**: Composição com múltiplos passos e customizações
  - ✋ **Manual**: Upload de letra e customização manual
- **Revisão de Composição**: Pré-visualização e edição antes de gerar
- **Múltiplos Formatos**: Suporte a diferentes gêneros e idiomas
- **Pré-visualizações**: Música e vídeo em tempo real

## 🚀 Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Linguagem**: TypeScript
- **Styling**: CSS-in-JS (inline styles)
- **State**: React Hooks (Custom Hook: `useComposition`)
- **Routing**: Next.js App Router
- **Database**: Supabase (tipos definidos em `types.ts`)

## 📁 Estrutura do Projeto

```
src/
├── app/(app)/
│   └── compositor/
│       ├── page.tsx              # Etapa 1: Identidade
│       ├── step-2/page.tsx       # Etapa 2: Voz e Estilo
│       ├── step-3/page.tsx       # Etapa 3: Conteúdo
│       ├── revisar/page.tsx      # Revisão antes de gerar
│       ├── loading-lyrics/       # Loading lyrics
│       ├── loading-music/        # Loading music
│       ├── resultado/page.tsx    # Resultado final
│       ├── quick/page.tsx        # Quick mode
│       ├── manual/page.tsx       # Manual mode
│       └── layout.tsx
├── components/Compositor/        # Componentes reutilizáveis
│   ├── WizardStepper.tsx        # Indicador de progresso
│   ├── FormSection.tsx          # Seção de formulário
│   ├── QuestionField.tsx        # Campo de entrada
│   ├── PillSelector.tsx         # Selector de pills/tags
│   ├── GenreSelector.tsx        # Selector de gêneros
│   ├── ReviewPanel.tsx          # Painel de revisão
│   ├── VersionCard.tsx          # Card de versão
│   ├── AudioPlayer.tsx          # Player de áudio
│   ├── AudioVisualizer.tsx      # Visualizador de áudio
│   ├── LoadingLyrics.tsx        # Loading state (lyrics)
│   ├── LoadingMusic.tsx         # Loading state (music)
│   └── FeaturesGrid.tsx         # Grid de features
├── lib/
│   ├── types.ts                 # Tipos TypeScript
│   ├── hooks/
│   │   └── useComposition.ts    # Hook principal do wizard
│   ├── data/
│   │   ├── genres.ts
│   │   ├── emotions.ts
│   │   ├── instruments.ts
│   │   ├── languages.ts
│   │   ├── voice.ts             # Voice styles e tones
│   │   └── structures.ts        # Song structures
│   └── mocks/
│       └── composition.ts       # Mock data para desenvolvimento
```

## 🎯 Componentes Principais

### WizardStepper
Indicador visual de progresso do wizard com step counter.

### ReviewPanel
Painel de revisão com:
- Edição de letra (textarea editável)
- Suas escolhas (formulário resumido)
- Custo total de créditos
- Pré-visualizações de música e vídeo

### useComposition Hook
Gerencia todo o estado do wizard:
- Modo selecionado (quick/detailed/manual)
- Step atual
- Form data
- Resultado da composição
- Loading state

**Funções**:
- `setMode()`: Define modo de criação
- `updateFormData()`: Atualiza dados do formulário
- `nextStep()`: Próximo passo
- `prevStep()`: Passo anterior
- `startComposition()`: Inicia composição
- `reset()`: Reseta wizard

## 🔄 Fluxo do Wizard

### Modo Detailed (Principal)
```
page.tsx (Etapa 1)
  ↓ Nome, Gênero, Tema
step-2/page.tsx (Etapa 2)
  ↓ Voz, Estilo Vocal
step-3/page.tsx (Etapa 3)
  ↓ Estrutura, Instrumentos, Idioma
revisar/page.tsx
  ↓ Editar letra, visualizar custos
loading-lyrics/page.tsx
  ↓ Aguardando geração da letra
loading-music/page.tsx
  ↓ Aguardando composição
resultado/page.tsx
  ↓ Múltiplas versões, download
```

### Modo Quick
Fluxo simplificado (tema + gênero → resultado)

### Modo Manual
Upload de letra + customizações → resultado

## 💾 Tipos Principais

```typescript
// Dados do formulário por modo
DetailedFormData   // Todos os campos detailed
QuickFormData      // Theme, genre, emotions
ManualFormData     // Title, lyrics, stylePrompt

// Resultado da composição
CompositionResult  // id, title, lyrics, versions, status
CompositionVersion // Versão individual da música

// Estado do wizard
WizardState        // mode, step, formData, result, loading
```

## 🎨 Design System

**Cores**: Variáveis CSS customizadas
- `--bg-deep`: Background principal
- `--bg-card`: Cards
- `--cyan-1`: Destaque cyan
- `--text-1`, `--text-2`, `--text-3`: Diferentes níveis de texto

**Typography**:
- `Orbitron`: Headlines
- `Sora`: UI text
- `JetBrains Mono`: Dados e labels
- `Caveat`: Lyrics display

## 🔧 Desenvolvimento

### Instalação
```bash
npm install
```

### Dev Server
```bash
npm run dev
```
Acesso em `http://localhost:3002`

### Build
```bash
npm run build
```

## 📝 Data Files

Dados centralizados em `/lib/data/`:
- `genres.ts`: Gêneros e descrições
- `emotions.ts`: Emoções predefinidas
- `instruments.ts`: Instrumentos musicais
- `languages.ts`: Idiomas suportados
- `voice.ts`: Estilos e tons de voz
- `structures.ts`: Estruturas de músicas

## 🚦 Status

- ✅ UI/UX completo
- ✅ Formários com validação
- ✅ Review panel editável
- ✅ Mock data para testes
- ⏳ Integração com API (em progresso)
- ⏳ Autenticação (em progresso)

## 📚 Próximos Passos

1. Integrar API de composição
2. Sistema de autenticação
3. Persistência de dados
4. Download de áudio
5. Compartilhamento de músicas

## 📄 Licença

Propriedade intelectual - Star Sonic 2025
