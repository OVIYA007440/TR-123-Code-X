import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, Eye, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper function to get risk badge styling
const getRiskBadgeClass = (risk) => {
  const riskStyles = {
    high: 'status-high',
    medium: 'status-medium',
    low: 'status-low',
  };
  return riskStyles[risk] || '';
};

// Helper function to get user initials
const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export default function InmatesPage({ user }) {
  const [inmates, setInmates] = useState([]);
  const [filteredInmates, setFilteredInmates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedInmate, setSelectedInmate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchInmates = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/inmates`);
      setInmates(response.data);
      setFilteredInmates(response.data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching inmates:', error);
      }
      toast.error('Failed to load inmates data');
    } finally {
      setLoading(false);
    }
    // API, axios, toast are stable imports
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterInmates = useCallback(() => {
    let filtered = inmates;

    if (searchTerm) {
      filtered = filtered.filter(
        (inmate) =>
          inmate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inmate.inmateId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter((inmate) => inmate.riskLevel === riskFilter);
    }

    setFilteredInmates(filtered);
  }, [inmates, searchTerm, riskFilter]);

  useEffect(() => {
    fetchInmates();
  }, [fetchInmates]);

  useEffect(() => {
    filterInmates();
  }, [filterInmates]);

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
          <h1 className="text-3xl font-bold tracking-tight">Inmate Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage rehabilitation participants</p>
        </div>
        {user.role === 'admin' && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Inmate
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inmates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInmates.map((inmate) => (
          <Card key={inmate.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 bg-accent">
                    <AvatarFallback className="text-accent-foreground">
                      {getInitials(inmate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{inmate.name}</CardTitle>
                    <CardDescription className="text-xs">{inmate.inmateId}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={getRiskBadgeClass(inmate.riskLevel)}>
                  {inmate.riskLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-semibold">{inmate.attendance}%</span>
                    {inmate.attendanceTrend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Behavior</p>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-semibold">{inmate.behaviorScore}/100</span>
                    {inmate.behaviorTrend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
              </div>

              {/* Programs */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Active Programs</p>
                <div className="flex flex-wrap gap-1">
                  {inmate.programs.map((program) => (
                    <Badge key={`${inmate.id}-${program}`} variant="secondary" className="text-xs">
                      {program}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <Dialog open={dialogOpen && selectedInmate?.id === inmate.id} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) setSelectedInmate(null);
              }}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setSelectedInmate(inmate)}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-accent">
                        <AvatarFallback className="text-accent-foreground">
                          {getInitials(inmate.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{inmate.name}</div>
                        <div className="text-sm font-normal text-muted-foreground">{inmate.inmateId}</div>
                      </div>
                    </DialogTitle>
                    <DialogDescription>
                      Comprehensive profile and rehabilitation progress
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Risk Assessment */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Risk Assessment</h3>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                        <AlertCircle className={`w-5 h-5 ${
                          inmate.riskLevel === 'high' ? 'text-destructive' :
                          inmate.riskLevel === 'medium' ? 'text-warning' :
                          'text-success'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Current Risk Level: <span className="capitalize">{inmate.riskLevel}</span></p>
                          <p className="text-xs text-muted-foreground mt-1">{inmate.riskNotes}</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Performance Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="text-xs text-muted-foreground mb-1">Attendance Rate</p>
                          <p className="text-2xl font-bold">{inmate.attendance}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="text-xs text-muted-foreground mb-1">Behavior Score</p>
                          <p className="text-2xl font-bold">{inmate.behaviorScore}/100</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="text-xs text-muted-foreground mb-1">Programs Completed</p>
                          <p className="text-2xl font-bold">{inmate.completedPrograms}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="text-xs text-muted-foreground mb-1">Time in Program</p>
                          <p className="text-2xl font-bold">{inmate.timeInProgram}</p>
                        </div>
                      </div>
                    </div>

                    {/* Active Programs */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Active Programs</h3>
                      <div className="space-y-2">
                        {inmate.programs.map((program) => (
                          <div key={`${inmate.id}-detail-${program}`} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                            <span className="text-sm font-medium">{program}</span>
                            <Badge variant="secondary">In Progress</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Notes */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Recent Notes</h3>
                      <div className="space-y-2">
                        {inmate.recentNotes?.map((note) => (
                          <div key={`${inmate.id}-note-${note.date}`} className="p-3 rounded-lg bg-muted">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">{note.author}</span>
                              <span className="text-xs text-muted-foreground">{note.date}</span>
                            </div>
                            <p className="text-sm">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInmates.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">No inmates found matching your criteria</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
