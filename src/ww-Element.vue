<template>
  <div class="ww-course-enrollment-root" :style="rootStyle">
    <!-- Mount point for your app bundle -->
    <div ref="mountEl" class="mount"></div>

    <!-- Fallback (visible until the external script loads and mounts) -->
    <div v-if="!mountedOk" class="fallback">
      <div class="title">Course Enrollment</div>
      <div class="hint">
        {{ scriptUrl ? 'Loading bundle…' : 'Set “Bundle URL” in the element properties.' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';

// Props come from ww-config.js
const props = defineProps({
  scriptUrl: { type: String, default: '' },
  semesters: { type: [Array, Object], default: () => [] },
  selectedSemesterIndex: { type: Number, default: 0 },
  selectedDayIndex: { type: Number, default: 0 },
  searchQuery: { type: String, default: '' },
  height: { type: Number, default: 700 },
  background: { type: String, default: '#ffffff' },
});

// WeWeb listens to this event for your custom triggers
const emit = defineEmits(['triggerEvent']);

const mountEl = ref(null);
const mountedOk = ref(false);
let unmountFn = null;

// Computed style so you can size the element in the editor
const rootStyle = computed(() => ({
  position: 'relative',
  width: '100%',
  height: `${props.height || 700}px`,
  background: props.background || '#fff',
  overflow: 'auto',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
}));

// Utility: load external script only once per URL
const loadedScripts = {};
function loadScriptOnce(url) {
  if (loadedScripts[url]) return loadedScripts[url];
  loadedScripts[url] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(s);
  });
  return loadedScripts[url];
}

// Emit helper mapping back to WeWeb triggerEvents
function trigger(name, payload) {
  emit('triggerEvent', { name, event: payload });
}

// Build the props/settings object we pass to your app
function getExternalProps() {
  return {
    semesters: props.semesters,
    selectedSemesterIndex: props.selectedSemesterIndex,
    selectedDayIndex: props.selectedDayIndex,
    searchQuery: props.searchQuery,
  };
}

// Build the callbacks your app can call to notify WeWeb
function getExternalCallbacks() {
  return {
    // Notes
    onAddNote: (courseId, text) =>
      trigger('noteAdded', { courseId, text }),
    onDeleteNote: (courseId, noteId) =>
      trigger('noteDeleted', { courseId, noteId }),
    onToggleNoteProblem: (courseId, noteId) =>
      trigger('noteToggledProblem', { courseId, noteId }),
    onToggleNoteResolved: (courseId, noteId) =>
      trigger('noteToggledResolved', { courseId, noteId }),

    // Moves
    onMoveChildToCourse: (childId, newCourseId, targetDayIndex) =>
      trigger('childMoved', { childId, newCourseId, targetDayIndex }),
    onMoveChildToWaitingList: (childId) =>
      trigger('movedToWaitingList', { childId }),

    // Course status
    onToggleCourseApproval: (courseId, approved) =>
      trigger('courseApprovalToggled', { courseId, approved }),
    onToggleCourseFull: (courseId, forcedFull) =>
      trigger('courseFullToggled', { courseId, forcedFull }),

    // Bulk actions
    onAutoEnroll: (dayIndex) =>
      trigger('autoEnrollTriggered', { dayIndex }),
    onResetToFirstChoices: (dayIndex) =>
      trigger('resetToFirstChoices', { dayIndex }),
  };
}

async function tryMount() {
  if (!mountEl.value) return;
  if (!props.scriptUrl) return;

  try {
    await loadScriptOnce(props.scriptUrl);
    // Expect your bundle to expose a global mount function
    // Signature suggestion:
    // window.CourseEnrollmentMount(el, initialProps, callbacks) => returns { unmount?: fn, update?: fn }
    const api = window.CourseEnrollmentMount && window.CourseEnrollmentMount(
      mountEl.value,
      getExternalProps(),
      getExternalCallbacks()
    );

    if (api && typeof api.unmount === 'function') {
      unmountFn = api.unmount;
    }

    // Store update function on the element so we can call it on prop changes
    if (api && typeof api.update === 'function') {
      mountEl.value.__update = api.update;
    }

    mountedOk.value = true;
  } catch (e) {
    console.error('[CourseEnrollment] mount failed:', e);
    mountedOk.value = false;
  }
}

onMounted(() => {
  tryMount();
});

// Update external app when data-related props change
watch(
  () => [props.semesters, props.selectedSemesterIndex, props.selectedDayIndex, props.searchQuery],
  () => {
    if (mountedOk.value && mountEl.value && typeof mountEl.value.__update === 'function') {
      mountEl.value.__update(getExternalProps());
    }
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (typeof unmountFn === 'function') {
    try {
      unmountFn();
    } catch {}
  }
});
</script>

<style scoped>
.ww-course-enrollment-root {
  display: block;
}

.fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #6b7280;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
  text-align: center;
  padding: 16px;
}
.fallback .title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
}
.fallback .hint {
  font-size: 13px;
}
.mount {
  width: 100%;
  height: 100%;
}
</style>
