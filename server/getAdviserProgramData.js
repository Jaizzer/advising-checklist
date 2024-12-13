import pool from './database.js';
import { getStudentDashboardData } from './getStudentDashboardData.js';

// Function to fetch adviser program data and students for advising
export async function getAdviserProgramData(adviserId) {
	// Ensure adviserId is provided before proceeding
	if (!adviserId) {
		throw new Error('Adviser ID is required.');
	}

	// Establish a connection to the database from the connection pool
	const connection = await pool.getConnection();

	try {
		// Start a transaction
		await connection.beginTransaction();

		// Query to fetch adviser details
		const [adviserResult] = await connection.query(
			`SELECT 
                a.AdvisingProgram AS Program,
                a.A_FirstName AS AdviserFirstName,
                a.A_LastName AS AdviserLastName
             FROM Adviser a
             WHERE a.AdviserID = ?`,
			[adviserId]
		);

		if (adviserResult.length === 0) {
			// If no adviser found, roll back and throw error
			await connection.rollback();
			throw new Error('Adviser not found.');
		}

		const adviser = adviserResult[0];

		// Query to fetch students with 'For Advising' status in the program
		const [studentsForAdvisingResult] = await connection.query(
			`SELECT 
                s.StudentNumber,
                s.S_FirstName AS StudentFirstName,
                s.S_LastName AS StudentLastName,
                scl.CourseId AS CourseId,
                scl.CourseStatus,
                scl.DateSubmitted,
                scl.TimeSubmitted
            FROM StudentCourseList scl
            JOIN Student s ON scl.StudentNumber = s.StudentNumber
            WHERE scl.CourseStatus = 'For Advising'
              AND s.StudentProgram = ?;`,
			[adviser.Program]
		);

		// Map students for advising data
		const studentsForAdvising = studentsForAdvisingResult.reduce((acc, student) => {
			// Group students by StudentNumber
			if (!acc[student.StudentNumber]) {
				acc[student.StudentNumber] = {
					Student: {
						StudentName: `${student.StudentFirstName} ${student.StudentLastName}`,
						StudentNumber: student.StudentNumber,
					},
					ProgramChecklist: [],
					// Store Date and Time separately
					DateSubmitted: student.DateSubmitted,
					TimeSubmitted: student.TimeSubmitted,
				};
			}

			// Add the course to the ProgramChecklist
			acc[student.StudentNumber].ProgramChecklist.push({
				CourseId: student.CourseId, // Correct key used here
				CourseStatus: student.CourseStatus,
			});

			// Combine DateSubmitted and TimeSubmitted into one datetime
			const combinedDateTime = combineDateTime(student.DateSubmitted, student.TimeSubmitted);
			acc[student.StudentNumber].CombinedDateTime = combinedDateTime;
			return acc;
		}, {});

		// Convert the grouped data into an array of objects
		const studentsForAdvisingArray = await Promise.all(
			Object.values(studentsForAdvising).map(async (studentData) => ({
				Student: await getStudentDashboardData(studentData.Student.StudentNumber),
				CoursesForAdvising: studentData.ProgramChecklist,
				// Return combined Date and Time
				CombinedDateTime: studentData.CombinedDateTime,
			}))
		);

		// Prepare the response JSON
		const response = {
			AdviserName: `${adviser.AdviserFirstName} ${adviser.AdviserLastName}`,
			Program: adviser.Program,
			StudentsForAdvising: studentsForAdvisingArray, // Include the 'For Advising' students
		};

		// Commit the transaction since everything succeeded
		await connection.commit();

		// Return the prepared JSON
		return response;
	} catch (error) {
		// Rollback the transaction in case of any error
		await connection.rollback();
		// Log the full error for debugging
		console.error(error); // Log the error for debugging
		// Rethrow the error to be handled by higher-level code
		throw new Error(error.message);
	} finally {
		// Release the connection back to the pool after all operations are complete
		connection.release();
	}
}

// Helper function to combine Date and Time into a single datetime and convert to Philippine Time (PHT)
function combineDateTime(dateString, timeString) {
	// Convert DateSubmitted (ISO format) to a Date object
	const date = new Date(dateString);

	// Extract hours, minutes, and seconds from TimeSubmitted
	const [hours, minutes, seconds] = timeString.split(':');

	// Set the time on the Date object
	date.setHours(hours);
	date.setMinutes(minutes);
	date.setSeconds(seconds);

	// Convert the Date object to Philippine Time (UTC +8)
	const philippinesTime = new Date(date.getTime() + 8 * 60 * 60 * 1000); // Add 8 hours to the UTC time

	// Return the combined DateTime as an ISO string in Philippine Time
	return philippinesTime.toISOString();
}