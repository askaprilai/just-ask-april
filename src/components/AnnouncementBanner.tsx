import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

interface AnnouncementBannerProps {
  user: User | null;
}

export const AnnouncementBanner = ({ user }: AnnouncementBannerProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const fetchAnnouncements = async () => {
      // Get all active announcements
      const { data: activeAnnouncements, error: announcementsError } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (announcementsError) {
        console.error("Error fetching announcements:", announcementsError);
        return;
      }

      if (!activeAnnouncements || activeAnnouncements.length === 0) return;

      // Get announcements the user has already seen
      const { data: seenAnnouncements, error: seenError } = await supabase
        .from("user_announcements")
        .select("announcement_id")
        .eq("user_id", user.id);

      if (seenError) {
        console.error("Error fetching seen announcements:", seenError);
      }

      const seenIds = new Set(seenAnnouncements?.map(sa => sa.announcement_id) || []);
      
      // Filter out announcements the user has already seen
      const unseenAnnouncements = activeAnnouncements.filter(
        announcement => !seenIds.has(announcement.id)
      );

      setAnnouncements(unseenAnnouncements);
    };

    fetchAnnouncements();

    // Set up realtime subscription for new announcements
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
          filter: 'is_active=eq.true'
        },
        (payload) => {
          const newAnnouncement = payload.new as Announcement;
          setAnnouncements(prev => [newAnnouncement, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleDismiss = async (announcementId: string) => {
    if (!user) return;

    // Mark as seen in the database
    const { error } = await supabase
      .from("user_announcements")
      .insert({
        user_id: user.id,
        announcement_id: announcementId,
      });

    if (error) {
      console.error("Error marking announcement as seen:", error);
      return;
    }

    // Add to dismissed set and remove from announcements
    setDismissedIds(prev => new Set(prev).add(announcementId));
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
  };

  const visibleAnnouncements = announcements.filter(a => !dismissedIds.has(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibleAnnouncements.map((announcement) => (
        <Alert key={announcement.id} className="relative bg-gradient-to-r from-secondary/10 to-accent/10 border-secondary/30 animate-slide-up">
          <Bell className="h-4 w-4 text-secondary" />
          <AlertTitle className="flex items-center justify-between pr-8">
            {announcement.title}
          </AlertTitle>
          <AlertDescription>{announcement.message}</AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => handleDismiss(announcement.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  );
};