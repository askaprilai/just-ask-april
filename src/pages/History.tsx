import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Copy, Mic, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Rewrite {
  id: string;
  created_at: string;
  raw_text: string;
  environment: string | null;
  outcome: string | null;
  desired_emotion: string | null;
  inferred_env: string | null;
  inferred_outcome: string | null;
  inferred_emotion: string | null;
  intent_summary: string | null;
}

interface VoiceTranscript {
  id: string;
  created_at: string;
  transcript: any; // JSONB from database
  summary: string | null;
}

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rewrites, setRewrites] = useState<Rewrite[]>([]);
  const [voiceTranscripts, setVoiceTranscripts] = useState<VoiceTranscript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setAuthLoading(false);

      if (!session?.user) {
        navigate('/auth');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchRewrites();
    }
  }, [user]);

  const fetchRewrites = async () => {
    try {
      setLoading(true);
      
      // Fetch text rewrites
      const { data: rewritesData, error: rewritesError } = await supabase
        .from('rewrites')
        .select('*')
        .order('created_at', { ascending: false });

      if (rewritesError) throw rewritesError;
      setRewrites(rewritesData || []);

      // Fetch voice transcripts
      const { data: transcriptsData, error: transcriptsError } = await supabase
        .from('voice_transcripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (transcriptsError) throw transcriptsError;
      setVoiceTranscripts(transcriptsData || []);
    } catch (error: any) {
      console.error('Error fetching history:', error);
      toast({
        title: "Error",
        description: "Could not load your history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'rewrite' | 'transcript') => {
    try {
      const table = type === 'rewrite' ? 'rewrites' : 'voice_transcripts';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (type === 'rewrite') {
        setRewrites(rewrites.filter(r => r.id !== id));
      } else {
        setVoiceTranscripts(voiceTranscripts.filter(t => t.id !== id));
      }
      
      toast({
        title: "Deleted",
        description: type === 'rewrite' ? "Message removed from history" : "Voice notes removed from history",
      });
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast({
        title: "Error",
        description: "Could not delete item",
        variant: "destructive",
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Original text copied to clipboard",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="hover:scale-105 transition-transform"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Your History
            </h1>
            <p className="text-muted-foreground mt-1">
              {rewrites.length} {rewrites.length === 1 ? 'message' : 'messages'} and {voiceTranscripts.length} voice {voiceTranscripts.length === 1 ? 'session' : 'sessions'} saved
            </p>
          </div>
        </div>

        {/* Content */}
        {rewrites.length === 0 && voiceTranscripts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No history yet</p>
              <Button onClick={() => navigate('/dashboard')}>
                Start practicing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Voice Transcripts Section */}
            {voiceTranscripts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Practice Sessions
                </h2>
                <div className="space-y-4">
                  {voiceTranscripts.map((transcript) => (
                    <Card key={transcript.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-sm text-muted-foreground mb-2">
                              {formatDistanceToNow(new Date(transcript.created_at), { addSuffix: true })}
                            </CardTitle>
                            {transcript.summary && (
                              <p className="text-sm text-muted-foreground italic">
                                {transcript.summary}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transcript.id, 'transcript')}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {Array.isArray(transcript.transcript) && transcript.transcript.map((msg: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg ${
                                msg.role === 'user' 
                                  ? 'bg-primary/10 ml-8' 
                                  : 'bg-muted mr-8'
                              }`}
                            >
                              <p className="text-xs font-semibold mb-1">
                                {msg.role === 'user' ? 'You' : 'April'}
                              </p>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Text Rewrites Section */}
            {rewrites.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Text Messages
                </h2>
                <div className="space-y-4">
                  {rewrites.map((rewrite) => (
                    <Card key={rewrite.id} className="hover:shadow-lg transition-shadow animate-fade-in">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm text-muted-foreground mb-2">
                              {formatDistanceToNow(new Date(rewrite.created_at), { addSuffix: true })}
                            </CardTitle>
                            {rewrite.intent_summary && (
                              <p className="text-sm text-muted-foreground italic mb-2">
                                Intent: {rewrite.intent_summary}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(rewrite.raw_text)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(rewrite.id, 'rewrite')}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Original Text:</p>
                            <p className="text-sm leading-relaxed">{rewrite.raw_text}</p>
                          </div>

                          {(rewrite.environment || rewrite.inferred_env || 
                            rewrite.outcome || rewrite.inferred_outcome || 
                            rewrite.desired_emotion || rewrite.inferred_emotion) && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t">
                              {(rewrite.environment || rewrite.inferred_env) && (
                                <Badge variant="secondary" className="text-xs">
                                  {rewrite.environment || rewrite.inferred_env}
                                </Badge>
                              )}
                              {(rewrite.outcome || rewrite.inferred_outcome) && (
                                <Badge variant="secondary" className="text-xs">
                                  {rewrite.outcome || rewrite.inferred_outcome}
                                </Badge>
                              )}
                              {(rewrite.desired_emotion || rewrite.inferred_emotion) && (
                                <Badge variant="secondary" className="text-xs">
                                  {rewrite.desired_emotion || rewrite.inferred_emotion}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
