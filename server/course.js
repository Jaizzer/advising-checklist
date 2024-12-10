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

export async function getCourse(courseID = null) {
	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		let courseResult;

		// If a courseID is provided, query for that specific course
		if (courseID) {
			[courseResult] = await connection.query(`SELECT * FROM Course WHERE CourseID = ?`, [courseID]);
			// If the course doesn't exist, return an error message
			if (courseResult.length === 0) {
				return { success: false, error: 'Course not found.' };
			}
		} else {
			// If no courseID is provided, retrieve all courses
			[courseResult] = await connection.query(`SELECT * FROM Course`);
		}

		// Array to store all the courses
		const courses = [];

		// Process each course
		for (const course of courseResult) {
			const courseData = {
				CourseID: course.CourseID,
				CourseDescription: course.CourseDescription,
				Units: course.Units,
				CourseComponents: course.CourseComponents,
				College: course.College,
				Department: course.Department,
				GradingBasis: course.GradingBasis,
				Prerequisites: [],
				Corequisites: [],
			};

			// Query the 'CoursePrerequisite' table to get the prerequisites for each course
			const [prerequisitesResult] = await connection.query(`SELECT Prerequisite FROM CoursePrerequisite WHERE CourseID = ?`, [course.CourseID]);

			// For each prerequisite, fetch detailed course information by calling getCourse recursively
			for (const prerequisiteRow of prerequisitesResult) {
				const prerequisiteCourse = await getCourse(prerequisiteRow.Prerequisite);
				if (prerequisiteCourse.success) {
					courseData.Prerequisites.push(prerequisiteCourse.courses[0]); // Assuming the recursive call returns an array
				}
			}

			// Query the 'CourseCorequisite' table to get the corequisites for each course
			const [corequisitesResult] = await connection.query(`SELECT Corequisite FROM CourseCorequisite WHERE CourseID = ?`, [course.CourseID]);

			// For each corequisite, fetch detailed course information by calling getCourse recursively
			for (const corequisiteRow of corequisitesResult) {
				const corequisiteCourse = await getCourse(corequisiteRow.Corequisite);
				if (corequisiteCourse.success) {
					courseData.Corequisites.push(corequisiteCourse.courses[0]); // Assuming the recursive call returns an array
				}
			}

			// Add the course data to the courses array
			courses.push(courseData);
		}

		// Return the course data along with detailed prerequisites and corequisites
		return { success: true, courses };
	} catch (error) {
		// Return the error wrapped in an object with error details
		return { success: false, error: error.message };
	} finally {
		// Release the connection back to the pool after all operations are complete
		connection.release();
	}
}
