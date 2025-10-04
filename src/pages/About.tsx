import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ImpactMethodDiagram from "@/components/ImpactMethodDiagram";
import aprilImage from "@/assets/april-sabral.png";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6 md:py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 md:mb-8 h-10 md:h-9"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent px-2">
            Meet April Sabral
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light italic px-2">
            When in doubt, just ask April
          </p>
        </div>

        {/* April's Photo Section */}
        <Card className="shadow-xl border-secondary/20 mb-12 md:mb-16 overflow-hidden">
          <CardContent className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="flex-1 max-w-md mx-auto w-full">
                <img 
                  src={aprilImage} 
                  alt="April Sabral - 30+ years experience"
                  className="w-full h-auto animate-fade-in rounded-lg"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  It's like having April Sabral in your pocket
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  30+ years of communication expertise, available whenever you need it. 
                  Get instant guidance on what to say and how to say it—right from your device.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-secondary/20">
          <CardContent className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-6 space-y-4 md:space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-base md:text-lg leading-relaxed">
                The world of work—how you communicate—either ignites people or deflates them. 
                I've seen firsthand the power of words and how one slight shift in language can get a better outcome.
              </p>

              <p className="text-base md:text-lg leading-relaxed">
                After leading retail teams that delivered growth for over 20 years, whether that was 
                one store or 300 stores, I learned that the right words at the right time can transform everything.
              </p>

              <div className="bg-gradient-to-r from-secondary/10 to-accent/10 p-4 md:p-6 rounded-lg border border-secondary/20 my-6 md:my-8">
                <p className="text-lg md:text-xl font-medium text-center italic">
                  "How do I say it?"
                </p>
                <p className="text-sm md:text-base text-muted-foreground text-center mt-2 md:mt-3">
                  This is the question people always ask me.
                </p>
              </div>

              <p className="text-base md:text-lg leading-relaxed">
                That's why Just Ask April exists. To help you find the right words when it matters most. 
                To transform difficult conversations into opportunities. To help you communicate with intention 
                and get the outcomes you're looking for.
              </p>

              <p className="text-base md:text-lg leading-relaxed font-medium text-secondary">
                Because when in doubt, you can always just ask April.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Impact Language Method Diagram */}
        <div className="mt-20 md:mt-32">
          <ImpactMethodDiagram />
        </div>

        <div className="text-center mt-8 md:mt-12">
          <Button 
            onClick={() => navigate('/')}
            size="lg"
            className="bg-gradient-to-r from-secondary to-accent hover:shadow-[0_0_30px_hsl(var(--secondary)/0.4)] transition-all duration-300 w-full sm:w-auto h-12 md:h-11"
          >
            Try Just Ask April
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
