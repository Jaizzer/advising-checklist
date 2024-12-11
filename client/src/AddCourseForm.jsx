import { useState } from 'react';

function AddCourseForm({ StudentProgram }) {
	const [formData, setFormData] = useState({
		CourseID: '',
		CourseDescription: '',
		Units: '',
		CourseComponents: '',
		College: 'College of Science',
		Department: '',
		GradingBasis: '',
		Prerequisites: [],
		Corequisites: [],
		CourseType: '',
		PrescribedYear: '',
		PrescribedSemester: '',
		StudentProgram: StudentProgram || '',
	});

	// Handle form input change
	function handleChange(event) {
		const { id, value } = event.target;
		setFormData({ ...formData, [id]: value });
	}

	// Handle form submission
	async function handleSubmit(event) {
		event.preventDefault();

		const courseData = { ...formData };

		try {
			// Send the course data including the StudentProgram field
			const response = await fetch('http://localhost:9090/addCourse', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ courseData }),
			});

			const result = await response.json();

			if (response.ok) {
				alert('Course successfully added!');
			} else {
				alert(`Failed to add course: ${result.error}`);
			}
		} catch (error) {
			console.error('Error adding course:', error.message);
			alert('An error occurred while adding the course.');
		}
	}

	return (
		<div className="add-course-section">
			<h1 className="title_page h1 fw-bold">Add Course</h1>
			<form className="add-course-form" onSubmit={handleSubmit}>
				<div className="form-grid">
					{/* Row 1 */}
					<div className="form-group">
						<label htmlFor="CourseID">Course ID</label>
						<input type="text" id="CourseID" placeholder="Enter text" value={formData.CourseID} onChange={handleChange} />
					</div>
					<div className="form-group">
						<label htmlFor="CourseDescription">Course Description</label>
						<input
							type="text"
							id="CourseDescription"
							placeholder="Enter text"
							value={formData.CourseDescription}
							onChange={handleChange}
						/>
					</div>
					<div className="form-group">
						<label htmlFor="CourseType">Course Type</label>
						<select id="CourseType" value={formData.CourseType} onChange={handleChange}>
							<option value="">Select option</option>
							<option value="Major">Major</option>
							<option value="GE Requirement">GE Requirement</option>
							<option value="Foundation">Foundation</option>
							<option value="Elective">Elective</option>
							<option value="Other">Other</option>
						</select>
					</div>

					{/* Row 2 */}
					<div className="form-group">
						<label htmlFor="Units">Units</label>
						<input type="number" id="Units" placeholder="Enter number" value={formData.Units} onChange={handleChange} />
					</div>
					<div className="form-group">
						<label htmlFor="CourseComponents">Course Components</label>
						<select id="CourseComponents" value={formData.CourseComponents} onChange={handleChange}>
							<option value="">Select option</option>
							<option value="Lab">Lab</option>
							<option value="Lecture">Lecture</option>
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="College">College</label>
						<select id="College" value={formData.College} onChange={handleChange}>
							<option value="College of Science">College of Science</option>
						</select>
					</div>

					{/* Row 3 */}
					<div className="form-group">
						<label htmlFor="Department">Department</label>
						<select id="Department" value={formData.Department} onChange={handleChange}>
							<option value="">Select option</option>
							<option value="Math">Math</option>
							<option value="Computer Science">Computer Science</option>
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="GradingBasis">Grading Basis</label>
						<select id="GradingBasis" value={formData.GradingBasis} onChange={handleChange}>
							<option value="">Select option</option>
							<option value="Letter">Letter</option>
							<option value="Numerical">Numerical</option>
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="PrescribedYear">Prescribed Year</label>
						<select id="PrescribedYear" value={formData.PrescribedYear} onChange={handleChange}>
							<option value="">Select option</option>
							<option value="1">Year 1</option>
							<option value="2">Year 2</option>
							<option value="3">Year 3</option>
							<option value="4">Year 4</option>
						</select>
					</div>

					{/* Row 4 */}
					<div className="form-group">
						<label htmlFor="Prerequisites">Prerequisites</label>
						<select id="Prerequisites" value={formData.Prerequisites} onChange={handleChange}>
							<option value="">Select option</option>
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="PrescribedSemester">Prescribed Semester</label>
						<select id="PrescribedSemester" value={formData.PrescribedSemester} onChange={handleChange}>
							<option value="">Select option</option>
							<option value="1">Semester 1</option>
							<option value="2">Semester 2</option>
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="Corequisites">Corequisites</label>
						<select id="Corequisites" value={formData.Corequisites} onChange={handleChange}>
							<option value="">Select option</option>
						</select>
					</div>
				</div>
				<div className="button-container text-end mt-4">
					<button type="submit" className="btn">
						Add Course
					</button>
				</div>
			</form>
		</div>
	);
}

export default AddCourseForm;
