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

export async function getAdviser(adviserID = null) {
	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		let adviserResult;

		// If an adviserID is provided, query for that specific adviser
		if (adviserID) {
			[adviserResult] = await connection.query(`SELECT * FROM Adviser WHERE AdviserID = ?`, [adviserID]);
			// If the adviser doesn't exist, return an error message
			if (adviserResult.length === 0) {
				return { success: false, error: 'Adviser not found.' };
			}
		} else {
			// If no adviserID is provided, retrieve all advisers
			[adviserResult] = await connection.query(`SELECT * FROM Adviser`);
		}

		// Array to store all the advisers
		const advisers = adviserResult.map((adviser) => ({
			AdviserID: adviser.AdviserID,
			A_FirstName: adviser.A_FirstName,
			A_MiddleName: adviser.A_MiddleName,
			A_LastName: adviser.A_LastName,
			AdvisingProgram: adviser.AdvisingProgram,
		}));

		// Return the adviser data
		return { success: true, advisers };
	} catch (error) {
		// Return the error wrapped in an object with error details
		return { success: false, error: error.message };
	} finally {
		// Release the connection back to the pool after all operations are complete
		connection.release();
	}
}
