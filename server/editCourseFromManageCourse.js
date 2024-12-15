import pool from './database.js';

export default async function editCourseFromManageCourse(currentCourseID, updatedCourseData, studentProgram) {
	const { CourseID: newCourseID, Units, CourseType, CourseDescription, Corequisites, Prerequisites } = updatedCourseData;

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Function to check if a course exists in the Course table
		const checkIfCourseExists = async (courseId) => {
			const [rows] = await connection.query(`SELECT COUNT(*) as count FROM Course WHERE CourseId = ?`, [courseId]);
			return rows[0].count > 0;
		};

		// Check if the current course exists
		const courseExists = await checkIfCourseExists(currentCourseID);
		if (!courseExists) {
			throw new Error(`Course with ID ${currentCourseID} does not exist.`);
		}

		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Update the course details in the 'Course' table using the current CourseID
		await connection.query(
			`UPDATE Course
             SET CourseId = ?, CourseDescription = ?, Units = ?
             WHERE CourseId = ?`,
			[newCourseID, CourseDescription, Units, currentCourseID]
		);

		// Update the CourseType in the ProgramChecklist table
		await connection.query(
			`UPDATE ProgramChecklist 
			 SET CourseId = ?, CourseType = ? 
			 WHERE CourseId = ? AND StudentProgram = ?`,
			[newCourseID, CourseType, currentCourseID, studentProgram]
		);

		// Delete old Prerequisites and Corequisites based on the newCourseID
		await connection.query(`DELETE FROM CoursePrerequisite WHERE CourseId = ?`, [newCourseID]);
		await connection.query(`DELETE FROM CourseCorequisite WHERE CourseId = ?`, [newCourseID]);

		// Step 4: Insert new Prerequisites
		if (Array.isArray(Prerequisites) && Prerequisites.length > 0) {
			for (const prerequisite of Prerequisites) {
				await connection.query(
					`INSERT INTO CoursePrerequisite (CourseId, Prerequisite) 
					 VALUES (?, ?)`,
					[newCourseID, prerequisite]
				);
			}
		}

		// Insert new Corequisites
		if (Array.isArray(Corequisites) && Corequisites.length > 0) {
			for (const corequisite of Corequisites) {
				await connection.query(
					`INSERT INTO CourseCorequisite (CourseId, Corequisite) 
					 VALUES (?, ?)`,
					[newCourseID, corequisite]
				);
			}
		}

		// Commit the transaction after all operations are successful
		await connection.commit();

		// Return the result of the course update
		return { success: true, message: `Course with ID ${currentCourseID} successfully updated.` };
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
