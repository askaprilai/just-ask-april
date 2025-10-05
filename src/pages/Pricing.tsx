import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, productId, loading, checkSubscription } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  
  const PRO_PRODUCT_ID = 'prod_TB6tW8iBKEha8e';
  const isPro = subscribed && productId === PRO_PRODUCT_ID;

  const handleCheckout = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to Pro",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        
        // Check subscription after a delay
        setTimeout(() => {
          checkSubscription();
        }, 3000);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "10 fine-tunes per day",
        "Basic tone adjustments",
        "Email support",
        "Standard response time"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Pro",
      price: "$20",
      period: "/month",
      description: "For professionals who communicate daily",
      features: [
        "Unlimited fine-tunes",
        "Advanced tone control",
        "Custom environments",
        "Priority support",
        "Analytics dashboard",
        "Team collaboration (up to 5)",
        "API access"
      ],
      cta: "Start Free Trial",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For organizations at scale",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "Custom AI training",
        "Dedicated account manager",
        "SSO & advanced security",
        "Custom integrations",
        "SLA guarantee",
        "Priority feature requests"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 md:mb-8 h-10 md:h-9"
          >
            ← Back to Home
          </Button>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent px-2">
            Choose Your Plan
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Transform your communication with April. Start free, upgrade as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={`relative animate-fade-in ${
                plan.highlighted 
                  ? 'border-primary shadow-xl shadow-primary/20 md:scale-105' 
                  : 'border-border'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-3 md:px-4 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="px-4 md:px-6 pt-6 md:pt-6">
                <CardTitle className="text-xl md:text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm md:text-base">{plan.description}</CardDescription>
                <div className="mt-3 md:mt-4">
                  <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm md:text-base text-muted-foreground">{plan.period}</span>}
                </div>
              </CardHeader>

              <CardContent className="px-4 md:px-6">
                <ul className="space-y-2 md:space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="px-4 md:px-6 pb-4 md:pb-6">
                {plan.name === "Pro" && isPro ? (
                  <div className="w-full space-y-2">
                    <div className="w-full h-11 md:h-10 flex items-center justify-center bg-gradient-to-r from-secondary/20 to-accent/20 rounded-md border border-secondary/30">
                      <span className="text-sm md:text-base font-semibold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                        ✨ Your Current Plan
                      </span>
                    </div>
                    <Button 
                      className="w-full h-11 md:h-10 text-sm md:text-base"
                      variant="outline"
                      onClick={handleManageSubscription}
                      disabled={portalLoading}
                    >
                      {portalLoading ? 'Loading...' : 'Manage Subscription'}
                    </Button>
                  </div>
                ) : plan.name === "Pro" ? (
                  <Button 
                    className="w-full h-11 md:h-10 text-sm md:text-base bg-gradient-to-r from-secondary to-accent hover:opacity-90"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? 'Loading...' : plan.cta}
                  </Button>
                ) : plan.name === "Free" ? (
                  <Button 
                    className="w-full h-11 md:h-10 text-sm md:text-base"
                    variant="outline"
                    onClick={() => navigate('/')}
                  >
                    {plan.cta}
                  </Button>
                ) : (
                  <Button 
                    className="w-full h-11 md:h-10 text-sm md:text-base"
                    variant="outline"
                    onClick={() => window.open('mailto:support@justaskapril.com', '_blank')}
                  >
                    {plan.cta}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 md:mt-24 max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4 md:space-y-6">
            <div className="border border-border rounded-lg p-4 md:p-6">
              <h3 className="font-semibold text-base md:text-lg mb-2">Can I switch plans anytime?</h3>
              <p className="text-sm md:text-base text-muted-foreground">Yes! You can upgrade, downgrade, or cancel your subscription at any time.</p>
            </div>
            <div className="border border-border rounded-lg p-4 md:p-6">
              <h3 className="font-semibold text-base md:text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-sm md:text-base text-muted-foreground">We accept all major credit cards and PayPal.</p>
            </div>
            <div className="border border-border rounded-lg p-4 md:p-6">
              <h3 className="font-semibold text-base md:text-lg mb-2">Is there a free trial for Pro?</h3>
              <p className="text-sm md:text-base text-muted-foreground">Yes! Get 14 days free when you sign up for Pro. No credit card required.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
