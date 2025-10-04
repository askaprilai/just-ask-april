import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MobileNavProps {
  user: User | null;
  usageCount?: number;
  freeLimit?: number;
}

export const MobileNav = ({ user, usageCount = 0, freeLimit = 5 }: MobileNavProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

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
        <nav className="flex flex-col gap-4 mt-8">
          {!user && (
            <div className="px-4 py-2 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                {usageCount}/{freeLimit} free uses
              </p>
            </div>
          )}
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
