import { useState, useEffect } from 'react';

export default function CourseTable({ studentProgram, tableTitle, typeOfCourse }) {
	// Example state with courses data
	const [courses, setCourses] = useState([]);

	// Fetch and filter Courses
	useEffect(() => {
		// Use encodeURIComponent to encode the studentProgram value
		const encodedStudentProgram = encodeURIComponent(studentProgram);

		fetch(`http://localhost:9090/courses/${encodedStudentProgram}`)
			.then((response) => response.json())
			.then((data) => {
				// Filter courses based on the typeOfCourse prop
				const filteredCourses = data.filter((course) => course.CourseType === typeOfCourse);
				setCourses(filteredCourses);
			});
	}, [studentProgram, typeOfCourse]); // Re-run effect when either studentProgram or typeOfCourse changes

	return (
		<section className="mb-5">
			<div className="d-flex justify-content-between align-items-center mb-2">{/* You can add any content like buttons or filters here */}</div>
			<h4 className="section-title">{tableTitle}</h4>
			<table className="table table-hover">
				<thead className="table-header">
					<tr>
						<th>Course Name</th>
						<th>Description</th>
						<th>Component</th>
						<th>Units</th>
						<th>Course Type</th>
						<th>Affiliation</th>
						<th>Prerequisite</th>
						<th>Corequisite</th>
					</tr>
				</thead>
				<tbody>
					{courses.length > 0 ? (
						courses.map((course, index) => (
							<tr key={index} className="text-center">
								<td>{course.CourseID}</td>
								<td>{course.CourseDescription}</td>
								<td>{course.CourseComponents}</td>
								<td>{course.Units}</td>
								<td>{course.CourseType}</td>
								<td>{course.Affiliation}</td>
								<td>{course.Prerequisites.length > 0 ? course.Prerequisites.join(', ') : 'None'}</td>
								<td>{course.Corequisites.length > 0 ? course.Corequisites.join(', ') : 'None'}</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan="8" className="text-center">
								No courses available for the selected course type.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</section>
	);
}
