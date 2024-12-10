import { useState } from 'react';

export default function CoourseForm() {
	// State for each form field
	const [courseData, setCourseData] = useState({
		CourseID: '',
		CourseDescription: '',
		Units: '',
		CourseComponents: '',
		College: '',
		Department: '',
		GradingBasis: '',
		Prerequisites: [],
		Corequisites: [],
	});

	// Handle change in any form field
	const handleChange = (e) => {
		const { name, value } = e.target;
		setCourseData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	// Handle adding a prerequisite or corequisite
	const handleArrayChange = (e, type) => {
		const { value } = e.target;
		setCourseData((prevData) => {
			const newArray = [...prevData[type], value];
			return {
				...prevData,
				[type]: newArray,
			};
		});
	};

	// Handle form submission and send data to the server
	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log(courseData);

		try {
			// Send the course data to the server via POST request
			const response = await fetch('http://localhost:9090/courses', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(courseData),
			});

			// Parse the JSON response
			const result = await response.json();

			if (response.ok) {
				alert('Course inserted successfully!');
			} else {
				alert(`Error inserting course: ${result.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Error sending course data:', error);
			alert('Error connecting to the server.');
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label>Course ID:</label>
				<input type="text" name="CourseID" value={courseData.CourseID} onChange={handleChange} required />
			</div>

			<div>
				<label>Course Description:</label>
				<input type="text" name="CourseDescription" value={courseData.CourseDescription} onChange={handleChange} required />
			</div>

			<div>
				<label>Units:</label>
				<input type="number" name="Units" value={courseData.Units} onChange={handleChange} required />
			</div>

			<div>
				<label>Course Components:</label>
				<input type="text" name="CourseComponents" value={courseData.CourseComponents} onChange={handleChange} />
			</div>

			<div>
				<label>College:</label>
				<input type="text" name="College" value={courseData.College} onChange={handleChange} />
			</div>

			<div>
				<label>Department:</label>
				<input type="text" name="Department" value={courseData.Department} onChange={handleChange} />
			</div>

			<div>
				<label>Grading Basis:</label>
				<input type="text" name="GradingBasis" value={courseData.GradingBasis} onChange={handleChange} />
			</div>

			<button type="submit">Submit Course</button>
		</form>
	);
}
