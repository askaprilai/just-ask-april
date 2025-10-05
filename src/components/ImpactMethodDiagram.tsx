import { Target, MessageCircle, SlidersHorizontal, ArrowUpRight, RotateCcw } from "lucide-react";

const ImpactMethodDiagram = () => {
  const pillars = [
    {
      id: "intent",
      title: "INTENT",
      subtitle: "Clarity begins with intention.",
      icon: Target,
      color: "bg-[#0A3D62]",
      position: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
    },
    {
      id: "message",
      title: "MESSAGE",
      subtitle: "Simplify to clarify.",
      icon: MessageCircle,
      color: "bg-[#00B3A4]",
      position: "top-[15%] right-[5%]"
    },
    {
      id: "position",
      title: "POSITION",
      subtitle: "Your tone is your influence.",
      icon: SlidersHorizontal,
      color: "bg-[#E77F00]",
      position: "bottom-[25%] right-[8%]"
    },
    {
      id: "action",
      title: "ACTION",
      subtitle: "Turn communication into movement.",
      icon: ArrowUpRight,
      color: "bg-[#FDB900]",
      position: "bottom-[15%] left-[15%]"
    },
    {
      id: "calibration",
      title: "CALIBRATION",
      subtitle: "Refine and re-align.",
      icon: RotateCcw,
      color: "bg-[#5A67D8]",
      position: "top-[30%] left-[5%]"
    }
  ];

  return (
    <div className="relative w-full max-w-3xl mx-auto pt-32 pb-16 px-4 flex items-center justify-center min-h-[600px] md:min-h-[700px]">
      {/* Central Circle */}
      <div className="relative w-[200px] h-[200px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px] rounded-full border-4 border-[#FDB900] bg-background shadow-2xl flex flex-col items-center justify-center z-10 animate-scale-in">
        <h3 className="text-lg md:text-2xl lg:text-3xl font-bold text-center mb-2">
          THE IMPACT<br />
          LANGUAGE<br />
          METHOD™
        </h3>
        <p className="text-xs md:text-sm lg:text-base text-center text-muted-foreground font-medium">
          Say it Better.<br />
          Get Better Results.
        </p>
      </div>

      {/* Circular Container for Pillars */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[600px] md:h-[600px] lg:w-[700px] lg:h-[700px] pointer-events-none">
        {/* Circle Path (visual guide) */}
        <svg className="absolute inset-0 w-full h-full -z-10" viewBox="0 0 700 700">
          <circle
            cx="350"
            cy="350"
            r="240"
            fill="none"
            stroke="hsl(var(--muted-foreground) / 0.2)"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
        </svg>

        {/* Pillars */}
        {pillars.map((pillar, index) => {
          const Icon = pillar.icon;
          const angle = (index * 72 - 90) * (Math.PI / 180); // 72 degrees apart, starting at top
          const radius = 240;
          const x = 350 + radius * Math.cos(angle);
          const y = 350 + radius * Math.sin(angle);

          return (
            <div
              key={pillar.id}
              className="absolute pointer-events-auto animate-fade-in"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${index * 150}ms`
              }}
            >
              <div className="flex flex-col items-center text-center max-w-[100px] md:max-w-[120px] lg:max-w-[140px]">
                {/* Icon Circle */}
                <div className={`w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full ${pillar.color} flex items-center justify-center mb-2 md:mb-3 shadow-lg hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" strokeWidth={2} />
                </div>
                
                {/* Title */}
                <h4 className={`text-sm md:text-base lg:text-lg font-bold mb-1 ${
                  pillar.id === 'intent' ? 'text-[#0A3D62]' :
                  pillar.id === 'message' ? 'text-[#00B3A4]' :
                  pillar.id === 'position' ? 'text-[#E77F00]' :
                  pillar.id === 'action' ? 'text-[#FDB900]' :
                  'text-[#5A67D8]'
                }`}>
                  {pillar.title}
                </h4>
                
                {/* Subtitle */}
                <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground leading-tight">
                  {pillar.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImpactMethodDiagram;
