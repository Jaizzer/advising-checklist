import pool from './database.js';

export default async function editCourseFromProgramChecklist(currentCourseID, updatedCourseData, studentProgram) {
	// Destructure the updated course data object to extract necessary information
	const { CourseID: newCourseID, Units, CourseType } = updatedCourseData;

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Function to check if a course exists in the Course table
		const checkIfCourseExists = async (courseId) => {
			const [rows] = await connection.query(`SELECT COUNT(*) as count FROM Course WHERE CourseID = ?`, [courseId]);
			return rows[0].count > 0;
		};

		// Check if the current course exists
		const courseExists = await checkIfCourseExists(currentCourseID);
		if (!courseExists) {
			throw new Error(`Course with ID ${currentCourseID} does not exist.`);
		}

		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Update the course details in the 'Course' table using the current CourseID
		const [updateResult] = await connection.query(
			`UPDATE Course
             SET CourseID = ?, Units = ? 
             WHERE CourseID = ?`,
			[newCourseID, Units, currentCourseID]
		);

		// Update CourseType in ProgramChecklist table
		await connection.query(`UPDATE ProgramChecklist SET CourseId = ?, CourseType = ? WHERE CourseId = ? AND StudentProgram = ?`, [
			newCourseID,
			CourseType,
			currentCourseID,
			studentProgram,
		]);

		// Commit the transaction after all operations (update, delete, insert) are successful
		await connection.commit();

		// Return the result of the course update
		return { success: true, message: `Course with ID ${currentCourseID} successfully updated.` };
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
