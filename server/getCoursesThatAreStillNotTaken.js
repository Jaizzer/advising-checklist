import pool from './database.js';

// Function to fetch courses that have not been taken by a student
export async function getCoursesThatAreStillNotTaken(studentNumber) {
	// Ensure studentNumber is provided before proceeding
	if (!studentNumber) {
		throw new Error('Student number is required.');
	}

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Check if the student exists in the Student table
		const [studentCheckResult] = await connection.query(`SELECT 1 FROM Student WHERE StudentNumber = ?`, [studentNumber]);

		if (studentCheckResult.length === 0) {
			throw new Error('Student not found.');
		}

		// Query to fetch courses that have not been taken by the student
		const [notTakenResult] = await connection.query(
			`SELECT 
                pc.StudentProgram, 
                pc.CourseId, 
                c.CourseDescription, 
                pc.CourseType
            FROM ProgramChecklist pc
            JOIN Course c ON pc.CourseId = c.CourseId
            LEFT JOIN StudentCourseList scl ON scl.StudentNumber = ? AND scl.CourseId = pc.CourseId
            WHERE pc.StudentProgram = (
                SELECT StudentProgram 
                FROM Student 
                WHERE StudentNumber = ?
            ) 
            AND scl.CourseId IS NULL
            AND pc.PrescribedYear <= (
                SELECT CurrentStanding 
                FROM Student 
                WHERE StudentNumber = ?
            )
            ORDER BY pc.PrescribedYear, pc.PrescribedSemester;`,
			[studentNumber, studentNumber, studentNumber]
		);

		// Query to fetch courses that are "For Advising"
		const [forAdvisingResult] = await connection.query(
			`SELECT 
                scl.CourseId, 
                c.CourseDescription 
            FROM StudentCourseList scl
            JOIN Course c ON scl.CourseId = c.CourseId
            WHERE scl.StudentNumber = ? 
              AND scl.CourseStatus = 'For Advising'`,
			[studentNumber]
		);

		// Prepare the course data in the desired format
		const coursesNotTaken = notTakenResult.map((course) => ({
			StudentProgram: course.StudentProgram,
			CourseId: course.CourseId,
			CourseDescription: course.CourseDescription,
			CourseType: course.CourseType || 'Not Assigned',
		}));

		const coursesForAdvising = forAdvisingResult.map((course) => ({
			CourseId: course.CourseId,
			CourseDescription: course.CourseDescription,
		}));

		// Return the results in the specified object format
		return {
			CourseNotYetTaken: coursesNotTaken,
			CoursesForAdvising: coursesForAdvising,
		};
	} catch (error) {
		throw new Error(error.message);
	} finally {
		connection.release();
	}
}
