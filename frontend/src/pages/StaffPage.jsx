import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mail, Phone, Calendar, Award, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper function to get user initials
const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

// Helper function to get workload status color
const getWorkloadColor = (status) => {
  const colorMap = {
    'Optimal': 'bg-success/10 text-success',
    'High': 'bg-warning/10 text-warning',
  };
  return colorMap[status] || 'bg-muted';
};

// Helper function to get role color
const getRoleColor = (role) => {
  const colorMap = {
    counselor: 'bg-accent/10 text-accent border-accent/20',
    therapist: 'bg-success/10 text-success border-success/20',
    educator: 'bg-warning/10 text-warning border-warning/20',
    coordinator: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  };
  return colorMap[role] || 'bg-muted text-muted-foreground border-border';
};

export default function StaffPage({ user }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/staff`);
      setStaff(response.data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching staff:', error);
      }
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  }, []); // API, axios, toast are stable imports - intentionally not included

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

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
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground mt-1">View staff assignments and performance</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active members</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Caseload</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Inmates per staff</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sessions This Week</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">156</div>
            <p className="text-xs text-muted-foreground mt-1">Across all staff</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Performance</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {staff.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 bg-accent">
                  <AvatarFallback className="text-accent-foreground text-lg">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription className="mt-1">{member.specialization}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{member.phone}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Caseload</p>
                  <p className="text-lg font-semibold">{member.caseload}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sessions</p>
                  <p className="text-lg font-semibold">{member.sessionsThisWeek}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Experience</p>
                  <p className="text-lg font-semibold">{member.experience}y</p>
                </div>
              </div>

              {/* Performance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Performance Rating</span>
                  <span className="font-medium">{member.performanceRating}%</span>
                </div>
                <Progress value={member.performanceRating} className="h-2" />
              </div>

              {/* Workload Status */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs font-medium">Current Workload</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{member.workloadStatus}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getWorkloadColor(member.workloadStatus)}`}
                >
                  {member.workloadStatus}
                </Badge>
              </div>

              {/* Certifications */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Certifications</p>
                <div className="flex flex-wrap gap-1">
                  {member.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Schedule
                </Button>
                {user.role === 'admin' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Assign Cases
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
