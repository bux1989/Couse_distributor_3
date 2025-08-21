import { Semester } from './types';

export const mockSemesters: Semester[] = [
  {
    id: 'fall2024',
    name: 'Fall 2024',
    schedule: [
      {
        day: 'Monday',
        courses: [
          { id: 'archery', name: 'Archery', maxCapacity: 12, enrolledChildren: ['10', '14', '23'], teacher: 'Ms. Johnson', room: 'Gym A', availableGrades: ['3', '4', '5'], notes: [] },
          { id: 'football', name: 'Football', maxCapacity: 16, enrolledChildren: ['9', '12', '16', '21', '25'], teacher: 'Mr. Smith', room: 'Field 1', availableGrades: ['4', '5'], notes: [] },
          { id: 'volleyball', name: 'Volleyball', maxCapacity: 14, enrolledChildren: ['1', '2', '3', '4', '5', '6', '7', '8', '11', '13', '15', '17', '18', '19', '20', '22', '24', '26', '27'], teacher: 'Ms. Brown', room: 'Gym B', availableGrades: ['3', '4', '5'], notes: [{ id: 'note1', text: 'Need to check equipment before class starts', author: 'Admin', timestamp: new Date(2024, 0, 15, 10, 30), isProblem: true, isResolved: false }] },
        ]
      },
      {
        day: 'Tuesday',
        courses: [
          { id: 'archery', name: 'Archery', maxCapacity: 12, enrolledChildren: ['2', '3', '8', '9', '11', '14', '17', '20', '23', '26'], teacher: 'Ms. Johnson', room: 'Gym A', availableGrades: ['3', '4', '5'], notes: [{ id: 'note2', text: 'Bow strings need replacement', author: 'Ms. Johnson', timestamp: new Date(2024, 0, 16, 14, 20), isProblem: true, isResolved: false }] },
          { id: 'football', name: 'Football', maxCapacity: 16, enrolledChildren: ['1', '4', '6', '10', '12', '15', '16', '18', '21', '22', '24', '25'], teacher: 'Mr. Smith', room: 'Field 1', availableGrades: ['4', '5'], notes: [] },
          { id: 'volleyball', name: 'Volleyball', maxCapacity: 14, enrolledChildren: ['5', '7', '13', '19', '27'], teacher: 'Ms. Brown', room: 'Gym B', availableGrades: ['3', '4', '5'], notes: [] },
        ]
      },
      {
        day: 'Wednesday',
        courses: [
          { id: 'archery', name: 'Archery', maxCapacity: 12, enrolledChildren: ['5', '6'], teacher: 'Ms. Johnson', room: 'Gym A', availableGrades: ['3', '4', '5'], notes: [] },
          { id: 'football', name: 'Football', maxCapacity: 16, enrolledChildren: ['3', '10'], teacher: 'Mr. Smith', room: 'Field 1', availableGrades: ['4', '5'], notes: [] },
          { id: 'volleyball', name: 'Volleyball', maxCapacity: 14, enrolledChildren: ['1', '2', '4', '7', '8', '9', '11', '12', '13', '14', '15', '17', '18', '19'], teacher: 'Ms. Brown', room: 'Gym B', availableGrades: ['3', '4', '5'], notes: [] },
        ]
      }
    ],
    children: [
      { id: '1', name: 'Emma Johnson', class: '4A', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: { 0: 'volleyball', 1: 'football', 2: 'volleyball' } },
      { id: '2', name: 'Liam Smith', class: '3B', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: { 0: 'volleyball', 1: 'archery', 2: 'volleyball' } },
      { id: '3', name: 'Olivia Brown', class: '5A', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'football', enrollments: { 0: 'volleyball', 1: 'archery', 2: 'football' } },
      { id: '4', name: 'Noah Davis', class: '4B', firstChoice: 'volleyball', secondChoice: 'football', thirdChoice: 'go-home', enrollments: { 0: 'volleyball', 1: 'football', 2: 'volleyball' } },
      { id: '5', name: 'Ava Wilson', class: '3A', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: { 0: 'volleyball', 1: 'volleyball', 2: 'archery' } },
      { id: '6', name: 'Ethan Miller', class: '5B', firstChoice: 'volleyball', secondChoice: 'football', thirdChoice: 'archery', enrollments: { 0: 'volleyball', 1: 'football', 2: 'archery' } },
      { id: '7', name: 'Sophia Garcia', class: '4A', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: { 0: 'volleyball', 1: 'volleyball', 2: 'volleyball' } },
      { id: '8', name: 'Mason Taylor', class: '3A', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: { 0: 'volleyball', 1: 'archery', 2: 'volleyball' } },
      { id: '9', name: 'Isabella Rodriguez', class: '4B', firstChoice: 'football', secondChoice: 'archery', thirdChoice: 'volleyball', enrollments: { 0: 'football', 1: 'archery', 2: 'volleyball' } },
      { id: '10', name: 'Lucas Anderson', class: '5A', firstChoice: 'archery', secondChoice: 'football', thirdChoice: 'volleyball', enrollments: { 0: 'archery', 1: 'football', 2: 'football' } },
      { id: '11', name: 'Mia Thomas', class: '3B', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: { 0: 'volleyball', 1: 'archery', 2: 'volleyball' } },
      { id: '12', name: 'Alexander Jackson', class: '4A', firstChoice: 'football', secondChoice: 'volleyball', thirdChoice: 'archery', enrollments: { 0: 'football', 1: 'football', 2: 'volleyball' } },
      { id: '13', name: 'Charlotte White', class: '5B', firstChoice: 'volleyball', secondChoice: 'football', thirdChoice: 'go-home', enrollments: { 0: 'volleyball', 1: 'football', 2: 'volleyball' } },
      { id: '14', name: 'Benjamin Harris', class: '3A', firstChoice: 'archery', secondChoice: 'volleyball', thirdChoice: 'go-home', enrollments: { 0: 'archery', 1: 'archery', 2: 'volleyball' } },
      { id: '15', name: 'Amelia Martin', class: '4B', firstChoice: 'volleyball', secondChoice: 'football', thirdChoice: 'go-home', enrollments: { 0: 'volleyball', 1: 'football', 2: 'volleyball' } },
      { id: '16', name: 'James Thompson', class: '5A', firstChoice: 'football', secondChoice: 'archery', thirdChoice: 'volleyball', enrollments: { 0: 'football', 1: 'football', 2: 'volleyball' } },
      { id: '17', name: 'Harper Garcia', class: '3B', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: { 0: 'volleyball', 1: 'archery', 2: 'volleyball' } },
      { id: '18', name: 'William Martinez', class: '4A', firstChoice: 'volleyball', secondChoice: 'football', thirdChoice: 'archery', enrollments: { 0: 'volleyball', 1: 'football', 2: 'volleyball' } },
      { id: '19', name: 'Evelyn Robinson', class: '5B', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'football', enrollments: { 0: 'volleyball', 1: 'volleyball', 2: 'volleyball' } },
      { id: '20', name: 'Henry Clark', class: '3A', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: { 0: 'volleyball', 1: 'archery', 2: undefined } },
      { id: '21', name: 'Abigail Rodriguez', class: '4B', firstChoice: 'football', secondChoice: 'volleyball', thirdChoice: 'go-home', enrollments: { 0: 'football', 1: 'football', 2: undefined } },
      { id: '22', name: 'Sebastian Lewis', class: '5A', firstChoice: 'volleyball', secondChoice: 'football', thirdChoice: 'archery', enrollments: { 0: 'volleyball', 1: 'football', 2: undefined } },
      { id: '23', name: 'Emily Lee', class: '3B', firstChoice: 'archery', secondChoice: 'volleyball', thirdChoice: 'go-home', enrollments: { 0: 'archery', 1: 'archery', 2: undefined } },
      { id: '24', name: 'Matthew Walker', class: '4A', firstChoice: 'volleyball', secondChoice: 'football', thirdChoice: 'archery', enrollments: { 0: 'volleyball', 1: 'football', 2: undefined } },
      { id: '25', name: 'Elizabeth Hall', class: '5B', firstChoice: 'football', secondChoice: 'volleyball', thirdChoice: 'archery', enrollments: { 0: 'football', 1: 'football', 2: undefined } },
      { id: '26', name: 'Daniel Allen', class: '3A', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: { 0: 'volleyball', 1: 'archery', 2: undefined } },
      { id: '27', name: 'Chloe Young', class: '4B', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'football', enrollments: { 0: 'volleyball', 1: 'volleyball', 2: undefined } },
      { id: '28', name: 'Sofia Martinez', class: '3A', firstChoice: 'go-home', secondChoice: 'go-home', thirdChoice: 'go-home', enrollments: { 0: undefined, 1: undefined, 2: undefined } },
      { id: '29', name: 'Jack Wilson', class: '4A', firstChoice: 'go-home', secondChoice: 'go-home', thirdChoice: 'go-home', enrollments: { 0: undefined, 1: undefined, 2: undefined } },
      { id: '30', name: 'Luna Chen', class: '5B', firstChoice: 'go-home', secondChoice: 'go-home', thirdChoice: 'go-home', enrollments: { 0: undefined, 1: undefined, 2: undefined } }
    ]
  },
  {
    id: 'spring2025',
    name: 'Spring 2025',
    schedule: [
      {
        day: 'Monday',
        courses: [
          { id: 'archery', name: 'Archery', maxCapacity: 12, enrolledChildren: [], teacher: 'Ms. Johnson', room: 'Gym A', availableGrades: ['3', '4', '5'], notes: [] },
          { id: 'football', name: 'Football', maxCapacity: 16, enrolledChildren: [], teacher: 'Mr. Smith', room: 'Field 1', availableGrades: ['4', '5'], notes: [] },
          { id: 'volleyball', name: 'Volleyball', maxCapacity: 14, enrolledChildren: [], teacher: 'Ms. Brown', room: 'Gym B', availableGrades: ['3', '4', '5'], notes: [] },
        ]
      },
      {
        day: 'Tuesday',
        courses: [
          { id: 'archery', name: 'Archery', maxCapacity: 12, enrolledChildren: [], teacher: 'Ms. Johnson', room: 'Gym A', availableGrades: ['3', '4', '5'], notes: [] },
          { id: 'football', name: 'Football', maxCapacity: 16, enrolledChildren: [], teacher: 'Mr. Smith', room: 'Field 1', availableGrades: ['4', '5'], notes: [] },
          { id: 'volleyball', name: 'Volleyball', maxCapacity: 14, enrolledChildren: [], teacher: 'Ms. Brown', room: 'Gym B', availableGrades: ['3', '4', '5'], notes: [] },
        ]
      },
      {
        day: 'Wednesday',
        courses: [
          { id: 'archery', name: 'Archery', maxCapacity: 12, enrolledChildren: [], teacher: 'Ms. Johnson', room: 'Gym A', availableGrades: ['3', '4', '5'], notes: [] },
          { id: 'football', name: 'Football', maxCapacity: 16, enrolledChildren: [], teacher: 'Mr. Smith', room: 'Field 1', availableGrades: ['4', '5'], notes: [] },
          { id: 'volleyball', name: 'Volleyball', maxCapacity: 14, enrolledChildren: [], teacher: 'Ms. Brown', room: 'Gym B', availableGrades: ['3', '4', '5'], notes: [] },
        ]
      }
    ],
    children: [
      { id: '1', name: 'Emma Johnson', class: '4A', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: {} },
      { id: '2', name: 'Liam Smith', class: '3B', firstChoice: 'archery', secondChoice: 'volleyball', thirdChoice: 'go-home', enrollments: {} },
      { id: '3', name: 'Olivia Brown', class: '5A', firstChoice: 'football', secondChoice: 'volleyball', thirdChoice: 'archery', enrollments: {} },
      { id: '4', name: 'Noah Davis', class: '4B', firstChoice: 'football', secondChoice: 'archery', thirdChoice: 'volleyball', enrollments: {} },
      { id: '5', name: 'Ava Wilson', class: '3A', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: {} },
      { id: '6', name: 'Ethan Miller', class: '5B', firstChoice: 'archery', secondChoice: 'football', thirdChoice: 'volleyball', enrollments: {} },
      { id: '7', name: 'Sophia Garcia', class: '4A', firstChoice: 'volleyball', secondChoice: 'football', thirdChoice: 'archery', enrollments: {} },
      { id: '8', name: 'Mason Taylor', class: '3A', firstChoice: 'archery', secondChoice: 'volleyball', thirdChoice: 'go-home', enrollments: {} },
      { id: '9', name: 'Isabella Rodriguez', class: '4B', firstChoice: 'archery', secondChoice: 'football', thirdChoice: 'go-home', enrollments: {} },
      { id: '10', name: 'Lucas Anderson', class: '5A', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'football', enrollments: {} },
      { id: '11', name: 'Mia Thomas', class: '3B', firstChoice: 'archery', secondChoice: 'volleyball', thirdChoice: 'go-home', enrollments: {} },
      { id: '12', name: 'Alexander Jackson', class: '4A', firstChoice: 'football', secondChoice: 'volleyball', thirdChoice: 'go-home', enrollments: {} },
      { id: '13', name: 'Charlotte White', class: '5B', firstChoice: 'football', secondChoice: 'volleyball', thirdChoice: 'archery', enrollments: {} },
      { id: '14', name: 'Benjamin Harris', class: '3A', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: {} },
      { id: '15', name: 'Amelia Martin', class: '4B', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'football', enrollments: {} },
      { id: '16', name: 'James Thompson', class: '5A', firstChoice: 'archery', secondChoice: 'football', thirdChoice: 'go-home', enrollments: {} },
      { id: '17', name: 'Harper Garcia', class: '3B', firstChoice: 'volleyball', secondChoice: 'archery', thirdChoice: 'go-home', enrollments: {} },
      { id: '18', name: 'William Martinez', class: '4A', firstChoice: 'archery', secondChoice: 'volleyball', thirdChoice: 'football', enrollments: {} },
      { id: '19', name: 'Evelyn Robinson', class: '5B', firstChoice: 'volleyball', secondChoice: 'football', thirdChoice: 'archery', enrollments: {} },
      { id: '20', name: 'Henry Clark', class: '3A', firstChoice: 'archery', secondChoice: 'volleyball', thirdChoice: 'go-home', enrollments: {} }
    ]
  }
];

// Removed MAX_MOVES - administrators should be able to make unlimited moves