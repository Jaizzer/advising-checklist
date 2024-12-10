import pool from './database.js';
import { getCourse } from './course.js';

// Function to insert a new checklist item into the ProgramChecklist
export async function insertChecklistItem(checklistData) {
	// Destructure the checklist data object to extract necessary information
	const { StudentProgram, CourseId, CourseType, PrescribedYear, PrescribedSemester } = checklistData;

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Check if the CourseId exists in the Course table
		const [courseExists] = await connection.query(`SELECT COUNT(*) AS count FROM Course WHERE CourseId = ?`, [CourseId]);

		if (courseExists[0].count === 0) {
			// Rollback the transaction if the CourseId does not exist in the Course table
			await connection.rollback();
			// Return an error indicating that the CourseId does not exist
			return { success: false, error: `CourseId ${CourseId} does not exist in the Course table.` };
		}

		// Insert the new checklist item into the 'ProgramChecklist' table, using CURRENT_DATE and CURRENT_TIME for dynamic values
		const [result] = await connection.query(
			`INSERT INTO ProgramChecklist (StudentProgram, CourseId, CourseType, PrescribedYear, PrescribedSemester, DateLastUpdated, TimeLastUpdated)
			 VALUES (?, ?, ?, ?, ?, CURRENT_DATE, CURRENT_TIME)`,
			[StudentProgram, CourseId, CourseType, PrescribedYear, PrescribedSemester]
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

// Function to retrieve checklist items, optionally filtering by StudentProgram
export async function getChecklistItems(studentProgram = null) {
	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Begin transaction
		await connection.beginTransaction();

		let checklistResult;

		// If a specific StudentProgram is provided, retrieve items for that program
		if (studentProgram) {
			// Retrieve checklist items and join with the Course table based on CourseId
			[checklistResult] = await connection.query(
				`SELECT pc.*, c.* 
				FROM ProgramChecklist pc
				JOIN Course c ON pc.CourseId = c.CourseId
				WHERE pc.StudentProgram = ?`,
				[studentProgram]
			);
		} else {
			// If no StudentProgram is provided, retrieve all checklist items with course details
			[checklistResult] = await connection.query(
				`SELECT pc.*, c.* 
				FROM ProgramChecklist pc
				JOIN Course c ON pc.CourseId = c.CourseId`
			);
		}

		// Initialize an empty array to store the processed checklist items
		const checklistItems = [];

		// Loop through each item in the checklistResult array
		for (const item of checklistResult) {
			// Asynchronously retrieve course details using the CourseId from the current item
			const { courses } = await getCourse(item.CourseId);

			// Push an object containing the relevant data for the checklist item into the checklistItems array
			checklistItems.push({
				StudentProgram: item.StudentProgram,
				CourseId: item.CourseId,
				CourseType: item.CourseType,
				PrescribedYear: item.PrescribedYear,
				PrescribedSemester: item.PrescribedSemester,
				DateLastUpdated: item.DateLastUpdated,
				TimeLastUpdated: item.TimeLastUpdated,
				Course: courses[0],
			});
		}

		// Commit transaction if everything is successful
		await connection.commit();

		// Return the list of checklist items along with the full Course object
		return { success: true, checklistItems };
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

// Function to delete a checklist item by its StudentProgram and CourseId
export async function deleteChecklistItem(studentProgram, courseId) {
	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Check if the checklist item exists in the database
		const [checklistResult] = await connection.query(`SELECT * FROM ProgramChecklist WHERE StudentProgram = ? AND CourseID = ?`, [
			studentProgram,
			courseId,
		]);

		// If no matching checklist item is found, throw an error
		if (checklistResult.length === 0) {
			throw new Error(`Checklist item not found for StudentProgram: ${studentProgram}, CourseID: ${courseId}`);
		}

		// Delete the checklist item from the 'ProgramChecklist' table
		const [result] = await connection.query(`DELETE FROM ProgramChecklist WHERE StudentProgram = ? AND CourseID = ?`, [studentProgram, courseId]);

		// Commit the transaction if the delete operation is successful
		await connection.commit();

		// Return a success message after deletion
		return {
			success: true,
			message: `Checklist item with StudentProgram: '${studentProgram}' and CourseID: '${courseId}' successfully deleted.`,
		};
	} catch (error) {
		// Roll back the transaction to maintain data consistency in case of an error
		await connection.rollback();

		// Return the error wrapped in an object with error details
		return {
			success: false,
			error: error.message,
		};
	} finally {
		// Release the connection back to the pool after all operations are complete
		connection.release();
	}
}

// Function to update the status or details of a checklist item
export async function updateChecklistItem(studentProgram, courseID, updatedData) {
	// Destructure the updated data object to extract necessary information
	const { NewStudentProgram, CourseType, PrescribedYear, PrescribedSemester } = updatedData;

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Check if the CourseID exists in the Course table
		const [courseExists] = await connection.query(`SELECT COUNT(*) AS count FROM Course WHERE CourseID = ?`, [courseID]);

		if (courseExists[0].count === 0) {
			// Rollback the transaction if the CourseID does not exist in the Course table
			await connection.rollback();
			// Return an error indicating that the CourseID does not exist
			return { success: false, error: `CourseID ${courseID} does not exist in the Course table.` };
		}

		// If StudentProgram is being updated, check if the new StudentProgram + CourseID combination already exists
		if (NewStudentProgram) {
			const [newProgramExists] = await connection.query(
				`SELECT COUNT(*) AS count FROM ProgramChecklist WHERE StudentProgram = ? AND CourseID = ?`,
				[NewStudentProgram, courseID]
			);

			if (newProgramExists[0].count > 0) {
				// If the new combination exists, return an error
				throw new Error(`A checklist item for StudentProgram ${NewStudentProgram} and CourseID ${courseID} already exists.`);
			}
		}

		// Check if the checklist item exists in the database for the original StudentProgram and CourseID
		const [itemExists] = await connection.query(`SELECT COUNT(*) AS count FROM ProgramChecklist WHERE StudentProgram = ? AND CourseID = ?`, [
			studentProgram,
			courseID,
		]);

		if (itemExists[0].count === 0) {
			// Throw an error if the checklist item does not exist
			throw new Error(`Checklist item for StudentProgram ${studentProgram} and CourseID ${courseID} does not exist.`);
		}

		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Update the checklist item information in the 'ProgramChecklist' table
		// If the StudentProgram is being updated, update it as well
		const [updateResult] = await connection.query(
			`UPDATE ProgramChecklist
                SET StudentProgram = ?, CourseType = ?, PrescribedYear = ?, PrescribedSemester = ?, DateLastUpdated = CURRENT_DATE, TimeLastUpdated = CURRENT_TIME
                WHERE StudentProgram = ? AND CourseID = ?`,
			[NewStudentProgram || studentProgram, CourseType, PrescribedYear, PrescribedSemester, studentProgram, courseID]
		);

		// Commit the transaction if the update operation is successful
		await connection.commit();

		// Return the result of the checklist item update
		return { success: true, updateResult };
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