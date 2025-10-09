import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface SubscriptionContextType {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  dailyUsage: number;
  incrementUsage: () => void;
  canUseFeature: boolean;
  isPro: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const PRO_PRODUCT_ID = 'prod_TB6tW8iBKEha8e';
const FREE_DAILY_LIMIT = 10;

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscribed(false);
        setProductId(null);
        setSubscriptionEnd(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;

      setSubscribed(data.subscribed || false);
      setProductId(data.product_id || null);
      setSubscriptionEnd(data.subscription_end || null);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscribed(false);
      setProductId(null);
      setSubscriptionEnd(null);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyUsage = () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `usage_${user.id}_${today}`;
    const stored = localStorage.getItem(storageKey);
    setDailyUsage(stored ? parseInt(stored, 10) : 0);
  };

  const incrementUsage = () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `usage_${user.id}_${today}`;
    const newUsage = dailyUsage + 1;
    setDailyUsage(newUsage);
    localStorage.setItem(storageKey, newUsage.toString());
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session) {
        checkSubscription();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session) {
        checkSubscription();
      } else {
        setSubscribed(false);
        setProductId(null);
        setSubscriptionEnd(null);
        setDailyUsage(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadDailyUsage();
  }, [user]);

  // Auto-refresh subscription status every minute
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const isPro = subscribed && productId === PRO_PRODUCT_ID;
  const canUseFeature = isPro || dailyUsage < FREE_DAILY_LIMIT;

  return (
    <SubscriptionContext.Provider
      value={{
        subscribed,
        productId,
        subscriptionEnd,
        loading,
        checkSubscription,
        dailyUsage,
        incrementUsage,
        canUseFeature,
        isPro,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
