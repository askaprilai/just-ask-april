import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ProFeatureBadge } from "./ProFeatureBadge";
import { Badge } from "@/components/ui/badge";
import { UpgradeDialog } from "./UpgradeDialog";

const CATEGORIES = [
  "All",
  "Workplace",
  "Leadership",
  "Conflict",
  "Feedback",
  "Difficult Conversations",
  "Executive Presence",
  "Team Dynamics"
];

const EXAMPLES = [
  // Workplace Category
  {
    before: "I need this done ASAP or we're going to miss the deadline.",
    after: "This is time-sensitive. Can you prioritize it by end of day? I'm here if you need support.",
    category: "Workplace",
    outcome: "From demand to partnership"
  },
  {
    before: "That's not how we do things here.",
    after: "I appreciate the fresh perspective. Let's explore how this could work within our process.",
    category: "Workplace",
    outcome: "From resistance to openness"
  },
  {
    before: "I don't have time for this right now.",
    after: "I want to give this proper attention. Can we schedule time when I can focus fully?",
    category: "Workplace",
    outcome: "From rejection to respect"
  },
  {
    before: "Just wanted to circle back and see if you had any thoughts on this.",
    after: "I'd like your perspective on this initiative. What considerations should we prioritize?",
    category: "Workplace",
    outcome: "From casual to intentional"
  },
  {
    before: "Can someone take care of this?",
    after: "I need support on this deliverable. Who has capacity to own it?",
    category: "Workplace",
    outcome: "From vague to clear"
  },
  
  // Leadership Category
  {
    before: "You're not meeting expectations and need to improve immediately.",
    after: "I've noticed some gaps in outcomes. What support do you need to get back on track?",
    category: "Leadership",
    outcome: "From criticism to coaching"
  },
  {
    before: "This won't work. We tried something similar before and it failed.",
    after: "I'm curious—how is this different from what we tried before? What's changed?",
    category: "Leadership",
    outcome: "From dismissal to curiosity"
  },
  {
    before: "You should have known better than to do it that way.",
    after: "Let's talk through what happened. What would you do differently next time?",
    category: "Leadership",
    outcome: "From judgment to growth"
  },
  {
    before: "I'm disappointed in your performance this quarter.",
    after: "I see potential for stronger results. Let's identify what's getting in the way.",
    category: "Leadership",
    outcome: "From disappointment to development"
  },
  {
    before: "You need to be more strategic.",
    after: "Help me understand your thought process. What factors are you weighing?",
    category: "Leadership",
    outcome: "From directive to exploratory"
  },

  // Conflict Category
  {
    before: "You never listen to me and always interrupt when I'm talking.",
    after: "I'd love to share my thoughts fully—can we find a rhythm where we both feel heard?",
    category: "Conflict",
    outcome: "From blame to collaboration"
  },
  {
    before: "Why didn't you tell me about this earlier?",
    after: "Help me understand the timeline. What can we learn for next time?",
    category: "Conflict",
    outcome: "From blame to learning"
  },
  {
    before: "That's a terrible idea and won't solve anything.",
    after: "I see it differently. Can you walk me through your thinking so I understand your approach?",
    category: "Conflict",
    outcome: "From shutdown to dialogue"
  },
  {
    before: "I can't believe you did that without asking me first.",
    after: "I'd like to understand what led to that decision. Can we talk through it?",
    category: "Conflict",
    outcome: "From accusation to inquiry"
  },
  {
    before: "You're overreacting.",
    after: "I hear this matters to you. Help me understand what's behind this concern.",
    category: "Conflict",
    outcome: "From dismissal to validation"
  },

  // Feedback Category
  {
    before: "Good job on the presentation.",
    after: "Your data visualization made the key insights crystal clear. That's what won the room.",
    category: "Feedback",
    outcome: "From generic to specific"
  },
  {
    before: "This needs more work.",
    after: "The structure is solid. Let's strengthen the opening and closing to maximize impact.",
    category: "Feedback",
    outcome: "From vague to actionable"
  },
  {
    before: "I don't think this is going to work.",
    after: "I see challenges with scalability. Can we stress-test these assumptions together?",
    category: "Feedback",
    outcome: "From negative to constructive"
  },
  {
    before: "You're doing fine.",
    after: "Your project management has kept us on track. I'd like to see you stretch into strategic planning next.",
    category: "Feedback",
    outcome: "From adequate to aspirational"
  },
  {
    before: "There are some issues with your approach.",
    after: "The execution is strong. I'd refine the prioritization to align with our Q4 goals.",
    category: "Feedback",
    outcome: "From problem-focused to solution-oriented"
  },

  // Difficult Conversations Category
  {
    before: "We need to let you go.",
    after: "This role isn't the right fit. Let's discuss a transition plan that honors your contributions.",
    category: "Difficult Conversations",
    outcome: "From blunt to dignified"
  },
  {
    before: "Your behavior is unacceptable.",
    after: "I've observed [specific behavior]. It impacts the team in [specific way]. What's your perspective?",
    category: "Difficult Conversations",
    outcome: "From judgment to observation"
  },
  {
    before: "I don't know how to say this, but...",
    after: "I have something important to discuss. I want to be direct and respectful.",
    category: "Difficult Conversations",
    outcome: "From hesitant to confident"
  },
  {
    before: "People have been complaining about you.",
    after: "I've noticed tension between you and the team. What's your read on the dynamic?",
    category: "Difficult Conversations",
    outcome: "From hearsay to direct"
  },
  {
    before: "If you don't improve, there will be consequences.",
    after: "Here's what success looks like in this role. Let's create a plan to get you there.",
    category: "Difficult Conversations",
    outcome: "From threat to clarity"
  },

  // Executive Presence Category
  {
    before: "Yeah, I think maybe we could probably try that if you want.",
    after: "I recommend we pursue this approach. Here's the strategic value I see.",
    category: "Executive Presence",
    outcome: "From tentative to decisive"
  },
  {
    before: "Sorry to bother you, but do you think maybe we could discuss this?",
    after: "I'd value your input on this matter. When can we connect to align on next steps?",
    category: "Executive Presence",
    outcome: "From apologetic to confident"
  },
  {
    before: "I'm not sure if this is right, but...",
    after: "Based on the data, I propose we move forward with option B.",
    category: "Executive Presence",
    outcome: "From uncertain to assured"
  },
  {
    before: "Does that make sense?",
    after: "What questions do you have?",
    category: "Executive Presence",
    outcome: "From self-doubt to leadership"
  },
  {
    before: "I just wanted to quickly mention...",
    after: "I need to highlight a critical issue that requires immediate attention.",
    category: "Executive Presence",
    outcome: "From minimizing to emphasizing"
  },

  // Team Dynamics Category
  {
    before: "Why can't everyone just get along?",
    after: "I'm seeing friction. Let's understand what each person needs to feel supported.",
    category: "Team Dynamics",
    outcome: "From frustration to facilitation"
  },
  {
    before: "Some people on this team aren't pulling their weight.",
    after: "I want to ensure workload is balanced. Let's review who's responsible for what.",
    category: "Team Dynamics",
    outcome: "From blame to clarity"
  },
  {
    before: "We need better communication.",
    after: "Let's establish how we share updates, make decisions, and resolve conflicts.",
    category: "Team Dynamics",
    outcome: "From abstract to concrete"
  },
  {
    before: "Everyone needs to collaborate more.",
    after: "What's preventing effective collaboration? Let's identify and remove those barriers.",
    category: "Team Dynamics",
    outcome: "From directive to diagnostic"
  },
  {
    before: "The team morale is low.",
    after: "I'm noticing signs of disengagement. What would make this team environment more energizing?",
    category: "Team Dynamics",
    outcome: "From observation to action"
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
  {
    before: "Yeah, I think maybe we could probably try that if you want.",
    after: "I recommend we pursue this approach. Here's the strategic value I see.",
    situation: "Executive Presence",
    outcome: "From tentative to decisive"
  },
  {
    before: "Just wanted to circle back and see if you had any thoughts on this.",
    after: "I'd like your perspective on this initiative. What considerations should we prioritize?",
    situation: "Executive Presence",
    outcome: "From casual to intentional"
  },
  {
    before: "Sorry to bother you, but do you think maybe we could discuss this?",
    after: "I'd value your input on this matter. When can we connect to align on next steps?",
    situation: "Executive Presence",
    outcome: "From apologetic to confident"
  },
];

export { EXAMPLES };

export const ExamplesSection = () => {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [showUpgradeDialog, setShowUpgradeDialog] = React.useState(false);
  const { subscribed } = useSubscription();
  const PRO_PRODUCT_ID = 'prod_TB6tW8iBKEha8e';

  const handleClick = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleLockedClick = () => {
    setShowUpgradeDialog(true);
  };

  const filteredExamples = selectedCategory === "All" 
    ? EXAMPLES 
    : EXAMPLES.filter(ex => ex.category === selectedCategory);

  // Show diverse examples to free users - one from each key category
  const FREE_USER_LIMIT = 6;
  let displayExamples = filteredExamples;
  let lockedExamples: typeof EXAMPLES = [];
  
  if (!subscribed) {
    // Show diverse categories for free users
    const priorityCategories = ["Executive Presence", "Conflict", "Leadership", "Team Dynamics", "Workplace", "Feedback"];
    const diverseExamples: typeof EXAMPLES = [];
    
    priorityCategories.forEach(cat => {
      const example = filteredExamples.find(ex => ex.category === cat && !diverseExamples.includes(ex));
      if (example) diverseExamples.push(example);
    });
    
    displayExamples = diverseExamples.slice(0, FREE_USER_LIMIT);
    lockedExamples = filteredExamples.slice(FREE_USER_LIMIT, FREE_USER_LIMIT + 6);
  }

  const handlePracticeWithApril = (example: typeof EXAMPLES[0]) => {
    // This will be implemented to start a voice conversation with this example
    console.log("Practice with April AI:", example);
  };

  return (
    <div className="mb-8 md:mb-16 animate-fade-in">
      <div className="text-center mb-6 md:mb-8 px-4">
        <div className="inline-flex items-center gap-2 mb-3">
          <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-secondary animate-pulse" />
          <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
            The Impact Playbook
          </h2>
          <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-accent animate-pulse" />
        </div>
        <p className="text-sm md:text-base text-muted-foreground mb-4">
          Your answer key to better communication. Click any example to see the transformation.
        </p>
        {!subscribed && (
          <p className="text-xs md:text-sm text-accent font-semibold">
            ✨ Upgrade to unlock unlimited Impact Statements + practice with April AI
          </p>
        )}
      </div>

      {/* Category Filter - Pro Feature */}
      <div className="mb-6 px-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-sm font-semibold text-foreground">Filter by Category</span>
          {!subscribed && <ProFeatureBadge feature="Categories" inline />}
        </div>
        <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              onClick={() => subscribed ? setSelectedCategory(category) : null}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              disabled={!subscribed && category !== "All"}
              className={`text-xs md:text-sm ${!subscribed && category !== "All" ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-3 px-4">
        {displayExamples.map((example, index) => (
          <Card 
            key={index} 
            className="group relative overflow-hidden border-secondary/20 hover:shadow-[0_20px_50px_-10px_hsl(var(--secondary)/0.3)] transition-all duration-300 md:hover:scale-105 animate-fade-in hover:border-secondary/40"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="absolute top-2 right-2 px-2.5 py-1 bg-accent/90 rounded-full border border-accent-foreground/20">
              <p className="text-[9px] md:text-[10px] font-bold text-accent-foreground uppercase tracking-wider">
                {expandedIndex === index ? "Showing" : "Click"}
              </p>
            </div>
            <CardContent className="p-5 md:p-6 space-y-3 md:space-y-4">
              <Badge variant="secondary" className="text-[10px] md:text-xs font-bold uppercase tracking-wide">
                {example.category}
              </Badge>

              <div className="space-y-3">
                <div 
                  onClick={() => handleClick(index)}
                  className="p-3 bg-muted/50 border-2 border-border rounded-lg transform transition-all duration-200 cursor-pointer hover:border-secondary/30"
                >
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

              <div className="pt-3 border-t border-border/50 space-y-2">
                <p className="text-[10px] md:text-xs text-accent font-bold">✨ {example.outcome}</p>
                
                {/* Practice with April AI Button - Pro Feature */}
                {expandedIndex === index && (
                  <Button
                    size="sm"
                    onClick={() => subscribed ? handlePracticeWithApril(example) : null}
                    disabled={!subscribed}
                    className="w-full text-xs"
                    variant={subscribed ? "default" : "outline"}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {subscribed ? "Practice with April AI" : "Practice with April AI (Pro)"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Locked Examples for Free Users */}
        {lockedExamples.map((example, index) => (
          <Card 
            key={`locked-${index}`}
            onClick={handleLockedClick}
            className="group relative overflow-hidden border-accent/30 animate-fade-in cursor-pointer hover:border-accent/50 transition-all"
            style={{ animationDelay: `${(displayExamples.length + index) * 50}ms` }}
          >
            <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex flex-col items-center justify-center p-6 text-center space-y-3 hover:bg-background/90 transition-all">
              <div className="bg-accent/20 border-2 border-accent/40 rounded-full p-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-8 w-8 text-accent animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Unlock Unlimited</p>
                <p className="text-xs text-muted-foreground">Impact Statements</p>
              </div>
              <Button size="sm" variant="outline" className="border-accent/40 text-accent hover:bg-accent/10">
                Upgrade to Pro
              </Button>
            </div>
            <CardContent className="p-5 md:p-6 space-y-3 md:space-y-4 opacity-30">
              <Badge variant="secondary" className="text-[10px] md:text-xs font-bold uppercase tracking-wide">
                {example.category}
              </Badge>

              <div className="space-y-3">
                <div className="p-3 bg-muted/50 border-2 border-border rounded-lg">
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Before</p>
                  <p className="text-xs md:text-sm text-foreground/80 italic leading-relaxed font-medium">&ldquo;{example.before}&rdquo;</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50">
                <p className="text-[10px] md:text-xs text-accent font-bold">✨ {example.outcome}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {displayExamples.length === 0 && lockedExamples.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No examples found in this category.</p>
        </div>
      )}

      <UpgradeDialog 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog}
        feature="unlimited Impact Statements"
      />
    </div>
  );
};