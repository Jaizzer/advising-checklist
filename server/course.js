import pool from './database.js';

export async function insertCourse(courseData) {
	// Destructure the course data object to extract necessary information
	const { CourseID, CourseDescription, Units, CourseComponents, College, Department, GradingBasis, Prerequisites, Corequisites } = courseData;

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Insert the new course into the 'Course' table
		const [result] = await connection.query(
			`INSERT INTO Course (CourseID, CourseDescription, Units, CourseComponents, College, Department, GradingBasis)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[CourseID, CourseDescription, Units, CourseComponents, College, Department, GradingBasis]
		);

		// Function to check if a course exists in the Course table
		const checkIfCourseExists = async (courseId) => {
			const [rows] = await connection.query(`SELECT COUNT(*) as count FROM Course WHERE CourseID = ?`, [courseId]);
			return rows[0].count > 0;
		};

		// Insert any prerequisites for the course into the 'CoursePrerequisite' table
		// Iterate over the prerequisites array and insert each one if it exists in the 'Course' table
		for (let prerequisite of Prerequisites) {
			const exists = await checkIfCourseExists(prerequisite);
			if (exists) {
				await connection.query(`INSERT INTO CoursePrerequisite (CourseID, Prerequisite) VALUES (?, ?)`, [CourseID, prerequisite]);
			} else {
				// Throw error if prerequisite does not exist in the Course table
				throw new Error(`Prerequisite course ${prerequisite} does not exist.`);
			}
		}

		// Insert any corequisites for the course into the 'CourseCorequisite' table
		// Iterate over the corequisites array and insert each one if it exists in the 'Course' table
		for (let corequisite of Corequisites) {
			const exists = await checkIfCourseExists(corequisite);
			if (exists) {
				await connection.query(`INSERT INTO CourseCorequisite (CourseID, Corequisite) VALUES (?, ?)`, [CourseID, corequisite]);
			} else {
				// Throw error if corequisite does not exist in the Course table
				throw new Error(`Corequisite course ${corequisite} does not exist.`);
			}
		}

		// Commit the transaction if all queries are successful
		await connection.commit();

		// Return the result of the course insertion
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
