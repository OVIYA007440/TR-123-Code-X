import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const DEMO_USERS = [
  { email: 'admin@rehab.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'counselor@rehab.com', password: 'counselor123', role: 'counselor', name: 'Sarah Johnson' },
  { email: 'manager@rehab.com', password: 'manager123', role: 'manager', name: 'Michael Chen' },
];

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const user = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
      onLogin(user);
    } else {
      toast.error('Invalid credentials. Please try again.');
    }

    setLoading(false);
  };

  const quickLogin = (user) => {
    setEmail(user.email);
    setPassword(user.password);
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
              Click to auto-fill credentials for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEMO_USERS.map((user) => (
              <Button
                key={user.email}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => quickLogin(user)}
              >
                <span className="font-medium capitalize">{user.role}:</span>
                <span className="ml-2 text-muted-foreground">{user.email}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
