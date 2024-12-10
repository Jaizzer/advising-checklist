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
app.get('/courses', async (request, response) => {
	// Get the courses
	const { courses } = await getCourse();
	response.json(courses);
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
