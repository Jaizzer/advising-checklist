import pool from './database.js';
import { getCourse } from './course.js';
import { getStudent } from './student.js';

// Function to insert a new student course record into the StudentCourseList
export async function insertstudentCourseListItems(studentCourseData) {
	// Destructure the student course data object to extract necessary information
	const { StudentNumber, CourseId, CourseStatus, Grade, StandingTaken, AcademicYear, Semester } = studentCourseData;

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Check if the CourseId exists in the Course table
		const [courseExists] = await connection.query(`SELECT COUNT(*) AS count FROM Course WHERE CourseId = ?`, [CourseId]);

		// If the CourseId does not exist, rollback the transaction and return an error
		if (courseExists[0].count === 0) {
			await connection.rollback();
			return { success: false, error: `CourseId ${CourseId} does not exist in the Course table.` };
		}

		// Check if the StudentNumber exists in the Student table
		const [studentExists] = await connection.query(`SELECT COUNT(*) AS count FROM Student WHERE StudentNumber = ?`, [StudentNumber]);

		// If the StudentNumber does not exist, rollback the transaction and return an error
		if (studentExists[0].count === 0) {
			await connection.rollback();
			return { success: false, error: `StudentNumber ${StudentNumber} does not exist in the Student table.` };
		}

		// Insert the new student course record into the StudentCourseList table
		const [result] = await connection.query(
			`INSERT INTO StudentCourseList (StudentNumber, CourseId, CourseStatus, Grade, StandingTaken, AcademicYear, Semester, DateSubmitted, TimeSubmitted)
             VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, CURRENT_TIME)`,
			[StudentNumber, CourseId, CourseStatus, Grade, StandingTaken, AcademicYear, Semester]
		);

		// Commit the transaction if the insert operation is successful
		await connection.commit();

		// Return the result of the student course record insertion
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

// Function to retrieve checklist items, optionally filtering by StudentNumber and CourseId
export async function getStudentCourseListItem(StudentNumber = null, CourseId = null) {
	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Begin transaction
		await connection.beginTransaction();

		let checklistResult;

		// Check if at least one of StudentNumber or CourseId is provided
		if (StudentNumber || CourseId) {
			// If both StudentNumber and CourseId are provided, retrieve checklist items for that specific student and course
			if (StudentNumber && CourseId) {
				[checklistResult] = await connection.query(
					`SELECT pc.*, c.* 
					FROM StudentCourseList pc
					JOIN Course c ON pc.CourseId = c.CourseId
					WHERE pc.StudentNumber = ? AND pc.CourseId = ?`,
					[StudentNumber, CourseId]
				);
			} else if (StudentNumber) {
				// If only StudentNumber is provided, retrieve items based on StudentNumber
				[checklistResult] = await connection.query(
					`SELECT pc.*, c.* 
					FROM StudentCourseList pc
					JOIN Course c ON pc.CourseId = c.CourseId
					WHERE pc.StudentNumber = ?`,
					[StudentNumber]
				);
			} else if (CourseId) {
				// If only CourseId is provided, retrieve items based on CourseId
				[checklistResult] = await connection.query(
					`SELECT pc.*, c.* 
					FROM StudentCourseList pc
					JOIN Course c ON pc.CourseId = c.CourseId
					WHERE pc.CourseId = ?`,
					[CourseId]
				);
			}
		} else {
			// If neither StudentNumber nor CourseId is provided, retrieve all checklist items with course details
			[checklistResult] = await connection.query(
				`SELECT pc.*, c.* 
				FROM StudentCourseList pc
				JOIN Course c ON pc.CourseId = c.CourseId`
			);
		}

		// Initialize an empty array to store the processed checklist items
		const studentCourseListItems = [];

		// Loop through each item in the checklistResult array
		for (const item of checklistResult) {
			// Asynchronously retrieve course details using the CourseId from the current item
			const { courses } = await getCourse(item.CourseId);

			// Asynchronously retrieve student details using the StudentNumber from the current item
			const { students } = await getStudent(item.StudentNumber);

			// Push an object containing the relevant data for the checklist item into the studentCourseListItems array
			studentCourseListItems.push({
				Course: courses[0],
				Student: students[0],
				CourseStatus: item.CourseStatus,
				Grade: item.Grade,
				StandingTaken: item.StandingTaken,
				AcademicYear: item.AcademicYear,
				Semester: item.Semester,
				DateSubmitted: item.DateSubmitted,
				TimeSubmitted: item.TimeSubmitted,
			});
		}

		// Commit transaction if everything is successful
		await connection.commit();

		// Return the list of checklist items along with the full Course and Student objects
		return { success: true, studentCourseListItems };
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

// Function to delete a studentCourseListItem based on StudentNumber and CourseId
export async function deleteStudentCourseListItem(StudentNumber, CourseId) {
	// Check if both StudentNumber and CourseId are provided
	if (!StudentNumber || !CourseId) {
		return { success: false, error: 'Both StudentNumber and CourseId must be provided.' };
	}

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Begin transaction
		await connection.beginTransaction();

		// Check if the studentCourseListItem for the given student and course exists
		const [existingStudentCourseListItem] = await connection.query(
			`SELECT COUNT(*) AS count 
			FROM StudentCourseList 
			WHERE StudentNumber = ? AND CourseId = ?`,
			[StudentNumber, CourseId]
		);

		// If no such row exists, return an error message
		if (existingStudentCourseListItem[0].count === 0) {
			return { success: false, error: `No studentCourseListItem found for StudentNumber ${StudentNumber} and CourseId ${CourseId}.` };
		}

		// Delete the studentCourseListItem for the provided StudentNumber and CourseId
		await connection.query(
			`DELETE FROM StudentCourseList 
			WHERE StudentNumber = ? AND CourseId = ?`,
			[StudentNumber, CourseId]
		);

		// Commit the transaction
		await connection.commit();

		// Return success message
		return { success: true, message: `studentCourseListItem for StudentNumber ${StudentNumber} and CourseId ${CourseId} has been deleted.` };
	} catch (error) {
		// Rollback transaction in case of any errors
		await connection.rollback();

		// Return error message
		return { success: false, error: error.message };
	} finally {
		// Release the connection back to the pool after all operations are complete
		connection.release();
	}
}
