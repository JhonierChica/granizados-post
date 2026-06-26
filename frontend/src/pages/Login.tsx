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

  // Show a brief loading state while AuthContext verifies the stored token
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-6">
        <img
          src="/logo-tds.png"
          alt="La Terraza del Sinú"
          className="h-24 w-auto animate-pulse"
        />
        <p className="text-muted-foreground text-lg font-medium animate-pulse">
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Panel Izquierdo: Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-secondary/20 rounded-full -ml-64 -mb-64 blur-3xl" />
        
        <div className="relative z-10 text-center space-y-12 max-w-lg">
          <div className="bg-white p-10 rounded-6xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] inline-block transform hover:rotate-3 transition-transform duration-700">
            <img 
              src="/logo-tds.png" 
              alt="La Terraza del Sinú" 
              className="h-56 w-auto object-contain"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white tracking-tighter leading-tight">
              La Terraza <br/>
              <span className="text-secondary drop-shadow-sm">del Sinú</span>
            </h1>
            <p className="text-white/80 text-2xl font-medium tracking-tight">
              Gestioná tu restaurante con altura.
            </p>
          </div>
        </div>
      </div>

      {/* Panel Derecho: Formulario */}
      <div className="flex flex-col justify-center items-center p-6 md:p-12 relative">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="lg:hidden text-center space-y-6 mb-12">
            <img src="/logo-tds.png" alt="Logo" className="h-28 w-auto mx-auto shadow-xl rounded-2xl" />
            <h2 className="text-4xl font-black text-primary tracking-tighter">La Terraza del Sinú</h2>
          </div>

          <div className="space-y-3 text-center lg:text-left">
            <h3 className="text-5xl font-black tracking-tighter text-foreground">Ingresar</h3>
            <p className="text-muted-foreground font-medium text-lg">Panel administrativo exclusivo.</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border-2 border-destructive/20 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300">
              <div className="bg-destructive text-white p-1 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </div>
              <p className="text-destructive text-sm font-black uppercase tracking-wider">{error}</p>
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
                className="h-16 px-6 rounded-2xl border-2 focus:border-primary focus-visible:ring-primary/20 transition-all text-lg font-bold text-foreground"
                disabled={loading}
              />
              <div className="relative group">
                <Input
                  label="Contraseña"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-16 px-6 rounded-2xl border-2 focus:border-primary focus-visible:ring-primary/20 transition-all text-lg font-bold text-foreground pr-14"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-10.5 p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOffIcon size={24} /> : <EyeIcon size={24} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-16 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30 hover:shadow-primary/50 transform active:scale-[0.97] transition-all duration-300 uppercase tracking-widest bg-primary hover:bg-primary/90"
              isLoading={loading}
            >
              Iniciar Gestión
            </Button>
          </form>

          <footer className="pt-12 text-center">
            <div className="flex items-center justify-center gap-4 text-muted-foreground/40 font-black text-[10px] uppercase tracking-[0.3em]">
              <div className="h-px w-12 bg-muted/30" />
              TDS OS v4.0
              <div className="h-px w-12 bg-muted/30" />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;