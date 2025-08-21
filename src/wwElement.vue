<template>
  <div class="ww-course-enrollment-root" :style="rootStyle">
    <div ref="mountEl" class="mount"></div>
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

const props = defineProps({
  scriptUrl: { type: String, default: '' },
  semesters: { type: [Array, Object], default: () => [] },
  selectedSemesterIndex: { type: Number, default: 0 },
  selectedDayIndex: { type: Number, default: 0 },
  searchQuery: { type: String, default: '' },
  height: { type: Number, default: 700 },
  background: { type: String, default: '#ffffff' },
});

const emit = defineEmits(['triggerEvent']);
const mountEl = ref(null);
const mountedOk = ref(false);
let unmountFn = null;

const rootStyle = computed(() => ({
  position: 'relative',
  width: '100%',
  height: `${props.height || 700}px`,
  background: props.background || '#fff',
  overflow: 'auto',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
}));

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

function trigger(name, payload) {
  emit('triggerEvent', { name, event: payload });
}

function getExternalProps() {
  return {
    semesters: props.semesters,
    selectedSemesterIndex: props.selectedSemesterIndex,
    selectedDayIndex: props.selectedDayIndex,
    searchQuery: props.searchQuery,
  };
}

function getExternalCallbacks() {
  return {
    onAddNote: (courseId, text) => trigger('noteAdded', { courseId, text }),
    onDeleteNote: (courseId, noteId) => trigger('noteDeleted', { courseId, noteId }),
    onToggleNoteProblem: (courseId, noteId) => trigger('noteToggledProblem', { courseId, noteId }),
    onToggleNoteResolved: (courseId, noteId) => trigger('noteToggledResolved', { courseId, noteId }),
    onMoveChildToCourse: (childId, newCourseId, targetDayIndex) => trigger('childMoved', { childId, newCourseId, targetDayIndex }),
    onMoveChildToWaitingList: (childId) => trigger('movedToWaitingList', { childId }),
    onToggleCourseApproval: (courseId, approved) => trigger('courseApprovalToggled', { courseId, approved }),
    onToggleCourseFull: (courseId, forcedFull) => trigger('courseFullToggled', { courseId, forcedFull }),
    onAutoEnroll: (dayIndex) => trigger('autoEnrollTriggered', { dayIndex }),
    onResetToFirstChoices: (dayIndex) => trigger('resetToFirstChoices', { dayIndex }),
  };
}

async function tryMount() {
  if (!mountEl.value || !props.scriptUrl) return;
  try {
    await loadScriptOnce(props.scriptUrl);
    const api = window.CourseEnrollmentMount && window.CourseEnrollmentMount(
      mountEl.value,
      getExternalProps(),
      getExternalCallbacks()
    );
    if (api && typeof api.unmount === 'function') unmountFn = api.unmount;
    if (api && typeof api.update === 'function') mountEl.value.__update = api.update;
    mountedOk.value = true;
  } catch (e) {
    console.error('[CourseEnrollment] mount failed:', e);
    mountedOk.value = false;
  }
}

onMounted(() => { tryMount(); });

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
    try { unmountFn(); } catch {}
  }
});
</script>

<style scoped>
.ww-course-enrollment-root { display: block; }
.fallback { position: absolute; inset: 0; display: grid; place-items: center; color: #6b7280; text-align: center; padding: 16px; }
.fallback .title { font-weight: 600; color: #111827; margin-bottom: 6px; }
.fallback .hint { font-size: 13px; }
.mount { width: 100%; height: 100%; }
</style>
