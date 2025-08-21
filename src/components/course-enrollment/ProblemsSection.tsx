import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertTriangle, Clock, Check } from 'lucide-react';
import { CourseNote } from './types';
import { getAllProblems, formatTimestamp } from './utils';

interface ProblemsSectionProps {
  currentDay: any;
  onToggleProblemResolved: (courseId: string, noteId: string) => void;
}

export function ProblemsSection({ currentDay, onToggleProblemResolved }: ProblemsSectionProps) {
  const problems = getAllProblems(currentDay);

  if (problems.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-red-50 rounded border-l-4 border-red-500">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <h3 className="text-sm font-medium text-red-800">
          Problems Requiring Resolution ({problems.length})
        </h3>
      </div>
      <div className="space-y-2">
        {problems.map(({ courseId, courseName, note }) => (
          <div key={note.id} className="flex items-start justify-between p-2 bg-white rounded border">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-red-700">{courseName}</span>
                <Badge variant="outline" className="text-xs">
                  {note.author}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(note.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{note.text}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
              onClick={() => onToggleProblemResolved(courseId, note.id)}
            >
              <Check className="h-3 w-3 mr-1" />
              Resolve
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}