module.exports = {
  name: 'course-enrollment',
  label: 'Course Enrollment',
  icon: 'school',
  // Show in “Elements” panel
  category: 'Custom',
  // You can require credentials or external libs here if needed
  properties: {
    scriptUrl: {
      label: 'Bundle URL',
      type: 'Text',
      bindable: true,
      defaultValue: '',
      section: 'Setup',
      helper: 'URL to your built bundle exposing window.CourseEnrollmentMount (UMD/IIFE).',
    },
    semesters: {
      label: 'Semesters',
      type: 'Object',
      bindable: true,
      defaultValue: [],
      section: 'Data',
      helper: 'Array of semesters with children, schedule, and courses.',
    },
    selectedSemesterIndex: {
      label: 'Selected Semester Index',
      type: 'Number',
      bindable: true,
      defaultValue: 0,
      section: 'Data',
    },
    selectedDayIndex: {
      label: 'Selected Day Index',
      type: 'Number',
      bindable: true,
      defaultValue: 0,
      section: 'Data',
    },
    searchQuery: {
      label: 'Search Query',
      type: 'Text',
      bindable: true,
      defaultValue: '',
      section: 'Data',
    },
    // Optional visuals
    height: {
      label: 'Height (px)',
      type: 'Number',
      bindable: false,
      defaultValue: 700,
      section: 'Appearance',
    },
    background: {
      label: 'Background',
      type: 'Text',
      bindable: false,
      defaultValue: '#ffffff',
      section: 'Appearance',
    },
  },

  // Declare all custom events your element can emit
  triggerEvents: [
    { name: 'noteAdded', label: 'Note Added' },
    { name: 'noteDeleted', label: 'Note Deleted' },
    { name: 'noteToggledProblem', label: 'Note Toggled Problem' },
    { name: 'noteToggledResolved', label: 'Note Toggled Resolved' },

    { name: 'childMoved', label: 'Child Moved To Course' },
    { name: 'movedToWaitingList', label: 'Child Moved To Waiting List' },

    { name: 'courseApprovalToggled', label: 'Course Approval Toggled' },
    { name: 'courseFullToggled', label: 'Course Full/Closed Toggled' },

    { name: 'autoEnrollTriggered', label: 'Auto Enroll Triggered' },
    { name: 'resetToFirstChoices', label: 'Reset To First Choices Triggered' },
  ],
};
