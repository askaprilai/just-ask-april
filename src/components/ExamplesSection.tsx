import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const EXAMPLES = [
  {
    before: "You never listen to me and always interrupt when I'm talking.",
    after: "I'd love to share my thoughts fully—can we find a rhythm where we both feel heard?",
    situation: "Personal Conflict",
    outcome: "From blame to collaboration"
  },
  {
    before: "I need this done ASAP or we're going to miss the deadline.",
    after: "This is time-sensitive. Can you prioritize it by end of day? I'm here if you need support.",
    situation: "Work Pressure",
    outcome: "From demand to partnership"
  },
  {
    before: "That's not how we do things here.",
    after: "I appreciate the fresh perspective. Let's explore how this could work within our process.",
    situation: "Team Disagreement",
    outcome: "From resistance to openness"
  },
];

export const ExamplesSection = () => {
  return (
    <div className="mb-16 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
          How Do I Say It?
        </h2>
        <p className="text-muted-foreground text-lg">
          April empowers people to communicate consciously—transforming words into outcomes that inspire trust, collaboration and growth.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {EXAMPLES.map((example, index) => (
          <Card 
            key={index} 
            className="overflow-hidden border-secondary/20 hover:shadow-[0_20px_50px_-10px_hsl(var(--secondary)/0.2)] transition-all duration-300 hover:scale-105"
          >
            <CardContent className="p-6 space-y-4">
              <div className="inline-block px-3 py-1 bg-secondary/10 rounded-full">
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide">
                  {example.situation}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-xs font-medium text-destructive mb-1.5 uppercase tracking-wide">Before</p>
                  <p className="text-sm text-muted-foreground italic">&ldquo;{example.before}&rdquo;</p>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-5 w-5 text-secondary" />
                </div>

                <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
                  <p className="text-xs font-medium text-secondary mb-1.5 uppercase tracking-wide">After</p>
                  <p className="text-sm font-medium">&ldquo;{example.after}&rdquo;</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-accent font-medium">✨ {example.outcome}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};