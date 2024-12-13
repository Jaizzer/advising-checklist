import SemestralRecords from './SemestralRecords';
import AdvisingCourses from './AdvisingCourses';

export default function StudentAdvising({ studentNumber }) {
	return (
		<>
			<SemestralRecords studentNumber={studentNumber}></SemestralRecords>
			<AdvisingCourses studentNumber={studentNumber}></AdvisingCourses>
		</>
	);
}
