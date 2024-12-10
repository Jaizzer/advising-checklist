import express from 'express';
import { getCourse } from './course.js';
import cors from 'cors';

// Initialize an Express application
const app = express();

// Use CORS middleware to allow cross-origin requests from any origin
app.use(cors());

// Set the port for the server to listen on
const PORT = 9090;

// Create courses route
app.get('/courses/:studentProgram', async (request, response) => {
    console.log("studentProgram")

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

// Start the server and listen on the specified port
app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
