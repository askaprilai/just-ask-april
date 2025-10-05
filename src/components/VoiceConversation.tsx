import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Lock } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ProFeatureBadge } from '@/components/ProFeatureBadge';
import aprilImage from '@/assets/april-headshot.jpeg';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

const ELEVENLABS_AGENT_ID = '1KtMKr5khbNAxBQoRs3X';

const VoiceConversation = () => {
  const { toast } = useToast();
  const { subscribed, productId } = useSubscription();
  const isPro = subscribed && productId === 'prod_TB6tW8iBKEha8e';
  const [transcript, setTranscript] = useState<Array<{ role: string; content: string }>>([]);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      toast({
        title: "Connected",
        description: "Voice conversation started with April",
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
    },
    onMessage: (message) => {
      console.log('Received message:', message);
      
      if (message.source === 'user') {
        setTranscript(prev => [...prev, { role: 'user', content: message.message }]);
      } else if (message.source === 'ai') {
        setTranscript(prev => [...prev, { role: 'assistant', content: message.message }]);
      }
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : "Failed to connect to voice service",
        variant: "destructive",
      });
    },
  });

  const startConversation = async () => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Voice practice requires a Pro subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get signed URL from our edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-signed-url', {
        body: { agentId: ELEVENLABS_AGENT_ID }
      });

      if (error) throw error;
      if (!data?.signed_url) throw new Error('No signed URL received');

      // Start the conversation with ElevenLabs using signed URL
      await conversation.startSession({ signedUrl: data.signed_url });
      setTranscript([]);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = async () => {
    await conversation.endSession();
  };

  useEffect(() => {
    return () => {
      conversation.endSession();
    };
  }, []);

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <div>
          <h3 className="text-xl font-semibold mb-2">Pro Feature</h3>
          <p className="text-muted-foreground mb-4">
            Voice practice with April is available for Pro subscribers only.
          </p>
          <ProFeatureBadge feature="Voice Practice" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8 p-8">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex flex-col items-center space-y-6">
          <div
            className={`relative transition-all duration-300 ${
              conversation.isSpeaking ? 'scale-110' : 'scale-100'
            } ${conversation.status === 'connected' ? 'ring-4 ring-primary ring-offset-4' : ''}`}
          >
            <div className="relative w-32 h-32 rounded-full overflow-hidden">
              {conversation.status === 'connected' && (
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
              )}
              <img
                src={aprilImage}
                alt="April Sabral"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Practice with April</h2>
          </div>

          <p className="text-muted-foreground mb-8">
            {conversation.status === 'connected'
              ? conversation.isSpeaking
                ? "April is speaking..."
                : "Listening..."
              : "Click the button below to start your practice conversation"}
          </p>

          <div className="flex gap-4 justify-center">
            {conversation.status !== 'connected' ? (
              <Button
                onClick={startConversation}
                size="lg"
                className="gap-2"
              >
                <Mic className="w-5 h-5" />
                Start Voice Practice
              </Button>
            ) : (
              <Button
                onClick={endConversation}
                size="lg"
                variant="destructive"
                className="gap-2"
              >
                <MicOff className="w-5 h-5" />
                End Conversation
              </Button>
            )}
          </div>

          {conversation.status === 'connected' && transcript.length > 0 && (
            <div className="w-full mt-8">
              <h3 className="text-lg font-semibold mb-4">Conversation Transcript</h3>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  {transcript.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {message.role === 'user' ? 'You' : 'April'}
                        </p>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VoiceConversation;
