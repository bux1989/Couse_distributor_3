import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Popover, PopoverTrigger } from '../ui/popover';
import { Home, ArrowRight, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { Child, Semester } from './types';
import { 
  sortChildrenByClassAndName, 
  getChildSchedule, 
  getPreferenceRank,
  getCurrentEnrollmentRank,
  formatPreferenceDisplay,
  getPreferenceBorderClass,
  hasGoHomePreference,
  getMovementBlockingReason
} from './utils';

interface GoHomeSectionProps {
  currentSemester: Semester;
  selectedDayIndex: number;
  selectedSemesterIndex: number;
  searchQuery: string;
  approvedCourses: {[key: string]: boolean};
  renderSchedulePopover: (childId: string, day: string, dayIndex: number, activity: string) => React.ReactElement;
  renderPreferencePopover: (childId: string, choice: 'first' | 'second' | 'third', targetCourse: string) => React.ReactElement;
  moveChildToCourse: (childId: string, newCourseId: string, targetDayIndex?: number) => void;
  moveChildToWaitingList: (childId: string) => void;
  currentDay: any;
}

export function GoHomeSection({ 
  currentSemester, 
  selectedDayIndex, 
  selectedSemesterIndex,
  searchQuery, 
  approvedCourses,
  renderSchedulePopover,
  renderPreferencePopover,
  moveChildToCourse,
  moveChildToWaitingList,
  currentDay
}: GoHomeSectionProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isChildrenVisible, setIsChildrenVisible] = useState<boolean>(true);

  const getUnenrolledChildren = () => {
    const enrolledIds = currentSemester.schedule[selectedDayIndex].courses.flatMap(course => course.enrolledChildren);
    return currentSemester.children.filter(child => 
      !enrolledIds.includes(child.id) && 
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      // Exclude children who are intentionally going home (have go-home preferences or explicitly set to go home)
      !(child.enrollments[selectedDayIndex] === undefined && hasGoHomePreference(child))
    );
  };

  const getGoingHomeChildren = () => {
    const enrolledIds = currentSemester.schedule[selectedDayIndex].courses.flatMap(course => course.enrolledChildren);
    return currentSemester.children.filter(child => 
      !enrolledIds.includes(child.id) && 
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      // Include children who are intentionally going home
      (child.enrollments[selectedDayIndex] === undefined && hasGoHomePreference(child))
    );
  };

  // Separate children based on when "go home" appears in their preferences
  const getFirstChoiceGoHomeChildren = () => {
    return getGoingHomeChildren().filter(child => child.firstChoice === 'go-home');
  };

  const getSecondOrThirdChoiceGoHomeChildren = () => {
    return getGoingHomeChildren().filter(child => 
      child.firstChoice !== 'go-home' && (child.secondChoice === 'go-home' || child.thirdChoice === 'go-home')
    );
  };

  const hasGoHomePreference = (child: Child) => {
    return child.firstChoice === 'go-home' || 
           child.secondChoice === 'go-home' || 
           child.thirdChoice === 'go-home';
  };

  const getTotalChildrenInSchool = () => {
    return currentSemester.children.length;
  };

  const getGoingHomeCount = () => {
    return getGoingHomeChildren().length;
  };

  const getFirstChoiceClassStats = () => {
    const firstChoiceChildren = getFirstChoiceGoHomeChildren();
    const allChildren = currentSemester.children;
    
    // Group all children by class
    const classCounts: {[className: string]: {total: number, goingHome: number}} = {};
    
    allChildren.forEach(child => {
      const className = child.class;
      if (!classCounts[className]) {
        classCounts[className] = { total: 0, goingHome: 0 };
      }
      classCounts[className].total++;
    });
    
    // Count going home children by class
    firstChoiceChildren.forEach(child => {
      const className = child.class;
      if (classCounts[className]) {
        classCounts[className].goingHome++;
      }
    });
    
    // Convert to array and sort by class name
    return Object.entries(classCounts)
      .filter(([_, stats]) => stats.goingHome > 0)
      .map(([className, stats]) => ({
        className,
        goingHome: stats.goingHome,
        total: stats.total,
        children: firstChoiceChildren.filter(child => child.class === className)
      }))
      .sort((a, b) => a.className.localeCompare(b.className));
  };

  return (
    <div className="mb-4 p-3 bg-muted/30 rounded border-l-2 border-muted-foreground">
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1 py-1 -mx-1 -my-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Home className="h-3 w-3" />
        <h3 className="text-sm">
          Going Home at 14:30
        </h3>
        <Badge variant="secondary" className="text-xs">
          {getGoingHomeCount()}/{getTotalChildrenInSchool()}
        </Badge>
        <ArrowRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-4">
          {/* First Choice Go Home - Simple List */}
          {getFirstChoiceClassStats().length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Going Home as First Choice</h4>
              <div className="space-y-2">
                {getFirstChoiceClassStats().map(({ className, goingHome, total, children }) => (
                  <div key={className} className="border rounded p-2 bg-background/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">{className}</span>
                      <Badge variant="outline" className="text-xs">
                        {goingHome}/{total}
                      </Badge>
                    </div>
                    <div className="space-y-1 ml-2">
                      {sortChildrenByClassAndName(children).map(child => {
                        const schedule = getChildSchedule(child.id, currentSemester, true, selectedDayIndex);
                        return (
                          <div key={child.id} className="flex items-center gap-2 py-1 px-2 bg-background/50 rounded text-sm">
                            <span>{child.name}</span>
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
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Second/Third Choice Go Home - Grid Format */}
          {getSecondOrThirdChoiceGoHomeChildren().length > 0 && (
            <div className="rounded p-3 bg-orange-50 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="flex items-center gap-2">
                  <span>Going Home as 2nd/3rd Choice</span>
                  <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                    {getSecondOrThirdChoiceGoHomeChildren().length} children - can be reassigned
                  </Badge>
                </h4>
              </div>

              {isChildrenVisible && (
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
                        onClick={() => setIsChildrenVisible(!isChildrenVisible)}
                        title={isChildrenVisible ? 'Hide participants' : 'Show participants'}
                      >
                        {isChildrenVisible ? (
                          <ChevronUp className="h-3 w-3 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {getSecondOrThirdChoiceGoHomeChildren().length > 0 ? (
                    <>
                      {sortChildrenByClassAndName(getSecondOrThirdChoiceGoHomeChildren()).map(child => {
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
                                        className={`h-6 px-2 text-xs w-full border-2 border-orange-500 bg-orange-50 ${isCurrentChoice ? 'cursor-default' : ''}`}
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
                      {searchQuery ? 'No matching children' : 'No children'}
                    </div>
                  )}
                </div>
              )}

              {/* Show toggle button when participants are hidden */}
              {!isChildrenVisible && (
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => setIsChildrenVisible(!isChildrenVisible)}
                    title="Show participants"
                  >
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {getFirstChoiceClassStats().length === 0 && getSecondOrThirdChoiceGoHomeChildren().length === 0 && (
            <div className="text-center py-2 text-xs text-muted-foreground">
              {searchQuery ? 'No matching children going home early' : 'No children going home early'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}