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
import { MessageSquare, Mic, BookOpen, LogOut, Menu, X, ArrowRight, Lightbulb, Shield, TrendingUp, Award, Target, TrendingDown, User as UserIcon } from "lucide-react";
import { EXAMPLES } from "@/components/ExamplesSection";
import { useToast } from "@/hooks/use-toast";
import VoiceConversation from "@/components/VoiceConversation";
import ImpactMethodDiagram from "@/components/ImpactMethodDiagram";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Badge } from "@/components/ui/badge";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ImpactStatement {
  id: string;
  raw_text: string;
  environment: string;
  outcome: string;
  created_at: string;
}

interface ImpactStats {
  [key: string]: {
    total: number;
    helpful: number;
    rate: number;
  };
}

interface TopRewrite {
  id: string;
  raw_text: string;
  environment: string;
  outcome: string;
  inferred_emotion?: string;
  desired_emotion?: string;
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
  const FREE_PLAYBOOK_LIMIT = 2;
  const [playbookUsage, setPlaybookUsage] = useState(0);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [impactIndex, setImpactIndex] = useState<number | null>(null);
  const [detailedStats, setDetailedStats] = useState<ImpactStats>({});
  const [topRewrites, setTopRewrites] = useState<TopRewrite[]>([]);
  const [weekComparison, setWeekComparison] = useState<{ thisWeek: number; lastWeek: number; change: number } | null>(null);
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (!session?.user) {
        setAuthLoading(false);
        navigate('/auth');
        return;
      }
      
      // Load playbook usage
      const today = new Date().toISOString().split('T')[0];
      const playbookKey = `playbook_${session.user.id}_${today}`;
      const storedPlaybook = localStorage.getItem(playbookKey);
      setPlaybookUsage(storedPlaybook ? parseInt(storedPlaybook, 10) : 0);
      
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

    // Load impact index and detailed stats
    const { data: feedbackData } = await supabase
      .from('feedback')
      .select('helpful')
      .eq('user_id', userId);

    if (feedbackData && feedbackData.length > 0) {
      const helpfulCount = feedbackData.filter(f => f.helpful).length;
      const totalCount = feedbackData.length;
      const index = Math.round((helpfulCount / totalCount) * 100);
      setImpactIndex(index);
    }

    // Calculate week comparison
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const { data: thisWeekFeedback } = await supabase
      .from('feedback')
      .select('helpful')
      .eq('user_id', userId)
      .gte('created_at', oneWeekAgo.toISOString());

    const { data: lastWeekFeedback } = await supabase
      .from('feedback')
      .select('helpful')
      .eq('user_id', userId)
      .gte('created_at', twoWeeksAgo.toISOString())
      .lt('created_at', oneWeekAgo.toISOString());

    if (thisWeekFeedback && thisWeekFeedback.length > 0) {
      const thisWeekRate = Math.round(
        (thisWeekFeedback.filter(f => f.helpful).length / thisWeekFeedback.length) * 100
      );
      
      let lastWeekRate = 0;
      if (lastWeekFeedback && lastWeekFeedback.length > 0) {
        lastWeekRate = Math.round(
          (lastWeekFeedback.filter(f => f.helpful).length / lastWeekFeedback.length) * 100
        );
      }

      setWeekComparison({
        thisWeek: thisWeekRate,
        lastWeek: lastWeekRate,
        change: thisWeekRate - lastWeekRate
      });
    }

    // Load detailed stats from edge function
    try {
      const { data: statsData, error: statsError } = await supabase.functions.invoke('impact-index');
      if (!statsError && statsData) {
        setDetailedStats(statsData.stats || {});
        setTopRewrites(statsData.topRewrites || []);
      }
    } catch (err) {
      console.error('Error loading detailed stats:', err);
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

    // Check playbook usage limit for free users (only in playbook tab)
    if (activeTab === "playbook" && !subscribed && playbookUsage >= FREE_PLAYBOOK_LIMIT) {
      setShowUpgradeDialog(true);
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
      
      // Increment playbook usage if in playbook tab
      if (activeTab === "playbook" && !subscribed && user) {
        const today = new Date().toISOString().split('T')[0];
        const playbookKey = `playbook_${user.id}_${today}`;
        const newPlaybookUsage = playbookUsage + 1;
        setPlaybookUsage(newPlaybookUsage);
        localStorage.setItem(playbookKey, newPlaybookUsage.toString());
      }
      
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
          {impactIndex !== null && (
            <div className="mb-4 p-3 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Your Impact Index</span>
                <span className="text-2xl font-bold text-primary">{impactIndex}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-500"
                  style={{ width: `${impactIndex}%` }}
                />
              </div>
            </div>
          )}
          
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
        <div className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card">
          <div className="flex items-center">
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mr-2 md:mr-4">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-lg md:text-xl font-semibold">Just Ask April</h1>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <ThemeToggle />
            {isAdmin && (
              <Button onClick={() => navigate('/admin')} variant="outline" size="sm" className="hidden md:flex">
                <Shield className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              size="sm"
              className="border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
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

            {/* Impact Index Card */}
            {impactIndex !== null && (
              <Card className="mb-8 bg-gradient-to-br from-secondary/10 to-accent/10 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Your Impact Index</h3>
                      <p className="text-sm text-muted-foreground">
                        Success rate across all your communications
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary">{impactIndex}%</div>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-500"
                      style={{ width: `${impactIndex}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {impactIndex >= 90 ? "Exceptional! Your communication is consistently hitting the mark." :
                     impactIndex >= 75 ? "Great work! You're mastering the Impact Language Method." :
                     impactIndex >= 60 ? "Good progress. Keep refining your approach." :
                     "Every conversation is a learning opportunity. Keep practicing!"}
                  </p>
                </CardContent>
              </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 h-auto mb-6">
                <TabsTrigger value="chat" className="flex-col md:flex-row py-3 md:py-2">
                  <MessageSquare className="h-5 w-5 md:h-4 md:w-4 md:mr-2 mb-1 md:mb-0" />
                  <span className="text-xs md:text-sm">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex-col md:flex-row py-3 md:py-2">
                  <Mic className="h-5 w-5 md:h-4 md:w-4 md:mr-2 mb-1 md:mb-0" />
                  <span className="text-xs md:text-sm">Voice AI</span>
                </TabsTrigger>
                <TabsTrigger value="playbook" className="flex-col md:flex-row py-3 md:py-2 relative">
                  <BookOpen className="h-5 w-5 md:h-4 md:w-4 md:mr-2 mb-1 md:mb-0" />
                  <span className="text-xs md:text-sm">Playbook</span>
                  {!subscribed && (
                    <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 h-4 border-accent/30 text-accent">
                      PRO
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="examples" className="flex-col md:flex-row py-3 md:py-2">
                  <Lightbulb className="h-5 w-5 md:h-4 md:w-4 md:mr-2 mb-1 md:mb-0" />
                  <span className="text-xs md:text-sm">Examples</span>
                </TabsTrigger>
                <TabsTrigger value="mystats" className="flex-col md:flex-row py-3 md:py-2">
                  <TrendingUp className="h-5 w-5 md:h-4 md:w-4 md:mr-2 mb-1 md:mb-0" />
                  <span className="text-xs md:text-sm">My Stats</span>
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
                      className="w-full touch-manipulation"
                      type="button"
                    >
                      {rewriteLoading ? "Optimizing..." : "Say it Better"}
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

                {/* Chat History */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Impact Statements</h3>
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="voice">
                <VoiceConversation />
              </TabsContent>

              <TabsContent value="examples" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-semibold mb-2">Quick Example Cards</h3>
                      <p className="text-muted-foreground mb-3">
                        {subscribed 
                          ? "100 fresh examples added weekly" 
                          : "5 examples available this week • Pro users get 100 weekly"}
                      </p>
                      {!subscribed && (
                        <Button 
                          onClick={() => setShowUpgradeDialog(true)}
                          size="sm"
                          className="bg-gradient-to-r from-secondary to-accent text-white"
                        >
                          Upgrade for 100 Weekly
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {EXAMPLES.map((example, index) => {
                        const isLocked = !subscribed && index >= 5;
                        return (
                        <Card 
                          key={index} 
                          className={`bg-gradient-to-br from-card to-muted/20 border-primary/20 transition-all ${
                            isLocked 
                              ? 'opacity-40 cursor-not-allowed' 
                              : 'hover:border-primary/40 hover:shadow-lg'
                          }`}
                        >
                          <CardContent className="p-4 space-y-3 relative">
                            {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg z-10">
                                <Button 
                                  onClick={() => setShowUpgradeDialog(true)}
                                  size="sm"
                                  variant="secondary"
                                  className="bg-gradient-to-r from-secondary to-accent text-white"
                                >
                                  Unlock with Pro
                                </Button>
                              </div>
                            )}
                            
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
                      );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="playbook" className="space-y-6" data-state="active" data-value="playbook">
                {!subscribed && (
                  <Card className="bg-gradient-to-r from-secondary/10 to-accent/10 border-accent/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold mb-1">Impact Playbook - Pro Feature</p>
                          <p className="text-sm text-muted-foreground">
                            {playbookUsage}/{FREE_PLAYBOOK_LIMIT} free uses remaining today
                          </p>
                        </div>
                        <Button 
                          onClick={() => setShowUpgradeDialog(true)}
                          size="sm"
                          className="bg-gradient-to-r from-secondary to-accent text-white"
                        >
                          Upgrade to Pro
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
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
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                              <SelectItem value="academic">Academic</SelectItem>
                              <SelectItem value="romantic">Romantic</SelectItem>
                              <SelectItem value="public">Public Speaking</SelectItem>
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
                              <SelectItem value="motivate">Motivate</SelectItem>
                              <SelectItem value="negotiate">Negotiate</SelectItem>
                              <SelectItem value="apologize">Apologize</SelectItem>
                              <SelectItem value="thank">Thank</SelectItem>
                              <SelectItem value="request">Request</SelectItem>
                              <SelectItem value="decline">Decline</SelectItem>
                              <SelectItem value="celebrate">Celebrate</SelectItem>
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
                              <SelectItem value="warm">Warm</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="grateful">Grateful</SelectItem>
                              <SelectItem value="respectful">Respectful</SelectItem>
                              <SelectItem value="optimistic">Optimistic</SelectItem>
                              <SelectItem value="understanding">Understanding</SelectItem>
                              <SelectItem value="determined">Determined</SelectItem>
                              <SelectItem value="compassionate">Compassionate</SelectItem>
                              <SelectItem value="excited">Excited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleRewrite}
                      disabled={rewriteLoading || !userText.trim()}
                      className="w-full touch-manipulation"
                      type="button"
                    >
                      {rewriteLoading ? "Optimizing..." : "Say it Better"}
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

              <TabsContent value="mystats" className="space-y-6">
                {/* Impact Language Method Training - Featured at Top */}
                <Card className="bg-gradient-to-br from-[#FDB900]/10 to-[#E77F00]/10 border-2 border-[#FDB900]">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold mb-2">The Impact Language Method™</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Master these 5 pillars to transform your communication
                      </p>
                    </div>
                    <ImpactMethodDiagram />
                  </CardContent>
                </Card>

                {/* Week Comparison */}
                {weekComparison && (
                  <Card className="bg-gradient-to-r from-secondary/10 to-accent/10 border-accent/30">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Week-over-Week Progress</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">This Week</p>
                          <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-primary">{weekComparison.thisWeek}%</span>
                            <div className={`flex items-center gap-1 text-sm font-medium ${
                              weekComparison.change > 0 ? 'text-green-600' : 
                              weekComparison.change < 0 ? 'text-red-600' : 
                              'text-muted-foreground'
                            }`}>
                              {weekComparison.change > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : weekComparison.change < 0 ? (
                                <TrendingDown className="h-4 w-4" />
                              ) : null}
                              {weekComparison.change > 0 ? '+' : ''}{weekComparison.change}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-2">Last Week</p>
                          <p className="text-2xl font-semibold text-muted-foreground">{weekComparison.lastWeek}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        {weekComparison.change > 0 
                          ? `Great progress! You're ${weekComparison.change}% more effective this week.`
                          : weekComparison.change < 0
                          ? `Keep practicing. Every conversation is a learning opportunity.`
                          : `Consistent performance. Keep up the good work!`
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Detailed Performance Stats */}
                {Object.keys(detailedStats).length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Performance by Context</h3>
                      <div className="space-y-4">
                        {Object.entries(detailedStats)
                          .sort((a, b) => b[1].rate - a[1].rate)
                          .map(([key, data]) => {
                            const [environment, outcome] = key.split('_');
                            const isHighPerformance = data.rate >= 85;
                            
                            return (
                              <div key={key} className={`p-4 rounded-lg border ${isHighPerformance ? "border-primary/50 bg-primary/5" : "border-border"}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold capitalize">
                                      {environment} · {outcome}
                                    </h4>
                                    {isHighPerformance && <Award className="h-4 w-4 text-primary" />}
                                  </div>
                                  <span className="text-xl font-bold text-primary">{data.rate}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden mb-2">
                                  <div 
                                    className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-500"
                                    style={{ width: `${data.rate}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{data.helpful} helpful of {data.total} uses</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Impact Statements */}
                {topRewrites.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Your Top Impact Statements</h3>
                      <div className="space-y-3">
                        {topRewrites.map((rewrite) => (
                          <div key={rewrite.id} className="p-3 bg-muted/30 rounded-lg border border-border">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex gap-2 text-xs">
                                <Badge variant="outline">{rewrite.environment}</Badge>
                                <Badge variant="outline">{rewrite.outcome}</Badge>
                              </div>
                              <Award className="h-4 w-4 text-primary flex-shrink-0" />
                            </div>
                            <p className="text-sm">"{rewrite.raw_text}"</p>
                            {(rewrite.inferred_emotion || rewrite.desired_emotion) && (
                              <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                                {rewrite.inferred_emotion && <span>From: {rewrite.inferred_emotion}</span>}
                                {rewrite.desired_emotion && (
                                  <>
                                    <span>→</span>
                                    <span className="text-primary">To: {rewrite.desired_emotion}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <UpgradeDialog 
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        feature="the Impact Playbook"
      />
    </div>
  );
};

export default Dashboard;
