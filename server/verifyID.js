import pool from './database.js';

async function verifyID(id) {
	const connection = await pool.getConnection();

	try {
		// Check if the ID exists in the Adviser table
		const [adviserResult] = await connection.query(
			`SELECT 
				AdviserID AS id, 
				CONCAT(A_FirstName, ' ', A_LastName) AS name, 
				AdvisingProgram AS program 
			FROM Adviser 
			WHERE AdviserID = ?`,
			[id]
		);

		if (adviserResult.length > 0) {
			// Return adviser details
			const { id, name, program } = adviserResult[0];
			return {
				id,
				name,
				position: 'Adviser',
				program,
			};
		}

		// Check if the ID exists in the Student table
		const [studentResult] = await connection.query(
			`SELECT 
				StudentNumber AS id, 
				CONCAT(S_FirstName, ' ', S_LastName) AS name, 
				StudentProgram AS program 
			FROM Student 
			WHERE StudentNumber = ?`,
			[id]
		);

		if (studentResult.length > 0) {
			// Return student details
			const { id, name, program } = studentResult[0];
			return {
				id,
				name,
				position: 'Student',
				program,
			};
		}

		// If the ID doesn't match either table
		return { error: 'Invalid ID' };
	} catch (error) {
		console.error('Error verifying ID:', error);
		return { error: 'Error verifying ID' };
	} finally {
		connection.release();
	}
}

export default verifyID;
