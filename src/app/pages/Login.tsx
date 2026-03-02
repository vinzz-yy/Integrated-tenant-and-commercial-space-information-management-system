import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Building2, AlertCircle, Mail, Lock, User, Briefcase, Home } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'staff' | 'tenant') => {
    const credentials = {
      admin: 'admin@skymall.com',
      staff: 'staff@skymall.com',
      tenant: 'tenant@skymall.com',
    };
    setEmail(credentials[role]);
    setPassword('password');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md border shadow-sm">
        <CardHeader className="space-y-2 text-center pb-4">
          {/* Simple Logo */}
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          
          {/* Clean Title */}
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              LA Union Sky Mall
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Integrated Tenant and Commercial Space Management
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-500" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Sign In Button */}
            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
              Demo Accounts (Password: password)
            </p>
            
            <div className="grid grid-cols-3 gap-2">
              {/* Admin */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('admin')}
                className="flex items-center justify-center gap-1.5 py-5"
              >
                <User className="h-4 w-4" />
                <span className="text-xs">Admin</span>
              </Button>

              {/* Staff */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('staff')}
                className="flex items-center justify-center gap-1.5 py-5"
              >
                <Briefcase className="h-4 w-4" />
                <span className="text-xs">Staff</span>
              </Button>

              {/* Tenant */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('tenant')}
                className="flex items-center justify-center gap-1.5 py-5"
              >
                <Home className="h-4 w-4" />
                <span className="text-xs">Tenant</span>
              </Button>
            </div>
          </div>

          {/* Simple Footer */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
            © 2026 LA Union Sky Mall Corporation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}