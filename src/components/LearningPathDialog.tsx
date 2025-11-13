import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Course {
  course_id: string;
  title: string;
  description: string;
  reason: string;
}

interface LearningPathDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  analysisSummary: string;
}

export const LearningPathDialog = ({
  open,
  onOpenChange,
  courses,
  analysisSummary,
}: LearningPathDialogProps) => {
  const navigate = useNavigate();

  const handleViewCourses = () => {
    onOpenChange(false);
    navigate('/learning');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <DialogTitle>Your Personalized Learning Path</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {analysisSummary}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Recommended Courses
          </h3>
          
          {courses.map((course, index) => (
            <Card key={course.course_id} className="p-4 hover:border-accent/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-accent" />
                    {course.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {course.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleViewCourses}
            className="flex-1 bg-gradient-to-r from-secondary to-accent hover:opacity-90"
          >
            View Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};