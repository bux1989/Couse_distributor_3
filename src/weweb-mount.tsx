import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // adjust if your main component lives elsewhere

type MountAPI = {
  update?: (nextProps: any) => void;
  unmount?: () => void;
};

declare global {
  interface Window {
    CourseEnrollmentMount: (el: HTMLElement, props: any, callbacks: any) => MountAPI;
  }
}

function mount(el: HTMLElement, initialProps: any, callbacks: any): MountAPI {
  const root = createRoot(el);
  const render = (p: any) => {
    root.render(
      <App
        {...p}
        onAddNote={callbacks?.onAddNote}
        onDeleteNote={callbacks?.onDeleteNote}
        onToggleNoteProblem={callbacks?.onToggleNoteProblem}
        onToggleNoteResolved={callbacks?.onToggleNoteResolved}
        onMoveChildToCourse={callbacks?.onMoveChildToCourse}
        onMoveChildToWaitingList={callbacks?.onMoveChildToWaitingList}
        onToggleCourseApproval={callbacks?.onToggleCourseApproval}
        onToggleCourseFull={callbacks?.onToggleCourseFull}
        onAutoEnroll={callbacks?.onAutoEnroll}
        onResetToFirstChoices={callbacks?.onResetToFirstChoices}
      />
    );
  };
  render(initialProps);
  return {
    update(nextProps: any) { render(nextProps); },
    unmount() { root.unmount(); },
  };
}

window.CourseEnrollmentMount = (el, props, callbacks) => mount(el, props, callbacks);
