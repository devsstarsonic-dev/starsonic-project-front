"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

    if (!data.session || !data.user) {
      setSuccess(
        "Cadastro criado! Enviamos um link de confirmação para o seu e-mail.",
      );
      return;
    }

    await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        full_name: fullName.trim(),
        email,
        plan: "Free",
        credits: 50,
        avatar_initial: (fullName.trim().charAt(0) || "A").toUpperCase(),
        bio: "",
        location: "",
        website: nick ? `starsonic.com.br/${nick}` : "",
      },
      { onConflict: "id", ignoreDuplicates: true },
    );

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

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
  );

  const GithubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
  );

  const DiscordIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
  );

  const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );

  return (
    <div className="auth-shell">
      {/* Coluna esquerda — imagem da mulher */}
      <div className="auth-left">
        <div className="auth-left-orb" />
        <Image
          src="/images/mulher com headset.png"
          alt="Mulher com headset"
          fill
          sizes="57vw"
          style={{ objectFit: "cover", objectPosition: "center top", filter: "brightness(1.18) saturate(1.3) contrast(1.05)" }}
          priority
        />
        {/* anel luminoso */}
        <div style={{
          position: "absolute", left: "50%", top: "44%",
          transform: "translate(-50%, -50%)",
          width: "68%", paddingBottom: "68%",
          borderRadius: "50%",
          border: "2.5px solid rgba(140,60,240,0.65)",
          boxShadow: "0 0 60px 12px rgba(120,40,200,0.35)",
          zIndex: 2, pointerEvents: "none"
        }} />
        <div className="auth-left-overlay" />
      </div>

      {/* Coluna direita — card de login */}
      <div className="auth-right">
        <form className="auth-card" onSubmit={onSubmit}>
          <div className="auth-logo-row">
            <Image
              src="/images/logo-starsonic.png"
              alt="Star Sonic"
              width={200}
              height={80}
              style={{ objectFit: "contain", maxWidth: "100%" }}
            />
          </div>

          <h1 className="auth-title">{isSignup ? "Criar conta" : "Bem-vindo de volta"}</h1>
          <p className="auth-sub">
            {isSignup
              ? "Comece a criar suas músicas com IA agora."
              : "Faça login para continuar criando experiências incríveis."}
          </p>

          {isSignup && (
            <>
              <div className="field-group">
                <label htmlFor="fullName">Nome completo</label>
                <div className="input-with-icon">
                  <UserIcon />
                  <input id="fullName" className="input-base" type="text" placeholder="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="username">Nome de usuário</label>
                <div className="input-with-icon">
                  <AtIcon />
                  <input id="username" className="input-base" type="text" placeholder="seu_nick" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
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
              <input id="email" className="input-base" type="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="password">Senha</label>
            <div className="input-with-icon">
              <LockIcon />
              <input id="password" className="input-base" type="password" placeholder={isSignup ? "Mínimo 6 caracteres" : "Sua senha"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={isSignup ? "new-password" : "current-password"} />
              <button type="button" className="input-eye-btn" tabIndex={-1} aria-label="Mostrar senha"><EyeIcon /></button>
            </div>
          </div>

          {!isSignup && (
            <div className="auth-remember-row">
              <label className="auth-remember-label">
                <input type="checkbox" style={{ accentColor: "var(--cyan-1)" }} />
                Lembrar de mim
              </label>
              <Link className="auth-link" href="/recuperar-senha">Esqueci minha senha</Link>
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>
            {loading ? "Aguarde..." : isSignup ? "Criar conta" : "Entrar"}
          </button>

          {error && <div className="auth-msg error">{error}</div>}
          {success && <div className="auth-msg success">{success}</div>}

          <div className="auth-divider-or"><span>ou continue com</span></div>

          <div className="auth-social-row">
            <button type="button" className="auth-social-btn"><GoogleIcon /></button>
            <button type="button" className="auth-social-btn"><GithubIcon /></button>
            <button type="button" className="auth-social-btn"><DiscordIcon /></button>
          </div>

          <div className="auth-bottom">
            {isSignup ? (
              <>Já tem conta?{" "}<Link className="auth-link" href="/login">Entrar</Link></>
            ) : (
              <>Ainda não tem conta?{" "}<Link className="auth-link" href="/cadastro">Criar conta</Link></>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
