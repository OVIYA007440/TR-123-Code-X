import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Clock, MapPin, Users, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SchedulePage({ user }) {
  const [date, setDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessionsByDate();
  }, [date, sessions]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const filterSessionsByDate = () => {
    const selectedDate = format(date, 'yyyy-MM-dd');
    const filtered = sessions.filter((session) => session.date === selectedDate);
    setFilteredSessions(filtered);
  };

  const getSessionColor = (type) => {
    switch (type) {
      case 'counseling':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'vocational':
        return 'bg-success/10 text-success border-success/20';
      case 'educational':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'therapy':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
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
          <h1 className="text-3xl font-bold tracking-tight">Session Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage rehabilitation program sessions</p>
        </div>
        {(user.role === 'admin' || user.role === 'manager') && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Schedule Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Session</DialogTitle>
                <DialogDescription>
                  Create a new rehabilitation session
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 py-4" onSubmit={(e) => {
                e.preventDefault();
                toast.success('Session scheduled successfully');
                setDialogOpen(false);
              }}>
                <div className="space-y-2">
                  <Label htmlFor="session-type">Session Type</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="counseling">Counseling</SelectItem>
                      <SelectItem value="vocational">Vocational Training</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="therapy">Group Therapy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input id="title" placeholder="Enter session title" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Room or area" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff">Assigned Staff</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff1">Dr. Sarah Johnson</SelectItem>
                      <SelectItem value="staff2">Michael Chen</SelectItem>
                      <SelectItem value="staff3">Emily Rodriguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" type="number" placeholder="Max participants" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea id="notes" placeholder="Additional details" rows={3} />
                </div>
                <Button type="submit" className="w-full">Schedule Session</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Calendar and Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Calendar</CardTitle>
            <CardDescription>Select a date to view sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Legend</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-accent"></div>
                  <span>Counseling</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-success"></div>
                  <span>Vocational</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-warning"></div>
                  <span>Educational</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-3))' }}></div>
                  <span>Therapy</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sessions for {format(date, 'MMMM d, yyyy')}</CardTitle>
            <CardDescription>
              {filteredSessions.length} session(s) scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No sessions scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-base mb-1">{session.title}</h3>
                        <Badge variant="outline" className={getSessionColor(session.type)}>
                          {session.type}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {session.enrolled}/{session.capacity}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Led by {session.staff}</span>
                      </div>
                    </div>
                    {session.notes && (
                      <p className="mt-3 text-xs text-muted-foreground p-2 bg-muted rounded">
                        {session.notes}
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                      {(user.role === 'admin' || user.role === 'manager') && (
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
          <CardDescription>Session summary for the current week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-2xl font-bold">18</p>
            </div>
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
              <p className="text-2xl font-bold">6</p>
            </div>
            <div className="p-4 rounded-lg bg-muted border border-border">
              <p className="text-sm text-muted-foreground mb-1">Avg Attendance</p>
              <p className="text-2xl font-bold">87%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
