import pool from './database.js';

// Function to fetch courses that have not been taken by a student
export async function getCoursesThatAreStillNotTaken(studentNumber) {
	// Ensure studentNumber is provided before proceeding
	if (!studentNumber) {
		throw new Error('Student number is required.'); // Throw error if no student number is provided
	}

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Check if the student exists in the Student table
		const [studentCheckResult] = await connection.query(`SELECT 1 FROM Student WHERE StudentNumber = ?`, [studentNumber]);

		if (studentCheckResult.length === 0) {
			// If no student is found with the provided student number, throw error
			throw new Error('Student not found.');
		}

		// Query to fetch courses that have not been taken by the student
		const [result] = await connection.query(
			`SELECT 
                pc.StudentProgram, 
                pc.CourseId, 
                c.CourseDescription, 
                pc.CourseType
            FROM ProgramChecklist pc
            JOIN Course c ON pc.CourseId = c.CourseId
            LEFT JOIN StudentCourseList scl ON scl.StudentNumber = ? AND scl.CourseId = pc.CourseId
            WHERE pc.StudentProgram = (
                SELECT StudentProgram 
                FROM Student 
                WHERE StudentNumber = ?
            ) 
            AND scl.CourseId IS NULL
            AND pc.PrescribedYear <= (
                SELECT CurrentStanding 
                FROM Student 
                WHERE StudentNumber = ?
            )
            ORDER BY pc.PrescribedYear, pc.PrescribedSemester;`,
			[studentNumber, studentNumber, studentNumber]
		);

		if (result.length === 0) {
			// If no courses are found that have not been taken, throw error
			throw new Error('No courses found that have not been taken.');
		}

		// Prepare the course data in the desired format
		const coursesNotTaken = result.map((course) => ({
			StudentProgram: course.StudentProgram,
			CourseId: course.CourseId,
			CourseDescription: course.CourseDescription,
			CourseType: course.CourseType || 'Not Assigned', // Default to 'Not Assigned' if missing
		}));

		// Return the list of courses that have not been taken
		return { success: true, courses: coursesNotTaken };
	} catch (error) {
		// Rethrow the error to propagate it upwards
		throw new Error(error.message);
	} finally {
		// Release the connection back to the pool after all operations are complete
		connection.release();
	}
}
