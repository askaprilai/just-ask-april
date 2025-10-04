import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>
          
          <p className="text-muted-foreground">
            Privacy policy details coming soon. Just Ask April is committed to protecting your privacy and handling your data responsibly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;