import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, USER_ROLES } from '../utils/constants';
import { normalizeProfileCode } from '../utils/roles';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] space-y-6">
        <img
          src="/logo-bombonera.png"
          alt="La Bombonera"
          className="h-24 w-auto animate-pulse"
        />
        <p className="text-white/60 text-lg font-medium animate-pulse">
          Verificando sesión...
        </p>
      </div>
    );
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(credentials.username, credentials.password);
      
      if (result.success && result.user) {
        const userRole = normalizeProfileCode(result.user.role);
        
        switch (userRole) {
          case USER_ROLES.ADMIN:
            navigate(ROUTES.ADMIN_PROFILES);
            break;
          case USER_ROLES.WAITER:
            navigate(ROUTES.WAITER_ORDERS);
            break;
          case USER_ROLES.CASHIER:
            navigate(ROUTES.CASHIER_TABLES);
            break;
          default:
            navigate(ROUTES.ADMIN_PROFILES);
        }
      } else {
        setError(result.error || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0A0A0A] overflow-hidden selection:bg-primary/30 selection:text-primary">
      {/* Panel Izquierdo: Branding — Vibra Bombonera */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-[#DC2626] via-[#E63946] to-[#B91C1C] relative overflow-hidden">
        {/* Fondo decorativo — llamas tenues */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB703]/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-[#00B4D8]/10 rounded-full -ml-64 -mb-64 blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative z-10 text-center space-y-12 max-w-lg">
          <div className="bg-[#0A0A0A] p-6 rounded-6xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] inline-block transform hover:rotate-2 hover:scale-[1.02] transition-all duration-700 border-2 border-[#FFB703]/30">
            <img 
              src="/logo-bombonera.png" 
              alt="La Bombonera" 
              className="h-56 w-auto object-contain"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white tracking-tighter leading-tight drop-shadow-[0_4px_20px_rgba(255,183,3,0.3)]">
              La <span className="text-[#FFB703]">Bombonera</span>
            </h1>
            <p className="text-white/80 text-2xl font-medium tracking-tight">
              🔥 Granizados que rompen la cancha.
            </p>
          </div>
        </div>
      </div>

      {/* Panel Derecho: Formulario */}
      <div className="flex flex-col justify-center items-center p-6 md:p-12 relative">
        {/* Partículas tenues de fondo */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#00B4D8]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#E63946]/5 rounded-full blur-3xl" />
        
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
          <div className="lg:hidden text-center space-y-6 mb-12">
            <img src="/logo-bombonera.png" alt="La Bombonera" className="h-28 w-auto mx-auto shadow-xl rounded-2xl" />
            <h2 className="text-4xl font-black text-[#E63946] tracking-tighter">La Bombonera</h2>
          </div>

          <div className="space-y-3 text-center lg:text-left">
            <h3 className="text-5xl font-black tracking-tighter text-white">Ingresar</h3>
            <p className="text-white/50 font-medium text-lg">Accedé al panel de gestión.</p>
          </div>

          {error && (
            <div className="bg-[#DC2626]/10 border-2 border-[#DC2626]/30 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300 backdrop-blur-sm">
              <div className="bg-[#DC2626] text-white p-1 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </div>
              <p className="text-[#DC2626] text-sm font-black uppercase tracking-wider">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <Input
                label="Usuario"
                name="username"
                type="text"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Nombre de usuario"
                className="h-16 px-6 rounded-2xl border-2 bg-white/5 border-white/10 focus:border-[#E63946] focus-visible:ring-[#E63946]/20 transition-all text-lg font-bold text-white placeholder:text-white/30"
                disabled={loading}
                labelClassName="text-white/60"
              />
              <div className="relative group">
                <Input
                  label="Contraseña"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-16 px-6 rounded-2xl border-2 bg-white/5 border-white/10 focus:border-[#E63946] focus-visible:ring-[#E63946]/20 transition-all text-lg font-bold text-white placeholder:text-white/30 pr-14"
                  disabled={loading}
                  labelClassName="text-white/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-10.5 p-2 text-white/40 hover:text-[#FFB703] transition-colors"
                >
                  {showPassword ? <EyeOffIcon size={24} /> : <EyeIcon size={24} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-16 rounded-2xl text-xl font-black shadow-2xl shadow-[#E63946]/30 hover:shadow-[#E63946]/50 transform active:scale-[0.97] transition-all duration-300 uppercase tracking-widest bg-[#E63946] hover:bg-[#DC2626] text-white"
              isLoading={loading}
            >
              🔥 Iniciar Gestión
            </Button>
          </form>

          <footer className="pt-12 text-center">
            <div className="flex items-center justify-center gap-4 text-white/20 font-black text-[10px] uppercase tracking-[0.3em]">
              <div className="h-px w-12 bg-white/10" />
              ⚽ BOMBONERA POS v1.0
              <div className="h-px w-12 bg-white/10" />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
