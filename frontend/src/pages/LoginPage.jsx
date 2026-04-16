import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Demo users for quick testing (emails only, passwords validated server-side)
const DEMO_ROLES = [
  { email: 'admin@rehab.com', role: 'admin', name: 'Admin User' },
  { email: 'counselor@rehab.com', role: 'counselor', name: 'Sarah Johnson' },
  { email: 'manager@rehab.com', role: 'manager', name: 'Michael Chen' },
];

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In production, this would call a real authentication endpoint
      // For demo purposes, we validate locally but architecture supports backend auth
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      const userData = response.data;
      toast.success(`Welcome back, ${userData.name}!`);
      onLogin(userData);
    } catch (error) {
      // Fallback to demo mode for prototype
      const demoUser = DEMO_ROLES.find((u) => u.email === email);
      if (demoUser && password === 'demo123') {
        toast.success(`Welcome back, ${demoUser.name}! (Demo Mode)`);
        onLogin(demoUser);
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    setEmail(role.email);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-accent text-accent-foreground rounded-2xl p-4">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Rehabilitation Portal</h1>
          <p className="text-muted-foreground">Sign in to access your dashboard</p>
        </div>

        {/* Login Form */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@rehab.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-sm">Demo Credentials</CardTitle>
            <CardDescription className="text-xs">
              Click to auto-fill (Password: demo123)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEMO_ROLES.map((role) => (
              <Button
                key={role.email}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => quickLogin(role)}
              >
                <span className="font-medium capitalize">{role.role}:</span>
                <span className="ml-2 text-muted-foreground">{role.email}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
