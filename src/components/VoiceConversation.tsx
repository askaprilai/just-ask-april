import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Lock } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ProFeatureBadge } from '@/components/ProFeatureBadge';
import { UpgradeDialog } from '@/components/UpgradeDialog';
import aprilImage from '@/assets/april-headshot.jpeg';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

const ELEVENLABS_AGENT_ID = '1KtMKr5khbNAxBQoRs3X';

const VoiceConversation = () => {
  const { toast } = useToast();
  const { isPro } = useSubscription();
  const [transcript, setTranscript] = useState<Array<{ role: string; content: string }>>([]);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('✅ Connected to ElevenLabs');
      toast({
        title: "Connected",
        description: "Voice conversation started with April",
      });
    },
    onDisconnect: () => {
      console.log('❌ Disconnected from ElevenLabs');
    },
    onMessage: (message) => {
      console.log('📨 Received message:', message);
      console.log('Message source:', message.source);
      console.log('Message content:', message.message);
      
      if (message.source === 'user') {
        console.log('🎤 User spoke:', message.message);
        setTranscript(prev => [...prev, { role: 'user', content: message.message }]);
      } else if (message.source === 'ai') {
        console.log('🤖 AI responded:', message.message);
        setTranscript(prev => [...prev, { role: 'assistant', content: message.message }]);
      }
    },
    onError: (error) => {
      console.error('❌ ElevenLabs error:', error);
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : "Failed to connect to voice service",
        variant: "destructive",
      });
    },
    onModeChange: (mode) => {
      console.log('🔄 Mode changed to:', mode);
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
      console.log('Starting conversation...');
      
      // Check if browser supports necessary APIs
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone access. Please use Chrome, Firefox, or Safari.');
      }

      console.log('Requesting microphone permission...');
      
      // Request microphone permission
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted');
      } catch (micError: any) {
        console.error('Microphone permission error:', micError);
        
        if (micError.name === 'NotAllowedError' || micError.name === 'PermissionDeniedError') {
          throw new Error('Microphone access was denied. Please allow microphone access in your browser settings and try again.');
        } else if (micError.name === 'NotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        } else if (micError.name === 'NotReadableError') {
          throw new Error('Microphone is already in use by another application. Please close other apps using the microphone and try again.');
        } else {
          throw new Error(`Microphone error: ${micError.message}`);
        }
      }
      
      console.log('Getting signed URL from edge function...');
      
      // Get signed URL from our edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-signed-url', {
        body: { agentId: ELEVENLABS_AGENT_ID }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      if (!data?.signed_url) {
        console.error('No signed URL in response:', data);
        throw new Error('No signed URL received');
      }

      console.log('Signed URL received, starting ElevenLabs session...');

      // Start the conversation with ElevenLabs using signed URL
      await conversation.startSession({ signedUrl: data.signed_url });
      setTranscript([]);
      
      console.log('Conversation started successfully');
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
      <>
        <div className="flex flex-col items-center justify-center space-y-6 py-6">
          <Card className="w-full max-w-2xl p-6 cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setShowUpgradeDialog(true)}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* April's Photo with Glow Effect */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent rounded-full blur-xl opacity-60 animate-pulse" />
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-secondary/30 shadow-lg">
                  <img
                    src={aprilImage}
                    alt="April Sabral"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 shadow-md">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div>
                  <h2 className="text-xl font-bold mb-1 flex items-center justify-center md:justify-start gap-2">
                    Practice with April AI
                    <Badge variant="secondary" className="text-xs">PRO</Badge>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Have real-time voice conversations to practice difficult conversations
                  </p>
                </div>

                {/* Voice Example Preview */}
                <div className="bg-muted/30 rounded-lg p-3 border border-border">
                  <p className="text-xs font-medium mb-2 text-muted-foreground">🎧 Example: Hear April's voice</p>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
                            body: { 
                              text: "Hi! I'm April. Let's practice your conversation together.",
                              voiceId: ELEVENLABS_AGENT_ID
                            }
                          });
                          
                          if (error) throw error;
                          
                          const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
                          audio.play();
                        } catch (error) {
                          console.error('Error playing sample:', error);
                          toast({
                            title: "Error",
                            description: "Failed to play sample audio",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="gap-2"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      Play Sample
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      "Hi! I'm April. Let's practice your conversation together."
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowUpgradeDialog(true)}
                  className="w-full md:w-auto gap-2"
                >
                  Unlock Voice Practice
                  <Lock className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
        <UpgradeDialog 
          open={showUpgradeDialog} 
          onOpenChange={setShowUpgradeDialog}
          feature="Voice Practice with April AI"
        />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-4">
      <Card className="w-full max-w-2xl p-4">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          {/* April's Photo with Dynamic Glow */}
          <div className="flex-shrink-0">
            <div
              className={`relative transition-all duration-300 ${
                conversation.isSpeaking ? 'scale-110' : 'scale-100'
              }`}
            >
              {conversation.status === 'connected' && (
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent rounded-full blur-xl opacity-70 animate-pulse" />
              )}
              <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 transition-all ${
                conversation.status === 'connected' 
                  ? 'border-secondary shadow-lg shadow-secondary/50' 
                  : 'border-secondary/30'
              }`}>
                {conversation.status === 'connected' && (
                  <div className="absolute inset-0 bg-secondary/20 rounded-full animate-pulse" />
                )}
                <img
                  src={aprilImage}
                  alt="April Sabral"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 w-full space-y-3">
            <div className="text-center md:text-left">
              <h2 className="text-lg font-bold mb-1">Practice with April AI</h2>
              <p className="text-sm text-muted-foreground">
                {conversation.status === 'connected'
                  ? conversation.isSpeaking
                    ? "April is speaking..."
                    : "Listening to you..."
                  : "Click below to start your voice practice session"}
              </p>
            </div>

            <div className="flex gap-3 justify-center md:justify-start">
              {conversation.status !== 'connected' ? (
                <Button
                  onClick={startConversation}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-secondary to-accent hover:opacity-90"
                >
                  <Mic className="w-4 h-4" />
                  Start Voice Practice
                </Button>
              ) : (
                <Button
                  onClick={endConversation}
                  size="lg"
                  variant="destructive"
                  className="gap-2"
                >
                  <MicOff className="w-4 h-4" />
                  End Conversation
                </Button>
              )}
            </div>

            {conversation.status === 'connected' && transcript.length > 0 && (
              <div className="w-full">
                <h3 className="text-sm font-semibold mb-2">Conversation Transcript</h3>
                <ScrollArea className="h-[160px] w-full rounded-md border p-2">
                  <div className="space-y-3">
                    {transcript.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-2 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-xs font-medium mb-0.5">
                            {message.role === 'user' ? 'You' : 'April'}
                          </p>
                          <p className="text-xs">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VoiceConversation;
