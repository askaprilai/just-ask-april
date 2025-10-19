import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  duration_seconds: number;
  order_index: number;
}

interface LessonProgress {
  completed: boolean;
  last_position_seconds: number;
}

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress>({ completed: false, last_position_seconds: 0 });
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    fetchLesson();
    fetchAllLessons();
  }, [lessonId]);

  useEffect(() => {
    if (lesson && videoRef.current && progress.last_position_seconds > 0) {
      videoRef.current.currentTime = progress.last_position_seconds;
    }
  }, [lesson, progress]);

  const fetchLesson = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      // Get signed URL for video
      const { data: urlData } = await supabase.storage
        .from("course-videos")
        .createSignedUrl(lessonData.video_url, 3600); // 1 hour expiry

      if (urlData?.signedUrl) {
        setVideoUrl(urlData.signedUrl);
      }

      // Fetch progress
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (progressData) {
        setProgress({
          completed: progressData.completed,
          last_position_seconds: progressData.last_position_seconds
        });
      }
    } catch (error) {
      console.error("Error fetching lesson:", error);
      toast({
        title: "Error",
        description: "Failed to load lesson",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLessons = async () => {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index");

    if (data) {
      setAllLessons(data);
    }
  };

  const updateProgress = async (completed: boolean = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !videoRef.current) return;

    const currentTime = Math.floor(videoRef.current.currentTime);

    await supabase
      .from("lesson_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId!,
        last_position_seconds: currentTime,
        completed,
        completed_at: completed ? new Date().toISOString() : null
      });
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return;
    
    // Auto-save progress every 10 seconds
    const currentTime = Math.floor(videoRef.current.currentTime);
    if (currentTime % 10 === 0) {
      updateProgress();
    }
  };

  const handleVideoEnded = () => {
    updateProgress(true);
    setProgress(prev => ({ ...prev, completed: true }));
    toast({
      title: "Lesson Completed!",
      description: "Great job! Keep up the momentum.",
    });
  };

  const markAsComplete = () => {
    updateProgress(true);
    setProgress(prev => ({ ...prev, completed: true }));
    toast({
      title: "Lesson Marked Complete",
      description: "Your progress has been saved.",
    });
  };

  const navigateToLesson = (direction: "prev" | "next") => {
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < allLessons.length) {
      const newLesson = allLessons[newIndex];
      navigate(`/learning/${courseId}/${newLesson.id}`);
    }
  };

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allLessons.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Lesson not found</p>
          <Button onClick={() => navigate("/learning")}>Back to Courses</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/learning")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            
            {!progress.completed && (
              <Button onClick={markAsComplete} variant="outline">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Video Player */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-muted-foreground">{lesson.description}</p>
          )}
        </div>

        <Card className="overflow-hidden mb-6">
          <div className="aspect-video bg-black">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full h-full"
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <p>Loading video...</p>
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigateToLesson("prev")}
            disabled={!hasPrev}
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Lesson
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Lesson {currentIndex + 1} of {allLessons.length}
            </span>
            {progress.completed && (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            )}
          </div>

          <Button
            onClick={() => navigateToLesson("next")}
            disabled={!hasNext}
            variant="outline"
          >
            Next Lesson
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <Card className="mt-6 p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Course Progress</span>
            <span className="font-medium">
              {Math.round(((currentIndex + (progress.completed ? 1 : 0)) / allLessons.length) * 100)}%
            </span>
          </div>
          <Progress 
            value={((currentIndex + (progress.completed ? 1 : 0)) / allLessons.length) * 100} 
            className="h-2" 
          />
        </Card>
      </main>
    </div>
  );
}
