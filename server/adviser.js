import pool from './database.js';

export async function insertAdviser(adviserData) {
	// Destructure the adviser data object to extract necessary information
	const { AdviserID, A_FirstName, A_MiddleName, A_LastName, AdvisingProgram } = adviserData;

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Insert the new adviser into the 'Adviser' table
		const [result] = await connection.query(
			`INSERT INTO Adviser (AdviserID, A_FirstName, A_MiddleName, A_LastName, AdvisingProgram)
			 VALUES (?, ?, ?, ?, ?)`,
			[AdviserID, A_FirstName, A_MiddleName, A_LastName, AdvisingProgram]
		);

		// Commit the transaction if the insert operation is successful
		await connection.commit();

		// Return the result of the adviser insertion
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
