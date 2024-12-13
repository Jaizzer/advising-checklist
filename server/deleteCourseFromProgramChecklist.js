import pool from './database.js';

// Function to delete a course from the ProgramChecklist
export default async function deleteCourseFromProgramChecklist(courseId, studentProgram) {
	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Delete the course from the ProgramChecklist table
		const [result] = await connection.query(`DELETE FROM ProgramChecklist WHERE CourseId = ? AND StudentProgram = ?`, [courseId, studentProgram]);

		// Check if any rows were affected by the delete operation
		if (result.affectedRows === 0) {
			await connection.rollback();
			return { success: false, error: `No record found for CourseId: ${courseId} and StudentProgram: ${studentProgram}` };
		}

		// Commit the transaction if the delete operation is successful
		await connection.commit();

		// Return the result of the course deletion
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
