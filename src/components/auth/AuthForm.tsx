"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { VideoBackground } from "@/components/VideoBackground";

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

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a17.7 17.7 0 0 1-3.15 4.02M6.1 6.1C3.5 7.9 1 12 1 12s4 7 11 7a10.8 10.8 0 0 0 5.15-1.28" />
    <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2" />
    <path d="M1 1l22 22" />
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
  const [showPassword, setShowPassword] = useState(false);
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

    // Cadastro passa pelo servidor (service role): cria a conta já com o
    // e-mail confirmado (sem etapa de "clique no link enviado") e grava a
    // linha em public.profiles direto, sem depender de sessão/RLS no cliente.
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName.trim(),
        website: nick ? `starsonic.com.br/${nick}` : "",
      }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(payload.error ?? "Não foi possível criar a conta.");
      return;
    }

    // E-mail já confirmado no passo anterior: loga na hora, sem link nenhum.
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setError(traduzErro(error?.message ?? "Conta criada. Faça login."));
      return;
    }

    // Reivindica a música que o usuário gerou como convidado (profile_id nulo).
    if (typeof window !== "undefined") {
      const guestCreationId = window.localStorage.getItem("starsonic:guestCreationId");
      if (guestCreationId) {
        await supabase
          .from("creations")
          .update({ profile_id: data.user.id })
          .eq("id", guestCreationId)
          .is("profile_id", null);
        window.localStorage.removeItem("starsonic:guestCreationId");
      }
      window.localStorage.removeItem("starsonic:guestCreditUsed");
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
      <VideoBackground src="/videos/video-login.mp4" overlayOpacity={0.6} />

      {/* Rodapé canto inferior direito (some no mobile — não cabe e é só prova social) */}
      <div className="auth-badge" style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        zIndex: 10,
        background: 'linear-gradient(135deg, rgba(10,14,35,0.85) 0%, rgba(0,200,255,0.08) 100%)',
        border: '1px solid rgba(0,200,255,0.25)',
        borderRadius: '16px',
        padding: '10px 16px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,200,255,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/demetrio.png"
          alt="Demétrio Mitre"
          style={{
            height: '56px',
            width: 'auto',
            objectFit: 'contain',
            imageRendering: 'auto',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
          }}
        />
        <div style={{ width: '1px', height: '38px', background: 'rgba(0,200,255,0.2)', margin: '0 12px' }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/starsonic-rodap%C3%A9.png"
          alt="Star Sonic"
          style={{
            height: '56px',
            width: 'auto',
            objectFit: 'contain',
            imageRendering: 'auto',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
          }}
        />
      </div>
      <form className="auth-card" onSubmit={onSubmit}>
        <div style={{ textAlign: 'center', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-login.png"
            alt="Star Sonic"
            style={{
              width: '300px',
              height: 'auto',
              objectFit: 'contain',
            }}
            loading="eager"
          />
        </div>

        <h1 style={{ marginBottom: '8px' }} className="auth-title">{isSignup ? "Criar conta" : "Entrar"}</h1>
        <p style={{ marginBottom: '16px' }} className="auth-sub">
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
              type={showPassword ? "text" : "password"}
              placeholder={isSignup ? "Mínimo 6 caracteres" : "Sua senha"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignup ? "new-password" : "current-password"}
              style={{ paddingRight: 38 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="input-eye-btn"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
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
