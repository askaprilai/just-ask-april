import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const MobileNav = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
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
        </nav>
      </SheetContent>
    </Sheet>
  );
};
