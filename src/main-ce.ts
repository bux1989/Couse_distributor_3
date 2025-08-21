import { defineCustomElement } from 'vue';
import CourseEnrollment from './components/CourseEnrollment.vue';

// Optional: expose attributes/props via observedAttributes using defineCustomElement props
const CE = defineCustomElement(CourseEnrollment);

// Use any tag name you like (kebab-case, with a hyphen)
customElements.define('course-enrollment', CE);
