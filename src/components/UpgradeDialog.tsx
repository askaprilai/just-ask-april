import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export const UpgradeDialog = ({ open, onOpenChange, feature = "unlimited Impact Statements" }: UpgradeDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkSubscription } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleUpgrade = async () => {
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
        
        onOpenChange(false);
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

  const proFeatures = [
    "Unlimited Impact Statements across all categories",
    "Practice conversations with April",
    "Advanced tone control",
    "Priority support",
    "Analytics dashboard"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-secondary to-accent p-3 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Unlock {feature}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Upgrade to Pro and get access to everything April offers
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ul className="space-y-3">
            {proFeatures.map((feat) => (
              <li key={feat} className="flex items-start gap-3">
                <div className="bg-secondary/20 rounded-full p-1 mt-0.5">
                  <Check className="h-4 w-4 text-secondary" />
                </div>
                <span className="text-sm">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-4">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-3xl font-bold">$10</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-1">
            Cancel anytime
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleUpgrade}
            disabled={checkoutLoading}
            className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white"
            size="lg"
          >
            {checkoutLoading ? 'Loading...' : 'Upgrade to Pro'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/pricing')}
            className="w-full"
          >
            View All Plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
