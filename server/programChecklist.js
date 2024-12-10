import pool from './database.js';
import { getCourse } from './course.js';

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

		// Check if a row with the same StudentProgram, CourseID, CourseType, PrescribedYear, and PrescribedSemester already exists
		const [duplicateCheck] = await connection.query(
			`SELECT COUNT(*) AS count FROM ProgramChecklist WHERE StudentProgram = ? AND CourseID = ? AND CourseType = ? AND PrescribedYear = ? AND PrescribedSemester = ?`,
			[StudentProgram, CourseID, CourseType, PrescribedYear, PrescribedSemester]
		);

		if (duplicateCheck[0].count > 0) {
			// If a duplicate is found, roll back the transaction and return an error message
			await connection.rollback();
			return { success: false, error: 'Duplicate checklist item found. Entry already exists.' };
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
			// Retrieve checklist items and join with the Course table based on CourseID
			[checklistResult] = await connection.query(
				`SELECT pc.*, c.* 
				FROM ProgramChecklist pc
				JOIN Course c ON pc.CourseID = c.CourseID
				WHERE pc.StudentProgram = ?`,
				[studentProgram]
			);
		} else {
			// If no StudentProgram is provided, retrieve all checklist items with course details
			[checklistResult] = await connection.query(
				`SELECT pc.*, c.* 
				FROM ProgramChecklist pc
				JOIN Course c ON pc.CourseID = c.CourseID`
			);
		}

		// Initialize an empty array to store the processed checklist items
		const checklistItems = [];

		// Loop through each item in the checklistResult array
		for (const item of checklistResult) {
			// Asynchronously retrieve course details using the CourseID from the current item
			const { courses } = await getCourse(item.CourseID);

			// Push an object containing the relevant data for the checklist item into the checklistItems array
			checklistItems.push({
				StudentProgram: item.StudentProgram,
				CourseID: item.CourseID,
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
