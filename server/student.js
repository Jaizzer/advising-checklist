import pool from './database.js';

export async function insertStudent(studentData) {
	// Destructure the student data object to extract necessary information
	const { StudentNumber, S_FirstName, S_MiddleName, S_LastName, StudentProgram, AdviserID, CurrentStanding, TotalUnitsTaken } = studentData;

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Check if AdviserID exists in the Adviser table
		if (AdviserID) {
			const [adviserCheck] = await connection.query(`SELECT COUNT(*) AS count FROM Adviser WHERE AdviserID = ?`, [AdviserID]);
			if (adviserCheck[0].count === 0) {
				// Throw an error if the adviser does not exist
				throw new Error(`Adviser with ID ${AdviserID} does not exist.`);
			}
		}

		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Insert the new student into the 'Student' table
		const [result] = await connection.query(
			`INSERT INTO Student (StudentNumber, S_FirstName, S_MiddleName, S_LastName, StudentProgram, AdviserID, CurrentStanding, TotalUnitsTaken)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[StudentNumber, S_FirstName, S_MiddleName, S_LastName, StudentProgram, AdviserID, CurrentStanding, TotalUnitsTaken]
		);

		// Commit the transaction if the insert operation is successful
		await connection.commit();

		// Return the result of the student insertion
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
