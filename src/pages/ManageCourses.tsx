import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, Trash2, Edit, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  order_index: number;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  order_index: number;
}

export default function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [courseForm, setCourseForm] = useState({ title: "", description: "", is_published: false });
  const [lessonForm, setLessonForm] = useState({ title: "", description: "" });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse);
    }
  }, [selectedCourse]);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!data) {
      navigate("/dashboard");
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive"
      });
      return;
    }

    setIsAdmin(true);
  };

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("order_index");

    if (error) {
      console.error("Error fetching courses:", error);
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const fetchLessons = async (courseId: string) => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index");

    if (error) {
      console.error("Error fetching lessons:", error);
    } else {
      setLessons(data || []);
    }
  };

  const createCourse = async () => {
    if (!courseForm.title) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("courses").insert({
      title: courseForm.title,
      description: courseForm.description,
      is_published: courseForm.is_published,
      created_by: user.id,
      order_index: courses.length
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Course created" });
      setCourseForm({ title: "", description: "", is_published: false });
      fetchCourses();
    }
  };

  const uploadVideo = async (courseId: string) => {
    if (!videoFile || !lessonForm.title) {
      toast({ title: "Error", description: "Title and video are required", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const fileName = `${courseId}/${Date.now()}-${videoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("course-videos")
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("lessons").insert({
        course_id: courseId,
        title: lessonForm.title,
        description: lessonForm.description,
        video_url: fileName,
        order_index: lessons.length
      });

      if (insertError) throw insertError;

      toast({ title: "Success", description: "Lesson uploaded" });
      setLessonForm({ title: "", description: "" });
      setVideoFile(null);
      fetchLessons(courseId);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const deleteLesson = async (lessonId: string, videoUrl: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    const { error: deleteError } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (deleteError) {
      toast({ title: "Error", description: deleteError.message, variant: "destructive" });
      return;
    }

    await supabase.storage.from("course-videos").remove([videoUrl]);

    toast({ title: "Success", description: "Lesson deleted" });
    if (selectedCourse) fetchLessons(selectedCourse);
  };

  const togglePublish = async (courseId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !currentStatus })
      .eq("id", courseId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Course ${!currentStatus ? "published" : "unpublished"}` });
      fetchCourses();
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Manage Courses</h1>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Courses Column */}
          <div>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="Course title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder="Course description"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={courseForm.is_published}
                    onCheckedChange={(checked) => setCourseForm({ ...courseForm, is_published: checked })}
                  />
                  <Label>Publish immediately</Label>
                </div>
                <Button onClick={createCourse} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Courses</h2>
              <div className="space-y-2">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCourse === course.id ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                    onClick={() => setSelectedCourse(course.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                      </div>
                      <Switch
                        checked={course.is_published}
                        onCheckedChange={() => togglePublish(course.id, course.is_published)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Lessons Column */}
          <div>
            {selectedCourse && (
              <>
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Upload New Lesson</h2>
                  <div className="space-y-4">
                    <div>
                      <Label>Lesson Title</Label>
                      <Input
                        value={lessonForm.title}
                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                        placeholder="Lesson title"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={lessonForm.description}
                        onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                        placeholder="Lesson description"
                      />
                    </div>
                    <div>
                      <Label>Video File</Label>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <Button
                      onClick={() => uploadVideo(selectedCourse)}
                      disabled={uploading}
                      className="w-full"
                    >
                      {uploading ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Lesson
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Lessons</h2>
                  <div className="space-y-2">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                            <div>
                              <h3 className="font-medium">{lesson.title}</h3>
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteLesson(lesson.id, lesson.video_url)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
