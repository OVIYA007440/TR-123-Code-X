import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { AlertCircle, Plus, TrendingUp, TrendingDown, Lightbulb, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.5rem',
};

const REASON_COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--chart-3))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--muted-foreground))'];
const BAR_RADIUS_HORIZONTAL = [0, 8, 8, 0];

const getPriorityColor = (priority) => {
  const colors = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-success/10 text-success border-success/20',
  };
  return colors[priority] || '';
};

export default function AbsenceManagementPage({ user }) {
  const [absences, setAbsences] = useState([]);
  const [report, setReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    inmateId: '',
    inmateName: '',
    date: '',
    sessionType: '',
    reason: '',
    notes: '',
  });

  const fetchAbsences = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/absences`);
      setAbsences(response.data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching absences:', error);
      }
      toast.error('Failed to load absences');
    }
  }, []); // API, axios, toast are stable imports

  const fetchReport = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/absences/report`);
      setReport(response.data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching report:', error);
      }
      toast.error('Failed to load absence report');
    } finally {
      setLoading(false);
    }
  }, []); // API, axios, toast are stable imports

  useEffect(() => {
    fetchAbsences();
    fetchReport();
  }, [fetchAbsences, fetchReport]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/absences`, {
        ...formData,
        recordedBy: user.name,
      });
      toast.success('Absence recorded successfully');
      setDialogOpen(false);
      setFormData({
        inmateId: '',
        inmateName: '',
        date: '',
        sessionType: '',
        reason: '',
        notes: '',
      });
      fetchAbsences();
    } catch (error) {
      toast.error('Failed to record absence');
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Absence Management</h1>
          <p className="text-muted-foreground mt-1">Track absences and AI-powered reduction strategies</p>
        </div>
        {(user.role === 'admin' || user.role === 'counselor') && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Record Absence
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record New Absence</DialogTitle>
                <DialogDescription>
                  Document an inmate's absence from a scheduled session
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inmateId">Inmate ID</Label>
                    <Input
                      id="inmateId"
                      placeholder="INM-1001"
                      value={formData.inmateId}
                      onChange={(e) => setFormData({ ...formData, inmateId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inmateName">Name</Label>
                    <Input
                      id="inmateName"
                      placeholder="John Doe"
                      value={formData.inmateName}
                      onChange={(e) => setFormData({ ...formData, inmateName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionType">Session Type</Label>
                  <Select value={formData.sessionType} onValueChange={(value) => setFormData({ ...formData, sessionType: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Counseling">Counseling</SelectItem>
                      <SelectItem value="Vocational Training">Vocational Training</SelectItem>
                      <SelectItem value="Educational">Educational</SelectItem>
                      <SelectItem value="Therapy">Group Therapy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Absence</Label>
                  <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medical Issues">Medical Issues</SelectItem>
                      <SelectItem value="Family Emergency">Family Emergency</SelectItem>
                      <SelectItem value="Behavioral Issues">Behavioral Issues</SelectItem>
                      <SelectItem value="Mental Health">Mental Health</SelectItem>
                      <SelectItem value="Scheduling Conflict">Scheduling Conflict</SelectItem>
                      <SelectItem value="Refused to Attend">Refused to Attend</SelectItem>
                      <SelectItem value="Transportation Issues">Transportation Issues</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional context..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">Record Absence</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="report" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="report">AI Report</TabsTrigger>
          <TabsTrigger value="records">Absence Records</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="space-y-6">
          {/* Monthly Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="stat-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Absences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{report?.totalAbsences || 0}</div>
                <div className="flex items-center gap-1 text-sm text-destructive mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{report?.percentageChange || 0}% vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Previous Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{report?.previousMonth || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">December 2023</p>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report?.topReasons?.[0]?.reason || 'N/A'}</div>
                <p className="text-xs text-muted-foreground mt-1">{report?.topReasons?.[0]?.percentage || 0}% of all absences</p>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">AI Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{report?.aiSuggestions?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Actionable recommendations</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Absence Reasons Breakdown</CardTitle>
                <CardDescription>Distribution of absence reasons this month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={report?.topReasons || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ reason, percentage }) => `${reason}: ${percentage}%`}
                      outerRadius={100}
                      fill="hsl(var(--accent))"
                      dataKey="count"
                    >
                      {(report?.topReasons || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={REASON_COLORS[index % REASON_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Absence Frequency by Reason</CardTitle>
                <CardDescription>Count of absences per category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={report?.topReasons || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="reason" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={BAR_RADIUS_HORIZONTAL} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Trends Analysis */}
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trends Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{report?.trendsAnalysis?.description}</p>
              <div className="p-4 rounded-lg bg-background border border-border">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Forecast
                </h4>
                <p className="text-sm text-muted-foreground">{report?.trendsAnalysis?.forecast}</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>Data-driven strategies to reduce absences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report?.aiSuggestions?.map((suggestion, index) => (
                <Card key={index} className="border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority} priority
                          </Badge>
                          <Badge variant="secondary" className="text-xs">{suggestion.category}</Badge>
                        </div>
                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="mt-2">{suggestion.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-sm font-medium text-success mb-1">Expected Impact</p>
                      <p className="text-sm">{suggestion.expectedImpact}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Action Items:</p>
                      <ul className="space-y-2">
                        {suggestion.actionItems.map((item) => (
                          <li key={`${index}-${item.substring(0, 20)}`} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Recent Absence Records</CardTitle>
              <CardDescription>Complete log of all recorded absences</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Inmate</TableHead>
                    <TableHead>Session Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Recorded By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absences.slice(0, 20).map((absence) => (
                    <TableRow key={absence.id}>
                      <TableCell>{absence.date}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{absence.inmateName}</div>
                          <div className="text-xs text-muted-foreground">{absence.inmateId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{absence.sessionType}</Badge>
                      </TableCell>
                      <TableCell>{absence.reason}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{absence.recordedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
