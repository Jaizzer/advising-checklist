import pool from './database.js';

// Function to insert a new checklist item into the ProgramChecklist
export async function insertChecklistItem(checklistData) {
	// Destructure the checklist data object to extract necessary information
	const { StudentProgram, CourseID, CourseType, PrescribedYear, PrescribedSemester } = checklistData;

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Check if the CourseID exists in the Course table
		const [courseExists] = await connection.query(`SELECT COUNT(*) AS count FROM Course WHERE CourseID = ?`, [CourseID]);

		if (courseExists[0].count === 0) {
			// Rollback the transaction if the CourseID does not exist in the Course table
			await connection.rollback();
			// Return an error indicating that the CourseID does not exist
			return { success: false, error: `CourseID ${CourseID} does not exist in the Course table.` };
		}

		// Insert the new checklist item into the 'ProgramChecklist' table, using CURRENT_DATE and CURRENT_TIME for dynamic values
		const [result] = await connection.query(
			`INSERT INTO ProgramChecklist (StudentProgram, CourseID, CourseType, PrescribedYear, PrescribedSemester, DateLastUpdated, TimeLastUpdated)
			 VALUES (?, ?, ?, ?, ?, CURRENT_DATE, CURRENT_TIME)`,
			[StudentProgram, CourseID, CourseType, PrescribedYear, PrescribedSemester]
		);

		// Commit the transaction if the insert operation is successful
		await connection.commit();

		// Return the result of the checklist item insertion
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
