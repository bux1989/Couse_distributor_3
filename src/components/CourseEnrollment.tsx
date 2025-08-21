import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Users, Home, ArrowRight, Search, Calendar, X, RotateCcw, Lock, Unlock, Check, AlertTriangle, MessageSquare, Plus, Clock, Edit2, Trash2, Save, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

import { Semester, Course, CourseNote, Child } from './course-enrollment/types';
import { mockSemesters } from './course-enrollment/constants';
import { 
  sortChildrenByClassAndName,
  processAutomaticEnrollment,
  getChildrenInCourse,
  getCurrentEnrollmentRank,
  formatPreferenceDisplay,
  getPreferenceBorderClass,
  hasGoHomePreference,
  getChildSchedule,
  getChildPreferences,
  getPreferenceRank,
  getChildrenInCourseForDay,
  filteredChildren,
  getCourseAvailableSpots,
  getCourseName,
  getAvailableCoursesForMove,
  getAvailableCoursesForMoveForDay,
  formatTimestamp,
  getMovementBlockingReason
} from './course-enrollment/utils';
import { ProblemsSection } from './course-enrollment/ProblemsSection';
import { GoHomeSection } from './course-enrollment/GoHomeSection';

export function CourseEnrollment() {
  const [semesters, setSemesters] = useState<Semester[]>(mockSemesters);
  const [selectedSemesterIndex, setSelectedSemesterIndex] = useState<number>(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activePopoverForm, setActivePopoverForm] = useState<{childId: string, courseId: string, dayIndex: number} | null>(null);
  const [approvedCourses, setApprovedCourses] = useState<{[key: string]: boolean}>({});
  const [newNoteText, setNewNoteText] = useState<{[courseKey: string]: string}>({});
  const [showAddNote, setShowAddNote] = useState<{[courseKey: string]: boolean}>({});
  const [editingNote, setEditingNote] = useState<{courseId: string, noteId: string} | null>(null);
  const [editNoteText, setEditNoteText] = useState<string>('');
  const [notesVisible, setNotesVisible] = useState<{[courseKey: string]: boolean}>({});
  const [childrenVisible, setChildrenVisible] = useState<{[courseKey: string]: boolean}>({});
  const [courseDetailsVisible, setCourseDetailsVisible] = useState<{[courseKey: string]: boolean}>({});

  const currentSemester = semesters[selectedSemesterIndex];
  const currentDay = currentSemester.schedule[selectedDayIndex];

  const toggleCourseFull = (courseId: string) => {
    setSemesters(prev => prev.map((semester, semIdx) => {
      if (semIdx !== selectedSemesterIndex) return semester;
      
      return {
        ...semester,
        schedule: semester.schedule.map((day, dIdx) => {
          if (dIdx !== selectedDayIndex) return day;
          
          return {
            ...day,
            courses: day.courses.map(course => 
              course.id === courseId 
                ? { ...course, forcedFull: !course.forcedFull }
                : course
            )
          };
        })
      };
    }));
  };

  const toggleCourseApproval = (courseId: string) => {
    const approvalKey = `${selectedSemesterIndex}-${selectedDayIndex}-${courseId}`;
    setApprovedCourses(prev => ({
      ...prev,
      [approvalKey]: !prev[approvalKey]
    }));
  };

  const isCourseApproved = (courseId: string) => {
    const approvalKey = `${selectedSemesterIndex}-${selectedDayIndex}-${courseId}`;
    return approvedCourses[approvalKey] || false;
  };

  // Auto-enroll students when component mounts or day/semester changes
  const autoEnrollStudents = () => {
    const updatedSemester = processAutomaticEnrollment(selectedSemesterIndex, selectedDayIndex, currentSemester);
    setSemesters(prev => prev.map((sem, idx) => 
      idx === selectedSemesterIndex ? updatedSemester : sem
    ));
  };

  const moveChildToCourse = (childId: string, newCourseId: string, targetDayIndex?: number) => {
    const dayIndex = targetDayIndex !== undefined ? targetDayIndex : selectedDayIndex;
    setSemesters(prev => prev.map((semester, semIdx) => {
      if (semIdx !== selectedSemesterIndex) return semester;
      
      return {
        ...semester,
        schedule: semester.schedule.map((day, dIdx) => {
          if (dIdx !== dayIndex) return day;
          
          return {
            ...day,
            courses: day.courses.map(course => {
              // Remove child from current course
              if (course.enrolledChildren.includes(childId)) {
                return {
                  ...course,
                  enrolledChildren: course.enrolledChildren.filter(id => id !== childId)
                };
              }
              // Add child to new course (if not going home)
              if (course.id === newCourseId && newCourseId !== 'go-home') {
                return {
                  ...course,
                  enrolledChildren: [...course.enrolledChildren, childId]
                };
              }
              return course;
            })
          };
        }),
        children: semester.children.map(child => 
          child.id === childId 
            ? { 
                ...child, 
                enrollments: { 
                  ...child.enrollments, 
                  [dayIndex]: newCourseId === 'go-home' ? undefined : newCourseId 
                }
              }
            : child
        )
      };
    }));
    
    // Move completed
  };

  const resetActiveForm = () => {
    setActivePopoverForm(null);
  };

  const getUnenrolledChildren = () => {
    const enrolledIds = currentDay.courses.flatMap(course => course.enrolledChildren);
    return currentSemester.children.filter(child => 
      !enrolledIds.includes(child.id) && 
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      // Exclude children who are intentionally going home (have go-home preferences or explicitly set to go home)
      !(child.enrollments[selectedDayIndex] === undefined && hasGoHomePreference(child))
    );
  };

  const moveChildToWaitingList = (childId: string) => {
    setSemesters(prev => prev.map((semester, semIdx) => {
      if (semIdx !== selectedSemesterIndex) return semester;
      
      return {
        ...semester,
        schedule: semester.schedule.map((day, dIdx) => {
          if (dIdx !== selectedDayIndex) return day;
          
          return {
            ...day,
            courses: day.courses.map(course => ({
              ...course,
              enrolledChildren: course.enrolledChildren.filter(id => id !== childId)
            }))
          };
        }),
        children: semester.children.map(child => 
          child.id === childId 
            ? { 
                ...child, 
                enrollments: { 
                  ...child.enrollments, 
                  [selectedDayIndex]: undefined 
                }
              }
            : child
        )
      };
    }));

  };

  // Notes functionality
  const addNote = (courseId: string, text: string) => {
    if (!text.trim()) return;
    
    const newNote: CourseNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      author: 'Admin', // In a real app, this would come from user authentication
      timestamp: new Date(),
      isProblem: false,
      isResolved: false
    };

    setSemesters(prev => prev.map((semester, semIdx) => {
      if (semIdx !== selectedSemesterIndex) return semester;
      
      return {
        ...semester,
        schedule: semester.schedule.map((day, dIdx) => {
          if (dIdx !== selectedDayIndex) return day;
          
          return {
            ...day,
            courses: day.courses.map(course => 
              course.id === courseId 
                ? { ...course, notes: [...course.notes, newNote] }
                : course
            )
          };
        })
      };
    }));

    // Clear the input
    const courseKey = `${selectedSemesterIndex}-${selectedDayIndex}-${courseId}`;
    setNewNoteText(prev => ({ ...prev, [courseKey]: '' }));
    setShowAddNote(prev => ({ ...prev, [courseKey]: false }));
  };

  const toggleNoteProblem = (courseId: string, noteId: string) => {
    setSemesters(prev => prev.map((semester, semIdx) => {
      if (semIdx !== selectedSemesterIndex) return semester;
      
      return {
        ...semester,
        schedule: semester.schedule.map((day, dIdx) => {
          if (dIdx !== selectedDayIndex) return day;
          
          return {
            ...day,
            courses: day.courses.map(course => 
              course.id === courseId 
                ? { 
                    ...course, 
                    notes: course.notes.map(note =>
                      note.id === noteId 
                        ? { ...note, isProblem: !note.isProblem, isResolved: note.isProblem ? false : note.isResolved }
                        : note
                    )
                  }
                : course
            )
          };
        })
      };
    }));
  };

  const toggleProblemResolved = (courseId: string, noteId: string) => {
    setSemesters(prev => prev.map((semester, semIdx) => {
      if (semIdx !== selectedSemesterIndex) return semester;
      
      return {
        ...semester,
        schedule: semester.schedule.map((day, dIdx) => {
          if (dIdx !== selectedDayIndex) return day;
          
          return {
            ...day,
            courses: day.courses.map(course => 
              course.id === courseId 
                ? { 
                    ...course, 
                    notes: course.notes.map(note =>
                      note.id === noteId 
                        ? { ...note, isResolved: !note.isResolved }
                        : note
                    )
                  }
                : course
            )
          };
        })
      };
    }));
  };

  const deleteNote = (courseId: string, noteId: string) => {
    setSemesters(prev => prev.map((semester, semIdx) => {
      if (semIdx !== selectedSemesterIndex) return semester;
      
      return {
        ...semester,
        schedule: semester.schedule.map((day, dIdx) => {
          if (dIdx !== selectedDayIndex) return day;
          
          return {
            ...day,
            courses: day.courses.map(course => 
              course.id === courseId 
                ? { ...course, notes: course.notes.filter(note => note.id !== noteId) }
                : course
            )
          };
        })
      };
    }));
  };

  const startEditNote = (courseId: string, noteId: string, currentText: string) => {
    setEditingNote({ courseId, noteId });
    setEditNoteText(currentText);
  };

  const cancelEditNote = () => {
    setEditingNote(null);
    setEditNoteText('');
  };

  const saveEditNote = (courseId: string, noteId: string) => {
    if (!editNoteText.trim()) return;

    setSemesters(prev => prev.map((semester, semIdx) => {
      if (semIdx !== selectedSemesterIndex) return semester;
      
      return {
        ...semester,
        schedule: semester.schedule.map((day, dIdx) => {
          if (dIdx !== selectedDayIndex) return day;
          
          return {
            ...day,
            courses: day.courses.map(course => 
              course.id === courseId 
                ? { 
                    ...course, 
                    notes: course.notes.map(note =>
                      note.id === noteId 
                        ? { ...note, text: editNoteText.trim() }
                        : note
                    )
                  }
                : course
            )
          };
        })
      };
    }));

    setEditingNote(null);
    setEditNoteText('');
  };

  const toggleNotesVisibility = (courseId: string) => {
    const courseKey = `${selectedSemesterIndex}-${selectedDayIndex}-${courseId}`;
    setNotesVisible(prev => ({
      ...prev,
      [courseKey]: !prev[courseKey]
    }));
  };

  const toggleChildrenVisibility = (courseId: string) => {
    const courseKey = `${selectedSemesterIndex}-${selectedDayIndex}-${courseId}`;
    setChildrenVisible(prev => ({
      ...prev,
      [courseKey]: !prev[courseKey]
    }));
  };

  const isNotesVisible = (courseId: string) => {
    const courseKey = `${selectedSemesterIndex}-${selectedDayIndex}-${courseId}`;
    return notesVisible[courseKey] !== false; // Default to true if not set
  };

  const isChildrenVisible = (courseId: string) => {
    const courseKey = `${selectedSemesterIndex}-${selectedDayIndex}-${courseId}`;
    return childrenVisible[courseKey] !== false; // Default to true if not set
  };

  const toggleCourseDetailsVisibility = (courseId: string) => {
    const courseKey = `${selectedSemesterIndex}-${selectedDayIndex}-${courseId}`;
    setCourseDetailsVisible(prev => ({
      ...prev,
      [courseKey]: !prev[courseKey]
    }));
  };

  const isCourseDetailsVisible = (courseId: string) => {
    const courseKey = `${selectedSemesterIndex}-${selectedDayIndex}-${courseId}`;
    return courseDetailsVisible[courseKey] || false; // Default to false (hidden)
  };

  const renderSchedulePopover = (childId: string, day: string, dayIndex: number, activity: string) => {
    const preferences = getChildPreferences(childId, currentSemester, currentDay);
    const currentChoice = preferences.find(p => p.courseId === activity);
    const enrolledChildren = activity !== 'go-home' ? getChildrenInCourseForDay(dayIndex, activity, currentSemester) : [];
    const isPopoverFormOpen = activePopoverForm?.childId === childId && activePopoverForm?.dayIndex === dayIndex;
    
    const renderPopoverInlineForm = (targetCourseId: string) => {
      const availableSpots = getCourseAvailableSpotsForDay(dayIndex, targetCourseId, currentSemester);
      const courseName = getCourseName(targetCourseId, currentDay);
      const isGoHome = targetCourseId === 'go-home';
      const targetEnrolledChildren = isGoHome ? [] : getChildrenInCourseForDay(dayIndex, targetCourseId, currentSemester);

      
      return (
        <div className="mt-2 p-2 bg-accent/30 rounded border text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-xs">{courseName}</span>
              {!isGoHome && (
                <Badge variant="outline" className="text-xs">
                  {targetEnrolledChildren.length}/{currentSemester.schedule[dayIndex].courses.find(c => c.id === targetCourseId)?.maxCapacity}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => setActivePopoverForm(null)}
            >
              <X className="h-2 w-2" />
            </Button>
          </div>

          {!isGoHome && targetEnrolledChildren.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-1">Currently enrolled:</p>
              <div className="space-y-1">
                {sortChildrenByClassAndName(targetEnrolledChildren).map(child => {
                  const availableMoveCourses = getAvailableCoursesForMoveForDay(dayIndex, targetCourseId, currentSemester);
                  
                  return (
                    <div key={child?.id} className="flex items-center justify-between py-0.5 px-1 bg-background/80 rounded">
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{child?.class} {child?.name}</span>
                      </div>
                      
                      {availableMoveCourses.length > 0 && (
                        <Select onValueChange={(value) => moveChildToCourse(child?.id || '', value, dayIndex)}>
                          <SelectTrigger className="h-4 w-16 text-xs">
                            <SelectValue placeholder="Move" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableMoveCourses.map(course => (
                              <SelectItem key={course.id} value={course.id} className="text-xs">
                                {course.name}
                                {course.spotsAvailable !== null && (
                                  <span className="ml-1 text-muted-foreground">
                                    ({course.spotsAvailable})
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isGoHome && targetEnrolledChildren.length === 0 && (
            <div className="mb-2 py-1 text-center text-xs text-muted-foreground">
              No children enrolled
            </div>
          )}

          <Button
            size="sm"
            className="h-5 px-2 text-xs w-full"
            onClick={() => {
              const blockingReason = getMovementBlockingReason(childId, targetCourseId, currentSemester, dayIndex);
              if (blockingReason) {
                alert(`Cannot move child: ${blockingReason}`);
              } else {
                moveChildToCourse(childId, targetCourseId, dayIndex);
              }
            }}
            variant={(() => {
              const blockingReason = getMovementBlockingReason(childId, targetCourseId, currentSemester, dayIndex);
              return blockingReason ? 'destructive' : 'default';
            })()}
            title={(() => {
              const blockingReason = getMovementBlockingReason(childId, targetCourseId, currentSemester, dayIndex);
              return blockingReason || '';
            })()}
          >
            {(() => {
              const blockingReason = getMovementBlockingReason(childId, targetCourseId, currentSemester, dayIndex);
              if (blockingReason) {
                return `⚠️ ${blockingReason}`;
              }
              return isGoHome 
                ? 'Send Home' 
                : `Move Here (${availableSpots} free)`;
            })()}
          </Button>
        </div>
      );
    };
    
    return (
      <PopoverContent className="w-64 p-2">
        <div className="space-y-2">
          <p className="text-xs mb-2">
            {day} - {activity === 'go-home' ? 'Going Home' : activity}
          </p>
          
          {currentChoice && (
            <div className="mb-2 p-1 bg-accent/50 rounded">
              <p className="text-xs">Current: {currentChoice.choice} choice</p>
            </div>
          )}
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Student's preferences:</p>
            {preferences.map(({ choice, courseId, name }) => (
              <div 
                key={choice} 
                className={`text-xs flex items-center justify-between px-1 py-0.5 rounded ${
                  courseId === activity ? 'bg-primary/10' : ''
                }`}
              >
                <span>{choice}:</span>
                <Badge 
                  variant={courseId === activity ? 'default' : 'outline'} 
                  className={`text-xs ${courseId !== 'go-home' ? 'cursor-pointer hover:bg-accent' : ''}`}
                  onClick={() => {
                    if (courseId !== 'go-home') {
                      setActivePopoverForm({ childId, courseId, dayIndex });
                    }
                  }}
                >
                  {name}
                  {courseId !== 'go-home' && (
                    <span className="ml-1 text-muted-foreground">
                      {(() => {
                        const day = currentSemester.schedule[dayIndex];
                        const course = day.courses.find(c => c.id === courseId);
                        return course ? `${course.enrolledChildren.length}/${course.maxCapacity}` : '';
                      })()}
                    </span>
                  )}
                </Badge>
              </div>
            ))}
          </div>

          {isPopoverFormOpen && activePopoverForm && renderPopoverInlineForm(activePopoverForm.courseId)}

          {activity !== 'go-home' && (
            <div className="space-y-1 border-t pt-2">
              <p className="text-xs text-muted-foreground">
                Other students enrolled: {getCourseName(activity, currentDay)}{currentChoice && ` (${currentChoice.choice} choice)`}
              </p>
              {enrolledChildren.length > 0 ? (
                <div className="space-y-1">
                  {sortChildrenByClassAndName(enrolledChildren).map(courseChild => (
                    <div key={courseChild?.id} className="text-xs flex items-center gap-1">
                      <span>{courseChild?.class} {courseChild?.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No other students</p>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    );
  };

  const renderPreferencePopover = (childId: string, choice: 'first' | 'second' | 'third', targetCourse: string) => {
    const preferences = getChildPreferences(childId, currentSemester, currentDay);
    const currentChoice = preferences.find(p => p.courseId === targetCourse);
    const courseName = getCourseName(targetCourse, currentDay);
    const isGoHome = targetCourse === 'go-home';
    const enrolledChildren = isGoHome ? [] : getChildrenInCourse(targetCourse, currentDay, currentSemester);
    const availableSpots = getCourseAvailableSpots(targetCourse, currentDay);
    const blockingReason = getMovementBlockingReason(childId, targetCourse, currentSemester, selectedDayIndex);
    
    return (
      <PopoverContent className="w-64 p-2">
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <span className="text-xs">
              <span className="font-bold">({choice === 'first' ? '1' : choice === 'second' ? '2' : '3'}):</span> <span className="font-bold">{courseName}</span>
            </span>
            {!isGoHome && (
              <Badge variant="outline" className="text-xs">
                {enrolledChildren.length}/{currentDay.courses.find(c => c.id === targetCourse)?.maxCapacity}
              </Badge>
            )}
          </div>

          {/* Move Here Button at Top */}
          <Button
            size="sm"
            className="h-6 px-2 text-xs w-full"
            onClick={() => {
              if (blockingReason) {
                alert(`Cannot move child: ${blockingReason}`);
              } else {
                moveChildToCourse(childId, targetCourse);
              }
            }}
            variant={blockingReason ? 'destructive' : 'default'}
            title={blockingReason || ''}
          >
            {blockingReason 
              ? `⚠️ ${blockingReason}` 
              : (isGoHome 
                ? 'Send Home at 14:30' 
                : `Move Here (${availableSpots} free)`)
            }
          </Button>

          {/* Compact Currently Enrolled Section */}
          {!isGoHome && enrolledChildren.length > 0 && (
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground mb-1">Currently enrolled ({enrolledChildren.length}):</p>
              <div className="text-xs text-muted-foreground space-y-0.5">
                {sortChildrenByClassAndName(enrolledChildren).map(child => (
                  <div key={child?.id} className="flex items-center gap-1">
                    <span>{child?.class} {child?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isGoHome && enrolledChildren.length === 0 && (
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground text-center">No children currently enrolled</p>
            </div>
          )}
        </div>
      </PopoverContent>
    );
  };

  const getCourseAvailableSpotsForDay = (dayIndex: number, courseId: string, currentSemester: Semester) => {
    if (courseId === 'go-home') return null;
    const day = currentSemester.schedule[dayIndex];
    const course = day.courses.find(c => c.id === courseId);
    if (!course) return 0;
    if (course.forcedFull) return 0;
    return course.maxCapacity - course.enrolledChildren.length;
  };

  return (
    <div className="p-4">
      {/* Header with semester, day selection and search */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <h1 className="mb-1">Course Enrollment</h1>
          <p className="text-sm text-muted-foreground">
            {currentSemester.name} - {currentDay.day}
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={autoEnrollStudents}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Reset to First Choices
        </Button>
        
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search students..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-40"
          />
        </div>

        <Select value={selectedSemesterIndex.toString()} onValueChange={(value) => setSelectedSemesterIndex(parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((semester, index) => (
              <SelectItem key={index} value={index.toString()}>
                {semester.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDayIndex.toString()} onValueChange={(value) => setSelectedDayIndex(parseInt(value))}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentSemester.schedule.map((day, index) => (
              <SelectItem key={index} value={index.toString()}>
                {day.day.slice(0, 3)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Problems Section */}
      <ProblemsSection 
        currentDay={currentDay} 
        onToggleProblemResolved={toggleProblemResolved}
      />

      {/* Go Home Section */}
      <GoHomeSection 
        currentSemester={currentSemester}
        selectedDayIndex={selectedDayIndex}
        selectedSemesterIndex={selectedSemesterIndex}
        searchQuery={searchQuery}
        approvedCourses={approvedCourses}
        renderSchedulePopover={renderSchedulePopover}
        renderPreferencePopover={renderPreferencePopover}
        moveChildToCourse={moveChildToCourse}
        moveChildToWaitingList={moveChildToWaitingList}
        currentDay={currentDay}
      />

      {/* Unenrolled Children */}
      {getUnenrolledChildren().length > 0 && (
        <div className="mb-4 p-3 bg-muted/30 rounded border-l-2 border-muted-foreground">
          <h3 className="mb-2 text-sm flex items-center gap-1">
            <Users className="h-3 w-3" />
            Waiting ({getUnenrolledChildren().length})
          </h3>
          <div className="space-y-1">
            {sortChildrenByClassAndName(getUnenrolledChildren()).map(child => {
              const schedule = getChildSchedule(child.id, currentSemester, true, selectedDayIndex);

              return (
                <div key={child.id}>
                  <div className="flex items-center justify-between py-1 px-2 bg-background rounded text-sm">
                    <div className="flex items-center gap-2">
                      <span>{child.class} {child.name}</span>
                      <div className="flex gap-1 text-xs text-muted-foreground">
                        {schedule.map(({ day, dayIndex, activity }) => {
                          const preferenceRank = getPreferenceRank(child.id, activity, currentSemester);
                          return (
                            <Popover key={dayIndex}>
                              <PopoverTrigger asChild>
                                <div className="cursor-pointer hover:bg-muted rounded px-1 py-0.5">
                                  {day.slice(0, 3)}{preferenceRank && ` (${preferenceRank})`}: {activity === 'go-home' ? 'Home' : activity}
                                </div>
                              </PopoverTrigger>
                              {renderSchedulePopover(child.id, day, dayIndex, activity)}
                            </Popover>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {/* First Choice */}
                      {(() => {
                        const currentRank = getCurrentEnrollmentRank(child.id, selectedDayIndex, currentSemester);
                        const isCurrentChoice = currentRank === 1;
                        const borderClass = getPreferenceBorderClass(currentRank === 1 ? 1 : null);
                        
                        if (child.firstChoice === 'go-home') {
                          return (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className={`h-6 px-2 text-xs ${borderClass} ${isCurrentChoice ? 'cursor-default' : ''}`}
                              onClick={() => {
                                if (!isCurrentChoice) {
                                  moveChildToCourse(child.id, 'go-home');
                                }
                              }}
                              disabled={isCurrentChoice}
                            >
                              {formatPreferenceDisplay(child.firstChoice, 1, isCurrentChoice, false, currentDay)}
                            </Button>
                          );
                        }
                        
                        return (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className={`h-6 px-2 text-xs ${borderClass} ${isCurrentChoice ? 'cursor-default' : ''}`}
                                disabled={isCurrentChoice}
                              >
                                {formatPreferenceDisplay(child.firstChoice, 1, isCurrentChoice, false, currentDay)}
                              </Button>
                            </PopoverTrigger>
                            {!isCurrentChoice && renderPreferencePopover(child.id, 'first', child.firstChoice)}
                          </Popover>
                        );
                      })()}
                      
                      {/* Second Choice */}
                      {(() => {
                        const currentRank = getCurrentEnrollmentRank(child.id, selectedDayIndex, currentSemester);
                        const isCurrentChoice = currentRank === 2;
                        const borderClass = getPreferenceBorderClass(currentRank === 2 ? 2 : null);
                        
                        if (child.secondChoice === 'go-home') {
                          return (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className={`h-6 px-2 text-xs ${borderClass} ${isCurrentChoice ? 'cursor-default' : ''}`}
                              onClick={() => {
                                if (!isCurrentChoice) {
                                  moveChildToCourse(child.id, 'go-home');
                                }
                              }}
                              disabled={isCurrentChoice}
                            >
                              {formatPreferenceDisplay(child.secondChoice, 2, isCurrentChoice, false, currentDay)}
                            </Button>
                          );
                        }
                        
                        return (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className={`h-6 px-2 text-xs ${borderClass} ${isCurrentChoice ? 'cursor-default' : ''}`}
                                disabled={isCurrentChoice}
                              >
                                {formatPreferenceDisplay(child.secondChoice, 2, isCurrentChoice, false, currentDay)}
                              </Button>
                            </PopoverTrigger>
                            {!isCurrentChoice && renderPreferencePopover(child.id, 'second', child.secondChoice)}
                          </Popover>
                        );
                      })()}
                      
                      {/* Third Choice */}
                      {(() => {
                        const currentRank = getCurrentEnrollmentRank(child.id, selectedDayIndex, currentSemester);
                        const isCurrentChoice = currentRank === 3;
                        const borderClass = getPreferenceBorderClass(currentRank === 3 ? 3 : null);
                        
                        if (child.thirdChoice === 'go-home') {
                          return (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className={`h-6 px-2 text-xs ${borderClass} ${isCurrentChoice ? 'cursor-default' : ''}`}
                              onClick={() => {
                                if (!isCurrentChoice) {
                                  moveChildToCourse(child.id, 'go-home');
                                }
                              }}
                              disabled={isCurrentChoice}
                            >
                              {formatPreferenceDisplay(child.thirdChoice, 3, isCurrentChoice, false, currentDay)}
                            </Button>
                          );
                        }
                        
                        return (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className={`h-6 px-2 text-xs ${borderClass} ${isCurrentChoice ? 'cursor-default' : ''}`}
                                disabled={isCurrentChoice}
                              >
                                {formatPreferenceDisplay(child.thirdChoice, 3, isCurrentChoice, false, currentDay)}
                              </Button>
                            </PopoverTrigger>
                            {!isCurrentChoice && renderPreferencePopover(child.id, 'third', child.thirdChoice)}
                          </Popover>
                        );
                      })()}

                      {/* Waiting List Button or Spacer */}
                      {!hasGoHomePreference(child) ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 px-2 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300"
                          onClick={() => {
                            moveChildToWaitingList(child.id);
                          }}
                          title="Move to waiting list"
                        >
                          W
                        </Button>
                      ) : (
                        <div className="h-6 px-2 text-xs" style={{width: '32px'}}></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Courses */}
      <div className="space-y-3">
        {currentDay.courses.map(course => {
          const enrolledChildren = filteredChildren(getChildrenInCourse(course.id, currentDay, currentSemester), searchQuery);
          const isFull = course.enrolledChildren.length >= course.maxCapacity || course.forcedFull;
          const isOverfilled = course.enrolledChildren.length > course.maxCapacity;
          
          return (
            <div key={course.id} className={`rounded p-3 ${isOverfilled ? 'bg-red-50 border border-red-200' : 'bg-muted/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="flex items-center gap-2">
                  <span 
                    className="cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => toggleCourseDetailsVisibility(course.id)}
                  >
                    {course.name}
                  </span>
                  <Badge variant={isOverfilled ? 'destructive' : isFull ? 'destructive' : 'secondary'} className="text-xs">
                    {course.enrolledChildren.length}/{course.maxCapacity}
                  </Badge>
                  {isOverfilled && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      OVERFILLED - NEEDS REDISTRIBUTION
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="outline" className="text-xs">
                      {enrolledChildren.length} shown
                    </Badge>
                  )}
                </h4>
                
                <div className="flex items-center gap-2">
                  {/* Lock/Unlock or Closed Badge */}
                  {course.forcedFull ? (
                    <Badge 
                      variant="destructive" 
                      className="text-xs cursor-pointer hover:bg-red-600"
                      onClick={() => toggleCourseFull(course.id)}
                      title="Click to open course"
                    >
                      <Lock className="h-2 w-2 mr-1" />
                      Closed
                    </Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => toggleCourseFull(course.id)}
                      title="Mark as closed"
                    >
                      <Unlock className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {/* Approval Button */}
                  <Button
                    variant={isCourseApproved(course.id) ? "default" : "ghost"}
                    size="sm"
                    className={`h-6 px-2 text-xs flex items-center gap-1 ${
                      isCourseApproved(course.id) 
                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => toggleCourseApproval(course.id)}
                    title={isCourseApproved(course.id) ? 'Mark as needs review' : 'Mark as approved'}
                  >
                    <Check className="h-3 w-3" />
                    {isCourseApproved(course.id) && <span>Approved</span>}
                  </Button>
                  
                  {/* Add Note Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const courseKey = `${selectedSemesterIndex}-${selectedDayIndex}-${course.id}`;
                      setShowAddNote(prev => ({ ...prev, [courseKey]: true }));
                    }}
                    title="Add note"
                  >
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Course Details Section - Only show when expanded */}
              {isCourseDetailsVisible(course.id) && (
                <div className="mb-2 text-xs text-muted-foreground flex items-center gap-4">
                  <span>Teacher: {course.teacher}</span>
                  <span>Room: {course.room}</span>
                  <span>Grades: {course.availableGrades.join(', ')}</span>
                  {course.notes.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <MessageSquare className="h-2 w-2" />
                        {course.notes.length} note{course.notes.length > 1 ? 's' : ''}
                        {course.notes.some(note => note.isProblem && !note.isResolved) && (
                          <AlertTriangle className="h-2 w-2 text-red-500" />
                        )}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => toggleNotesVisibility(course.id)}
                        title={isNotesVisible(course.id) ? 'Hide notes' : 'Show notes'}
                      >
                        {isNotesVisible(course.id) ? (
                          <EyeOff className="h-2 w-2 text-blue-600" />
                        ) : (
                          <Eye className="h-2 w-2 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Section - Only show when course details are visible and notes are toggled on */}
              {isCourseDetailsVisible(course.id) && isNotesVisible(course.id) && (
                <div className="mb-3">
                  {course.notes.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {course.notes.map(note => (
                      <div key={note.id} className={`p-2 rounded border text-xs ${
                        note.isProblem && !note.isResolved ? 'bg-red-50 border-red-200' : 
                        note.isResolved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{note.author}</span>
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2 w-2" />
                                {formatTimestamp(note.timestamp)}
                              </span>
                              {note.isProblem && !note.isResolved && (
                                <Badge variant="destructive" className="text-xs px-1 py-0">
                                  Problem
                                </Badge>
                              )}
                              {note.isResolved && (
                                <Badge variant="outline" className="text-xs px-1 py-0 bg-green-100 text-green-700 border-green-300">
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            {editingNote?.courseId === course.id && editingNote?.noteId === note.id ? (
                              <div className="flex gap-2 items-center">
                                <Input
                                  value={editNoteText}
                                  onChange={(e) => setEditNoteText(e.target.value)}
                                  className="text-xs"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      saveEditNote(course.id, note.id);
                                    }
                                    if (e.key === 'Escape') {
                                      cancelEditNote();
                                    }
                                  }}
                                  autoFocus
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-green-600 hover:bg-green-100"
                                  onClick={() => saveEditNote(course.id, note.id)}
                                  title="Save changes"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-gray-500 hover:bg-gray-100"
                                  onClick={cancelEditNote}
                                  title="Cancel editing"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <p className="text-gray-700">{note.text}</p>
                            )}
                          </div>
                          {!(editingNote?.courseId === course.id && editingNote?.noteId === note.id) && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm" 
                                className={`h-5 w-5 p-0 ${note.isProblem ? 'text-red-600 bg-red-100' : 'text-gray-400 hover:text-red-600'}`}
                                onClick={() => toggleNoteProblem(course.id, note.id)}
                                title={note.isProblem ? 'Remove from problems' : 'Flag as problem'}
                              >
                                <AlertTriangle className="h-3 w-3" />
                              </Button>
                              {note.isProblem && !note.isResolved && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-green-600 hover:bg-green-100"
                                  onClick={() => toggleProblemResolved(course.id, note.id)}
                                  title="Mark as resolved"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-blue-600 hover:bg-blue-100"
                                onClick={() => startEditNote(course.id, note.id, note.text)}
                                title="Edit note"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-red-600 hover:bg-red-100"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this note?')) {
                                    deleteNote(course.id, note.id);
                                  }
                                }}
                                title="Delete note"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Note Form */}
                {(() => {
                  const courseKey = `${selectedSemesterIndex}-${selectedDayIndex}-${course.id}`;
                  return showAddNote[courseKey] ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Add a note..."
                        value={newNoteText[courseKey] || ''}
                        onChange={(e) => setNewNoteText(prev => ({ ...prev, [courseKey]: e.target.value }))}
                        className="text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addNote(course.id, newNoteText[courseKey] || '');
                          }
                          if (e.key === 'Escape') {
                            setShowAddNote(prev => ({ ...prev, [courseKey]: false }));
                            setNewNoteText(prev => ({ ...prev, [courseKey]: '' }));
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => addNote(course.id, newNoteText[courseKey] || '')}
                      >
                        Add
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          setShowAddNote(prev => ({ ...prev, [courseKey]: false }));
                          setNewNoteText(prev => ({ ...prev, [courseKey]: '' }));
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : null;
                })()}
                </div>
              )}

              {isChildrenVisible(course.id) && (
                <div className="space-y-1">
                  {/* Grid Header */}
                  <div className="flex items-center justify-between py-1 px-2 bg-muted/50 rounded text-xs font-medium text-muted-foreground border-b border-border">
                    <div className="grid grid-cols-12 gap-2 flex-1">
                      <div className="col-span-5">Participants</div>
                      <div className="col-span-2 text-center">1. wish</div>
                      <div className="col-span-2 text-center">2. wish</div>
                      <div className="col-span-2 text-center">3. wish</div>
                      <div className="col-span-1 text-center">Wait</div>
                    </div>
                    <div className="ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => toggleChildrenVisibility(course.id)}
                        title={isChildrenVisible(course.id) ? 'Hide participants' : 'Show participants'}
                      >
                        {isChildrenVisible(course.id) ? (
                          <ChevronUp className="h-3 w-3 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {enrolledChildren.length > 0 ? (
                    <>
                      {sortChildrenByClassAndName(enrolledChildren).map(child => {
                        if (!child) return null;
                        const schedule = getChildSchedule(child.id, currentSemester, true, selectedDayIndex);

                        return (
                          <div key={child.id} className="flex items-center justify-between py-1 px-2 bg-background rounded text-sm">
                            <div className="grid grid-cols-12 gap-2 flex-1">
                              {/* Participants Column */}
                              <div className="col-span-5 flex items-center gap-2">
                                <span>{child.class} {child.name}</span>
                                <div className="flex gap-1 text-xs text-muted-foreground">
                                  {schedule.map(({ day, dayIndex, activity }) => {
                                    const preferenceRank = getPreferenceRank(child.id, activity, currentSemester);
                                    const isApproved = activity !== 'go-home' && (() => {
                                      const approvalKey = `${selectedSemesterIndex}-${dayIndex}-${activity}`;
                                      return approvedCourses[approvalKey] || false;
                                    })();
                                    return (
                                      <Popover key={dayIndex}>
                                        <PopoverTrigger asChild>
                                          <div className="cursor-pointer hover:bg-muted rounded px-1 py-0.5 flex items-center gap-1 font-medium">
                                            <span>
                                              {day.slice(0, 3)}{preferenceRank && ` (${preferenceRank})`}: {activity === 'go-home' ? 'Home' : activity}
                                            </span>
                                            {isApproved && (
                                              <Check className="h-2 w-2 text-green-600" />
                                            )}
                                          </div>
                                        </PopoverTrigger>
                                        {renderSchedulePopover(child.id, day, dayIndex, activity)}
                                      </Popover>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* First Choice Column */}
                              <div className="col-span-2 flex justify-center">
                                {(() => {
                                  const currentRank = getCurrentEnrollmentRank(child.id, selectedDayIndex, currentSemester);
                                  const isCurrentChoice = currentRank === 1;
                                  const borderClass = getPreferenceBorderClass(currentRank === 1 ? 1 : null);
                                  
                                  if (child.firstChoice === 'go-home') {
                                    return (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className={`h-6 px-2 text-xs w-full ${borderClass} ${isCurrentChoice ? 'cursor-default' : ''}`}
                                        onClick={() => {
                                          if (!isCurrentChoice) {
                                            moveChildToCourse(child.id, 'go-home');
                                          }
                                        }}
                                        disabled={isCurrentChoice}
                                      >
                                        {formatPreferenceDisplay(child.firstChoice, 1, isCurrentChoice, true, currentDay)}
                                      </Button>
                                    );
                                  }
                                  
                                  return (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className={`h-6 px-2 text-xs w-full ${borderClass} ${isCurrentChoice ? 'cursor-default' : ''}`}
                                          disabled={isCurrentChoice}
                                        >
                                          {formatPreferenceDisplay(child.firstChoice, 1, isCurrentChoice, true, currentDay)}
                                        </Button>
                                      </PopoverTrigger>
                                      {!isCurrentChoice && renderPreferencePopover(child.id, 'first', child.firstChoice)}
                                    </Popover>
                                  );
                                })()}
                              </div>
                              
                              {/* Second Choice Column */}
                              <div className="col-span-2 flex justify-center">
                                {(() => {
                                  const currentRank = getCurrentEnrollmentRank(child.id, selectedDayIndex, currentSemester);
                                  const isCurrentChoice = currentRank === 2;
                                  const borderClass = getPreferenceBorderClass(currentRank === 2 ? 2 : null);
                                  
                                  if (child.secondChoice === 'go-home') {
                                    return (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className={`h-6 px-2 text-xs w-full ${borderClass} ${isCurrentChoice ? 'cursor-default' : ''}`}
                                        onClick={() => {
                                          if (!isCurrentChoice) {
                                            moveChildToCourse(child.id, 'go-home');
                                          }
                                        }}
                                        disabled={isCurrentChoice}
                                      >
                                        {formatPreferenceDisplay(child.secondChoice, 2, isCurrentChoice, true, currentDay)}
                                      </Button>
                                    );
                                  }
                                  
                                  return (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className={`h-6 px-2 text-xs w-full ${borderClass} ${isCurrentChoice ? 'cursor-default' : ''}`}
                                          disabled={isCurrentChoice}
                                        >
                                          {formatPreferenceDisplay(child.secondChoice, 2, isCurrentChoice, true, currentDay)}
                                        </Button>
                                      </PopoverTrigger>
                                      {!isCurrentChoice && renderPreferencePopover(child.id, 'second', child.secondChoice)}
                                    </Popover>
                                  );
                                })()}
                              </div>
                              
                              {/* Third Choice Column */}
                              <div className="col-span-2 flex justify-center">
                                {(() => {
                                  const currentRank = getCurrentEnrollmentRank(child.id, selectedDayIndex, currentSemester);
                                  const isCurrentChoice = currentRank === 3;
                                  const borderClass = getPreferenceBorderClass(currentRank === 3 ? 3 : null);
                                  
                                  if (child.thirdChoice === 'go-home') {
                                    return (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className={`h-6 px-2 text-xs w-full ${borderClass} ${isCurrentChoice ? 'cursor-default' : ''}`}
                                        onClick={() => {
                                          if (!isCurrentChoice) {
                                            moveChildToCourse(child.id, 'go-home');
                                          }
                                        }}
                                        disabled={isCurrentChoice}
                                      >
                                        {formatPreferenceDisplay(child.thirdChoice, 3, isCurrentChoice, true, currentDay)}
                                      </Button>
                                    );
                                  }
                                  
                                  return (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className={`h-6 px-2 text-xs w-full ${borderClass} ${isCurrentChoice ? 'cursor-default' : ''}`}
                                          disabled={isCurrentChoice}
                                        >
                                          {formatPreferenceDisplay(child.thirdChoice, 3, isCurrentChoice, true, currentDay)}
                                        </Button>
                                      </PopoverTrigger>
                                      {!isCurrentChoice && renderPreferencePopover(child.id, 'third', child.thirdChoice)}
                                    </Popover>
                                  );
                                })()}
                              </div>

                              {/* Waiting List Column */}
                              <div className="col-span-1 flex justify-center">
                                {!hasGoHomePreference(child) ? (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-6 w-6 p-0 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300"
                                    onClick={() => {
                                      moveChildToWaitingList(child.id);
                                    }}
                                    title="Move to waiting list"
                                  >
                                    W
                                  </Button>
                                ) : (
                                  <div className="h-6 w-6"></div>
                                )}
                              </div>
                            </div>
                            <div className="ml-2 w-4">
                              {/* Empty space to match the toggle button area in the header */}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="text-center py-3 text-xs text-muted-foreground">
                      {searchQuery ? 'No matching children enrolled' : 'No children enrolled'}
                    </div>
                  )}
                </div>
              )}
              
              {/* Show toggle button when participants are hidden */}
              {!isChildrenVisible(course.id) && (
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => toggleChildrenVisibility(course.id)}
                    title={isChildrenVisible(course.id) ? 'Hide participants' : 'Show participants'}
                  >
                    {isChildrenVisible(course.id) ? (
                      <ChevronUp className="h-3 w-3 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}