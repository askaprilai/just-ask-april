import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Copy, ThumbsUp, ThumbsDown, Volume2, BarChart3, Mic, MessageSquare, Phone, ArrowRight, ChevronDown, Building2, Target, Smile, History as HistoryIcon, AlertCircle, RefreshCw, Shield, Users, Award, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExamplesSection } from "@/components/ExamplesSection";
import VoiceConversation from "@/components/VoiceConversation";
import aprilImage from "@/assets/april-headshot.jpeg";
import { MobileNav } from "@/components/MobileNav";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";

interface Rewrite {
  text: string;
  tone_label: string;
  pillars: {
    intent: string;
    message: string;
    position: string;
    action: string;
    calibration: string;
  };
  rationale: string;
  cautions: string;
}

interface RewriteResponse {
  inferred?: {
    environment?: string;
    outcome?: string;
    desired_emotion?: string;
  };
  diagnostics?: {
    intent_summary?: string;
  };
  rewrites: Rewrite[];
  rewrite_id?: string;
}

const ENVIRONMENTS = ["Corporate", "SmallBusiness", "Personal", "Relationship"];
const OUTCOMES = ["Resolve", "Motivate", "Align", "Clarify", "Inspire", "SetBoundary"];
const EMOTIONS = ["Heard", "Motivated", "Respected", "Accountable", "Reassured", "Understood"];

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, dailyUsage, incrementUsage, canUseFeature, productId } = useSubscription();
  const { trackEvent } = useAnalytics();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userText, setUserText] = useState("");
  const [environment, setEnvironment] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [result, setResult] = useState<RewriteResponse | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, boolean>>({});
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showTryItNow, setShowTryItNow] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const FREE_USAGE_LIMIT = 10;
  const PRO_PRODUCT_ID = 'prod_TB6tW8iBKEha8e';

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setAuthLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully",
    });
  };

  const handleExampleClick = (before: string, after: string) => {
    setUserText(before);
    setShowTryItNow(true);
    // Scroll to input field smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({
      title: "Example loaded",
      description: "Click the arrow to see April's suggestions",
    });
  };

  const handleRewrite = async () => {
    if (!userText.trim()) {
      toast({
        title: "Please enter some text",
        variant: "destructive",
      });
      return;
    }

    trackEvent('rewrite_submitted', {
      text_length: userText.length,
      has_environment: !!environment,
      has_outcome: !!outcome,
      has_emotion: !!emotion,
      is_authenticated: !!user,
    });

    // Handle free tries for non-authenticated users
    if (!user) {
      const freeTriesKey = 'april_free_tries';
      const triesUsed = parseInt(localStorage.getItem(freeTriesKey) || '0');
      
      if (triesUsed >= 3) {
        toast({
          title: "Free tries used up",
          description: "Create a free account to continue using April's rewriting features",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }
      
      // Increment free tries counter
      localStorage.setItem(freeTriesKey, String(triesUsed + 1));
      
      // Show remaining tries
      const remaining = 2 - triesUsed;
      if (remaining > 0) {
        toast({
          title: `${remaining} free ${remaining === 1 ? 'try' : 'tries'} remaining`,
          description: "Sign up for unlimited access",
        });
      }
    }

    // Hide the try it now badge when submitting
    setShowTryItNow(false);

    // Check usage limit for authenticated users
    if (user && !canUseFeature) {
      setShowUpgradeDialog(true);
      return;
    }

    setRewriteLoading(true);
    setResult(null);
    setFeedbackGiven({});
    setErrorState(null);

    try {
      const { data, error } = await supabase.functions.invoke('rewrite', {
        body: {
          user_text: userText,
          environment,
          outcome,
          desired_emotion: emotion,
          allow_infer: true,
        }
      });

      if (error) throw error;

      setResult(data);
      
      // Update chips with inferred values
      if (data.inferred?.environment && !environment) {
        setEnvironment(data.inferred.environment);
      }
      if (data.inferred?.outcome && !outcome) {
        setOutcome(data.inferred.outcome);
      }
      if (data.inferred?.desired_emotion && !emotion) {
        setEmotion(data.inferred.desired_emotion);
      }

      // Increment usage count
      incrementUsage();

    } catch (error: any) {
      console.error("Rewrite error:", error);
      const errorMessage = error.message || "Failed to generate rewrites";
      
      // Check if it's a daily limit error
      if (errorMessage.includes('daily_limit_reached') || errorMessage.includes('daily limit')) {
        setErrorState("Daily limit reached");
        toast({
          title: "Daily Limit Reached",
          description: "You've used all 5 free rewrites today. Upgrade to Pro for unlimited rewrites!",
          variant: "destructive",
          action: (
            <Button onClick={() => navigate('/pricing')} variant="outline" size="sm">
              Upgrade Now
            </Button>
          ),
        });
      } else {
        setErrorState(errorMessage);
        toast({
          title: "Something went wrong",
          description: "We couldn't process your request. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setRewriteLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    trackEvent('rewrite_copied', { text_length: text.length });
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Said better with Just Ask April",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try selecting and copying manually",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = async (helpful: boolean, index: number) => {
    if (!result?.rewrite_id) return;
    
    try {
      await supabase.functions.invoke('feedback', {
        body: {
          rewrite_id: result.rewrite_id,
          helpful,
          environment: result.inferred?.environment || environment,
          outcome: result.inferred?.outcome || outcome,
        }
      });

      setFeedbackGiven(prev => ({ ...prev, [index]: true }));
      
      toast({
        title: helpful ? "Thanks! Glad it helped." : "Thanks for the feedback.",
        description: "Your input makes April better.",
      });
    } catch (error) {
      console.error("Feedback error:", error);
    }
  };

  const handlePlayAudio = async (text: string, index: number) => {
    if (playingAudio === index) {
      setPlayingAudio(null);
      return;
    }

    setPlayingAudio(index);
    
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });

      if (error) throw error;

      const audioData = atob(data.audioContent);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        setPlayingAudio(null);
        URL.revokeObjectURL(url);
      };
      
      await audio.play();
    } catch (error: any) {
      console.error('Audio playback error:', error);
      setPlayingAudio(null);
      toast({
        title: "Audio unavailable",
        description: error.message || "Could not play audio",
        variant: "destructive",
      });
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserText(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Error",
        description: "Could not capture voice input",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const pillarColors = {
    intent: "bg-[#0A3D62] text-white",
    message: "bg-[#00B3A4] text-white",
    position: "bg-[#E77F00] text-white",
    action: "bg-[#FDB900] text-primary",
    calibration: "bg-[#5A67D8] text-white",
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-secondary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-accent/10 rounded-full blur-3xl -z-10" />
      
      <div className="container max-w-5xl mx-auto px-4 py-6 md:py-12 relative">
        {/* Hero Section */}
        <div className="text-center mb-6 md:mb-12 animate-fade-in">
          <div className="inline-block mb-2 md:mb-4 px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full border border-secondary/30">
            <p className="text-[10px] md:text-sm font-medium bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              The AI for Human Connection
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight px-4">
            Just Ask April
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground mb-2 md:mb-3 font-light px-4 leading-relaxed">Say it better. Get better results.</p>
          <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4 px-4">
            Grammarly fixes your grammar. April fixes your impact.
          </p>
          
          {/* Quick Benefits */}
          <div className="flex flex-wrap gap-3 md:gap-4 justify-center mb-4 md:mb-6 px-4">
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>3 free tries - no signup</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>10 free daily rewrites</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span>Unlimited with Pro</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-3 justify-center flex-wrap items-center">
            <Button variant="outline" size="sm" onClick={() => navigate('/about')} className="hover:scale-105 transition-transform">
              About April
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              trackEvent('pricing_clicked', { source: 'header' });
              navigate('/pricing');
            }} className="hover:scale-105 transition-transform">
              Pricing
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/stats')} className="hover:scale-105 transition-transform">
              <BarChart3 className="mr-2 h-4 w-4" />
              Impact Index
            </Button>
            {user && (
              <Button variant="outline" size="sm" onClick={() => navigate('/history')} className="hover:scale-105 transition-transform">
                <HistoryIcon className="mr-2 h-4 w-4" />
                History
              </Button>
            )}
            {user && subscribed && productId === PRO_PRODUCT_ID && (
              <Button variant="outline" size="sm" onClick={() => navigate('/analytics')} className="hover:scale-105 transition-transform border-secondary/30">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/privacy')}>
              Privacy
            </Button>
            {user && (
              <Button variant="outline" size="sm" onClick={handleSignOut} className="hover:scale-105 transition-transform">
                Sign Out
              </Button>
            )}
            {user ? (
              subscribed && productId === PRO_PRODUCT_ID ? (
                <Badge className="bg-gradient-to-r from-secondary to-accent text-white">
                  Pro Plan ✨
                </Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {dailyUsage}/{FREE_USAGE_LIMIT} today
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      trackEvent('upgrade_clicked', { source: 'header', daily_usage: dailyUsage });
                      navigate('/pricing');
                    }}
                    className="hover:scale-105 transition-transform"
                  >
                    Upgrade to Pro
                  </Button>
                </div>
              )
            ) : null}
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-center">
            <MobileNav user={user} />
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="text" className="mb-4 md:mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-8 h-14 md:h-11">
            <TabsTrigger value="text" className="text-xs md:text-base h-full">
              <MessageSquare className="mr-1 md:mr-2 h-4 w-4" />
              Say it better
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs md:text-base h-full">
              <Phone className="mr-1 md:mr-2 h-4 w-4" />
              Practice Live
            </TabsTrigger>
          </TabsList>

          {/* Text Rewrite Tab */}
          <TabsContent value="text" className="space-y-4 md:space-y-8">
            {/* Input Section with Heading */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                How do I say it better?
              </h2>
              
              <div className="relative animate-scale-in">
                <div className="relative rounded-2xl border-2 border-border bg-white dark:bg-white shadow-xl">
                  <Textarea
                    placeholder="What do you want to say? Let April audit your communication and show you how it could land better."
                    value={userText}
                    onChange={(e) => setUserText(e.target.value.slice(0, 1500))}
                    className="min-h-[140px] md:min-h-[120px] text-sm md:text-base leading-relaxed border-0 rounded-2xl pr-24 md:pr-28 pb-14 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white dark:bg-white text-foreground placeholder:text-muted-foreground"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && userText.trim()) {
                        handleRewrite();
                      }
                    }}
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {userText.length}/1500
                    </span>
                    <div className="flex items-center gap-2">
                      {showTryItNow && (
                        <Badge className="bg-secondary text-white animate-fade-in animate-pulse shadow-lg">
                          Try it now →
                        </Badge>
                      )}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={handleVoiceInput}
                        disabled={isListening}
                        className="h-9 w-9 hover:bg-muted"
                        title="Voice input"
                      >
                        <Mic className={`h-4 w-4 ${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button 
                        onClick={handleRewrite} 
                        disabled={rewriteLoading || !userText.trim()}
                        size="icon"
                        className={`h-9 w-9 bg-foreground hover:bg-foreground/90 text-background rounded-lg ${showTryItNow ? 'ring-2 ring-secondary ring-offset-2' : ''}`}
                        title="Send (⌘/Ctrl + Enter)"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {isListening && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs text-destructive animate-pulse font-medium">
                        Listening...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Settings - Collapsible */}
              <div className="mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="w-full justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {subscribed && productId === PRO_PRODUCT_ID ? 'Pro Options' : 'Optional: Fine-tune your message'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAdvancedOptions ? 'rotate-180' : ''}`} />
                </Button>
                
                <div className={`overflow-hidden transition-all duration-300 ${showAdvancedOptions ? 'max-h-[800px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                  <Card className="shadow-sm border-secondary/20">
                    <CardContent className="pt-5 md:pt-6 px-3 md:px-6">
                      <div className="space-y-4 md:space-y-5">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-4 w-4 text-secondary" />
                            <p className="text-xs md:text-sm font-semibold text-foreground">Environment</p>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">Where will this be said?</p>
                          <div className="flex flex-wrap gap-2">
                            {ENVIRONMENTS.map(env => (
                              <Badge
                                key={env}
                                variant={environment === env ? "default" : "outline"}
                                className="cursor-pointer text-xs md:text-sm h-9 md:h-8 px-3 touch-manipulation hover:scale-105 transition-transform"
                                onClick={() => setEnvironment(environment === env ? null : env)}
                              >
                                {env}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-secondary" />
                            <p className="text-xs md:text-sm font-semibold text-foreground">Outcome</p>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">What do you want to achieve?</p>
                          <div className="flex flex-wrap gap-2">
                            {OUTCOMES.map(out => (
                              <Badge
                                key={out}
                                variant={outcome === out ? "default" : "outline"}
                                className="cursor-pointer text-xs md:text-sm h-9 md:h-8 px-3 touch-manipulation hover:scale-105 transition-transform"
                                onClick={() => setOutcome(outcome === out ? null : out)}
                              >
                                {out}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Smile className="h-4 w-4 text-secondary" />
                            <p className="text-xs md:text-sm font-semibold text-foreground">Desired Emotion</p>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">How do you want them to feel?</p>
                          <div className="flex flex-wrap gap-2">
                            {EMOTIONS.map(emo => (
                              <Badge
                                key={emo}
                                variant={emotion === emo ? "default" : "outline"}
                                className="cursor-pointer text-xs md:text-sm h-9 md:h-8 px-3 touch-manipulation hover:scale-105 transition-transform"
                                onClick={() => setEmotion(emotion === emo ? null : emo)}
                              >
                                {emo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Examples Section - Now below the input */}
            {!result && !rewriteLoading && <ExamplesSection />}

            {/* Social Proof Section */}
            {!result && !rewriteLoading && (
              <section className="mt-12 md:mt-16 space-y-6">
                <h3 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">Why People Love April</h3>
                <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-secondary text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-3">"This changed how I communicate at work. My messages are clearer and get better responses."</p>
                    <p className="text-xs md:text-sm font-medium text-foreground">— Sarah M., Product Manager</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-secondary text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-3">"Finally, a tool that actually helps me say what I mean without sounding harsh or unclear."</p>
                    <p className="text-xs md:text-sm font-medium text-foreground">— James L., Team Lead</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-secondary text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-3">"The voice practice feature helped me prepare for difficult conversations. Game changer!"</p>
                    <p className="text-xs md:text-sm font-medium text-foreground">— Maria K., Sales Director</p>
                  </div>
                </div>
              </section>
            )}

            {/* Benefits Section */}
            {!result && !rewriteLoading && (
              <section className="mt-12 md:mt-16 space-y-6">
                <h3 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">Built on Proven Communication Principles</h3>
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <div className="border border-border rounded-xl p-4 md:p-6 hover:border-secondary/50 transition-colors">
                    <h4 className="font-semibold text-base md:text-lg mb-2">
                      Impact Language Method™
                    </h4>
                    <p className="text-sm md:text-base text-muted-foreground">Based on 5 core communication pillars that drive real results in professional and personal settings.</p>
                  </div>
                  <div className="border border-border rounded-xl p-4 md:p-6 hover:border-secondary/50 transition-colors">
                    <h4 className="font-semibold text-base md:text-lg mb-2">
                      Context-Aware Suggestions
                    </h4>
                    <p className="text-sm md:text-base text-muted-foreground">Get rewrites tailored to your specific situation, desired outcome, and emotional tone.</p>
                  </div>
                  <div className="border border-border rounded-xl p-4 md:p-6 hover:border-secondary/50 transition-colors">
                    <h4 className="font-semibold text-base md:text-lg mb-2">
                      Instant Results
                    </h4>
                    <p className="text-sm md:text-base text-muted-foreground">No more staring at blank screens. Get 3 professional alternatives in seconds.</p>
                  </div>
                  <div className="border border-border rounded-xl p-4 md:p-6 hover:border-secondary/50 transition-colors">
                    <h4 className="font-semibold text-base md:text-lg mb-2">
                      Practice Mode
                    </h4>
                    <p className="text-sm md:text-base text-muted-foreground">Rehearse difficult conversations with AI feedback before the real thing.</p>
                  </div>
                </div>
              </section>
            )}

            {/* FAQ Section */}
            {!result && !rewriteLoading && (
              <section className="mt-12 md:mt-16 space-y-6">
                <h3 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">Frequently Asked Questions</h3>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  <AccordionItem value="item-1" className="border border-border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">How does April help me communicate better?</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      April uses the proven Impact Language Method™ to transform your messages into clear, confident communication. Simply type what you want to say, and April provides 3 professionally crafted alternatives tailored to your situation, tone, and desired outcome.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border border-border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">Is my information private and secure?</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Absolutely. Your messages are processed securely and never shared with third parties. We use enterprise-grade encryption to protect your data, and you can delete your history at any time.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="border border-border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">What's included in the free version?</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      The free version includes 10 Impact Statement rewrites per month across all categories. It's perfect for trying out April and handling occasional communication needs.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" className="border border-border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">Can I cancel my Pro subscription anytime?</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Yes! Pro subscriptions are $20/month with no long-term commitment. Cancel anytime from your account settings, and you'll retain access until the end of your billing period.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" className="border border-border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">What makes April different from other AI writing tools?</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      April is specifically designed for communication, not general content writing. It's built on 20+ years of professional communication expertise and the Impact Language Method™, focusing on real-world conversations, emails, and messages that need to land just right.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Final CTA */}
                <Card className="bg-gradient-to-r from-secondary/10 to-accent/10 border-secondary/20 mt-8">
                  <CardContent className="p-6 md:p-8 text-center">
                    <h4 className="text-xl md:text-2xl font-bold mb-3">Ready to communicate with confidence?</h4>
                    <p className="text-muted-foreground mb-6">Join thousands who've transformed their communication with April</p>
                    <Button 
                      size="lg" 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white gap-2"
                    >
                      Get Started Free
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </section>
            )}
          </TabsContent>

          {/* Voice Practice Tab */}
          <TabsContent value="voice">
            <VoiceConversation />
          </TabsContent>
        </Tabs>

        {/* Loading State */}
        {rewriteLoading && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-secondary">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <p className="text-sm font-medium">April is analyzing your message...</p>
              </div>
            </div>
            
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-secondary/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-20 w-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {errorState && !rewriteLoading && (
          <Card className="border-destructive/50 bg-destructive/5 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-1" />
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Something went wrong</h3>
                    <p className="text-sm text-muted-foreground">{errorState}</p>
                  </div>
                  <Button
                    onClick={handleRewrite}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Original Text Display */}
        {result && (
          <div className="mb-4 md:mb-8 space-y-3 md:space-y-4 animate-fade-in">
            <div className="p-4 md:p-6 bg-muted/30 rounded-lg md:rounded-2xl border border-border/50">
              <p className="text-[10px] md:text-xs font-semibold text-muted-foreground mb-2 md:mb-3 uppercase tracking-wide flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground"></span>
                What You Said
              </p>
              <p className="text-sm md:text-base text-foreground leading-relaxed italic">&ldquo;{userText}&rdquo;</p>
            </div>

            {/* Intent Summary */}
            {result.diagnostics?.intent_summary && (
              <div className="p-4 md:p-6 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg md:rounded-2xl border border-secondary/30 shadow-lg backdrop-blur-sm">
                <p className="text-[10px] md:text-sm font-semibold text-secondary mb-2 uppercase tracking-wide">April&apos;s Analysis</p>
                <p className="text-sm md:text-lg text-foreground leading-relaxed">{result.diagnostics.intent_summary}</p>
              </div>
            )}

            <div className="text-center py-2 md:py-3">
              <p className="text-[10px] md:text-sm font-semibold text-secondary uppercase tracking-wide flex items-center justify-center gap-2">
                <span className="inline-block w-6 md:w-8 h-px bg-gradient-to-r from-transparent via-secondary to-transparent"></span>
                April&apos;s Suggestions
                <span className="inline-block w-6 md:w-8 h-px bg-gradient-to-r from-transparent via-secondary to-transparent"></span>
              </p>
            </div>
          </div>
        )}

        {/* Rewrites */}
        {result?.rewrites && (
          <div className="space-y-4 md:space-y-6">
            {result.rewrites.map((rewrite, index) => (
              <Card key={index} className="overflow-hidden shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.1)] hover:shadow-[0_20px_50px_-10px_hsl(var(--secondary)/0.2)] transition-all duration-300 md:hover:scale-[1.02] border-secondary/20 backdrop-blur-sm animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-4 md:p-6">
                  {/* Tone Label */}
                  <div className="flex items-center justify-between mb-4 md:mb-4">
                    <Badge variant="secondary" className="text-xs md:text-base px-3 md:px-3 py-1 md:py-1">
                      {rewrite.tone_label}
                    </Badge>
                  </div>

                  {/* Rewrite Text */}
                  <p className="text-base md:text-lg mb-4 md:mb-4 leading-relaxed">{rewrite.text}</p>

                  {/* Pillars */}
                  <div className="space-y-2.5 md:space-y-2 mb-4 md:mb-4">
                    {Object.entries(rewrite.pillars).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2.5 md:gap-2">
                        <Badge 
                          className={`${pillarColors[key as keyof typeof pillarColors]} shrink-0 uppercase text-[10px] md:text-xs`}
                        >
                          {key}
                        </Badge>
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Rationale */}
                  <div className="mb-4 md:mb-4 p-3 md:p-3 bg-muted/50 rounded-lg md:rounded-md">
                    <p className="text-xs md:text-sm font-semibold text-secondary mb-1.5 md:mb-1">Why it works:</p>
                    <p className="text-xs md:text-sm leading-relaxed">{rewrite.rationale}</p>
                  </div>

                  {/* Cautions */}
                  {rewrite.cautions && (
                    <div className="mb-4 md:mb-4 p-3 md:p-3 bg-accent/10 rounded-lg md:rounded-md border border-accent/20">
                      <p className="text-xs md:text-sm font-semibold text-accent-foreground mb-1.5 md:mb-1">⚠️ Cautions:</p>
                      <p className="text-xs md:text-sm leading-relaxed">{rewrite.cautions}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2.5 md:gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopy(rewrite.text)}
                      className="w-full sm:w-auto h-11 md:h-9 touch-manipulation text-sm"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePlayAudio(rewrite.text, index)}
                      disabled={playingAudio !== null && playingAudio !== index}
                      className="w-full sm:w-auto h-11 md:h-9 touch-manipulation text-sm"
                    >
                      <Volume2 className={`mr-2 h-4 w-4 ${playingAudio === index ? 'animate-pulse' : ''}`} />
                      {playingAudio === index ? 'Playing...' : 'Hear it'}
                    </Button>
                    {!feedbackGiven[index] && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFeedback(true, index)}
                          className="w-full sm:w-auto h-11 md:h-9 touch-manipulation text-sm"
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Helpful
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFeedback(false, index)}
                          className="w-full sm:w-auto h-10 md:h-9"
                        >
                          <ThumbsDown className="mr-2 h-4 w-4" />
                          Not Helpful
                        </Button>
                      </>
                    )}
                    {feedbackGiven[index] && (
                      <Badge variant="secondary" className="w-full sm:w-auto sm:ml-auto text-center">
                        Thanks for feedback!
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 md:mt-20 py-8 md:py-12 border-t border-border/40 bg-muted/20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-6 md:mb-8">
              <p className="text-lg md:text-xl font-medium bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
                When in doubt, just ask April
              </p>
              <p className="text-sm md:text-base text-muted-foreground">
                Professional communication coaching powered by AI
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
              <div>
                <h4 className="font-semibold text-sm mb-3">Product</h4>
                <div className="space-y-2">
                  <button onClick={() => navigate('/about')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About April</button>
                  <button onClick={() => navigate('/pricing')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
                  <button onClick={() => navigate('/stats')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Impact Index</button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Legal</h4>
                <div className="space-y-2">
                  <button onClick={() => navigate('/privacy')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Learn More</h4>
                <div className="space-y-2">
                  <a 
                    href="https://aprilsabral.newzenler.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Online Courses
                  </a>
                </div>
              </div>
            </div>
            
            <div className="text-center pt-6 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                © 2025 Just Ask April. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {!user ? "You've used all 10 free fine-tunes! 🎉" : "Daily Limit Reached 🎉"}
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              {!user ? (
                <>
                  <p>
                    Ready to keep improving your communication? Sign in to get 10 fine-tunes per day.
                  </p>
                  <p className="text-sm">
                    Or upgrade to Pro for unlimited fine-tunes, save your history, and unlock advanced features.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    You've reached your daily limit of {FREE_USAGE_LIMIT} fine-tunes.
                  </p>
                  <p className="text-sm">
                    Upgrade to Pro for unlimited fine-tunes, advanced tone control, custom environments, and more!
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
              className="w-full sm:w-auto"
            >
              Maybe later
            </Button>
            {!user ? (
              <Button
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto bg-gradient-to-r from-secondary to-accent"
              >
                Sign in to continue
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/pricing')}
                className="w-full sm:w-auto bg-gradient-to-r from-secondary to-accent"
              >
                Upgrade to Pro
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;