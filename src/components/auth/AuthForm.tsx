"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 5L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AtIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
  </svg>
);

const Logo = () => (
  <svg className="auth-logo-svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="auth-logo-grad" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0" stopColor="#3be6ff" />
        <stop offset="0.5" stopColor="#00d4ff" />
        <stop offset="1" stopColor="#3b9eff" />
      </linearGradient>
    </defs>
    <path
      d="M24 3l5.3 11.4L42 16.2l-9 8.6 2.3 12.6L24 31.6l-11.3 5.8L15 24.8l-9-8.6 12.7-1.8L24 3z"
      fill="url(#auth-logo-grad)"
    />
  </svg>
);

// Traduz os erros mais comuns do Supabase para PT-BR.
function traduzErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já está cadastrado. Faça login.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("password should be at least"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "E-mail inválido.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Muitas tentativas. Aguarde um momento e tente de novo.";
  return msg;
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(traduzErro(error.message));
      return;
    }
    router.push("/compositor");
    router.refresh();
  }

  async function handleSignup() {
    const nick = username.trim().replace(/\s+/g, "_").toLowerCase();

    // Os dados extras vão em user_metadata; o trigger handle_new_user()
    // no banco cria a linha em public.profiles a partir deles.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          website: nick ? `starsonic.com.br/${nick}` : "",
        },
      },
    });
    if (error) {
      setError(traduzErro(error.message));
      return;
    }

    // Sem sessão = confirmação de e-mail está ligada no Supabase.
    // (O profile já foi criado pelo trigger; só falta confirmar o e-mail.)
    if (!data.session) {
      setSuccess(
        "Cadastro criado! Enviamos um link de confirmação para o seu e-mail.",
      );
      return;
    }

    router.push("/compositor");
    router.refresh();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (isSignup) await handleSignup();
      else await handleLogin();
    } catch (err) {
      setError(err instanceof Error ? traduzErro(err.message) : "Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-logo-row">
          <Logo />
          <div className="auth-brand">
            <span className="s1">STAR</span>
            <span className="s2">SONIC</span>
          </div>
          <div className="auth-tagline">MÚSICAS QUE CONECTAM</div>
        </div>

        <h1 className="auth-title">{isSignup ? "Criar conta" : "Entrar"}</h1>
        <p className="auth-sub">
          {isSignup
            ? "Comece a criar suas músicas com IA agora."
            : "Bom te ver de volta. Continue criando."}
        </p>

        {isSignup && (
          <>
            <div className="field-group">
              <label htmlFor="fullName">Nome completo</label>
              <div className="input-with-icon">
                <UserIcon />
                <input
                  id="fullName"
                  className="input-base"
                  type="text"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="username">Nome de usuário</label>
              <div className="input-with-icon">
                <AtIcon />
                <input
                  id="username"
                  className="input-base"
                  type="text"
                  placeholder="seu_nick"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              {username.trim() && (
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
                  starsonic.com.br/{username.trim().replace(/\s+/g, "_").toLowerCase()}
                </p>
              )}
            </div>
          </>
        )}

        <div className="field-group">
          <label htmlFor="email">E-mail</label>
          <div className="input-with-icon">
            <MailIcon />
            <input
              id="email"
              className="input-base"
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="password">Senha</label>
          <div className="input-with-icon">
            <LockIcon />
            <input
              id="password"
              className="input-base"
              type="password"
              placeholder={isSignup ? "Mínimo 6 caracteres" : "Sua senha"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </div>
        </div>

        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
        >
          {loading ? "Aguarde..." : isSignup ? "Criar conta" : "Entrar"}
        </button>

        {error && <div className="auth-msg error">{error}</div>}
        {success && <div className="auth-msg success">{success}</div>}

        <div className="auth-bottom">
          {isSignup ? (
            <>
              Já tem conta?{" "}
              <Link className="auth-link" href="/login">
                Entrar
              </Link>
            </>
          ) : (
            <>
              Ainda não tem conta?{" "}
              <Link className="auth-link" href="/cadastro">
                Criar conta
              </Link>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
