import { useState, useEffect } from 'react';
import SemestralRecords from './SemestralRecords'; // Assuming this component is in the same folder
import styles from './SemestralRecords.module.css'; // Import the CSS module

export default function StudentDashboard({ studentNumber }) {
	const [studentData, setStudentData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch student dashboard data when the component mounts
	useEffect(() => {
		const fetchStudentData = async () => {
			try {
				const response = await fetch(`http://localhost:9090/dashboard/${studentNumber}`);
				if (!response.ok) {
					throw new Error('Failed to fetch student data');
				}
				const data = await response.json();
				setStudentData(data); // Store student data in state
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchStudentData();
	}, [studentNumber]);

	// If data is still loading, show loading message
	if (loading) {
		return <div>Loading...</div>;
	}

	// If there is an error, show the error message
	if (error) {
		return <div>Error: {error}</div>;
	}

	// If no student data found, return a message
	if (!studentData) {
		return <div>No student data found.</div>;
	}

	// Destructure the student data to use it in the component
	const { StudentName, StudentProgram, AdviserName, CurrentStanding, CoursesTaken, CourseChecklist } = studentData;

	return (
		<div className="container">
			<h1 className={`${styles['title_page']} ${styles['h1']} ${styles['fw-bold']}`}>Dashboard</h1>

			{/* Student Info Container */}
			<div className={styles['student-info-container']}>
				<div className={styles['student-info-left']}>
					<h4>{studentData.StudentName}</h4>
					<p>{studentData.StudentNumber}</p>
				</div>
				<div className={styles['student-info-right']}>
					<h4>{studentData.CurrentStanding}</h4>
					<h5>{studentData.StudentProgram}</h5>
				</div>
			</div>

			{/* Adviser Container */}
			<div className={styles['adviser-container']}>
				<div className={styles['total-units']}>
					<p>Total Units Taken: {CoursesTaken.reduce((sum, course) => sum + course.Units, 0)} Units</p>
				</div>
				<div className={styles['adviser']}>
					<p>Adviser: {studentData.AdviserName}</p>
				</div>
			</div>

			{/* Course Checklist */}
			<h1 className={`${styles['adviser-checklist-title']} ${styles['h1']} ${styles['fw-bold']}`}>Student Course Checklist</h1>
			<h4 className={`${styles['adviser-checklist-subtitle']} ${styles['h4']}`}>{studentData.StudentProgram}</h4>

			{/* Render the SemestralRecords Component, passing the studentNumber */}
			<SemestralRecords studentNumber={studentNumber} />
		</div>
	);
}
