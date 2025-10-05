import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { Lock, TrendingUp, MessageSquare, Target, Calendar, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Analytics = () => {
  const navigate = useNavigate();
  const { subscribed, productId, loading } = useSubscription();
  const [stats, setStats] = useState({
    totalRewrites: 0,
    thisWeek: 0,
    thisMonth: 0,
    topEnvironment: '',
    topOutcome: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  const PRO_PRODUCT_ID = 'prod_TB6tW8iBKEha8e';
  const isPro = subscribed && productId === PRO_PRODUCT_ID;

  useEffect(() => {
    if (!loading && !isPro) {
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get all rewrites
        const { data: rewrites, error } = await supabase
          .from('rewrites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const thisWeekCount = rewrites?.filter(r => new Date(r.created_at) > weekAgo).length || 0;
        const thisMonthCount = rewrites?.filter(r => new Date(r.created_at) > monthAgo).length || 0;

        // Calculate top environment
        const envCounts: Record<string, number> = {};
        rewrites?.forEach(r => {
          const env = r.environment || r.inferred_env || 'Unknown';
          envCounts[env] = (envCounts[env] || 0) + 1;
        });
        const topEnv = Object.entries(envCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // Calculate top outcome
        const outcomeCounts: Record<string, number> = {};
        rewrites?.forEach(r => {
          const outcome = r.outcome || r.inferred_outcome || 'Unknown';
          outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1;
        });
        const topOutcome = Object.entries(outcomeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        setStats({
          totalRewrites: rewrites?.length || 0,
          thisWeek: thisWeekCount,
          thisMonth: thisMonthCount,
          topEnvironment: topEnv,
          topOutcome: topOutcome,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [isPro, loading]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Card className="border-accent/30">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="h-10 w-10 text-accent" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Track your communication progress, identify patterns, and see your improvement over time with detailed analytics.
              </p>
              <Badge className="mb-6 bg-gradient-to-r from-secondary to-accent text-white">
                Pro Feature ✨
              </Badge>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/pricing')}
                  size="lg"
                  className="bg-gradient-to-r from-secondary to-accent"
                >
                  Upgrade to Pro
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  size="lg"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Your Analytics
            </h1>
            <p className="text-muted-foreground mt-2">Track your communication improvement</p>
          </div>
          <Badge className="bg-gradient-to-r from-secondary to-accent text-white">
            Pro Feature ✨
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-secondary" />
                Total Fine-tunes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRewrites}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-secondary" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.thisWeek}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-secondary" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-secondary" />
                Top Communication Context
              </CardTitle>
              <CardDescription>Your most common environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{stats.topEnvironment}</div>
              <p className="text-sm text-muted-foreground">
                Most of your communication happens in this setting
              </p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-secondary" />
                Primary Goal
              </CardTitle>
              <CardDescription>Your most common outcome</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{stats.topOutcome}</div>
              <p className="text-sm text-muted-foreground">
                This is what you're usually trying to achieve
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-secondary/20">
          <CardHeader>
            <CardTitle>Growth Insights</CardTitle>
            <CardDescription>Your communication journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                {stats.thisWeek > 0 
                  ? `Great job! You've refined ${stats.thisWeek} messages this week. Keep practicing to build your communication confidence.`
                  : "Start using Just Ask April to track your progress and improve your communication skills."}
              </p>
            </div>
            {stats.totalRewrites > 10 && (
              <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <p className="text-sm font-medium text-secondary mb-1">🎉 Milestone Achieved!</p>
                <p className="text-sm">
                  You've refined over {stats.totalRewrites} messages! You're building strong communication habits.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
