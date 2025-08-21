export interface Child {
  id: string;
  name: string;
  class: string;
  firstChoice: string;
  secondChoice: string;
  thirdChoice: string;
  enrollments: { [dayIndex: number]: string | undefined }; // dayIndex -> courseId or undefined for go-home
}

export interface CourseNote {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  isProblem: boolean;
  isResolved: boolean;
}

export interface Course {
  id: string;
  name: string;
  maxCapacity: number;
  enrolledChildren: string[];
  teacher: string;
  room: string;
  availableGrades: string[];
  forcedFull?: boolean;
  notes: CourseNote[];
}

export interface SchoolDay {
  day: string;
  courses: Course[];
}

export interface Semester {
  id: string;
  name: string;
  schedule: SchoolDay[];
  children: Child[];
}