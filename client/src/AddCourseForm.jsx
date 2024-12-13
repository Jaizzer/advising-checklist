import { useState } from 'react';
import styles from './AddCourseForm.module.css'; // Import the CSS module

function AddCourseForm({ StudentProgram, setIsAdding }) {
	const [formData, setFormData] = useState({
		CourseID: '',
		CourseDescription: '',
		Units: 1, // Default to 1
		CourseComponents: '',
		College: 'College of Science',
		Department: '',
		GradingBasis: '',
		Prerequisites: '',
		Corequisites: '',
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
		<div className={styles['container-content']}>
			{/* Back to Courses Button */}

			<h1 className={styles['title_page']}>Add Course</h1>
			<form className={styles['add-course-form']} onSubmit={handleSubmit}>
				<div className={styles['form-grid']}>
					{/* Row 1 */}
					<div className={styles['form-group']}>
						<label htmlFor="CourseID">Course ID</label>
						<input type="text" id="CourseID" placeholder="Enter Course ID" value={formData.CourseID} onChange={handleChange} required />
					</div>
					<div className={styles['form-group']}>
						<label htmlFor="CourseDescription">Course Description</label>
						<input
							type="text"
							id="CourseDescription"
							placeholder="Enter Course Description"
							value={formData.CourseDescription}
							onChange={handleChange}
							required
						/>
					</div>
					<div className={styles['form-group']}>
						<label htmlFor="CourseType">Course Type</label>
						<select id="CourseType" value={formData.CourseType} onChange={handleChange} required>
							<option value="">Select option</option>
							<option value="Major">Major</option>
							<option value="GE Requirement">GE Requirement</option>
							<option value="Foundation">Foundation</option>
							<option value="Elective">Elective</option>
							<option value="Other">Other</option>
						</select>
					</div>

					{/* Row 2 */}
					<div className={styles['form-group']}>
						<label htmlFor="Units">Units</label>
						<input type="number" id="Units" placeholder="Enter number" value={formData.Units} onChange={handleChange} min="1" required />
					</div>
					<div className={styles['form-group']}>
						<label htmlFor="CourseComponents">Course Components</label>
						<select id="CourseComponents" value={formData.CourseComponents} onChange={handleChange} required>
							<option value="">Select option</option>
							<option value="Lab">Lab</option>
							<option value="Lecture">Lecture</option>
						</select>
					</div>
					<div className={styles['form-group']}>
						<label htmlFor="College">College</label>
						<select id="College" value={formData.College} onChange={handleChange} required>
							<option value="College of Science">College of Science</option>
						</select>
					</div>

					{/* Row 3 */}
					<div className={styles['form-group']}>
						<label htmlFor="Department">Department</label>
						<select id="Department" value={formData.Department} onChange={handleChange} required>
							<option value="">Select option</option>
							<option value="Math">Math</option>
							<option value="Computer Science">Computer Science</option>
						</select>
					</div>
					<div className={styles['form-group']}>
						<label htmlFor="GradingBasis">Grading Basis</label>
						<select id="GradingBasis" value={formData.GradingBasis} onChange={handleChange} required>
							<option value="">Select option</option>
							<option value="Letter">Letter</option>
							<option value="Numerical">Numerical</option>
						</select>
					</div>
					<div className={styles['form-group']}>
						<label htmlFor="PrescribedYear">Year</label>
						<select id="PrescribedYear" value={formData.PrescribedYear} onChange={handleChange} required>
							<option value="">Select option</option>
							<option value="Year 1">Year 1</option>
							<option value="Year 2">Year 2</option>
							<option value="Year 3">Year 3</option>
							<option value="Year 4">Year 4</option>
						</select>
					</div>

					{/* Row 4 */}
					<div className={styles['form-group']}>
						<label htmlFor="Prerequisites">Prerequisites</label>
						<input
							type="text"
							id="Prerequisites"
							placeholder="Enter Prerequisites (comma separated)"
							value={formData.Prerequisites}
							onChange={handleChange}
						/>
					</div>
					<div className={styles['form-group']}>
						<label htmlFor="PrescribedSemester">Semester</label>
						<select id="PrescribedSemester" value={formData.PrescribedSemester} onChange={handleChange} required>
							<option value="">Select option</option>
							<option value="Semester 1">Semester 1</option>
							<option value="Semester 2">Semester 2</option>
						</select>
					</div>
					<div className={styles['form-group']}>
						<label htmlFor="Corequisites">Corequisites</label>
						<input
							type="text"
							id="Corequisites"
							placeholder="Enter Corequisites (comma separated)"
							value={formData.Corequisites}
							onChange={handleChange}
						/>
					</div>
				</div>

				<div className={styles['button-container']}>
					<button type="submit" className={styles['add-course-button']}>
						Add Course
					</button>
					<button
						className={styles['back-to-courses-button']}
						onClick={() => setIsAdding(false)} // Calls the passed function to stop adding a course
					>
						Back to Courses
					</button>
				</div>
			</form>
		</div>
	);
}

export default AddCourseForm;
