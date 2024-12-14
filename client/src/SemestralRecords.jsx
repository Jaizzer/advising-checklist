import { useState, useEffect } from 'react';

export default function SemestralRecords({ studentNumber }) {
	const [studentData, setStudentData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchStudentData = async () => {
			try {
				const response = await fetch(`http://localhost:9090/dashboard/${studentNumber}`);
				if (!response.ok) {
					throw new Error('Failed to fetch student data');
				}
				const data = await response.json();
				setStudentData(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStudentData();
	}, [studentNumber]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!studentData) {
		return <div>No student data found.</div>;
	}

	const { CoursesTaken } = studentData;

	const groupCoursesByYearAndSemester = (courses) => {
		const grouped = {};
		courses.forEach((course) => {
			const year = course.PrescribedYear || 'No Year';
			const semester = course.PrescribedSemester || 'No Semester';
			if (!grouped[year]) {
				grouped[year] = {};
			}
			if (!grouped[year][semester]) {
				grouped[year][semester] = [];
			}
			grouped[year][semester].push(course);
		});
		return grouped;
	};

	const getStatus = (grade) => {
		if (grade === 'Not Available') return 'ONGOING';
		if (grade === 5) return 'FAIL';
		if (grade === 4) return 'INC';
		if (grade >= 1 && grade <= 3) return 'PASSED';
		return 'Unknown'; // Fallback for unexpected grades
	};

	const renderSemester = (year, semester, courses) => {
		const totalUnits = courses.reduce((sum, course) => sum + course.Units, 0);
		return (
			<div key={`${year}-${semester}`} className="table-responsive mt-4">
				<table className="table table-hover align-middle">
					<thead>
						<tr>
							<th colSpan="8" className="text-start sem-label">
								{`${year} - ${semester}`}
							</th>
						</tr>
						<tr>
							<th scope="col">Course</th>
							<th scope="col">Course Type</th>
							<th scope="col">Units</th>
							<th scope="col">Grade</th>
							<th scope="col">Status</th>
						</tr>
					</thead>
					<tbody>
						{courses.map((course, index) => {
							const { CourseId, CourseType, Units, Grade, PrescribedSemester, AcademicYearTaken } = course;
							return (
								<tr key={index}>
									<td>{CourseId}</td>
									<td>{CourseType}</td>
									<td>{Units}</td>
									<td>{Grade}</td>
									<td>{getStatus(Grade)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<p className="text-end">TOTAL UNITS: {totalUnits}</p>
			</div>
		);
	};

	const groupedCoursesTaken = groupCoursesByYearAndSemester(CoursesTaken);

	return (
		<div className="advising-container">
			<div className="card shadow-sm card-checklist">
				<div className="card-body">
					{/* Render courses grouped by year and semester */}
					{Object.keys(groupedCoursesTaken)
						.sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
						.map((year) => (
							<div key={year}>
								<div className="year-container">
									<h2 className="year-title">{year}</h2>
								</div>
								<div className="semester-row">
									{Object.keys(groupedCoursesTaken[year])
										.sort((a, b) => a.localeCompare(b))
										.map((semester) => renderSemester(year, semester, groupedCoursesTaken[year][semester]))}
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
