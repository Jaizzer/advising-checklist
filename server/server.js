import express from 'express';
import cors from 'cors';
import { getCourse } from './course.js';
import insertCourse from './insertCourse.js';
import { insertAdviser } from './adviser.js';
import { insertStudent } from './student.js';
import { getStudentDashboardData } from './getStudentDashboardData.js';
import { getCoursesThatAreStillNotTaken } from './getCoursesThatAreStillNotTaken.js';
import { insertStudentCourseListItems } from './insertStudentCourseListItems.js';

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

// POST route for adding a course list item
app.post('/addCourseforAdvising', async (req, res) => {
	try {
		// Extract data from the request body
		const { studentNumber, courseId, courseStatus } = req.body;

		// Validate required fields
		if (!studentNumber || !courseId || !courseStatus) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields: studentNumber, courseId, or courseStatus.',
			});
		}

		// Call the insertStudentCourseListItem function
		const result = await insertStudentCourseListItems({
			StudentNumber: studentNumber,
			CourseId: courseId,
			CourseStatus: courseStatus,
		});

		// Send a success response
		res.status(200).json({
			success: true,
			message: 'Course list item successfully added.',
			data: result,
		});
	} catch (error) {
		// Handle errors and send an error response
		console.error('Error in /addSubjectForAdvising:', error.message);
		res.status(500).json({
			success: false,
			message: 'An error occurred while adding the course list item.',
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

// Start the server and listen on the specified port
app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
