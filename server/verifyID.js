import pool from './database.js';

async function verifyID(id) {
	const connection = await pool.getConnection();

	try {
		// Check if the ID exists in the Adviser table
		const [result1] = await connection.query('SELECT AdviserID FROM Adviser WHERE AdviserID = ?', [id]);

		if (result1.length > 0) {
			return 'Adviser';
		}

		// Check if the ID exists in the Student table
		const [result2] = await connection.query('SELECT StudentNumber FROM Student WHERE StudentNumber = ?', [id]);

		if (result2.length > 0) {
			return 'Student';
		}

		// If the ID doesn't match either table
		return 'Invalid ID';
	} catch (error) {
		console.error('Error verifying ID:', error);
		return 'Error verifying ID';
	} finally {
		connection.release();
	}
}

export default verifyID;
