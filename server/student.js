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

export async function getStudent(studentNumber = null) {
	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Begin transaction
		await connection.beginTransaction();

		let studentResult;

		// If a specific student number is provided, verify the student exists first
		if (studentNumber) {
			const [studentCheck] = await connection.query(`SELECT COUNT(*) AS count FROM Student WHERE StudentNumber = ?`, [studentNumber]);

			// If the student does not exist, throw an error to trigger rollback
			if (studentCheck[0].count === 0) {
				throw new Error('Student not found.');
			}

			// Retrieve the specific student's information with adviser details
			[studentResult] = await connection.query(
				`SELECT 
					Student.*,
					Adviser.AdviserID,
					Adviser.A_FirstName,
					Adviser.A_MiddleName,
					Adviser.A_LastName,
					Adviser.AdvisingProgram
				 FROM Student
				 LEFT JOIN Adviser ON Student.AdviserID = Adviser.AdviserID
				 WHERE Student.StudentNumber = ?`,
				[studentNumber]
			);
		} else {
			// If no specific student number is provided, retrieve all students
			[studentResult] = await connection.query(
				`SELECT 
					Student.*,
					Adviser.AdviserID,
					Adviser.A_FirstName,
					Adviser.A_MiddleName,
					Adviser.A_LastName,
					Adviser.AdvisingProgram
				 FROM Student
				 LEFT JOIN Adviser ON Student.AdviserID = Adviser.AdviserID`
			);
		}

		// Map the database results into an array of student objects with adviser details
		const students = studentResult.map((student) => ({
			StudentNumber: student.StudentNumber,
			S_FirstName: student.S_FirstName,
			S_MiddleName: student.S_MiddleName,
			S_LastName: student.S_LastName,
			StudentProgram: student.StudentProgram,
			Adviser: student.AdviserID
				? {
						AdviserID: student.AdviserID,
						A_FirstName: student.A_FirstName,
						A_MiddleName: student.A_MiddleName,
						A_LastName: student.A_LastName,
						AdvisingProgram: student.AdvisingProgram,
				  }
				: null,
			CurrentStanding: student.CurrentStanding,
			TotalUnitsTaken: student.TotalUnitsTaken,
		}));

		// Commit transaction if everything is successful
		await connection.commit();

		// Return the list of students with adviser details
		return { success: true, students };
	} catch (error) {
		// Rollback transaction in case of any errors
		await connection.rollback();
		// Return the error wrapped in an object with error details
		return { success: false, error: error.message };
	} finally {
		// Release the connection back to the pool after all operations are complete
		connection.release();
	}
}

export async function deleteStudent(studentNumber) {
	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Check if the student exists in the database
		const [studentResult] = await connection.query(`SELECT * FROM Student WHERE StudentNumber = ?`, [studentNumber]);
		if (studentResult.length === 0) {
			// Throw an error if the student does not exist
			throw new Error('Student not found.');
		}

		// Delete the student from the 'Student' table
		const [result] = await connection.query(`DELETE FROM Student WHERE StudentNumber = ?`, [studentNumber]);

		// Commit the transaction if the delete operation is successful
		await connection.commit();

		// Return a success message after deletion
		return { success: true, message: `Student with number ${studentNumber} successfully deleted.` };
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