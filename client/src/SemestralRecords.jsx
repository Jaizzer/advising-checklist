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

	const { CoursesTaken, CourseChecklist } = studentData;

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

	const getCourseStatus = (course) => {
		if (course.Grade === "Not Available") {
			return 'On Going';
		} else if (course.Grade === 4.0) {
			return 'INC';
		} else if (course.Grade <= 3.0) {
			return 'Passed';
		} else {
			return 'Failed';
		}
	};

	const renderSemester = (semester, courses) => {
		const totalUnits = courses.reduce((sum, course) => sum + course.Units, 0);
		return (
			<div className="semester" key={semester}>
				{' '}
				{/* Added key prop */}
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
								<th>Status</th>
								<th>Grade</th>
							</tr>
						</thead>
						<tbody>
							{courses.map((course, index) => {
								return (
									<tr key={`${semester}-${index}`}>
										{' '}
										{/* Key for each course row */}
										<td>{course.CourseId}</td>
										<td>{course.CourseType}</td>
										<td>{course.Units}</td>
										<td>{getCourseStatus(course)}</td>
										<td>{course.Grade !== 'Not Available' ? course.Grade.toFixed(2) : '-'}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	const groupedCoursesTaken = groupCoursesByYearAndSemester(CoursesTaken);

	return (
		<>
			{Object.keys(groupedCoursesTaken)
				.sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
				.map((year) => (
					<div className="year-container" key={year}>
						{' '}
						{/* Added key prop */}
						<h2 className="year-title">{year}</h2>
						<div className="semester-row">
							{Object.keys(groupedCoursesTaken[year])
								.sort((a, b) => a.localeCompare(b))
								.map((semester) => renderSemester(semester, groupedCoursesTaken[year][semester]))}
						</div>
					</div>
				))}
		</>
	);
}
