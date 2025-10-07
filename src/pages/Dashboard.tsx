import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Mic, BookOpen, LogOut, Menu, X, ArrowRight, Lightbulb, Shield } from "lucide-react";
import { EXAMPLES } from "@/components/ExamplesSection";
import { useToast } from "@/hooks/use-toast";
import VoiceConversation from "@/components/VoiceConversation";
import ImpactMethodDiagram from "@/components/ImpactMethodDiagram";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Badge } from "@/components/ui/badge";

interface ImpactStatement {
  id: string;
  raw_text: string;
  environment: string;
  outcome: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, dailyUsage, incrementUsage, canUseFeature } = useSubscription();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [impactStatements, setImpactStatements] = useState<ImpactStatement[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userText, setUserText] = useState("");
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [environment, setEnvironment] = useState<string>("");
  const [outcome, setOutcome] = useState<string>("");
  const [desiredEmotion, setDesiredEmotion] = useState<string>("");
  const FREE_USAGE_LIMIT = 10;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (!session?.user) {
        setAuthLoading(false);
        navigate('/auth');
        return;
      }
      
      // Check if user is admin
      console.log('Checking admin status for user:', session.user.id);
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      console.log('Admin check result:', { roles, roleError });
      
      if (roles) {
        console.log('User is admin!');
        setIsAdmin(true);
      } else {
        console.log('User is NOT admin');
      }
      
      setAuthLoading(false);
      loadImpactStatements(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadImpactStatements(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadImpactStatements = async (userId: string) => {
    const { data, error } = await supabase
      .from('rewrites')
      .select('id, raw_text, environment, outcome, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading impact statements:', error);
    } else {
      setImpactStatements(data || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleRewrite = async () => {
    if (!userText.trim()) {
      toast({
        title: "No input",
        description: "Please enter some text to rewrite",
        variant: "destructive",
      });
      return;
    }

    if (!canUseFeature) {
      toast({
        title: "Usage limit reached",
        description: `You've reached your daily limit of ${FREE_USAGE_LIMIT} rewrites. Upgrade to Pro for unlimited access.`,
        variant: "destructive",
      });
      return;
    }

    setRewriteLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rewrite', {
        body: {
          raw_text: userText,
          environment: environment || null,
          outcome: outcome || null,
          desired_emotion: desiredEmotion || null
        }
      });

      if (error) throw error;
      
      setResult(data);
      incrementUsage();
      
      if (user) {
        loadImpactStatements(user.id);
      }

      toast({
        title: "Success",
        description: "Your text has been rewritten with impact",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to rewrite text',
        variant: "destructive",
      });
    } finally {
      setRewriteLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* Sidebar - Bottom on mobile, Left on desktop */}
      <div className={`${sidebarOpen ? 'h-64 md:h-auto md:w-80' : 'h-0 md:w-0'} transition-all duration-300 order-2 md:order-1 border-t md:border-t-0 md:border-r border-border bg-card overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg">Impact Statements</h2>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {impactStatements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No impact statements yet. Start creating!
              </p>
            ) : (
              impactStatements.map((statement) => (
                <Card key={statement.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-3">
                    <p className="text-sm line-clamp-2 mb-2">{statement.raw_text}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {statement.environment}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {statement.outcome}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(statement.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              {subscribed ? 'Pro' : 'Free'} Plan
            </p>
            {!subscribed && (
              <p className="text-xs text-muted-foreground">
                {dailyUsage}/{FREE_USAGE_LIMIT} today
              </p>
            )}
          </div>
          {isAdmin && (
            <Button onClick={() => navigate('/admin')} variant="secondary" className="w-full mb-2" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          )}
          <Button onClick={handleSignOut} variant="outline" className="w-full" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col order-1 md:order-2">
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <div className="flex items-center">
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mr-4">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">Just Ask April</h1>
          </div>
          {isAdmin && (
            <Button onClick={() => navigate('/admin')} variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-6">
            {/* Welcome Message */}
            <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.email?.split('@')[0] || 'there'}! 👋
              </h2>
              <p className="text-muted-foreground">
                {subscribed 
                  ? "You're on the Pro plan with unlimited access to all features."
                  : `You have ${FREE_USAGE_LIMIT - dailyUsage} rewrites remaining today on your free plan.`
                }
              </p>
            </div>

            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 h-auto mb-6">
                <TabsTrigger value="chat" className="flex-col md:flex-row py-3 md:py-2">
                  <MessageSquare className="h-5 w-5 md:h-4 md:w-4 md:mr-2 mb-1 md:mb-0" />
                  <span className="text-xs md:text-sm">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex-col md:flex-row py-3 md:py-2">
                  <Mic className="h-5 w-5 md:h-4 md:w-4 md:mr-2 mb-1 md:mb-0" />
                  <span className="text-xs md:text-sm">Voice AI</span>
                </TabsTrigger>
                <TabsTrigger value="playbook" className="flex-col md:flex-row py-3 md:py-2">
                  <BookOpen className="h-5 w-5 md:h-4 md:w-4 md:mr-2 mb-1 md:mb-0" />
                  <span className="text-xs md:text-sm">Playbook</span>
                </TabsTrigger>
                <TabsTrigger value="examples" className="flex-col md:flex-row py-3 md:py-2">
                  <Lightbulb className="h-5 w-5 md:h-4 md:w-4 md:mr-2 mb-1 md:mb-0" />
                  <span className="text-xs md:text-sm">Examples</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Transform Your Message</h3>
                    <Textarea
                      placeholder="Type or paste what you want to say..."
                      value={userText}
                      onChange={(e) => setUserText(e.target.value)}
                      className="min-h-[150px] mb-4"
                    />
                    <Button 
                      onClick={handleRewrite}
                      disabled={rewriteLoading || !userText.trim()}
                      className="w-full"
                    >
                      {rewriteLoading ? "Rewriting..." : "Rewrite with Impact"}
                    </Button>
                  </CardContent>
                </Card>

                {result && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Impact Rewrites</h3>
                      <div className="space-y-4">
                        {result.rewrites?.map((rewrite: any, idx: number) => (
                          <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                            <p className="text-sm mb-2">{rewrite.text}</p>
                            <Badge variant="secondary">{rewrite.tone_label}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="voice">
                <VoiceConversation />
              </TabsContent>

              <TabsContent value="examples" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-semibold mb-2">Quick Example Cards</h3>
                    <p className="text-muted-foreground mb-6">
                      Browse real-world communication examples for instant inspiration
                    </p>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {EXAMPLES.map((example, index) => (
                        <Card key={index} className="bg-gradient-to-br from-card to-muted/20 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
                          <CardContent className="p-4 space-y-3">
                            {/* Category Badge */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {example.category}
                              </span>
                            </div>

                            {/* Before */}
                            <div className="space-y-1">
                              <div className="text-xs font-semibold text-muted-foreground">Before:</div>
                              <div className="text-sm text-foreground/80 italic">
                                "{example.before}"
                              </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex justify-center">
                              <ArrowRight className="h-4 w-4 text-accent" />
                            </div>

                            {/* After */}
                            <div className="space-y-1">
                              <div className="text-xs font-semibold text-accent">After:</div>
                              <div className="text-sm text-foreground font-medium">
                                "{example.after}"
                              </div>
                            </div>

                            {/* Outcome */}
                            <div className="pt-2 border-t border-border">
                              <div className="text-xs text-muted-foreground">
                                <span className="font-semibold">Impact:</span> {example.outcome}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="playbook" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-semibold mb-6">Say it better</h3>
                    <p className="text-muted-foreground mb-6">What do you want to say?</p>
                    
                    <Textarea
                      placeholder="Paste or type what you want to say..."
                      value={userText}
                      onChange={(e) => setUserText(e.target.value)}
                      className="min-h-[150px] mb-6"
                    />

                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="environment">Environment (optional)</Label>
                          <Select value={environment} onValueChange={setEnvironment}>
                            <SelectTrigger id="environment">
                              <SelectValue placeholder="Select environment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="social">Social</SelectItem>
                              <SelectItem value="family">Family</SelectItem>
                              <SelectItem value="formal">Formal</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="outcome">Desired Outcome (optional)</Label>
                          <Select value={outcome} onValueChange={setOutcome}>
                            <SelectTrigger id="outcome">
                              <SelectValue placeholder="Select outcome" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="persuade">Persuade</SelectItem>
                              <SelectItem value="inform">Inform</SelectItem>
                              <SelectItem value="inspire">Inspire</SelectItem>
                              <SelectItem value="connect">Connect</SelectItem>
                              <SelectItem value="resolve">Resolve</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emotion">Desired Emotion (optional)</Label>
                          <Select value={desiredEmotion} onValueChange={setDesiredEmotion}>
                            <SelectTrigger id="emotion">
                              <SelectValue placeholder="Select emotion" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confident">Confident</SelectItem>
                              <SelectItem value="empathetic">Empathetic</SelectItem>
                              <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                              <SelectItem value="calm">Calm</SelectItem>
                              <SelectItem value="assertive">Assertive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleRewrite}
                      disabled={rewriteLoading || !userText.trim()}
                      className="w-full"
                    >
                      {rewriteLoading ? "Rewriting..." : "Rewrite with Impact"}
                    </Button>
                  </CardContent>
                </Card>

                {result && (
                  <>
                    <Card className="border-accent/50">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Emotional Assessment</h3>
                        <div className="space-y-4">
                          {result.diagnostics?.current_emotional_tone && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Current Emotional Tone</p>
                              <p className="text-sm">{result.diagnostics.current_emotional_tone}</p>
                            </div>
                          )}
                          
                          {result.diagnostics?.intent_summary && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Your Intent</p>
                              <p className="text-sm">{result.diagnostics.intent_summary}</p>
                            </div>
                          )}

                          {result.diagnostics?.intent_alignment && (
                            <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                              <p className="text-sm font-medium text-accent mb-1">Intent Alignment</p>
                              <p className="text-sm">{result.diagnostics.intent_alignment}</p>
                            </div>
                          )}

                          {result.diagnostics?.emotional_impact && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Likely Emotional Impact</p>
                              <p className="text-sm">{result.diagnostics.emotional_impact}</p>
                            </div>
                          )}

                          {result.diagnostics?.resistance_factors && (
                            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                              <p className="text-sm font-medium text-destructive mb-1">Resistance Factors</p>
                              <p className="text-sm">{result.diagnostics.resistance_factors}</p>
                            </div>
                          )}

                          {result.diagnostics?.intention_question && (
                            <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                              <p className="text-sm font-medium text-primary mb-1">Reflection</p>
                              <p className="text-sm italic">{result.diagnostics.intention_question}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Impact Rewrites</h3>
                        <div className="space-y-4">
                          {result.rewrites?.map((rewrite: any, idx: number) => (
                            <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border">
                              <p className="text-sm mb-3">{rewrite.text}</p>
                              <Badge variant="secondary" className="mb-3">{rewrite.tone_label}</Badge>
                              {rewrite.rationale && (
                                <p className="text-xs text-muted-foreground italic mt-2">
                                  Why it works: {rewrite.rationale}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-6 text-center">The Impact Language Method™</h3>
                    <ImpactMethodDiagram />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
