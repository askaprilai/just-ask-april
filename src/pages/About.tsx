import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Meet April Sabral
          </h1>
          <p className="text-2xl text-muted-foreground font-light italic">
            When in doubt, just ask April
          </p>
        </div>

        <Card className="shadow-xl border-secondary/20">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                The world of work—how you communicate—either ignites people or deflates them. 
                I've seen firsthand the power of words and how one slight shift in language can get a better outcome.
              </p>

              <p className="text-lg leading-relaxed">
                After leading retail teams that delivered growth for over 20 years, whether that was 
                one store or 300 stores, I learned that the right words at the right time can transform everything.
              </p>

              <div className="bg-gradient-to-r from-secondary/10 to-accent/10 p-6 rounded-lg border border-secondary/20 my-8">
                <p className="text-xl font-medium text-center italic">
                  "How do I say it?"
                </p>
                <p className="text-muted-foreground text-center mt-3">
                  This is the question people always ask me.
                </p>
              </div>

              <p className="text-lg leading-relaxed">
                That's why Just Ask April exists. To help you find the right words when it matters most. 
                To transform difficult conversations into opportunities. To help you communicate with intention 
                and get the outcomes you're looking for.
              </p>

              <p className="text-lg leading-relaxed font-medium text-secondary">
                Because when in doubt, you can always just ask April.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <Button 
            onClick={() => navigate('/')}
            size="lg"
            className="bg-gradient-to-r from-secondary to-accent hover:shadow-[0_0_30px_hsl(var(--secondary)/0.4)] transition-all duration-300"
          >
            Try Just Ask April
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
