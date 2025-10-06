import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ImpactMethodDiagram from "@/components/ImpactMethodDiagram";
import aprilImage from "@/assets/april-sabral.png";
import aprilLogo from "@/assets/just-ask-april-logo.png";

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

        {/* Impact Language Method Section */}
        <div className="mb-16 md:mb-24 pt-8 md:pt-12">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent px-2">
              The Impact Language Method™ — Backed by Science.
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl font-light mb-6 md:mb-8 px-2">
              Say it Better. Get Better Results.
            </p>
          </div>

          <Card className="shadow-xl border-secondary/20 mb-12 md:mb-16">
            <CardContent className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-6">
              <div className="prose prose-lg max-w-none">
                <p className="text-base md:text-lg leading-relaxed mb-4">
                  Every message we send creates an outcome. The Impact Language Method™ brings structure and science to how you communicate — helping you move from reaction to intentional, positive influence.
                </p>
                <p className="text-base md:text-lg leading-relaxed">
                  Built on behavioral psychology and communication science, this method helps leaders, teams, managers, executives and humans express themselves clearly, confidently, and with purpose. Because we all have a role to play and that role requires connected communication that influences outcomes positively—most issues can always be tracked back to a lack of communication.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Impact Method Diagram */}
          <div className="mb-12 md:mb-16">
            <ImpactMethodDiagram />
          </div>

          {/* CTA Section */}
          <Card className="shadow-xl border-secondary/20 bg-gradient-to-r from-secondary/5 to-accent/5">
            <CardContent className="pt-8 md:pt-10 pb-8 md:pb-10 px-4 md:px-6 text-center">
              <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">
                Learn how to apply the Impact Language Method™ in your everyday communication.
              </p>
              <Button 
                onClick={() => navigate('/')}
                size="lg"
                className="bg-gradient-to-r from-secondary to-accent hover:shadow-[0_0_30px_hsl(var(--secondary)/0.4)] transition-all duration-300 w-full sm:w-auto h-12 md:h-11"
              >
                Try Just Ask April AI
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* April's Photo Section */}
        <Card className="shadow-xl border-secondary/20 overflow-hidden mt-8 md:mt-12">
          <CardContent className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="flex-1 max-w-md mx-auto w-full">
                <img 
                  src={aprilImage} 
                  alt="April Sabral - 30+ years experience in communication and leadership"
                className="w-full h-auto animate-fade-in rounded-lg"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  It's like having April Sabral in your pocket.
                </h2>
                <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                  <p>
                    With over 30 years of experience leading and coaching teams across global retail brands, April Sabral has seen firsthand how communication can ignite or deflate a team.
                  </p>
                  <p>
                    As the author of three leadership books — <em>The Positive Effect</em>, <em>Incurable Positivity</em>, and <em>Positive Accountability</em> — and the founder of April Sabral Leadership and RetailU, April has dedicated her career to helping leaders and teams reach their potential through intentional communication.
                  </p>
                  <p>
                    After decades of hearing the same question — "April, how do I say this?" — she created Just Ask April AI, an AI-powered communication intelligence tool that brings her proven frameworks right to your device.
                  </p>
                  <p>
                    Built on the Impact Language Method™, a science-backed model for effective communication, Just Ask April AI helps you get instant guidance on what to say and how to say it — transforming difficult conversations into positive outcomes.
                  </p>
                  <p>
                    Whether you're leading a team, managing a client, or navigating relationships, you can now access April's leadership expertise anytime, anywhere.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 md:mt-20 py-8 md:py-12 border-t border-border/40 bg-muted/20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col items-center mb-8 md:mb-10">
              {/* Message Bubble with April */}
              <div className="relative mb-6">
                {/* April's Avatar */}
                <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary to-accent animate-pulse blur-lg opacity-60"></div>
                  <div className="relative w-full h-full rounded-full ring-4 ring-secondary/30 bg-background flex items-center justify-center overflow-hidden">
                    <img src={aprilLogo} alt="Just Ask April AI logo" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                {/* Speech Bubble */}
                <div className="relative max-w-md mx-auto">
                  <div className="bg-gradient-to-br from-secondary/20 to-accent/20 backdrop-blur-sm rounded-3xl px-6 py-4 border-2 border-secondary/30 shadow-lg">
                    <p className="text-lg md:text-xl font-medium bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent text-center">
                      "When in doubt, just ask April AI"
                    </p>
                  </div>
                  {/* Bubble Tail */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[12px] border-l-transparent border-r-transparent border-b-secondary/30"></div>
                </div>
              </div>
              
              <p className="text-xl md:text-2xl font-semibold mb-3 text-foreground">
                We build workplace relationships that transform lives
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
                © 2025 Just Ask April AI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default About;
