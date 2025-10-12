import { Target, MessageCircle, SlidersHorizontal, ArrowUpRight, RotateCcw } from "lucide-react";

const ImpactMethodDiagram = () => {
  const pillars = [
    {
      id: "intent",
      title: "INTENT",
      subtitle: "Clarity begins with intention.",
      icon: Target,
      color: "bg-[#0A3D62]",
    },
    {
      id: "message",
      title: "MESSAGE",
      subtitle: "Simplify to clarify.",
      icon: MessageCircle,
      color: "bg-[#00B3A4]",
    },
    {
      id: "position",
      title: "POSITION",
      subtitle: "Your tone is your influence.",
      icon: SlidersHorizontal,
      color: "bg-[#E77F00]",
    },
    {
      id: "action",
      title: "ACTION",
      subtitle: "Turn communication into movement.",
      icon: ArrowUpRight,
      color: "bg-[#FDB900]",
    },
    {
      id: "calibration",
      title: "CALIBRATION",
      subtitle: "Refine and re-align.",
      icon: RotateCcw,
      color: "bg-[#5A67D8]",
    }
  ];

  return (
    <>
      {/* Mobile View - Stacked Cards */}
      <div className="block md:hidden space-y-4">
        <div className="bg-gradient-to-r from-[#FDB900]/20 to-[#E77F00]/20 border-2 border-[#FDB900] rounded-xl p-4 text-center">
          <h3 className="text-lg font-bold mb-1">
            THE IMPACT LANGUAGE METHOD™
          </h3>
          <p className="text-xs text-muted-foreground">
            Better Communication. Better Results.
          </p>
        </div>
        
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              className="bg-card border border-border rounded-lg p-4 flex items-start gap-3 hover:border-primary/30 transition-colors"
            >
              <div className={`w-12 h-12 rounded-full ${pillar.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-bold mb-1 ${
                  pillar.id === 'intent' ? 'text-[#0A3D62]' :
                  pillar.id === 'message' ? 'text-[#00B3A4]' :
                  pillar.id === 'position' ? 'text-[#E77F00]' :
                  pillar.id === 'action' ? 'text-[#FDB900]' :
                  'text-[#5A67D8]'
                }`}>
                  {pillar.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {pillar.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View - Circular Layout */}
      <div className="hidden md:block relative w-full mx-auto px-4 sm:px-8 overflow-visible">
        <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center min-h-[600px] sm:min-h-[700px] md:min-h-[800px] py-12 sm:py-16">
          {/* Central Circle */}
          <div className="relative w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] md:w-[300px] md:h-[300px] lg:w-[340px] lg:h-[340px] rounded-full border-4 border-[#FDB900] bg-background shadow-2xl shadow-[#FDB900]/30 flex flex-col items-center justify-center z-10 animate-scale-in">
            <h3 className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold text-center mb-1 md:mb-2 px-2">
              THE IMPACT<br />
              LANGUAGE<br />
              METHOD™
            </h3>
            <p className="text-[9px] sm:text-xs md:text-sm lg:text-base text-center text-muted-foreground font-medium px-2">
              Better Communication.<br />
              Better Results.
            </p>
          </div>

          {/* Circular Container for Pillars */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[380px] max-h-[380px] sm:max-w-[600px] sm:max-h-[600px] md:max-w-[700px] md:max-h-[700px] lg:max-w-[800px] lg:max-h-[800px]">
            {/* Circle Path (visual guide) */}
            <svg className="absolute inset-0 w-full h-full -z-10 animate-spin-slow drop-shadow-[0_0_15px_rgba(253,185,0,0.5)]" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet">
              <circle
                cx="400"
                cy="400"
                r="280"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="4"
                strokeDasharray="8 8"
                className="drop-shadow-[0_0_20px_rgba(253,185,0,0.6)]"
              />
            </svg>

            {/* Pillars */}
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              const angle = (index * 72 - 90) * (Math.PI / 180);
              const radius = 35; // percentage
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);

              return (
                <div
                  key={pillar.id}
                  className="absolute pointer-events-auto animate-fade-in"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    animationDelay: `${index * 150}ms`
                  }}
                >
                  <div className="flex flex-col items-center text-center w-[80px] sm:w-[120px] md:w-[140px] lg:w-[160px]">
                    {/* Icon Circle */}
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full ${pillar.color} flex items-center justify-center mb-2 sm:mb-3 shadow-lg hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" strokeWidth={2} />
                    </div>
                    
                    {/* Title */}
                    <h4 className={`text-xs sm:text-sm md:text-base lg:text-lg font-bold mb-1 sm:mb-1.5 whitespace-nowrap ${
                      pillar.id === 'intent' ? 'text-[#0A3D62]' :
                      pillar.id === 'message' ? 'text-[#00B3A4]' :
                      pillar.id === 'position' ? 'text-[#E77F00]' :
                      pillar.id === 'action' ? 'text-[#FDB900]' :
                      'text-[#5A67D8]'
                    }`}>
                      {pillar.title}
                    </h4>
                    
                    {/* Subtitle */}
                    <p className="text-[9px] sm:text-xs md:text-sm lg:text-base text-muted-foreground leading-tight">
                      {pillar.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImpactMethodDiagram;
