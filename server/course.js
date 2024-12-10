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

export async function getCourse(courseID = null, studentProgram = null) {
	// Ensure studentProgram is provided before proceeding
	if (!studentProgram) {
		return { success: false, error: 'Student program is required.' }; // Return early if no student program is provided
	}

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		let courseResult;

		// If a courseID is provided, query for that specific course and join with ProgramChecklist
		if (courseID) {
			[courseResult] = await connection.query(
				`SELECT Course.*, ProgramChecklist.CourseType 
				FROM Course 
				LEFT JOIN ProgramChecklist ON Course.CourseID = ProgramChecklist.CourseID 
				WHERE Course.CourseID = ? AND ProgramChecklist.StudentProgram = ?`,
				[courseID, studentProgram]
			);

			// If the course doesn't exist, return an error message
			if (courseResult.length === 0) {
				return { success: false, error: 'Course not found for the given student program.' };
			}
		} else {
			// If no courseID is provided, retrieve all courses for the student program
			[courseResult] = await connection.query(
				`SELECT Course.*, ProgramChecklist.CourseType 
				FROM Course 
				LEFT JOIN ProgramChecklist ON Course.CourseID = ProgramChecklist.CourseID 
				WHERE ProgramChecklist.StudentProgram = ?`,
				[studentProgram]
			);
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
				CourseType: course.CourseType || 'Not Assigned', // Include CourseType here
				Prerequisites: [],
				Corequisites: [],
			};

			// Query the 'CoursePrerequisite' table to get the prerequisites for each course
			const [prerequisitesResult] = await connection.query(`SELECT Prerequisite FROM CoursePrerequisite WHERE CourseID = ?`, [course.CourseID]);

			// For each prerequisite, fetch detailed course information by calling getCourse recursively
			for (const prerequisiteRow of prerequisitesResult) {
				const prerequisiteCourse = await getCourse(prerequisiteRow.Prerequisite, studentProgram);
				if (prerequisiteCourse.success) {
					courseData.Prerequisites.push(prerequisiteCourse.courses[0]); // Assuming the recursive call returns an array
				}
			}

			// Query the 'CourseCorequisite' table to get the corequisites for each course
			const [corequisitesResult] = await connection.query(`SELECT Corequisite FROM CourseCorequisite WHERE CourseID = ?`, [course.CourseID]);

			// For each corequisite, fetch detailed course information by calling getCourse recursively
			for (const corequisiteRow of corequisitesResult) {
				const corequisiteCourse = await getCourse(corequisiteRow.Corequisite, studentProgram);
				if (corequisiteCourse.success) {
					courseData.Corequisites.push(corequisiteCourse.courses[0]); // Assuming the recursive call returns an array
				}
			}

			// Add the course data to the courses array
			courses.push(courseData);
		}

		// Return the course data along with detailed prerequisites, corequisites, and CourseType
		return { success: true, courses };
	} catch (error) {
		// Return the error wrapped in an object with error details
		return { success: false, error: error.message };
	} finally {
		// Release the connection back to the pool after all operations are complete
		connection.release();
	}
}

export async function deleteCourse(courseID) {
	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Check if the course exists in the Course table
		const [courseResult] = await connection.query(`SELECT * FROM Course WHERE CourseID = ?`, [courseID]);

		// If the course does not exist, throw an error
		if (courseResult.length === 0) {
			throw new Error('Course not found.');
		}

		// Delete the course from the Course table
		const [result] = await connection.query(`DELETE FROM Course WHERE CourseID = ?`, [courseID]);

		// Commit the transaction if the delete operation is successful
		await connection.commit();

		// Return success response
		return { success: true, message: `Course with ID ${courseID} successfully deleted.` };
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

export async function editCourse(currentCourseID, updatedCourseData) {
	// Destructure the updated course data object to extract necessary information
	const {
		CourseID: newCourseID,
		CourseDescription,
		Units,
		CourseComponents,
		College,
		Department,
		GradingBasis,
		Prerequisites,
		Corequisites,
	} = updatedCourseData;

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Function to check if a course exists in the Course table
		const checkIfCourseExists = async (courseId) => {
			const [rows] = await connection.query(`SELECT COUNT(*) as count FROM Course WHERE CourseID = ?`, [courseId]);
			return rows[0].count > 0;
		};

		// Step 0: Check if the current course exists
		const courseExists = await checkIfCourseExists(currentCourseID);
		if (!courseExists) {
			throw new Error(`Course with ID ${currentCourseID} does not exist.`);
		}

		// Start a transaction to ensure atomicity of the operations
		await connection.beginTransaction();

		// Update the course details in the 'Course' table using the current CourseID
		const [updateResult] = await connection.query(
			`UPDATE Course
			 SET CourseID = ?, CourseDescription = ?, Units = ?, CourseComponents = ?, College = ?, Department = ?, GradingBasis = ?
			 WHERE CourseID = ?`,
			[newCourseID, CourseDescription, Units, CourseComponents, College, Department, GradingBasis, currentCourseID]
		);

		// Delete old prerequisites for the course from 'CoursePrerequisite' table using currentCourseID
		await connection.query(`DELETE FROM CoursePrerequisite WHERE CourseID = ?`, [currentCourseID]);

		// Delete old corequisites for the course from 'CourseCorequisite' table using currentCourseID
		await connection.query(`DELETE FROM CourseCorequisite WHERE CourseID = ?`, [currentCourseID]);

		// Insert new prerequisites for the course into the 'CoursePrerequisite' table
		// Iterate over the prerequisites array and insert each one if it exists in the 'Course' table
		for (let prerequisite of Prerequisites) {
			// Ensure the course is not being added as its own prerequisite (currentCourseID check only)
			if (prerequisite === currentCourseID) {
				throw new Error(`Course cannot be its own prerequisite.`);
			}

			// Check if the prerequisite course exists
			const exists = await checkIfCourseExists(prerequisite);
			if (exists) {
				await connection.query(`INSERT INTO CoursePrerequisite (CourseID, Prerequisite) VALUES (?, ?)`, [newCourseID, prerequisite]);
			} else {
				// Throw error if prerequisite does not exist in the Course table
				throw new Error(`Prerequisite course ${prerequisite} does not exist.`);
			}
		}

		// Insert new corequisites for the course into the 'CourseCorequisite' table
		// Iterate over the corequisites array and insert each one if it exists in the 'Course' table
		for (let corequisite of Corequisites) {
			// Ensure the course is not being added as its own corequisite (currentCourseID check only)
			if (corequisite === currentCourseID) {
				throw new Error(`Course cannot be its own corequisite.`);
			}

			// Check if the corequisite course exists
			const exists = await checkIfCourseExists(corequisite);
			if (exists) {
				await connection.query(`INSERT INTO CourseCorequisite (CourseID, Corequisite) VALUES (?, ?)`, [newCourseID, corequisite]);
			} else {
				// Throw error if corequisite does not exist in the Course table
				throw new Error(`Corequisite course ${corequisite} does not exist.`);
			}
		}

		// Commit the transaction after all operations (update, delete, insert) are successful
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
