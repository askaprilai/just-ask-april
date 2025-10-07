import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Award, Target, TrendingDown, User } from "lucide-react";
import ImpactMethodDiagram from "@/components/ImpactMethodDiagram";

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

const Stats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ImpactStats>({});
  const [topRewrites, setTopRewrites] = useState<TopRewrite[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [weekComparison, setWeekComparison] = useState<{ thisWeek: number; lastWeek: number; change: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Show example data for non-logged-in users
          setUserName("Sally Sunshine");
          setStats({
            'Work_Action': { total: 24, helpful: 22, rate: 92 },
            'Work_Recognition': { total: 18, helpful: 17, rate: 94 },
            'Work_Input': { total: 15, helpful: 13, rate: 87 },
            'Personal_Recognition': { total: 12, helpful: 11, rate: 92 },
            'Personal_Delay': { total: 8, helpful: 7, rate: 88 },
          });
          setWeekComparison({ thisWeek: 91, lastWeek: 85, change: 6 });
          setLoading(false);
          return;
        }

        // Set user name to Sally Sunshine
        setUserName("Sally Sunshine");

        // Calculate week comparison
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Get this week's feedback
        const { data: thisWeekFeedback } = await supabase
          .from('feedback')
          .select('helpful')
          .eq('user_id', session.user.id)
          .gte('created_at', oneWeekAgo.toISOString());

        // Get last week's feedback
        const { data: lastWeekFeedback } = await supabase
          .from('feedback')
          .select('helpful')
          .eq('user_id', session.user.id)
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

        const { data, error } = await supabase.functions.invoke('impact-index');
        
        if (error) throw error;
        setStats(data.stats || {});
        setTopRewrites(data.topRewrites || []);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const totalRewrites = Object.values(stats).reduce((sum, data) => sum + data.total, 0);
  const avgRate = Object.values(stats).length > 0 
    ? Math.round(Object.values(stats).reduce((sum, data) => sum + data.rate, 0) / Object.values(stats).length)
    : 0;

  const getInsight = () => {
    if (avgRate >= 90) return { text: "Exceptional! Your communication is consistently hitting the mark.", icon: Award, color: "text-green-600" };
    if (avgRate >= 75) return { text: "Great work! You're mastering the Impact Language Method.", icon: TrendingUp, color: "text-blue-600" };
    if (avgRate >= 60) return { text: "Good progress. Keep refining your approach.", icon: Target, color: "text-orange-600" };
    return { text: "Every rewrite is a learning opportunity. Keep practicing!", icon: Target, color: "text-muted-foreground" };
  };

  const insight = getInsight();
  const InsightIcon = insight.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4 md:mb-6 h-10 md:h-9"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Profile Header */}
        <Card className="mb-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center text-white text-2xl font-bold">
                  {userName ? userName.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold">{userName || "Your Profile"}</h2>
                    <Badge variant="outline" className="text-xs">Preview</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Communication Impact Profile</p>
                </div>
              </div>
            </div>
            
            {weekComparison && (
              <div className="bg-background/50 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Week-over-Week Progress</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-bold">{weekComparison.thisWeek}%</span>
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
                    <p className="text-xs text-muted-foreground">Last Week</p>
                    <p className="text-lg font-semibold text-muted-foreground">{weekComparison.lastWeek}%</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {weekComparison.change > 0 
                    ? `Great progress! You're ${weekComparison.change}% more effective this week.`
                    : weekComparison.change < 0
                    ? `Keep practicing. Every conversation is a learning opportunity.`
                    : `Consistent performance. Keep up the good work!`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3">My Impact Index</h1>
          <p className="text-sm md:text-lg text-muted-foreground px-4 max-w-2xl mx-auto">
            Track how the Impact Language Method™ transforms your communication
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading stats...</p>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Rewrites</CardDescription>
                  <CardTitle className="text-3xl font-bold text-primary">{totalRewrites}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Average Success Rate</CardDescription>
                  <CardTitle className="text-3xl font-bold text-primary">{avgRate}%</CardTitle>
                </CardHeader>
              </Card>
              <Card className="md:col-span-1">
                <CardHeader className="pb-3 flex-row items-start gap-3">
                  <InsightIcon className={`h-5 w-5 mt-1 ${insight.color}`} />
                  <div>
                    <CardDescription>Your Impact</CardDescription>
                    <p className="text-sm font-medium mt-1">{insight.text}</p>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Biggest Impact Areas */}
            <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  Sally's Biggest Impact Areas
                </CardTitle>
                <CardDescription>
                  Where the Impact Language Method™ transformed her communication most
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats)
                  .sort((a, b) => b[1].rate - a[1].rate)
                  .slice(0, 3)
                  .map(([key, data], index) => {
                    const [environment, outcome] = key.split('_');
                    const medals = ['🥇', '🥈', '🥉'];
                    
                    return (
                      <div key={key} className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{medals[index]}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg capitalize">
                                {environment} · {outcome}
                              </h3>
                              <span className="text-2xl font-bold text-primary">{data.rate}%</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{data.total} uses</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">{data.helpful} successful</span>
                              </div>
                              <div className="text-muted-foreground">
                                Impact: {index === 0 ? 'Exceptional' : index === 1 ? 'Outstanding' : 'Excellent'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div className="bg-accent/20 rounded-lg p-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Sally's Secret:</strong> By focusing on emotional transformation 
                    (moving from frustration → confidence and uncertainty → clarity), she's mastered the art of 
                    turning challenging conversations into opportunities for connection and action.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Impact Method Framework */}
            <Card className="mb-8 overflow-hidden">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">The Impact Language Method™</CardTitle>
                <CardDescription>
                  Sally's stats below show how well she's applying each pillar
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <ImpactMethodDiagram />
              </CardContent>
            </Card>

            {/* Top Impact Statements */}
            {topRewrites.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Top Impact Statements</CardTitle>
                  <CardDescription>
                    Your most effective rewrites that got results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topRewrites.map((rewrite) => (
                    <div key={rewrite.id} className="p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize font-medium">{rewrite.environment}</span>
                          <span>·</span>
                          <span className="capitalize">{rewrite.outcome}</span>
                        </div>
                        <Award className="h-4 w-4 text-primary flex-shrink-0" />
                      </div>
                      <p className="text-sm leading-relaxed">"{rewrite.raw_text}"</p>
                      {(rewrite.inferred_emotion || rewrite.desired_emotion) && (
                        <div className="mt-2 flex gap-2 text-xs">
                          {rewrite.inferred_emotion && (
                            <span className="text-muted-foreground">From: {rewrite.inferred_emotion}</span>
                          )}
                          {rewrite.desired_emotion && (
                            <>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-primary font-medium">To: {rewrite.desired_emotion}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Detailed Stats */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Your Performance by Context</h2>
              <p className="text-sm text-muted-foreground mb-6">
                See how effectively you communicate across different environments and outcomes
              </p>
            </div>

            {Object.keys(stats).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center px-4">
                  <p className="text-sm md:text-base text-muted-foreground">
                    No feedback data yet. Start using April to see your impact!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {Object.entries(stats).map(([key, data]) => {
                  const [environment, outcome] = key.split('_');
                  const isHighPerformance = data.rate >= 85;
                  
                  return (
                    <Card key={key} className={isHighPerformance ? "border-primary/50" : ""}>
                      <CardHeader className="px-4 md:px-6 py-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg md:text-xl capitalize">
                              {environment} · {outcome}
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm mt-1">
                              {data.total} fine-tune{data.total !== 1 ? 's' : ''} used
                            </CardDescription>
                          </div>
                          {isHighPerformance && (
                            <Award className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 md:px-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
                                style={{ width: `${data.rate}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-primary min-w-[60px] text-right">
                            {data.rate}%
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 text-xs md:text-sm">
                          <span className="text-green-600 font-medium">{data.helpful} helpful</span>
                          <span className="text-muted-foreground">{data.total - data.helpful} not helpful</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Stats;