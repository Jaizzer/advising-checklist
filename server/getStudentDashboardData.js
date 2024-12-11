import pool from './database.js';

// Function to fetch student dashboard data with transaction handling
export async function getStudentDashboardData(studentNumber) {
	// Ensure studentNumber is provided before proceeding
	if (!studentNumber) {
		throw new Error('Student number is required.'); // Throw error if no student number is provided
	}

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction
		await connection.beginTransaction();

		// Query to fetch student details, adviser information, and current standing
		const [studentResult] = await connection.query(
			`SELECT 
				s.StudentNumber, 
				s.StudentProgram, 
				s.S_FirstName, 
				s.S_MiddleName, 
				s.S_LastName, 
				a.A_FirstName AS AdviserFirstName, 
				a.A_LastName AS AdviserLastName,
				s.CurrentStanding  -- Include the student's current standing
			FROM Student s
			LEFT JOIN Adviser a ON s.AdviserID = a.AdviserID
			WHERE s.StudentNumber = ?`,
			[studentNumber]
		);

		if (studentResult.length === 0) {
			// If no student found, roll back and throw error
			await connection.rollback();
			throw new Error('Student not found.');
		}

		const student = studentResult[0];

		// Get the list of all courses that the student has taken, including grades
		const [courseResult] = await connection.query(
			`SELECT 
				c.CourseId, 
				pc.CourseType, 
				c.Units, 
				pc.PrescribedYear, 
				pc.PrescribedSemester,
				scl.Grade
			FROM Course c
			JOIN ProgramChecklist pc ON c.CourseId = pc.CourseId
			JOIN StudentCourseList scl ON scl.StudentNumber = ? AND scl.CourseId = c.CourseId
			WHERE pc.StudentProgram = (SELECT StudentProgram FROM Student WHERE StudentNumber = ?)
			ORDER BY pc.PrescribedYear DESC, pc.PrescribedSemester DESC`,
			[studentNumber, studentNumber]
		);

		if (courseResult.length === 0) {
			// If no courses found for the student, roll back and throw error
			await connection.rollback();
			throw new Error('No courses found for the student.');
		}

		// Prepare the course data in the desired format
		const courses = courseResult.map((course) => ({
			CourseId: course.CourseId,
			CourseType: course.CourseType || 'Not Assigned', // Course type is optional
			Units: course.Units,
			PrescribedYear: course.PrescribedYear,
			PrescribedSemester: course.PrescribedSemester,
			Grade: course.Grade || 'Not Available', // Grade is optional
		}));

		// Get the full course checklist based on the student's program and current standing
		// Exclude courses with PrescribedYear = 'None' and PrescribedSemester = 'None'
		const [courseChecklistResult] = await connection.query(
			`SELECT 
                c.CourseId, 
                pc.CourseType, 
                c.Units, 
                pc.PrescribedYear, 
                pc.PrescribedSemester
            FROM Course c
            JOIN ProgramChecklist pc ON c.CourseId = pc.CourseId
            WHERE pc.StudentProgram = (SELECT StudentProgram FROM Student WHERE StudentNumber = ?)
            AND pc.PrescribedYear <= (SELECT CurrentStanding FROM Student WHERE StudentNumber = ?)
            AND pc.PrescribedYear != 'None'  -- Exclude courses with PrescribedYear = 'None'
            AND pc.PrescribedSemester != 'None'  -- Exclude courses with PrescribedSemester = 'None'
            ORDER BY pc.PrescribedYear DESC, pc.PrescribedSemester DESC`,
			[studentNumber, studentNumber]
		);

		// Prepare the course checklist in the desired format
		const courseChecklist = courseChecklistResult.map((course) => ({
			CourseId: course.CourseId,
			CourseType: course.CourseType || 'Not Assigned', // Default to 'Not Assigned' if missing
			Units: course.Units,
			PrescribedYear: course.PrescribedYear,
			PrescribedSemester: course.PrescribedSemester,
		}));

		// Commit the transaction since everything succeeded
		await connection.commit();

		// Return the student data along with courses, course checklist, and current standing
		return {
			StudentName: `${student.S_FirstName} ${student.S_MiddleName ? student.S_MiddleName + ' ' : ''}${student.S_LastName}`,
			StudentNumber: student.StudentNumber,
			StudentProgram: student.StudentProgram,
			AdviserName: `${student.AdviserFirstName} ${student.AdviserLastName}`,
			CurrentStanding: student.CurrentStanding, // Include the current standing
			CoursesTaken: courses,
			CourseChecklist: courseChecklist,
		};
	} catch (error) {
		// Rollback the transaction in case of any error
		await connection.rollback();
		// Rethrow the error to be handled by higher-level code
		throw new Error(error.message);
	} finally {
		// Release the connection back to the pool after all operations are complete
		connection.release();
	}
}
