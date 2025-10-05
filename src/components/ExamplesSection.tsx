import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import React from "react";

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
  {
    before: "You're not meeting expectations and need to improve immediately.",
    after: "I've noticed some gaps in outcomes. What support do you need to get back on track?",
    situation: "Performance Review",
    outcome: "From criticism to coaching"
  },
  {
    before: "Why didn't you tell me about this earlier?",
    after: "Help me understand the timeline. What can we learn for next time?",
    situation: "Communication Gap",
    outcome: "From blame to learning"
  },
  {
    before: "This won't work. We tried something similar before and it failed.",
    after: "I'm curious—how is this different from what we tried before? What's changed?",
    situation: "Change Resistance",
    outcome: "From dismissal to curiosity"
  },
  {
    before: "I don't have time for this right now.",
    after: "I want to give this proper attention. Can we schedule time when I can focus fully?",
    situation: "Time Management",
    outcome: "From rejection to respect"
  },
  {
    before: "That's a terrible idea and won't solve anything.",
    after: "I see it differently. Can you walk me through your thinking so I understand your approach?",
    situation: "Idea Disagreement",
    outcome: "From shutdown to dialogue"
  },
  {
    before: "You should have known better than to do it that way.",
    after: "Let's talk through what happened. What would you do differently next time?",
    situation: "Mistake Response",
    outcome: "From judgment to growth"
  },
];

export { EXAMPLES };

export const ExamplesSection = () => {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const handleClick = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="mb-8 md:mb-16 animate-fade-in">
      <div className="text-center mb-6 md:mb-8 px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
          When in doubt, just ask April
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground">
          Click any example to see the transformation
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        {EXAMPLES.map((example, index) => (
          <Card 
            key={index} 
            onClick={() => handleClick(index)}
            className="group relative overflow-hidden border-secondary/20 hover:shadow-[0_20px_50px_-10px_hsl(var(--secondary)/0.3)] transition-all duration-300 md:hover:scale-105 animate-fade-in hover:border-secondary/40 cursor-pointer active:scale-[0.98]"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="absolute top-2 right-2 px-2.5 py-1 bg-accent/90 rounded-full border border-accent-foreground/20 animate-pulse">
              <p className="text-[9px] md:text-[10px] font-bold text-accent-foreground uppercase tracking-wider">
                Try it
              </p>
            </div>
            <CardContent className="p-5 md:p-6 space-y-3 md:space-y-4">
              <div className="inline-block px-2.5 md:px-3 py-1 bg-secondary/20 rounded-full border border-secondary/30">
                <p className="text-[10px] md:text-xs font-bold text-secondary uppercase tracking-wide">
                  {example.situation}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-muted/50 border-2 border-border rounded-lg transform transition-all duration-200">
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Before</p>
                  <p className="text-xs md:text-sm text-foreground/80 italic leading-relaxed font-medium">&ldquo;{example.before}&rdquo;</p>
                </div>

                {expandedIndex === index && (
                  <>
                    <div className="flex justify-center py-1 animate-fade-in">
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-secondary animate-pulse" />
                    </div>

                    <div className="p-3 bg-secondary/15 border-2 border-secondary/40 rounded-lg animate-fade-in">
                      <p className="text-[10px] md:text-xs font-bold text-secondary mb-1.5 uppercase tracking-wide">After</p>
                      <p className="text-xs md:text-sm font-semibold leading-relaxed text-foreground">&ldquo;{example.after}&rdquo;</p>
                    </div>
                  </>
                )}
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