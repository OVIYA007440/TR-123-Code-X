import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import LoginPage from '@/pages/LoginPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OverviewPage from '@/pages/OverviewPage';
import InmatesPage from '@/pages/InmatesPage';
import SchedulePage from '@/pages/SchedulePage';
import StaffPage from '@/pages/StaffPage';
import ReportsPage from '@/pages/ReportsPage';
import AbsenceManagementPage from '@/pages/AbsenceManagementPage';
import SettingsPage from '@/pages/SettingsPage';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />}
          />
          <Route
            path="/*"
            element={
              user ? (
                <DashboardLayout user={user} onLogout={handleLogout}>
                  <Routes>
                    <Route path="/" element={<OverviewPage user={user} />} />
                    <Route path="/inmates" element={<InmatesPage user={user} />} />
                    <Route path="/schedule" element={<SchedulePage user={user} />} />
                    <Route path="/staff" element={<StaffPage user={user} />} />
                    <Route path="/absences" element={<AbsenceManagementPage user={user} />} />
                    <Route path="/reports" element={<ReportsPage user={user} />} />
                    <Route path="/settings" element={<SettingsPage user={user} />} />
                  </Routes>
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
