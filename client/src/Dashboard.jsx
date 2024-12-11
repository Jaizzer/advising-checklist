import { useState, useEffect } from 'react';

export default function Dashboard({ studentNumber }) {
	// State to hold the fetched student data
	const [studentData, setStudentData] = useState(null);
	// State to manage the loading state while data is being fetched
	const [loading, setLoading] = useState(true);

	// useEffect hook to fetch student data when the component mounts or when studentNumber changes
	useEffect(() => {
		// Function to fetch student data from the server
		const fetchStudentData = async () => {
			try {
				// Fetch data from the server using the provided student number
				const response = await fetch(`http://localhost:9090/dashboard/${studentNumber}`);
				// Parse the JSON response
				const data = await response.json();
				// Set the fetched data in the state
				setStudentData(data);
			} catch (error) {
				// Log any errors that occur during the fetch operation
				console.error('Error fetching student data:', error);
			} finally {
				// Set loading state to false once the fetch operation is complete
				setLoading(false);
			}
		};

		// Call the fetchStudentData function
		fetchStudentData();
	}, [studentNumber]); // Dependency array: only refetch data when studentNumber changes

	// Display loading message while data is being fetched
	if (loading) {
		return <div>Loading...</div>;
	}

	// Display a message if no data is available
	if (!studentData) {
		return <div>No data available</div>;
	}

	// Destructure the relevant data from the fetched student data object
	const { StudentName, StudentNumber, StudentProgram, AdviserName, CoursesTaken, CourseChecklist, CurrentStanding } = studentData;

	// Utility function to calculate the total units from a list of courses
	const getTotalUnits = (courses) => {
		// Reduce the list of courses to sum up the units
		return courses.reduce((total, course) => total + course.Units, 0);
	};

	// Calculate the total number of years based on the student's current standing (e.g., "Year 3")
	const totalYears = parseInt(CurrentStanding.split(' ')[1], 10);

	// Transform the course checklist into a structured array of years and semesters
	const yearsData = Array.from({ length: totalYears }).map((_, yearIndex) => {
		// Determine the year name (e.g., "Year 1", "Year 2")
		const year = `Year ${yearIndex + 1}`;
		// Create a structure for each year with two semesters: Sem 1 and Sem 2
		const semesters = ['Sem 1', 'Sem 2'].map((semester) => {
			// Filter courses based on the prescribed year and semester
			const semesterCourses = CourseChecklist.filter((course) => course.PrescribedYear === year && course.PrescribedSemester === semester);
			return {
				semester, // Name of the semester (e.g., "Sem 1")
				courses: semesterCourses, // List of courses for this semester
				totalUnits: getTotalUnits(semesterCourses), // Total units for this semester
			};
		});

		// Return an object representing the year, including its semesters and their total units
		return {
			year: year,
			semesters,
		};
	});

	// Console log the student data for debugging purposes
	console.log(studentData);

	// Render the Dashboard component
	return (
		<div className="dashboard">
			{/* Page Title */}
			<h1 className="title_page h1 fw-bold">Dashboard</h1>

			{/* Student Info Section */}
			<div className="student-info-container">
				{/* Left side: student name and number */}
				<div className="student-info-left">
					<h4>{StudentName}</h4>
					<p>{StudentNumber}</p>
				</div>
				{/* Right side: current standing and program */}
				<div className="student-info-right">
					<div>
						<h4>{CurrentStanding}</h4>
						<h5>{StudentProgram}</h5>
					</div>
				</div>
			</div>

			{/* Adviser and Total Units Taken */}
			<div className="adviser-container">
				{/* Total units taken */}
				<div className="total-units">
					<p>Total Units Taken: {getTotalUnits(CoursesTaken)} Units</p>
				</div>
				{/* Adviser name */}
				<div className="adviser">
					<p>Adviser: {AdviserName}</p>
				</div>
			</div>

			{/* Student Course Checklist */}
			<h1 className="adviser-checklist-title h1 fw-bold">Student Course Checklist</h1>
			<h4 className="adviser-checklist-subtitle h4">{StudentProgram}</h4>

			{/* Loop through the yearsData and render each year's information */}
			{yearsData.map((yearData, yearIndex) => {
				return (
					<div key={yearIndex} className="year-container">
						{/* Display the year title (e.g., "Year 1") */}
						<h2 className="year-title">{yearData.year}</h2>
						{/* Loop through the semesters (Sem 1 and Sem 2) for the current year */}
						<div className="semester-row">
							{yearData.semesters.map((semesterData, semIndex) => {
								return (
									<div key={semIndex} className="semester">
										{/* Semester header displaying the semester name and total units */}
										<div className="semester-header">
											<h3 className="semester-title">{semesterData.semester}</h3>
											<p className="total-units">Total Units: {semesterData.totalUnits}</p>
										</div>
										{/* Table of courses for this semester */}
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
													{/* Loop through the courses for the current semester */}
													{semesterData.courses.map((course, index) => (
														<tr key={index}>
															<td>{course.CourseId}</td>
															<td>{course.CourseType}</td>
															<td>{course.Units}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
