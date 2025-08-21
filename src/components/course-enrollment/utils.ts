import { Child, Course, Semester, CourseNote } from './types';

export const sortChildrenByClassAndName = (children: any[]) => {
  return [...children].sort((a, b) => {
    // First sort by class
    if (a.class !== b.class) {
      return a.class.localeCompare(b.class);
    }
    // Then sort by name
    return a.name.localeCompare(b.name);
  });
};

export const isChildEligibleForCourse = (child: Child, courseId: string, dayIndex: number, currentSemester: Semester) => {
  if (courseId === 'go-home') return true;
  
  const day = currentSemester.schedule[dayIndex];
  const course = day.courses.find(c => c.id === courseId);
  if (!course) return false;
  
  // Check grade eligibility
  const childGrade = child.class.charAt(0); // Extract grade number from class (e.g., "4A" -> "4")
  return course.availableGrades.includes(childGrade);
};

export const getMovementBlockingReason = (childId: string, targetCourseId: string, currentSemester: Semester, selectedDayIndex: number) => {
  const child = currentSemester.children.find(c => c.id === childId);
  if (!child) return 'Child not found';

  // Check if already in this course
  const currentEnrollment = child.enrollments[selectedDayIndex];
  if (currentEnrollment === targetCourseId || (currentEnrollment === undefined && targetCourseId === 'go-home')) {
    return 'Already in this course/status';
  }

  if (targetCourseId === 'go-home') {
    return null; // Going home is always allowed
  }

  const day = currentSemester.schedule[selectedDayIndex];
  const course = day.courses.find(c => c.id === targetCourseId);
  if (!course) return 'Course not found';

  // Check if course is forced full
  if (course.forcedFull) {
    return 'Course is marked as closed';
  }

  // Check grade eligibility
  const childGrade = child.class.charAt(0);
  if (!course.availableGrades.includes(childGrade)) {
    return `Not eligible (Grade ${childGrade} not allowed, only grades ${course.availableGrades.join(', ')})`;
  }

  // Check available spots
  const availableSpots = course.maxCapacity - course.enrolledChildren.length;
  if (availableSpots <= 0) {
    return `Course is full (${course.enrolledChildren.length}/${course.maxCapacity})`;
  }

  return null; // No blocking reason
};

export const getCourseCapacityRemaining = (courseId: string, dayIndex: number, currentSemester: Semester) => {
  if (courseId === 'go-home') return Infinity;
  
  const day = currentSemester.schedule[dayIndex];
  const course = day.courses.find(c => c.id === courseId);
  if (!course || course.forcedFull) return 0;
  
  return course.maxCapacity - course.enrolledChildren.length;
};

export const processAutomaticEnrollment = (semesterIndex: number, dayIndex: number, semester: Semester) => {
  const day = semester.schedule[dayIndex];
  
  // Reset all enrollments for this day
  const updatedSemester = {
    ...semester,
    schedule: semester.schedule.map((scheduleDay, idx) => {
      if (idx !== dayIndex) return scheduleDay;
      return {
        ...scheduleDay,
        courses: scheduleDay.courses.map(course => ({
          ...course,
          enrolledChildren: []
        }))
      };
    }),
    children: semester.children.map(child => ({
      ...child,
      enrollments: {
        ...child.enrollments,
        [dayIndex]: undefined
      }
    }))
  };

  // Process each child's FIRST CHOICE only (allow overfill)
  const childrenToProcess = [...updatedSemester.children];
  const enrollmentResults: { [childId: string]: string } = {};

  // Process all children's first choices
  childrenToProcess.forEach(child => {
    const firstChoice = child.firstChoice;
    
    if (firstChoice === 'go-home') {
      enrollmentResults[child.id] = 'go-home';
      return;
    }
    
    // Check if child is eligible for their first choice
    if (isChildEligibleForCourse(child, firstChoice, dayIndex, updatedSemester)) {
      const course = day.courses.find(c => c.id === firstChoice);
      
      if (course && !course.forcedFull) {
        // Always enroll in first choice, even if it goes over capacity
        enrollmentResults[child.id] = firstChoice;
      } else {
        // Course is forced full, send home
        enrollmentResults[child.id] = 'go-home';
      }
    } else {
      // Not eligible for first choice (wrong grade), send home
      enrollmentResults[child.id] = 'go-home';
    }
  });

  // Apply the enrollment results
  const finalSemester = {
    ...updatedSemester,
    schedule: updatedSemester.schedule.map((scheduleDay, idx) => {
      if (idx !== dayIndex) return scheduleDay;
      return {
        ...scheduleDay,
        courses: scheduleDay.courses.map(course => ({
          ...course,
          enrolledChildren: Object.entries(enrollmentResults)
            .filter(([_, courseId]) => courseId === course.id)
            .map(([childId, _]) => childId)
        }))
      };
    }),
    children: updatedSemester.children.map(child => ({
      ...child,
      enrollments: {
        ...child.enrollments,
        [dayIndex]: enrollmentResults[child.id] === 'go-home' ? undefined : enrollmentResults[child.id]
      }
    }))
  };

  return finalSemester;
};

export const getChildrenInCourse = (courseId: string, currentDay: any, currentSemester: Semester) => {
  const course = currentDay.courses.find((c: Course) => c.id === courseId);
  if (!course) return [];
  
  return course.enrolledChildren.map(childId => 
    currentSemester.children.find(c => c.id === childId)
  ).filter(Boolean);
};

export const getCurrentEnrollmentRank = (childId: string, selectedDayIndex: number, currentSemester: Semester) => {
  const child = currentSemester.children.find(c => c.id === childId);
  if (!child) return null;
  
  const currentEnrollment = child.enrollments[selectedDayIndex];
  if (!currentEnrollment) return null; // Going home
  
  if (child.firstChoice === currentEnrollment) return 1;
  if (child.secondChoice === currentEnrollment) return 2;
  if (child.thirdChoice === currentEnrollment) return 3;
  return null;
};

export const formatPreferenceDisplay = (courseId: string, rank: number, isCurrentEnrollment: boolean = false, hideRank: boolean = false, currentDay: any) => {
  if (courseId === 'go-home') {
    return hideRank ? 'Home' : `(${rank}): Home`;
  }
  
  const courseName = getCourseName(courseId, currentDay);
  const shortName = courseName.substring(0, 8);
  
  if (isCurrentEnrollment) {
    return hideRank ? shortName : `(${rank}): ${shortName}`;
  }
  
  const course = currentDay.courses.find((c: Course) => c.id === courseId);
  const capacity = course ? `${course.enrolledChildren.length}/${course.maxCapacity}` : '';
  
  return hideRank ? `${shortName} ${capacity}` : `(${rank}): ${shortName} ${capacity}`;
};

export const getPreferenceBorderClass = (rank: number | null) => {
  if (rank === 1) return 'border-2 border-green-500 bg-green-50';
  if (rank === 2) return 'border-2 border-blue-500 bg-blue-50';
  if (rank === 3) return 'border-2 border-orange-500 bg-orange-50';
  return '';
};

export const hasGoHomePreference = (child: Child) => {
  return child.firstChoice === 'go-home' || 
         child.secondChoice === 'go-home' || 
         child.thirdChoice === 'go-home';
};

export const getChildSchedule = (childId: string, currentSemester: Semester, excludeCurrentDay: boolean = true, selectedDayIndex: number) => {
  const child = currentSemester.children.find(c => c.id === childId);
  if (!child) return [];
  
  return currentSemester.schedule.map((day, dayIndex) => ({
    day: day.day,
    dayIndex,
    activity: child.enrollments[dayIndex] || 'go-home'
  })).filter((_, dayIndex) => !excludeCurrentDay || dayIndex !== selectedDayIndex);
};

export const getChildPreferences = (childId: string, currentSemester: Semester, currentDay: any) => {
  const child = currentSemester.children.find(c => c.id === childId);
  if (!child) return [];
  
  return [
    { choice: '1st', courseId: child.firstChoice, name: getCourseName(child.firstChoice, currentDay) },
    { choice: '2nd', courseId: child.secondChoice, name: getCourseName(child.secondChoice, currentDay) },
    { choice: '3rd', courseId: child.thirdChoice, name: getCourseName(child.thirdChoice, currentDay) },
  ];
};

export const getPreferenceRank = (childId: string, activity: string, currentSemester: Semester) => {
  const child = currentSemester.children.find(c => c.id === childId);
  if (!child || activity === 'go-home') return null;
  
  if (child.firstChoice === activity) return 1;
  if (child.secondChoice === activity) return 2;
  if (child.thirdChoice === activity) return 3;
  return null;
};

export const getChildrenInCourseForDay = (dayIndex: number, courseId: string, currentSemester: Semester) => {
  const day = currentSemester.schedule[dayIndex];
  const course = day.courses.find(c => c.id === courseId);
  if (!course) return [];
  
  return course.enrolledChildren.map(childId => 
    currentSemester.children.find(c => c.id === childId)
  ).filter(Boolean);
};

export const filteredChildren = (children: any[], searchQuery: string) => {
  return children.filter(child => 
    child && child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

export const getCourseAvailableSpots = (courseId: string, currentDay: any) => {
  if (courseId === 'go-home') return null;
  const course = currentDay.courses.find((c: Course) => c.id === courseId);
  if (!course) return 0;
  if (course.forcedFull) return 0;
  return course.maxCapacity - course.enrolledChildren.length;
};

export const getCourseName = (courseId: string, currentDay: any) => {
  if (courseId === 'go-home') return 'Go Home';
  const course = currentDay.courses.find((c: Course) => c.id === courseId);
  return course ? course.name : courseId;
};

export const getAvailableCoursesForMove = (currentCourseId: string, currentDay: any) => {
  const availableCourses = currentDay.courses.filter((course: Course) => 
    course.id !== currentCourseId && 
    getCourseAvailableSpots(course.id, currentDay)! > 0
  );
  
  // Add go-home option
  return [
    ...availableCourses.map((course: Course) => ({
      id: course.id,
      name: course.name,
      spotsAvailable: getCourseAvailableSpots(course.id, currentDay)!
    })),
    { id: 'go-home', name: 'Go Home', spotsAvailable: null }
  ];
};

export const getCourseAvailableSpotsForDay = (dayIndex: number, courseId: string, currentSemester: Semester) => {
  if (courseId === 'go-home') return null;
  const day = currentSemester.schedule[dayIndex];
  const course = day.courses.find(c => c.id === courseId);
  if (!course) return 0;
  if (course.forcedFull) return 0;
  return course.maxCapacity - course.enrolledChildren.length;
};

export const getAvailableCoursesForMoveForDay = (dayIndex: number, currentCourseId: string, currentSemester: Semester) => {
  const day = currentSemester.schedule[dayIndex];
  const availableCourses = day.courses.filter(course => 
    course.id !== currentCourseId && 
    getCourseAvailableSpotsForDay(dayIndex, course.id, currentSemester)! > 0
  );
  
  // Add go-home option
  return [
    ...availableCourses.map(course => ({
      id: course.id,
      name: course.name,
      spotsAvailable: getCourseAvailableSpotsForDay(dayIndex, course.id, currentSemester)!
    })),
    { id: 'go-home', name: 'Go Home', spotsAvailable: null }
  ];
};

export const getAllProblems = (currentDay: any) => {
  const problems: Array<{
    courseId: string;
    courseName: string;
    note: CourseNote;
  }> = [];

  currentDay.courses.forEach((course: Course) => {
    course.notes.forEach(note => {
      if (note.isProblem && !note.isResolved) {
        problems.push({
          courseId: course.id,
          courseName: course.name,
          note
        });
      }
    });
  });

  return problems.sort((a, b) => b.note.timestamp.getTime() - a.note.timestamp.getTime());
};

export const formatTimestamp = (timestamp: Date) => {
  return timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};