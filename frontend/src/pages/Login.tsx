import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import { Input } from '../components/ui/input';
import Button from '../components/common/Button';
import { EyeIcon, EyeOffIcon, X } from 'lucide-react';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // ── Loading screen ──────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 relative overflow-hidden selection:bg-primary/20 selection:text-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-amber-950/10" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-500/[0.04] rounded-full blur-[180px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/[0.05] rounded-full blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <img
          src="/logo-bombonera.png"
          alt="La Bombonera"
          className="h-36 w-auto object-contain drop-shadow-[0_20px_60px_rgba(245,158,11,0.18)] animate-[gentle-pulse_2s_ease-in-out_infinite] select-none"
          draggable={false}
        />
        <div className="text-center space-y-2">
          <p className="text-white/30 text-base font-medium tracking-wide">Verificando sesión</p>
          <div className="flex items-center justify-center gap-1.5">
            <span className="size-1.5 rounded-full bg-amber-500/40 animate-bounce [animation-delay:0ms]" />
            <span className="size-1.5 rounded-full bg-amber-500/40 animate-bounce [animation-delay:150ms]" />
            <span className="size-1.5 rounded-full bg-amber-500/40 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(credentials.username, credentials.password);
      if (result.success && result.user) {
        navigate(ROUTES.WAITER_ORDERS);
      } else {
        setError(result.error || 'Usuario o contraseña incorrectos');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════
  //  LOGIN SCREEN — SPLIT LAYOUT: HERO LEFT + FORM RIGHT
  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* ── Shared background (spans both sides) ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-amber-950/10" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-500/[0.04] rounded-full blur-[180px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/[0.05] rounded-full blur-[160px]" />
      <div className="absolute top-[35%] left-[45%] w-[30%] h-[30%] bg-secondary/[0.03] rounded-full blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ══════════════════════════════════════════════════════════
          LEFT — Full-height brand hero (hidden on mobile)
          ══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        {/* Warm ambient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-amber-950/8 to-background" />
        <div className="absolute top-[8%] right-[10%] w-[75%] h-[75%] bg-amber-500/[0.06] rounded-full blur-[220px]" />
        <div className="absolute bottom-[15%] left-[5%] w-[55%] h-[55%] bg-amber-600/[0.03] rounded-full blur-[160px]" />

        {/* Decorative watermark */}
        <span
          className="absolute text-[clamp(8rem,16vw,16rem)] font-black text-white/[0.012] tracking-[-0.06em] leading-none pointer-events-none select-none"
          aria-hidden
        >
          LB
        </span>

        {/* Decorative horizontal accents */}
        <div className="absolute top-[12%] left-[12%] w-40 h-px bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" />
        <div className="absolute bottom-[12%] right-[12%] w-40 h-px bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" />
        <div className="absolute top-[18%] right-[20%] w-20 h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
        <div className="absolute bottom-[18%] left-[20%] w-20 h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center gap-7">
          {/* ── MONUMENTAL LOGO ── */}
          <img
            src="/logo-bombonera.png"
            alt="La Bombonera"
            className="
              h-72 xl:h-80 2xl:h-96
              w-auto object-contain
              drop-shadow-[0_30px_80px_rgba(245,158,11,0.22)]
              animate-[float_5s_ease-in-out_infinite]
              select-none
            "
            draggable={false}
          />

          {/* Brand text */}
          <div className="text-center space-y-1.5">
            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-secondary via-amber-400 to-secondary bg-clip-text text-transparent">
                La Bombonera
              </span>
            </h1>
            <p className="text-white/25 text-sm xl:text-base font-medium tracking-wide">
              Granizados que refrescan tu día.
            </p>
          </div>

          {/* Decorative dots */}
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
            <div className="size-1.5 rounded-full bg-amber-500/25" />
            <div className="w-10 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
          </div>
        </div>
      </div>

      {/* ── Vertical divider glow ── */}
      <div className="hidden lg:block absolute left-1/2 top-[8%] bottom-[8%] w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent -translate-x-1/2 z-10" />

      {/* ══════════════════════════════════════════════════════════
          RIGHT — Glass card with form
          ══════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Side ambient accent */}
        <div className="absolute top-[20%] right-[15%] w-[50%] h-[50%] bg-primary/[0.04] rounded-full blur-[150px]" />

        <div className="relative z-10 w-full max-w-md">
          {/* ── Mobile logo (visible only on < lg) ── */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img
              src="/logo-bombonera.png"
              alt="La Bombonera"
              className="h-36 sm:h-44 w-auto object-contain drop-shadow-[0_20px_50px_rgba(245,158,11,0.15)] animate-[float_4s_ease-in-out_infinite] select-none"
              draggable={false}
            />
            <div className="text-center mt-4 space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-secondary via-amber-400 to-secondary bg-clip-text text-transparent">
                  La Bombonera
                </span>
              </h2>
              <p className="text-white/25 text-sm font-medium tracking-wide">
                Granizados que refrescan tu día.
              </p>
            </div>
          </div>

          {/* ── Glass card ── */}
          <div className="w-full bg-black/25 backdrop-blur-2xl border border-white/[0.06] rounded-[2rem] sm:rounded-[2.5rem] p-7 sm:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.03)]">
            {/* ── Card title (desktop: minimal, mobile: replaced by logo above) ── */}
            <div className="text-center space-y-2 mb-9">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-secondary via-amber-400 to-secondary bg-clip-text text-transparent">
                  La Bombonera
                </span>
              </h2>
              <p className="text-white/35 text-sm sm:text-base font-medium tracking-wide">
                Granizados que refrescan tu día.
              </p>
            </div>

            {/* ── Error alert ── */}
            {error && (
              <div className="mb-6 bg-destructive/5 border border-destructive/15 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="shrink-0 w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                  <X size={15} className="text-destructive" strokeWidth={2.5} />
                </div>
                <p className="text-destructive/85 text-sm font-semibold leading-snug">{error}</p>
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/25">
                  Usuario
                </label>
                <Input
                  name="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Nombre de usuario"
                  disabled={loading}
                  autoComplete="username"
                  className="h-14 px-5 rounded-2xl bg-white/[0.04] border-white/[0.07] text-base font-semibold text-white placeholder:text-white/15 focus-visible:border-primary/40 focus-visible:ring-primary/15 transition-all duration-300"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/25">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="current-password"
                    className="h-14 px-5 pr-14 rounded-2xl bg-white/[0.04] border-white/[0.07] text-base font-semibold text-white placeholder:text-white/15 focus-visible:border-primary/40 focus-visible:ring-primary/15 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-white/15 hover:text-secondary transition-colors duration-200"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOffIcon size={20} strokeWidth={1.8} /> : <EyeIcon size={20} strokeWidth={1.8} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full h-14 rounded-2xl !text-base !font-black !uppercase !tracking-[0.2em] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-[0_0_30px_rgba(12,183,183,0.25)] hover:shadow-[0_0_50px_rgba(12,183,183,0.4)] text-white transition-all duration-500 active:scale-[0.98] mt-1"
              >
                Iniciar Gestión
              </Button>
            </form>

            {/* ── Footer ── */}
            <div className="mt-10 pt-6 border-t border-white/[0.04]">
              <div className="flex items-center justify-center gap-3 text-white/[0.08] font-black text-[10px] uppercase tracking-[0.35em]">
                <div className="h-px w-8 bg-white/[0.05]" />
                LA BOMBONERA
                <div className="h-px w-8 bg-white/[0.05]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
