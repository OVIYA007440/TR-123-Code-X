import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Calendar, TrendingUp, AlertTriangle, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Chart styling constants
const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.5rem',
};

const CHART_DOT_STYLE = { fill: 'hsl(var(--accent))' };
const BAR_RADIUS = [8, 8, 0, 0];

// Helper functions for severity styling
const getSeverityIconColor = (severity) => {
  const colorMap = {
    high: 'text-destructive',
    medium: 'text-warning',
  };
  return colorMap[severity] || 'text-muted-foreground';
};

const getSeverityBadgeClass = (severity) => {
  const classMap = {
    high: 'status-high',
    medium: 'status-medium',
  };
  return classMap[severity] || 'status-low';
};

export default function OverviewPage({ user }) {
  const [stats, setStats] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/dashboard/overview`);
      setStats(response.data.stats);
      setAttendanceData(response.data.attendanceData);
      setRiskData(response.data.riskData);
      setRecentAlerts(response.data.recentAlerts);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching dashboard data:', error);
      }
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
    // API, axios, toast are stable imports - no need to include in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleExport = async () => {
    toast.success('Report export started. Download will begin shortly.');
    // Export functionality would be implemented here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your rehabilitation programs</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inmates</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalInmates || 0}</div>
            <div className="flex items-center gap-1 text-sm text-success mt-1">
              <ArrowUp className="w-3 h-3" />
              <span>{stats?.inmatesChange || 0}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Attendance</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.avgAttendance || 0}%</div>
            <div className="flex items-center gap-1 text-sm text-destructive mt-1">
              <ArrowDown className="w-3 h-3" />
              <span>{stats?.attendanceChange || 0}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Programs</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activePrograms || 0}</div>
            <div className="flex items-center gap-1 text-sm text-success mt-1">
              <ArrowUp className="w-3 h-3" />
              <span>{stats?.programsChange || 0}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Cases</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats?.highRiskCases || 0}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <span>Requires immediate attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Last 8 weeks attendance and behavior scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                />
                <Line type="monotone" dataKey="attendance" stroke="hsl(var(--accent))" strokeWidth={2} dot={CHART_DOT_STYLE} />
                <Line type="monotone" dataKey="behavior" stroke="hsl(var(--success))" strokeWidth={2} dot={CHART_DOT_STYLE} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
            <CardDescription>Current risk assessment across all inmates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="level" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={BAR_RADIUS} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts and AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Critical notifications requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent alerts</p>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${getSeverityIconColor(alert.severity)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <Badge variant="outline" className={`text-xs ${getSeverityBadgeClass(alert.severity)}`}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>AI Recommendations</span>
              <Badge variant="secondary" className="text-xs">Powered by ML</Badge>
            </CardTitle>
            <CardDescription>Data-driven insights for improved outcomes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-background border border-border">
                <h4 className="text-sm font-medium mb-2">Increase Counseling Frequency</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Based on declining attendance rates, we recommend scheduling additional counseling sessions for 8 high-risk inmates.
                </p>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border">
                <h4 className="text-sm font-medium mb-2">Vocational Training Assignment</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  12 inmates show readiness for vocational programs based on behavior improvements and program completion rates.
                </p>
                <Button size="sm" variant="outline">View Candidates</Button>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border">
                <h4 className="text-sm font-medium mb-2">Staff Resource Optimization</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Consider redistributing staff assignments on Thursdays when session attendance peaks.
                </p>
                <Button size="sm" variant="outline">Review Schedule</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
