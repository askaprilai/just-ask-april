import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Copy, ThumbsUp, ThumbsDown, Volume2, BarChart3, Mic, MessageSquare, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExamplesSection } from "@/components/ExamplesSection";
import VoiceConversation from "@/components/VoiceConversation";
import aprilImage from "@/assets/april-headshot.jpeg";
import { MobileNav } from "@/components/MobileNav";

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
  const [userText, setUserText] = useState("");
  const [environment, setEnvironment] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RewriteResponse | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, boolean>>({});
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleRewrite = async () => {
    if (!userText.trim()) {
      toast({
        title: "Please enter some text",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setFeedbackGiven({});

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

    } catch (error: any) {
      console.error("Rewrite error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate rewrites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Said better with Just Ask April",
    });
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-secondary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-accent/10 rounded-full blur-3xl -z-10" />
      
      <div className="container max-w-5xl mx-auto px-4 py-6 md:py-12 relative">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="inline-block mb-3 md:mb-4 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full border border-secondary/30">
            <p className="text-xs md:text-sm font-medium bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              The AI for Human Connection
            </p>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight px-2">
            Just Ask April
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4 md:mb-6 font-light px-2">Say it better. Get better results.</p>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-3 justify-center flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate('/about')} className="hover:scale-105 transition-transform">
              About April
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/pricing')} className="hover:scale-105 transition-transform">
              Pricing
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/stats')} className="hover:scale-105 transition-transform">
              <BarChart3 className="mr-2 h-4 w-4" />
              Impact Index
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/privacy')}>
              Privacy
            </Button>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-center">
            <MobileNav />
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="text" className="mb-6 md:mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6 md:mb-8 h-12 md:h-11">
            <TabsTrigger value="text" className="text-sm md:text-base h-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Say it better
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-sm md:text-base h-full">
              <Phone className="mr-2 h-4 w-4" />
              Practice Live
            </TabsTrigger>
          </TabsList>

          {/* Text Rewrite Tab */}
          <TabsContent value="text" className="space-y-6 md:space-y-8">
            {/* Examples Section */}
            {!result && <ExamplesSection />}

            {/* Input Section */}
            <Card className="shadow-[0_10px_40px_-10px_hsl(var(--secondary)/0.15)] border-secondary/20 backdrop-blur-sm animate-scale-in">
              <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
                <div className="relative">
                  <Textarea
                    placeholder="Paste what you'd normally say... even if you think it's fine. Let April audit your communication and show you how it could land better."
                    value={userText}
                    onChange={(e) => setUserText(e.target.value.slice(0, 1500))}
                    className="min-h-[100px] md:min-h-[120px] mb-2 text-sm md:text-base pr-12 md:pr-14"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleVoiceInput}
                    disabled={isListening}
                    className="absolute right-2 top-2 hover:bg-secondary/20 h-10 w-10 md:h-11 md:w-11"
                    title="Voice input"
                  >
                    <Mic className={`h-4 w-4 md:h-5 md:w-5 ${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
                  </Button>
                </div>
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {userText.length}/1500 characters
                  </span>
                  {isListening && (
                    <span className="text-xs md:text-sm text-destructive animate-pulse">
                      Listening...
                    </span>
                  )}
                </div>

                {/* Label Chips */}
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs md:text-sm font-medium mb-2">Environment:</p>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {ENVIRONMENTS.map(env => (
                        <Badge
                          key={env}
                          variant={environment === env ? "default" : "outline"}
                          className="cursor-pointer text-xs md:text-sm h-7 md:h-8 px-2 md:px-3"
                          onClick={() => setEnvironment(environment === env ? null : env)}
                        >
                          {env}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs md:text-sm font-medium mb-2">Outcome:</p>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {OUTCOMES.map(out => (
                        <Badge
                          key={out}
                          variant={outcome === out ? "default" : "outline"}
                          className="cursor-pointer text-xs md:text-sm h-7 md:h-8 px-2 md:px-3"
                          onClick={() => setOutcome(outcome === out ? null : out)}
                        >
                          {out}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs md:text-sm font-medium mb-2">Desired Emotion:</p>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {EMOTIONS.map(emo => (
                        <Badge
                          key={emo}
                          variant={emotion === emo ? "default" : "outline"}
                          className="cursor-pointer text-xs md:text-sm h-7 md:h-8 px-2 md:px-3"
                          onClick={() => setEmotion(emotion === emo ? null : emo)}
                        >
                          {emo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleRewrite} 
                  disabled={loading || !userText.trim()}
                  className="w-full bg-gradient-to-r from-secondary to-accent hover:shadow-[0_0_30px_hsl(var(--secondary)/0.4)] transition-all duration-300 hover:scale-105 h-12 md:h-14 text-sm md:text-base"
                  size="lg"
                >
                  {loading ? "April is thinking..." : "How do I say it better?"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Practice Tab */}
          <TabsContent value="voice">
            <VoiceConversation />
          </TabsContent>
        </Tabs>

        {/* Original Text Display */}
        {result && (
          <div className="mb-6 md:mb-8 space-y-3 md:space-y-4 animate-fade-in">
            <div className="p-4 md:p-6 bg-muted/30 rounded-xl md:rounded-2xl border border-border/50">
              <p className="text-xs font-semibold text-muted-foreground mb-2 md:mb-3 uppercase tracking-wide flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground"></span>
                What You Said
              </p>
              <p className="text-sm md:text-base text-foreground leading-relaxed italic">&ldquo;{userText}&rdquo;</p>
            </div>

            {/* Intent Summary */}
            {result.diagnostics?.intent_summary && (
              <div className="p-4 md:p-6 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-xl md:rounded-2xl border border-secondary/30 shadow-lg backdrop-blur-sm">
                <p className="text-xs md:text-sm font-semibold text-secondary mb-2 uppercase tracking-wide">April&apos;s Analysis</p>
                <p className="text-sm md:text-base lg:text-lg text-foreground leading-relaxed">{result.diagnostics.intent_summary}</p>
              </div>
            )}

            <div className="text-center py-2">
              <p className="text-xs md:text-sm font-semibold text-secondary uppercase tracking-wide flex items-center justify-center gap-2">
                <span className="inline-block w-6 md:w-8 h-px bg-gradient-to-r from-transparent via-secondary to-transparent"></span>
                April&apos;s Rewrites
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
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <Badge variant="secondary" className="text-sm md:text-base px-2.5 md:px-3 py-0.5 md:py-1">
                      {rewrite.tone_label}
                    </Badge>
                  </div>

                  {/* Rewrite Text */}
                  <p className="text-base md:text-lg mb-3 md:mb-4 leading-relaxed">{rewrite.text}</p>

                  {/* Pillars */}
                  <div className="space-y-2 mb-3 md:mb-4">
                    {Object.entries(rewrite.pillars).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <Badge 
                          className={`${pillarColors[key as keyof typeof pillarColors]} shrink-0 uppercase text-xs`}
                        >
                          {key}
                        </Badge>
                        <p className="text-xs md:text-sm text-muted-foreground">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Rationale */}
                  <div className="mb-3 md:mb-4 p-2.5 md:p-3 bg-muted/50 rounded-md">
                    <p className="text-xs md:text-sm font-medium text-secondary mb-1">Why it works:</p>
                    <p className="text-xs md:text-sm">{rewrite.rationale}</p>
                  </div>

                  {/* Cautions */}
                  {rewrite.cautions && (
                    <div className="mb-3 md:mb-4 p-2.5 md:p-3 bg-accent/10 rounded-md border border-accent/20">
                      <p className="text-xs md:text-sm font-medium text-accent-foreground mb-1">⚠️ Cautions:</p>
                      <p className="text-xs md:text-sm">{rewrite.cautions}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopy(rewrite.text)}
                      className="w-full sm:w-auto h-10 md:h-9"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePlayAudio(rewrite.text, index)}
                      disabled={playingAudio !== null && playingAudio !== index}
                      className="w-full sm:w-auto h-10 md:h-9"
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
                          className="w-full sm:w-auto h-10 md:h-9"
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
        <footer className="text-center mt-12 md:mt-16 py-6 md:py-8 border-t border-secondary/20">
          <p className="text-base md:text-lg font-medium bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent px-4">
            When in doubt, just ask April
          </p>
          <div className="mt-3 md:mt-4">
            <a 
              href="https://aprilsabral.newzenler.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors underline"
            >
              Access April's Learning Hub - Online Courses
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;