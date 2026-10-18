import StandardLesson from './StandardLesson.jsx';
import { receivables } from './lesson-packages.js';
export { LessonPractice, LessonPracticeSummary } from './StandardLesson.jsx';

// Preserve the original component entry point and receivables practice identities.
export default function ReceivablesLesson(props) {
  return <StandardLesson {...props} lesson={receivables}/>;
}
