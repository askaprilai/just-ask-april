import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { PhoneCall, PhoneOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import aprilImage from '@/assets/april-headshot.jpeg';

const VoiceConversation = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Message type:', event.type);
    
    if (event.type === 'response.audio_transcript.delta') {
      setTranscript(prev => {
        const newTranscript = [...prev];
        if (newTranscript.length > 0 && newTranscript[newTranscript.length - 1].startsWith('April: ')) {
          newTranscript[newTranscript.length - 1] += event.delta;
        } else {
          newTranscript.push('April: ' + event.delta);
        }
        return newTranscript;
      });
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      setTranscript(prev => [...prev, 'You: ' + event.transcript]);
    } else if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
    }
  };

  const startConversation = async () => {
    try {
      toast({
        title: "Starting conversation...",
        description: "Connecting to April",
      });

      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Connected",
        description: "You can now speak with April",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    setTranscript([]);
    
    toast({
      title: "Conversation ended",
      description: "Thanks for talking with April",
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="w-full space-y-4">
      <Card className="border-secondary/30 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-300 ${
              isSpeaking 
                ? 'border-secondary shadow-[0_0_30px_10px_hsl(var(--secondary)/0.6)] scale-110 animate-pulse' 
                : isConnected 
                  ? 'border-secondary shadow-lg' 
                  : 'border-muted'
            }`}>
              <img 
                src={aprilImage} 
                alt="April Sabral"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                {isConnected ? (isSpeaking ? 'April is speaking...' : 'Listening...') : 'Practice with April'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isConnected 
                  ? 'Have a conversation with April to practice your communication'
                  : 'Start a voice conversation to roleplay and practice'}
              </p>
            </div>

            {!isConnected ? (
              <Button 
                onClick={startConversation}
                size="lg"
                className="bg-gradient-to-r from-secondary to-accent hover:shadow-[0_0_30px_hsl(var(--secondary)/0.4)] transition-all duration-300"
              >
                <PhoneCall className="mr-2 h-5 w-5" />
                Start Voice Practice
              </Button>
            ) : (
              <Button 
                onClick={endConversation}
                variant="destructive"
                size="lg"
              >
                <PhoneOff className="mr-2 h-5 w-5" />
                End Conversation
              </Button>
            )}
          </div>

          {transcript.length > 0 && (
            <div className="mt-6 space-y-2 max-h-60 overflow-y-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Conversation</p>
              {transcript.map((line, index) => (
                <p 
                  key={index} 
                  className={`text-sm ${
                    line.startsWith('You:') 
                      ? 'text-foreground' 
                      : 'text-secondary font-medium'
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceConversation;
