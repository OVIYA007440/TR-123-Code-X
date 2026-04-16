import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Download, FileText, TrendingUp, Filter, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--chart-3))', 'hsl(var(--destructive))'];

// Chart styling constants
const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.5rem',
};

const BAR_RADIUS = [8, 8, 0, 0];
const BAR_RADIUS_HORIZONTAL = [0, 8, 8, 0];

export default function ReportsPage({ user }) {
  const [timeRange, setTimeRange] = useState('30days');
  const [reportType, setReportType] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/reports/analytics`, {
        params: { timeRange, reportType }
      });
      setAnalyticsData(response.data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching analytics:', error);
      }
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange, reportType]); // API, axios, toast are stable imports

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = (format) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
    // Export logic would go here
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive program performance insights</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="behavior">Behavior</SelectItem>
                <SelectItem value="programs">Programs</SelectItem>
                <SelectItem value="risk">Risk Assessment</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="gap-2">
                <Download className="w-4 h-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="gap-2">
                <Download className="w-4 h-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="gap-2">
                <Download className="w-4 h-4" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData?.totalParticipants || 0}</div>
            <Badge variant="secondary" className="mt-2 text-xs bg-success/10 text-success">
              +12% vs previous period
            </Badge>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Program Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData?.completionRate || 0}%</div>
            <Badge variant="secondary" className="mt-2 text-xs bg-success/10 text-success">
              +5% vs previous period
            </Badge>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Session Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData?.avgAttendance || 0}%</div>
            <Badge variant="secondary" className="mt-2 text-xs bg-destructive/10 text-destructive">
              -3% vs previous period
            </Badge>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData?.successRate || 0}%</div>
            <Badge variant="secondary" className="mt-2 text-xs bg-success/10 text-success">
              +8% vs previous period
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Participation Trends</CardTitle>
                <CardDescription>Monthly participation over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.participationTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Line type="monotone" dataKey="participants" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
                <CardDescription>Current risk assessment breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.riskDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="hsl(var(--accent))"
                      dataKey="value"
                    >
                      {(analyticsData?.riskDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Analysis</CardTitle>
              <CardDescription>Weekly attendance rates across all programs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData?.attendanceData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                  <Legend />
                  <Bar dataKey="attended" fill="hsl(var(--success))" radius={BAR_RADIUS} />
                  <Bar dataKey="absent" fill="hsl(var(--destructive))" radius={BAR_RADIUS} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Program Performance</CardTitle>
              <CardDescription>Completion rates by program type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData?.programPerformance || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="program" type="category" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                  <Bar dataKey="completionRate" fill="hsl(var(--accent))" radius={BAR_RADIUS_HORIZONTAL} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Improvement Trends</CardTitle>
              <CardDescription>Average behavior scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData?.behaviorTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--success))" strokeWidth={2} name="Avg Behavior Score" />
                  <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Executive Summary
          </CardTitle>
          <CardDescription>Key findings and recommendations from this reporting period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Positive Trends</h4>
                  <p className="text-sm text-muted-foreground">
                    Overall program completion rates have increased by 8% compared to the previous period. Vocational training programs show the highest success rates at 94%.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Areas of Concern</h4>
                  <p className="text-sm text-muted-foreground">
                    Attendance rates for counseling sessions have declined by 3%. This is primarily affecting high-risk participants who require the most support.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Recommendations</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider implementing mandatory check-ins for high-risk participants and exploring alternative counseling formats (e.g., peer support groups) to improve engagement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
