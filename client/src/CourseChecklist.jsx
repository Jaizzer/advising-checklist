import { useState, useEffect } from 'react';

export default function CourseChecklist({ program, isAdviser }) {
	const [courseData, setCourseData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchCourseData = async () => {
			try {
				// Encode the program to handle spaces or special characters
				const encodedProgram = encodeURIComponent(program);

				// Make the fetch request with the encoded program name
				const response = await fetch(`http://localhost:9090/courseChecklist/${encodedProgram}`);
				if (!response.ok) {
					throw new Error('Failed to fetch course data');
				}
				const data = await response.json();

				// Group courses by PrescribedYear and PrescribedSemester
				const groupedData = groupCoursesByYearAndSemester(data);

				setCourseData(groupedData);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCourseData();
	}, [program]);

	// Function to group courses by PrescribedYear and PrescribedSemester
	const groupCoursesByYearAndSemester = (courses) => {
		const grouped = {};

		courses.forEach((course) => {
			// Ensure that the year and semester values are valid and formatted correctly
			const year = course.PrescribedYear || 'No Year';
			const semester = course.PrescribedSemester || 'No Semester';

			// Initialize the year and semester in the grouped object if not present
			if (!grouped[year]) {
				grouped[year] = {};
			}

			if (!grouped[year][semester]) {
				grouped[year][semester] = [];
			}

			// Push the course into the appropriate year/semester group
			grouped[year][semester].push(course);
		});

		return grouped;
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	// Render the course list for each semester and year
	const renderSemester = (semester, courses) => {
		const totalUnits = courses.reduce((sum, course) => sum + (course.Units || 0), 0);

		return (
			<div className="semester">
				<div className="semester-header">
					<h3 className="semester-title">{semester}</h3>
					<p className="total-units">Total Units: {totalUnits}</p>
				</div>
				<div className="semester-table-container">
					<table className="semester-table">
						<thead>
							<tr>
								<th>Course Name</th>
								<th>Course Type</th>
								<th>Units</th>
							</tr>
						</thead>
						<tbody>
							{courses.map((course, index) => (
								<tr key={index}>
									<td>{course.CourseId}</td>
									<td>{course.CourseType}</td>
									<td>{course.Units || 'N/A'}</td> {/* Display the units */}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	return (
		<div>
			<h4 className="adviser-checklist-subtitle h4">{program}</h4>

			{/* Iterate through each year in the grouped course data, sorted numerically */}
			{Object.keys(courseData)
				.sort((a, b) => {
					// Sort years numerically, assuming years are in the format 'Year 1', 'Year 2', etc.
					const yearA = parseInt(a.split(' ')[1]);
					const yearB = parseInt(b.split(' ')[1]);
					return yearA - yearB;
				})
				.map((year, index) => (
					<div key={index} className="year-container">
						<h2 className="year-title">{year}</h2>
						<div className="semester-row">
							{/* Iterate through each semester in the year */}
							{Object.keys(courseData[year]).map((semester, index) => renderSemester(semester, courseData[year][semester], index))}
						</div>
					</div>
				))}

			{/* Conditionally render Update Record button based on isAdviser prop */}
			{isAdviser && (
				<div className="text-end mt-4">
					<button className="btn update">Update Record</button>
				</div>
			)}
		</div>
	);
}
