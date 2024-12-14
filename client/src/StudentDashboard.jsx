import { useState, useEffect } from 'react';
import SemestralRecords from './SemestralRecords'; // Assuming this component is in the same folder

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
			{/* Dashboard Title */}
			<h1 className="fw-bold">Dashboard</h1>

			{/* Student Info Section */}
			<div className="student-info-container">
				<div className="student-info-left">
					<h4>{StudentName}</h4>
					<p>{studentNumber}</p>
				</div>
				<div className="student-info-right">
					<div>
						<h4>{CurrentStanding}</h4>
						<h5>{StudentProgram}</h5>
					</div>S11
				</div>
			</div>

			{/* Adviser Info Section */}
			<div className="adviser-container">
				<div className="total-units">
					<p>Total Units Taken: {CoursesTaken.reduce((total, course) => total + course.Units, 0)} Units</p>
				</div>
				<div className="adviser">
					<p>Adviser: {AdviserName}</p>
				</div>
			</div>

			{/* Student Course Checklist */}
			<h1 className="h1 fw-bold">Student Course Checklist</h1>
			<h4 className="h4">{StudentProgram}</h4>

			{/* Render the SemestralRecords Component, passing the studentNumber */}
			<SemestralRecords studentNumber={studentNumber} />

		
		</div>
	);
}
