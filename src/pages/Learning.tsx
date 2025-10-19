import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, PlayCircle, CheckCircle2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  progress: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_seconds: number;
  order_index: number;
  completed: boolean;
  last_position_seconds: number;
}

export default function Learning() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProUser, setIsProUser] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkProAccess();
    fetchCourses();
  }, []);

  const checkProAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user has pro access
    const { data: profile } = await supabase
      .from("profiles")
      .select("manual_pro_access")
      .eq("id", user.id)
      .single();

    setIsProUser(profile?.manual_pro_access || false);
  };

  const fetchCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("order_index");

      if (coursesError) throw coursesError;

      // Fetch lessons and progress for each course
      const coursesWithLessons = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { data: lessonsData } = await supabase
            .from("lessons")
            .select("*")
            .eq("course_id", course.id)
            .order("order_index");

          const { data: progressData } = await supabase
            .from("lesson_progress")
            .select("*")
            .eq("user_id", user.id)
            .in("lesson_id", lessonsData?.map(l => l.id) || []);

          const lessons = lessonsData?.map(lesson => {
            const progress = progressData?.find(p => p.lesson_id === lesson.id);
            return {
              ...lesson,
              completed: progress?.completed || false,
              last_position_seconds: progress?.last_position_seconds || 0
            };
          }) || [];

          const completedLessons = lessons.filter(l => l.completed).length;
          const progress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

          return {
            ...course,
            lessons,
            progress
          };
        })
      );

      setCourses(coursesWithLessons);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (courseId: string, lessonId: string) => {
    if (!isProUser) {
      toast({
        title: "Pro Access Required",
        description: "Upgrade to Pro to access the learning platform",
        variant: "destructive"
      });
      return;
    }
    navigate(`/learning/${courseId}/${lessonId}`);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.lessons.some(lesson => lesson.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Learning Platform</h1>
              <p className="text-muted-foreground">Transform your leadership skills</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses or lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isProUser && (
          <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <Lock className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Pro Access Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upgrade to Pro to unlock all courses and transform your leadership skills.
                </p>
                <Button onClick={() => navigate("/pricing")}>
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </Card>
        )}

        {filteredCourses.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No courses found</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                      {course.description && (
                        <p className="text-muted-foreground mb-4">{course.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="secondary">
                          {course.lessons.length} Lessons
                        </Badge>
                        <span className="text-muted-foreground">
                          {course.lessons.filter(l => l.completed).length} completed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Course Progress</span>
                      <span className="font-medium">{Math.round(course.progress)}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  {/* Lessons List */}
                  <Accordion type="single" collapsible defaultValue={course.id}>
                    <AccordionItem value={course.id} className="border-0">
                      <AccordionTrigger className="hover:no-underline">
                        <span className="font-medium">Course Curriculum</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-4">
                          {course.lessons.map((lesson, index) => (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonClick(course.id, lesson.id)}
                              className="w-full flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
                              disabled={!isProUser}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                lesson.completed ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}>
                                {lesson.completed ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <span className="text-sm font-medium">{index + 1}</span>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{lesson.title}</h4>
                                {lesson.description && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {!isProUser && <Lock className="h-4 w-4 text-muted-foreground" />}
                                <PlayCircle className="h-5 w-5 text-primary" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
