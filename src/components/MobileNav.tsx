import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, BarChart3, History, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ThemeToggle } from "@/components/ThemeToggle";

interface MobileNavProps {
  user: User | null;
  usageCount?: number;
  freeLimit?: number;
}

export const MobileNav = ({ user }: MobileNavProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, productId, dailyUsage } = useSubscription();
  const [open, setOpen] = useState(false);
  
  const PRO_PRODUCT_ID = 'prod_TB6tW8iBKEha8e';
  const isPro = subscribed && productId === PRO_PRODUCT_ID;
  const FREE_USAGE_LIMIT = 10;

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    toast({
      title: "Signed out",
      description: "You've been signed out successfully",
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[350px]">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <nav className="flex flex-col gap-4 mt-8">
          {user ? (
            isPro ? (
              <div className="px-4 py-2 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg border border-secondary/20">
                <Badge className="w-full bg-gradient-to-r from-secondary to-accent text-white justify-center">
                  Pro Plan ✨
                </Badge>
              </div>
            ) : (
              <div className="px-4 py-2 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  {dailyUsage}/{FREE_USAGE_LIMIT} today
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => handleNavigate('/pricing')}
                >
                  Upgrade to Pro
                </Button>
              </div>
            )
          ) : null}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-lg h-12"
            onClick={() => handleNavigate('/about')}
          >
            About April
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-lg h-12"
            onClick={() => handleNavigate('/pricing')}
          >
            Pricing
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-lg h-12"
            onClick={() => handleNavigate('/stats')}
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            Impact Index
          </Button>
          {user && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-lg h-12"
              onClick={() => handleNavigate('/history')}
            >
              <History className="mr-2 h-5 w-5" />
              History
            </Button>
          )}
          {user && isPro && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-lg h-12"
              onClick={() => handleNavigate('/analytics')}
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Analytics
            </Button>
          )}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-lg h-12"
            onClick={() => handleNavigate('/privacy')}
          >
            Privacy
          </Button>
          {user && (
            <Button 
              variant="outline" 
              className="w-full justify-start text-lg h-12 mt-4"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
