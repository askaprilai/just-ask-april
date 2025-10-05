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
    <div className="mb-8 md:mb-16 animate-fade-in">
      <div className="text-center mb-6 md:mb-8 px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
          When in doubt, just ask April
        </h2>
        <p className="text-muted-foreground text-sm md:text-lg leading-relaxed">
          Grammarly fixes your grammar. April fixes your impact.
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        {EXAMPLES.map((example, index) => (
          <Card 
            key={index} 
            className="overflow-hidden border-secondary/20 hover:shadow-[0_20px_50px_-10px_hsl(var(--secondary)/0.3)] transition-all duration-300 md:hover:scale-105 animate-fade-in hover:border-secondary/40"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <CardContent className="p-5 md:p-6 space-y-3 md:space-y-4">
              <div className="inline-block px-2.5 md:px-3 py-1 bg-secondary/20 rounded-full border border-secondary/30">
                <p className="text-[10px] md:text-xs font-bold text-secondary uppercase tracking-wide">
                  {example.situation}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-destructive/10 border-2 border-destructive/30 rounded-lg transform transition-all duration-200 hover:scale-[1.02]">
                  <p className="text-[10px] md:text-xs font-bold text-destructive mb-1.5 uppercase tracking-wide">Before</p>
                  <p className="text-xs md:text-sm text-foreground/80 italic leading-relaxed font-medium">&ldquo;{example.before}&rdquo;</p>
                </div>

                <div className="flex justify-center py-1">
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-secondary animate-pulse" />
                </div>

                <div className="p-3 bg-secondary/15 border-2 border-secondary/40 rounded-lg transform transition-all duration-200 hover:scale-[1.02]">
                  <p className="text-[10px] md:text-xs font-bold text-secondary mb-1.5 uppercase tracking-wide">After</p>
                  <p className="text-xs md:text-sm font-semibold leading-relaxed text-foreground">&ldquo;{example.after}&rdquo;</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <p className="text-[10px] md:text-xs text-accent font-bold">✨ {example.outcome}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};