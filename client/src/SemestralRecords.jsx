import { useState, useEffect } from 'react';
import styles from './StudentAdvising.module.css';

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

	const renderSemester = (semester, courses) => {
		const totalUnits = courses.reduce((sum, course) => sum + course.Units, 0);
		return (
			<div key={semester} className={`${styles['checklist-table']} table-responsive mt-4`}>
				<table className="table table-hover align-middle">
					<thead>
						<tr>
							<th colSpan="7" className={`text-start ${styles['sem-label']}`}>
								{semester}
							</th>
						</tr>
						<tr>
							<th scope="col">Course</th>
							<th scope="col">Course Type</th>
							<th scope="col">Units</th>
							<th scope="col">Grade</th>
							<th scope="col">Semester Taken</th>
							<th scope="col">A.Y Taken</th>
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
									<td>{PrescribedSemester}</td>
									<td>{AcademicYearTaken}</td>
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
		<div className={`col-7 ${styles['advising-container']}`}>
			<div className={`card shadow-sm ${styles['card-checklist']}`}>
				<div className="card-body">
					{/* Render courses grouped by year and semester */}
					{Object.keys(groupedCoursesTaken)
						.sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
						.map((year) => (
							<div key={year}>
								{Object.keys(groupedCoursesTaken[year])
									.sort((a, b) => a.localeCompare(b))
									.map((semester) => renderSemester(semester, groupedCoursesTaken[year][semester]))}
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
