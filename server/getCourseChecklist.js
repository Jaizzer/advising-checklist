import pool from './database.js';

// Function to fetch course checklist data with transaction handling
export async function getCourseChecklist(program) {
	// Ensure program is provided before proceeding
	if (!program) {
		throw new Error('Program is required.');
	}

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction
		await connection.beginTransaction();

		// Query to fetch course checklist details for the given program, including Units
		const [courseChecklistResult] = await connection.query(
			`SELECT 
				pc.StudentProgram, 
				pc.CourseId, 
				pc.CourseType, 
				pc.PrescribedYear, 
				pc.PrescribedSemester,
				pc.DateLastUpdated, 
				pc.TimeLastUpdated,
				c.Units
			FROM ProgramChecklist pc
			JOIN Course c ON pc.CourseId = c.CourseId
			WHERE pc.StudentProgram = ?`,
			[program] // Use the given program as a parameter for the query
		);

		if (courseChecklistResult.length === 0) {
			// If no course checklist found, roll back and throw error
			await connection.rollback();
			throw new Error('No course checklist found for the program.');
		}

		// Prepare the course checklist data in the desired format, including Units
		const courseChecklist = courseChecklistResult.map((course) => ({
			CourseId: course.CourseId,
			CourseType: course.CourseType || 'Not Assigned', // Default to 'Not Assigned' if missing
			PrescribedYear: course.PrescribedYear,
			PrescribedSemester: course.PrescribedSemester,
			Units: course.Units || 'N/A', // Include Units, default to 'N/A' if missing
			DateLastUpdated: course.DateLastUpdated,
			TimeLastUpdated: course.TimeLastUpdated,
		}));

		// Commit the transaction since everything succeeded
		await connection.commit();

		// Return the course checklist data
		return courseChecklist;
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
