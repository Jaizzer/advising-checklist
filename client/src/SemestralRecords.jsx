import { useState, useEffect } from 'react';
import styles from './SemestralRecords.module.css'; 

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
		if (grade === 'Not Available') return 'FOR ADVISING';
		if (grade === 5) return 'FAIL';
		if (grade === 4) return 'INC';
		if (grade >= 1 && grade <= 3) return 'PASSED';
		return 'Unknown'; // Fallback for unexpected grades
	};

	const renderSemester = (year, semester, courses) => {
		const totalUnits = courses.reduce((sum, course) => sum + course.Units, 0);
		return (
			<div key={`${year}-${semester}`} className={styles.semester}>
				<div className={styles['semester-header']}>
					<h3 className={styles['semester-title']}>{`${year} - ${semester}`}</h3>
					<p className={styles['total-units']}>Total Units: {totalUnits}</p>
				</div>
				<div className={styles['semester-table-container']}>
					<table className={styles['semester-table']}>
						<thead>
							<tr>
								<th>Course Name</th>
								<th>Course Type</th>
								<th>Units</th>
								<th>Grade</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{courses.map((course, index) => {
								const { CourseId, CourseType, Units, Grade } = course;
                                if (Grade != "Not Available"){
								return (
									<tr key={index}>
										<td>{CourseId}</td>
										<td>{CourseType}</td>
										<td>{Units}</td>
										<td>{Grade  === "Not Available" ? '--' : Grade}</td>
										<td>{getStatus(Grade)}</td>
									</tr>
								)} else {
                                    return null;
                                }
							})}
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	const groupedCoursesTaken = groupCoursesByYearAndSemester(CoursesTaken);

	return (
		<div className={styles['container-content']}>
			{/* Render courses grouped by year and semester */}
			{Object.keys(groupedCoursesTaken)
				.sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
				.map((year) => (
					<div key={year}>
						<div className={styles['year-container']}>
							<h2 className={styles['year-title']}>{year}</h2>
						</div>
						<div className={styles['semester-row']}>
							{Object.keys(groupedCoursesTaken[year])
								.sort((a, b) => a.localeCompare(b))
								.map((semester) => renderSemester(year, semester, groupedCoursesTaken[year][semester]))}
						</div>
					</div>
				))}
		</div>
	);
}
