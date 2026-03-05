// Login.jsx - Enhanced user login page
// Features: Form validation, remember me, demo credentials, loading states, and animations

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Eye, EyeOff, Loader2, Building2, UserCog, User } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Load saved email if "remember me" was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Attempt login
      const user = await login(email, password);
      
      // Handle "remember me" functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Store user preferences
      sessionStorage.setItem('lastLogin', new Date().toISOString());
      
      // Redirect based on user role with welcome message
      const roleMessages = {
        admin: 'Welcome back, Administrator!',
        staff: 'Welcome back, Staff Member!',
        tenant: `Welcome back to your commercial space, ${user.firstName || 'Tenant'}!`
      };
      
      // You could show a toast notification here
      console.log(roleMessages[user.role] || 'Welcome back!');
      
      // Navigate to appropriate dashboard
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'staff':
          navigate('/staff');
          break;
        case 'tenant':
          navigate('/tenant');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo credentials for testing
  const fillDemoCredentials = (role) => {
    setDemoMode(true);
    const demos = {
      admin: { email: 'admin@example.com', password: 'admin123' },
      staff: { email: 'staff@example.com', password: 'staff123' },
      tenant: { email: 'tenant@example.com', password: 'tenant123' }
    };
    
    setEmail(demos[role].email);
    setPassword(demos[role].password);
    setError('');
    
    // Auto-hide demo mode after 3 seconds
    setTimeout(() => setDemoMode(false), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login card */}
      <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 shadow-2xl border-0">
        <CardHeader className="space-y-1 text-center">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Commercial Space Manager
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Demo mode success message */}
          {demoMode && (
            <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <AlertDescription className="text-green-700 dark:text-green-300 text-sm">
                Demo credentials filled! Click "Sign In" to continue.
              </AlertDescription>
            </Alert>
          )}

          {/* Error alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 px-4"
                disabled={loading}
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            {/* Password input with show/hide toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 px-4"
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                disabled={loading}
              />
              <Label 
                htmlFor="remember" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Remember me
              </Label>
            </div>

            {/* Submit button with loading state */}
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo credentials section */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                  Demo Credentials
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('admin')}
                className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                disabled={loading}
              >
                <UserCog className="h-3 w-3 mr-1" />
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('staff')}
                className="text-xs hover:bg-green-50 dark:hover:bg-green-900/20"
                disabled={loading}
              >
                <User className="h-3 w-3 mr-1" />
                Staff
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('tenant')}
                className="text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20"
                disabled={loading}
              >
                <Building2 className="h-3 w-3 mr-1" />
                Tenant
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2024 Commercial Space Manager. All rights reserved.</p>
          <p className="text-xs">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </CardFooter>
      </Card>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}