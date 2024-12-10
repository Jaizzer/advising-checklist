import express from 'express';
import { getCourse, insertCourse } from './course.js';
import cors from 'cors';

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
	console.log('studentProgram');

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

// Start the server and listen on the specified port
app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
