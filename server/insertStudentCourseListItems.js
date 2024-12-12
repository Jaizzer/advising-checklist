import pool from './database.js';

// Function to insert a new student course record into the StudentCourseList
export default async function insertStudentCourseListItems(studentCourseData) {
	// Destructure the student course data object to extract necessary information
	const { StudentNumber, CourseId, CourseStatus } = studentCourseData;

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Check if the CourseId exists in the Course table
		const [courseExists] = await connection.query(`SELECT COUNT(*) AS count FROM Course WHERE CourseId = ?`, [CourseId]);

		// If the CourseId does not exist, rollback the transaction and return an error
		if (courseExists[0].count === 0) {
			await connection.rollback();
			return { success: false, error: `CourseId ${CourseId} does not exist in the Course table.` };
		}

		// Check if the StudentNumber exists in the Student table
		const [studentExists] = await connection.query(`SELECT COUNT(*) AS count FROM Student WHERE StudentNumber = ?`, [StudentNumber]);

		// If the StudentNumber does not exist, rollback the transaction and return an error
		if (studentExists[0].count === 0) {
			await connection.rollback();
			return { success: false, error: `StudentNumber ${StudentNumber} does not exist in the Student table.` };
		}

		// Insert the new student course record into the StudentCourseList table
		const [result] = await connection.query(
			`INSERT INTO StudentCourseList (StudentNumber, CourseId, CourseStatus, DateSubmitted, TimeSubmitted)
       VALUES (?, ?, ?, CURRENT_DATE, CURRENT_TIME)`,
			[StudentNumber, CourseId, CourseStatus]
		);

		// Commit the transaction if the insert operation is successful
		await connection.commit();

		// Return the result of the student course record insertion
		return { success: true, result };
	} catch (error) {
		// If any error occurs, roll back the transaction to maintain data consistency
		await connection.rollback();
		// Return the error wrapped in an object with error details
		return { success: false, error: error.message };
	} finally {
		// Release the connection back to the pool after all operations are complete
		connection.release();
	}
}
