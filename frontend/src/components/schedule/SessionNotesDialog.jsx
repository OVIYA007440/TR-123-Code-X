import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const BYTES_PER_KB = 1024;

export function SessionNotesDialog({ 
  open, 
  onOpenChange, 
  session, 
  user, 
  notes, 
  onNotesUpdate 
}) {
  const [noteContent, setNoteContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUploadNote = async () => {
    if ((!noteContent.trim() && !selectedFile) || !session) return;

    try {
      let fileUrl = '';
      let fileName = '';

      if (selectedFile) {
        fileName = selectedFile.name;
        fileUrl = `https://storage.example.com/session-notes/${Date.now()}_${fileName}`;
      }

      await axios.post(`${API}/session-notes`, {
        sessionId: session.id,
        sessionTitle: session.title,
        date: session.date,
        author: user.name,
        content: noteContent || `Uploaded document: ${fileName}`,
        attendees: [],
        fileUrl: fileUrl,
        fileName: fileName,
      });

      toast.success('Session note uploaded successfully');
      setNoteContent('');
      setSelectedFile(null);
      onNotesUpdate();
    } catch (error) {
      toast.error('Failed to upload session note');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        toast.success(`File selected: ${file.name}`);
      } else {
        toast.error('Please select a PDF, DOC, DOCX, or TXT file');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Session Notes - {session?.title}</DialogTitle>
          <DialogDescription>
            {session?.date} at {session?.time} | {session?.location}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Upload New Note */}
          {(user.role === 'admin' || user.role === 'counselor' || user.role === 'manager') && (
            <Card className="border-accent/20 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Add Session Note
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Enter session notes, observations, outcomes..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-sm font-medium">
                    Or upload a document (PDF, DOC, DOCX, TXT)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    {selectedFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                      <FileText className="w-4 h-4 text-accent" />
                      <span className="flex-1 truncate">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(selectedFile.size / BYTES_PER_KB).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleUploadNote} 
                  size="sm" 
                  disabled={!noteContent.trim() && !selectedFile}
                  className="w-full"
                >
                  Upload Note
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Existing Notes */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Session History ({notes.length})</h3>
            {notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notes uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <Card key={note.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium">{note.author}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {new Date(note.timestamp).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {note.date}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      {note.fileName && (
                        <div className="mt-3 p-3 bg-muted rounded-lg border border-border">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-accent" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{note.fileName}</p>
                              {note.fileUrl && (
                                <a 
                                  href={note.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-accent hover:underline"
                                >
                                  Download file
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
