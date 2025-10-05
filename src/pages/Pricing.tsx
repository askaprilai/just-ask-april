import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Zap, Shield, Users, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, productId, loading, checkSubscription } = useSubscription();
  const { trackEvent } = useAnalytics();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  
  const PRO_PRODUCT_ID = 'prod_TB6tW8iBKEha8e';
  const isPro = subscribed && productId === PRO_PRODUCT_ID;

  const handleCheckout = async () => {
    trackEvent('checkout_initiated', { plan: 'Pro' });
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        trackEvent('checkout_url_opened', { plan: 'Pro' });
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
    trackEvent('manage_subscription_clicked');
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        trackEvent('customer_portal_opened');
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
        "The Impact Playbook",
        "Unlimited impact statements",
        "Practice with April",
        "Unlimited chat",
        "Personalize your impact statements"
      ],
      cta: "Subscribe Now",
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
          
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary" />
              <span>10,000+ Happy Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-secondary" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-secondary" />
              <span>Instant Access</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent px-2">
            Say It Better, Get Better Results
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 mb-3">
            Join thousands of professionals who communicate with confidence
          </p>
          <div className="flex items-center justify-center gap-1 text-secondary">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">4.9/5 from 2,000+ reviews</span>
          </div>
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
                    onClick={() => navigate('/auth')}
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

        {/* Feature Comparison Table */}
        <div className="mt-16 md:mt-20 max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-4 px-4 font-semibold">Features</th>
                  <th className="text-center py-4 px-4 font-semibold">Free</th>
                  <th className="text-center py-4 px-4 font-semibold bg-gradient-to-br from-secondary/10 to-accent/10 rounded-t-lg">
                    <div className="flex flex-col items-center gap-1">
                      <span>Pro</span>
                      <span className="text-xs font-normal text-muted-foreground">Most Popular</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-border">
                  <td className="py-4 px-4">Impact Statements per day</td>
                  <td className="text-center py-4 px-4">10</td>
                  <td className="text-center py-4 px-4 bg-gradient-to-br from-secondary/5 to-accent/5">Unlimited</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4">Practice conversations</td>
                  <td className="text-center py-4 px-4"><X className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-4 px-4 bg-gradient-to-br from-secondary/5 to-accent/5"><Check className="h-5 w-5 mx-auto text-secondary" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 mx-auto text-secondary" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4">The Impact Playbook</td>
                  <td className="text-center py-4 px-4"><X className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-4 px-4 bg-gradient-to-br from-secondary/5 to-accent/5"><Check className="h-5 w-5 mx-auto text-secondary" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 mx-auto text-secondary" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4">Analytics Dashboard</td>
                  <td className="text-center py-4 px-4"><X className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-4 px-4 bg-gradient-to-br from-secondary/5 to-accent/5"><Check className="h-5 w-5 mx-auto text-secondary" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 mx-auto text-secondary" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4">Priority Support</td>
                  <td className="text-center py-4 px-4"><X className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-4 px-4 bg-gradient-to-br from-secondary/5 to-accent/5"><Check className="h-5 w-5 mx-auto text-secondary" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 mx-auto text-secondary" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4">Team Members</td>
                  <td className="text-center py-4 px-4">1</td>
                  <td className="text-center py-4 px-4 bg-gradient-to-br from-secondary/5 to-accent/5">1</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4">Custom AI Training</td>
                  <td className="text-center py-4 px-4"><X className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-4 px-4 bg-gradient-to-br from-secondary/5 to-accent/5"><X className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 mx-auto text-secondary" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Dedicated Account Manager</td>
                  <td className="text-center py-4 px-4"><X className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-4 px-4 bg-gradient-to-br from-secondary/5 to-accent/5 rounded-b-lg"><X className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 mx-auto text-secondary" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 md:mt-20 max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Trusted by Professionals</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-sm md:text-base mb-4">"April Pro has transformed how I handle difficult conversations at work. The practice feature alone is worth the price."</p>
                <p className="text-sm font-medium">— Jennifer K., Director of Operations</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-sm md:text-base mb-4">"Best investment I've made in my career. My emails get responses faster and my messages land exactly how I want them to."</p>
                <p className="text-sm font-medium">— Marcus T., Sales Manager</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 md:mt-24 max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4 md:space-y-6">
            <div className="border border-border rounded-lg p-4 md:p-6">
              <h3 className="font-semibold text-base md:text-lg mb-2">Can I switch plans anytime?</h3>
              <p className="text-sm md:text-base text-muted-foreground">Yes! You can upgrade, downgrade, or cancel your subscription at any time. No long-term commitment required.</p>
            </div>
            <div className="border border-border rounded-lg p-4 md:p-6">
              <h3 className="font-semibold text-base md:text-lg mb-2">What happens when I upgrade to Pro?</h3>
              <p className="text-sm md:text-base text-muted-foreground">You get instant access to unlimited Impact Statements, practice conversations, analytics, and The Impact Playbook. Your card is charged immediately.</p>
            </div>
            <div className="border border-border rounded-lg p-4 md:p-6">
              <h3 className="font-semibold text-base md:text-lg mb-2">Is my data secure?</h3>
              <p className="text-sm md:text-base text-muted-foreground">Absolutely. We use enterprise-grade encryption and never share your data with third parties. You can delete your history anytime.</p>
            </div>
            <div className="border border-border rounded-lg p-4 md:p-6">
              <h3 className="font-semibold text-base md:text-lg mb-2">How does billing work?</h3>
              <p className="text-sm md:text-base text-muted-foreground">You'll be billed $20/month for Pro. Cancel anytime with no fees or penalties.</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 md:mt-20 max-w-3xl mx-auto px-4">
          <Card className="bg-gradient-to-r from-secondary/10 to-accent/10 border-secondary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your communication?</h2>
              <p className="text-muted-foreground mb-6 md:mb-8">Join 10,000+ professionals who communicate with confidence</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  className="text-base"
                >
                  Try Free
                </Button>
                <Button 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white text-base"
                >
                  {checkoutLoading ? 'Loading...' : 'Upgrade to Pro'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
