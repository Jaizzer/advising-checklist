import pool from './database.js';

export default async function insertCourse(courseData) {
	const {
		CourseID,
		CourseDescription,
		Units,
		CourseComponents,
		College,
		Department,
		GradingBasis,
		Prerequisites,
		Corequisites,
		CourseType,
		PrescribedYear,
		PrescribedSemester,
		StudentProgram, // Extract StudentProgram from courseData
	} = courseData;

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction to ensure atomicity
		await connection.beginTransaction();

		// Insert the new course into the 'Course' table
		const [courseResult] = await connection.query(
			`INSERT INTO Course (CourseID, CourseDescription, Units, CourseComponents, College, Department, GradingBasis)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[CourseID, CourseDescription, Units, CourseComponents, College, Department, GradingBasis]
		);

		// Commit the course insertion to make the CourseID available
		await connection.commit();

		// Restart transaction for dependent inserts
		await connection.beginTransaction();

		// Insert the course into the ProgramChecklist table
		await connection.query(
			`INSERT INTO ProgramChecklist (StudentProgram, CourseID, CourseType, PrescribedYear, PrescribedSemester, DateLastUpdated, TimeLastUpdated)
			 VALUES (?, ?, ?, ?, ?, CURRENT_DATE, CURRENT_TIME)`,
			[StudentProgram, CourseID, CourseType, PrescribedYear, PrescribedSemester]
		);

		// Insert any prerequisites for the course into the 'CoursePrerequisite' table
		for (let prerequisite of Prerequisites) {
			await connection.query(`INSERT INTO CoursePrerequisite (CourseID, Prerequisite) VALUES (?, ?)`, [CourseID, prerequisite]);
		}

		// Insert any corequisites for the course into the 'CourseCorequisite' table
		for (let corequisite of Corequisites) {
			await connection.query(`INSERT INTO CourseCorequisite (CourseID, Corequisite) VALUES (?, ?)`, [CourseID, corequisite]);
		}

		// Commit the remaining inserts
		await connection.commit();

		// Return the result of the course insertion
		return { success: true, result: courseResult };
	} catch (error) {
		// If any error occurs, roll back the transaction to maintain data consistency
		await connection.rollback();

		// Throw the error directly
		throw error;
	} finally {
		// Release the connection back to the pool after all operations are complete
		connection.release();
	}
}
