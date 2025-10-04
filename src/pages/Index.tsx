import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, ThumbsUp, ThumbsDown, Volume2, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const pillarColors = {
    intent: "bg-[#0A3D62] text-white",
    message: "bg-[#00B3A4] text-white",
    position: "bg-[#E77F00] text-white",
    action: "bg-[#FDB900] text-primary",
    calibration: "bg-[#5A67D8] text-white",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-2">Just Ask April</h1>
          <p className="text-xl text-muted-foreground mb-4">When in doubt, Just Ask April.</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" size="sm" onClick={() => navigate('/stats')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Impact Index
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/privacy')}>
              Privacy
            </Button>
          </div>
        </div>

        {/* Input Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Textarea
              placeholder="What do you need to say? Paste your draft or describe the situation..."
              value={userText}
              onChange={(e) => setUserText(e.target.value.slice(0, 1500))}
              className="min-h-[120px] mb-2 text-base"
            />
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">
                {userText.length}/1500 characters
              </span>
            </div>

            {/* Label Chips */}
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm font-medium mb-2">Environment:</p>
                <div className="flex flex-wrap gap-2">
                  {ENVIRONMENTS.map(env => (
                    <Badge
                      key={env}
                      variant={environment === env ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setEnvironment(environment === env ? null : env)}
                    >
                      {env}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Outcome:</p>
                <div className="flex flex-wrap gap-2">
                  {OUTCOMES.map(out => (
                    <Badge
                      key={out}
                      variant={outcome === out ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setOutcome(outcome === out ? null : out)}
                    >
                      {out}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Desired Emotion:</p>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map(emo => (
                    <Badge
                      key={emo}
                      variant={emotion === emo ? "default" : "outline"}
                      className="cursor-pointer"
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
              className="w-full"
              size="lg"
            >
              {loading ? "April is thinking..." : "Get 3 Rewrites"}
            </Button>
          </CardContent>
        </Card>

        {/* Intent Summary */}
        {result?.diagnostics?.intent_summary && (
          <div className="mb-6 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
            <p className="text-sm font-medium text-secondary mb-1">April's Analysis:</p>
            <p className="text-foreground">{result.diagnostics.intent_summary}</p>
          </div>
        )}

        {/* Rewrites */}
        {result?.rewrites && (
          <div className="space-y-6">
            {result.rewrites.map((rewrite, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  {/* Tone Label */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {rewrite.tone_label}
                    </Badge>
                  </div>

                  {/* Rewrite Text */}
                  <p className="text-lg mb-4 leading-relaxed">{rewrite.text}</p>

                  {/* Pillars */}
                  <div className="space-y-2 mb-4">
                    {Object.entries(rewrite.pillars).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <Badge 
                          className={`${pillarColors[key as keyof typeof pillarColors]} shrink-0 uppercase text-xs`}
                        >
                          {key}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Rationale */}
                  <div className="mb-4 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm font-medium text-secondary mb-1">Why it works:</p>
                    <p className="text-sm">{rewrite.rationale}</p>
                  </div>

                  {/* Cautions */}
                  {rewrite.cautions && (
                    <div className="mb-4 p-3 bg-accent/10 rounded-md border border-accent/20">
                      <p className="text-sm font-medium text-accent-foreground mb-1">⚠️ Cautions:</p>
                      <p className="text-sm">{rewrite.cautions}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopy(rewrite.text)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled
                    >
                      <Volume2 className="mr-2 h-4 w-4" />
                      Hear it
                    </Button>
                    {!feedbackGiven[index] && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFeedback(true, index)}
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Helpful
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFeedback(false, index)}
                        >
                          <ThumbsDown className="mr-2 h-4 w-4" />
                          Not Helpful
                        </Button>
                      </>
                    )}
                    {feedbackGiven[index] && (
                      <Badge variant="secondary" className="ml-auto">
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
        <footer className="text-center mt-12 py-6 border-t">
          <p className="text-muted-foreground">Say it better. Get better results.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;