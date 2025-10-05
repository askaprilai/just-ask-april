import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface ProFeatureBadgeProps {
  feature: string;
  inline?: boolean;
}

export const ProFeatureBadge = ({ feature, inline = false }: ProFeatureBadgeProps) => {
  const { subscribed, productId } = useSubscription();
  const PRO_PRODUCT_ID = 'prod_TB6tW8iBKEha8e';
  const isPro = subscribed && productId === PRO_PRODUCT_ID;

  if (isPro) return null;

  if (inline) {
    return (
      <Badge variant="outline" className="ml-2 text-xs border-accent/30 text-accent">
        <Lock className="h-3 w-3 mr-1" />
        Pro
      </Badge>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20">
      <Lock className="h-3 w-3 text-accent" />
      <span className="text-xs font-medium text-accent">{feature}</span>
    </div>
  );
};
