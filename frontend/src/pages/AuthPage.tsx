import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginDemo, loginEmail, signUpEmail, logout, isAuthenticated, isDemoUser } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !email.includes('@')) {
      setFormError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setFormError('Please enter your full name or tournament nickname.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        await loginEmail(email, password);
        showToast('Signed in successfully', {
          message: 'Welcome back to ClusterHub!',
          type: 'success',
        });
      } else {
        await signUpEmail(name, email, password);
        showToast('Account registered', {
          message: 'Welcome to ClusterHub! Your organizer profile is ready.',
          type: 'success',
        });
      }
      navigate('/');
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async (role: 'organizer' | 'admin' | 'referee') => {
    setIsLoading(true);
    try {
      await loginDemo(role);
      showToast('Signed in with Demo Session', {
        message: `Active as ${role.toUpperCase()}. Exploring live tournament system.`,
        type: 'info',
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Heading */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-linear-to-tr from-[#8B7CF6] via-[#A78BFA] to-[#67B7F7] flex items-center justify-center text-white shadow-lg shadow-[#8B7CF6]/25">
            <svg
              className="w-8 h-8 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7 6H17C19.7614 6 22 8.23858 22 11V16C22 18.2091 20.2091 20 18 20H16.5L14 17.5H10L7.5 20H6C3.79086 20 2 18.2091 2 16V11C2 8.23858 4.23858 6 7 6Z" fillOpacity="0.9" />
              <circle cx="8" cy="12" r="1.5" fill="#252842" />
              <circle cx="16" cy="11" r="1" fill="#FFAD91" />
              <circle cx="17.5" cy="12.5" r="1" fill="#6FD6B0" />
              <circle cx="14.5" cy="12.5" r="1" fill="#FFD978" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[#252842] font-heading tracking-tight">
            Cluster<span className="text-[#8B7CF6]">Hub</span>
          </h2>
          <p className="text-xs text-[#777D96]">Play Together. Compete Better.</p>
        </div>

        {/* Current Active User Status if signed in */}
        {isAuthenticated && (
          <div className="p-4 rounded-2xl bg-white border border-[#E9EAF3] shadow-xs space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#252842]">
              <ShieldCheck className="w-4 h-4 text-[#6FD6B0]" />
              Currently Active Session
            </div>
            <p className="text-xs text-[#777D96]">
              Signed in as <strong className="text-[#252842]">{user?.name}</strong> ({user?.email}) with role <strong className="text-[#8B7CF6]">{user?.role}</strong>.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2 border-t border-[#E9EAF3]">
              <Button size="sm" variant="outline" onClick={() => navigate('/')}>
                Go to Dashboard
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  logout();
                  showToast('Signed out', { type: 'info' });
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* Auth Form Card */}
        <Card className="p-6">
          <div className="flex items-center p-1 bg-[#F8F9FE] border border-[#E9EAF3] rounded-xl mb-6">
            <button
              onClick={() => {
                setMode('signin');
                setFormError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white text-[#252842] shadow-xs'
                  : 'text-[#777D96] hover:text-[#252842]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setFormError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#252842] shadow-xs'
                  : 'text-[#777D96] hover:text-[#252842]'
              }`}
            >
              Register Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full Name / Handle"
                required
                placeholder="e.g. Abdul Ahad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />
            )}

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="organizer@clusterhub.gg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="focus:outline-none hover:text-[#252842]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFAD91]/15 border border-[#FFAD91]/30 text-xs font-semibold text-[#932710]">
                <AlertCircle className="w-4 h-4 text-[#FFAD91] shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'signin' ? 'Sign In to Hub' : 'Create Organizer Account'}
            </Button>
          </form>

          {/* Development Quick Role Switch */}
          <div className="mt-6 pt-5 border-t border-[#E9EAF3] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#777D96]">
              <span>Quick Development Login:</span>
              <span className="text-[10px] text-[#8B7CF6]">Instant Preview</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDemoSignIn('organizer')}
                disabled={isLoading}
              >
                Lead Organizer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoSignIn('admin')}
                disabled={isLoading}
              >
                System Admin
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
