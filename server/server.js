import express from 'express';
import cors from 'cors';
import { getCourse } from './course.js';
import insertCourse from './insertCourse.js';
import { insertAdviser } from './adviser.js';
import { insertStudent } from './student.js';
import { getStudentDashboardData } from './getStudentDashboardData.js';
import { getCoursesThatAreStillNotTaken } from './getCoursesThatAreStillNotTaken.js';
import insertStudentCourseListItems from './insertStudentCourseListItems.js';
import deleteStudentCourseListItem from './deleteStudentCourseListItem.js';
import { getAdviserProgramData } from './getAdviserProgramData.js';
import { getCourseChecklist } from './getCourseChecklist.js';
import deleteCourseFromProgramChecklist from './deleteCourseFromProgramChecklist.js';
import editCourseFromProgramChecklist from './editCourseFromProgramChecklist.js';
import approveStudentCourseList from './approveStudentCourseList.js';
import verifyID from './verifyID.js';

// Initialize an Express application
const app = express();

// Use CORS middleware to allow cross-origin requests from any origin
app.use(cors());

// Add middleware to parse JSON sent by the client
app.use(express.json());

// Set the port for the server to listen on
const PORT = 9090;

// Create courses route
app.get('/courses/:studentProgram', async (request, response) => {
	// Get the student program from the URL parameter and decode it in case it contains spaces
	const studentProgram = decodeURIComponent(request.params.studentProgram);

	// Get the courses based on the student program
	const { courses, error } = await getCourse(null, studentProgram);

	// Check if courses were fetched successfully
	if (error) {
		return response.status(400).json({ success: false, error });
	}

	// Return the courses as a JSON response
	response.json(courses);
});

app.post('/courses', async (request, response) => {
	// Access the course to be added to the database
	const course = request.body;

	try {
		await insertCourse(course);
		// Respond with the received course data
		response.status(201).json({
			success: true,
			message: 'Course successfully submitted!',
			data: course, // Send the course data back as the response
		});
	} catch (error) {
		// Handle any errors and respond with an error message
		response.status(500).json({
			success: false,
			error: `Failed to submit course: ${error.message}`,
		});
	}
});

app.get('/dashboard/:studentNumber', async (request, response) => {
	try {
		const studentDashboardData = await getStudentDashboardData(request.params.studentNumber);
		response.status(200).json(studentDashboardData);
	} catch (error) {
		response.status(500).send('Student not Found');
	}
});

app.get('/shopCourses/:studentNumber', async (req, res) => {
	try {
		// Get courses that are still not taken by the student
		const courses = await getCoursesThatAreStillNotTaken(req.params.studentNumber);

		// Return the courses in the response
		res.status(200).json(courses);
	} catch (error) {
		// If an error occurs, return the error message with a 400 status code
		res.status(400).send({ error: error.message });
	}
});

app.post('/advisers', async (req, res) => {
	const adviserData = req.body;

	try {
		// Assume insertAdviser is a function to handle database insertion
		const result = await insertAdviser(adviserData);

		if (result.success) {
			res.status(201).json({
				success: true,
				message: 'Adviser successfully submitted!',
				data: adviserData,
			});
		} else {
			res.status(500).json({
				success: false,
				error: 'Failed to insert adviser into the database.',
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Error occurred: ${error.message}`,
		});
	}
});

app.post('/students', async (req, res) => {
	const studentData = req.body;
	try {
		const result = await insertStudent(studentData);
		if (result.success) {
			res.status(201).json({ message: 'Student successfully added!', result: result.result });
		} else {
			res.status(400).json({ error: result.error });
		}
	} catch (error) {
		res.status(500).json({ error: `Server error: ${error.message}` });
	}
});

// DELETE route to remove a course from the ProgramChecklist
app.delete('/deleteCourseFromProgramChecklist', async (req, res) => {
	const { courseId, program } = req.body; // Extract data from the request body

	try {
		// Validate required fields
		if (!courseId || !program) {
			return res.status(400).json({
				success: false,
				message: 'Both courseId and program are required.',
			});
		}

		// Call the deleteCourseFromProgramChecklist function
		const result = await deleteCourseFromProgramChecklist(courseId, program);

		// Respond based on the result
		if (result.success) {
			res.status(200).json({
				success: true,
				message: `Course with ID ${courseId} successfully deleted from Program ${program}.`,
			});
		} else {
			res.status(404).json({
				success: false,
				message: result.error, // Send the error message from the function
			});
		}
	} catch (error) {
		// Log and handle unexpected errors
		res.status(500).json({
			success: false,
			message: 'An error occurred while deleting the course.',
			error: error.message,
		});
	}
});

// POST route for adding a course
app.post('/addCourse', async (req, res) => {
	try {
		// Extract data from the request body
		const { courseData } = req.body;

		// Validate required fields
		if (!courseData) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields: courseData or studentProgram.',
			});
		}

		// Call the insertCourse function
		const result = await insertCourse(courseData);

		// Send a success response
		res.status(200).json({
			success: true,
			message: 'Course successfully added.',
			data: result,
		});
	} catch (error) {
		// Handle errors and send an error response
		console.error('Error in /addCourse:', error.message);
		res.status(500).json({
			success: false,
			message: 'An error occurred while adding the course.',
			error: error.message,
		});
	}
});

// POST route for updating the course list
app.post('/updateCourseList', async (req, res) => {
	try {
		// Extract data from the request body
		const { coursesToAdd, coursesToDelete } = req.body;

		// Process courses to add
		for (const course of coursesToAdd) {
			// Validate each course object
			if (!course.CourseId || !course.CourseStatus) {
				return res.status(400).json({
					success: false,
					message: 'Invalid course data in coursesToAdd.',
				});
			}

			// Call the insertStudentCourseListItems function
			const result = await insertStudentCourseListItems(course);

			if (!result.success) {
				return res.status(500).json({
					success: false,
					message: `Error adding course ${course.CourseId}: ${result.error}`,
				});
			}
		}

		// Process courses to delete
		for (const courseToDelete of coursesToDelete) {
			// Call the deleteStudentCourseListItem function
			const result = await deleteStudentCourseListItem(courseToDelete);

			if (!result.success) {
				return res.status(500).json({
					success: false,
					message: `Error deleting course ${courseToDelete}: ${result.error}`,
				});
			}
		}

		// Send a success response
		res.status(200).json({
			success: true,
			message: 'Course list updated successfully.',
		});
	} catch (error) {
		// Handle errors and send an error response
		console.error('Error in /updateCourseList:', error.message);
		res.status(500).json({
			success: false,
			message: 'An error occurred while updating the course list.',
			error: error.message,
		});
	}
});

// GET route to fetch courses not taken and courses for advising
app.get('/getCoursesForStudent/:studentNumber', async (req, res) => {
	try {
		const studentNumber = req.params.studentNumber;

		// Call the function to get the courses
		const result = await getCoursesThatAreStillNotTaken(studentNumber);

		// Send the result as a JSON response
		res.status(200).json(result);
	} catch (error) {
		console.error('Error in /getCoursesForStudent:', error.message);
		res.status(500).json({
			success: false,
			message: 'An error occurred while fetching courses.',
			error: error.message,
		});
	}
});

// Route to get adviser program data
app.get('/adviser/:adviserId', async (req, res) => {
	try {
		// Extract adviser ID from the route parameters
		const { adviserId } = req.params;

		// Call the function to fetch the adviser program data
		const data = await getAdviserProgramData(adviserId);

		// Respond with the retrieved data
		res.status(200).json({
			success: true,
			message: 'Adviser program data fetched successfully.',
			data,
		});
	} catch (error) {
		// Handle errors
		console.error('Error fetching adviser program data:', error.message);
		res.status(500).json({
			success: false,
			message: 'An error occurred while fetching adviser program data.',
			error: error.message,
		});
	}
});

// Define the route to fetch the course checklist based on the given program
app.get('/courseChecklist/:program', async (req, res) => {
	const program = req.params.program; // Retrieve the program parameter from the URL

	try {
		// Call the getCourseChecklist function to fetch course data for the given program
		const courseChecklist = await getCourseChecklist(program);

		// Respond with the course checklist data
		res.status(200).json(courseChecklist);
	} catch (error) {
		// Handle errors and send an error response
		console.error('Error in /courseChecklist:', error.message);
		res.status(500).json({
			success: false,
			message: 'An error occurred while fetching the course checklist.',
			error: error.message,
		});
	}
});

// POST route to edit a course in the ProgramChecklist
app.post('/editCourseFromProgramChecklist', async (req, res) => {
	const { currentCourseID, updatedCourseData, studentProgram } = req.body;

	try {
		// Validate required fields
		if (!currentCourseID || !updatedCourseData || !studentProgram) {
			return res.status(400).json({
				success: false,
				message: 'currentCourseID, updatedCourseData, and studentProgram are required.',
			});
		}

		// Call the editCourseFromProgramChecklist function with the provided data
		const result = await editCourseFromProgramChecklist(currentCourseID, updatedCourseData, studentProgram);

		// Respond based on the result
		if (result.success) {
			res.status(200).json({
				success: true,
				message: result.message,
			});
		} else {
			res.status(400).json({
				success: false,
				message: result.error, // Send the error message from the function
			});
		}
	} catch (error) {
		// Handle unexpected errors
		res.status(500).json({
			success: false,
			message: 'An error occurred while editing the course from the ProgramChecklist.',
			error: error.message,
		});
	}
});

// POST route to approve a student's course list
app.post('/approveStudentCourseList', async (req, res) => {
	const { studentNumber } = req.body; // Extract studentNumber from the request body
	console.log('studentNumber');

	try {
		// Validate the student number
		if (!studentNumber) {
			return res.status(400).json({
				success: false,
				message: 'Student number is required.',
			});
		}

		// Call the approveStudentCourseList function with the provided student number
		const result = await approveStudentCourseList(studentNumber);

		// Respond with a success message
		res.status(200).json({
			success: true,
			message: result.message,
		});
	} catch (error) {
		// Handle unexpected errors
		res.status(500).json({
			success: false,
			message: 'An error occurred while approving the student course list.',
			error: error.message,
		});
	}
});

// POST route to verify if the given ID belongs to an Adviser or Student
app.post('/verifyID', async (req, res) => {
	const { id } = req.body; // Extract the ID from the request body

	try {
		// Validate the ID
		if (!id) {
			return res.status(400).json({
				success: false,
				message: 'ID is required.',
			});
		}

		// Call the verifyID function to determine whether the ID belongs to an Adviser, Student, or is invalid
		const result = await verifyID(id);

		if (result === 'Adviser' || result === 'Student') {
			res.status(200).json({
				position: result,
			});
		} else {
			res.status(400).json({
				success: false,
				message: result, // Error message from verifyID
			});
		}
	} catch (error) {
		// Handle any unexpected errors
		res.status(500).json({
			success: false,
			message: 'An error occurred while verifying the ID.',
			error: error.message,
		});
	}
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
