import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface ImpactStats {
  [key: string]: {
    total: number;
    helpful: number;
    rate: number;
  };
}

const Stats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ImpactStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('impact-index');
        
        if (error) throw error;
        setStats(data.stats || {});
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6 md:py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4 md:mb-6 h-10 md:h-9"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">My Impact Index</h1>
          <p className="text-sm md:text-base text-muted-foreground px-4">Track how April helps you communicate better</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading stats...</p>
          </div>
        ) : Object.keys(stats).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center px-4">
              <p className="text-sm md:text-base text-muted-foreground">No feedback data yet. Start using April to see your impact!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:gap-4">
            {Object.entries(stats).map(([key, data]) => {
              const [environment, outcome] = key.split('_');
              return (
                <Card key={key}>
                  <CardHeader className="px-4 md:px-6 py-4 md:py-6">
                    <CardTitle className="text-base md:text-lg">
                      {environment} · {outcome}
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      {data.total} fine-tune{data.total !== 1 ? 's' : ''} used
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 md:px-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="flex-1">
                        <div className="h-3 md:h-4 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary transition-all"
                            style={{ width: `${data.rate}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-primary">
                        {data.rate}%
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2">
                      {data.helpful} helpful · {data.total - data.helpful} not helpful
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;