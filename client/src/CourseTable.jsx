import { useState, useEffect } from 'react';
import styles from './ManageCoursePage.module.css'; // Ensure correct path to CSS module

export default function CourseTable({ studentProgram, tableTitle, typeOfCourse, isEditing }) {
	const [courses, setCourses] = useState([]);
	const [editingCourse, setEditingCourse] = useState(null); // Track the course being edited
	const [editedValues, setEditedValues] = useState({});

	useEffect(() => {
		const encodedStudentProgram = encodeURIComponent(studentProgram);

		fetch(`http://localhost:9090/courses/${encodedStudentProgram}`)
			.then((response) => response.json())
			.then((data) => {
				// Filter courses based on the typeOfCourse prop
				const filteredCourses = data.filter((course) => course.CourseType === typeOfCourse);
				setCourses(filteredCourses);
			});
	}, [studentProgram, typeOfCourse]);

	const handleDelete = async (courseId) => {
		try {
			// Make DELETE request to the server
			const response = await fetch('http://localhost:9090/deleteCourseFromProgramChecklist', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ courseId, program: studentProgram }), // Send courseId and studentProgram
			});

			if (!response.ok) {
				throw new Error('Failed to delete course');
			}

			// Immediately update state to remove the deleted course
			setCourses((prevCourses) => prevCourses.filter((course) => course.CourseID !== courseId));
		} catch (error) {
			console.error('Error deleting course:', error);
		}
	};

	const handleEdit = (courseId) => {
		setEditingCourse(courseId);
		const originalCourse = courses.find((course) => course.CourseID === courseId);
		setEditedValues({
			[courseId]: {
				CourseID: originalCourse.CourseID,
				CourseType: originalCourse.CourseType,
				Units: originalCourse.Units,
				CourseDescription: originalCourse.CourseDescription,
				Prerequisites: originalCourse.Prerequisites, // Maintain as array
				Corequisites: originalCourse.Corequisites, // Maintain as array
			},
		});
	};

	const handleSaveChanges = async (courseId) => {
		const updatedCourseData = editedValues[courseId];

		// Make the API request to save the changes
		try {
			const response = await fetch('http://localhost:9090/editCourseFromManageCourse', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					currentCourseID: courseId,
					updatedCourseData: updatedCourseData,
					studentProgram: studentProgram,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to save changes');
			}

			// Reflect changes immediately in state and reset editing mode
			setCourses((prevCourses) =>
				prevCourses.map((course) =>
					course.CourseID === courseId
						? {
								...course,
								...updatedCourseData,
						  }
						: course
				)
			);
			setEditingCourse(null); // Reset editing state
		} catch (error) {
			console.error('Error saving course changes:', error);
		}
	};

	const handleInputChange = (e, courseId, field) => {
		const { value } = e.target;
		setEditedValues((prevValues) => ({
			...prevValues,
			[courseId]: {
				...prevValues[courseId],
				[field]:
					field === 'Units'
						? Number(value)
						: field === 'Prerequisites' || field === 'Corequisites'
						? value.split(',').map((item) => item.trim())
						: value,
			},
		}));
	};

	return (
		<section className={`mb-5 ${styles['section-container']}`}>
			<h4 className={`${styles['section-title']}`}>{tableTitle}</h4>
			<table className={`table table-hover ${styles['table']}`}>
				<thead className={`${styles['table-header']}`}>
					<tr>
						<th>Course Name</th>
						<th>Description</th>
						<th>Component</th>
						<th>Units</th>
						<th>Prerequisite</th>
						<th>Corequisite</th>
						{isEditing && <th>Actions</th>} {/* Conditionally render Actions column */}
					</tr>
				</thead>
				<tbody>
					{courses.length > 0 ? (
						courses.map((course, index) => (
							<tr key={index} className="text-center">
								<td>
									{editingCourse === course.CourseID ? (
										<input
											className={styles['action-related-input']}
											type="text"
											value={editedValues[course.CourseID]?.CourseID || course.CourseID}
											onChange={(e) => handleInputChange(e, course.CourseID, 'CourseID')}
										/>
									) : (
										course.CourseID
									)}
								</td>
								<td>
									{editingCourse === course.CourseID ? (
										<input
											className={styles['action-related-input']}
											type="text"
											value={editedValues[course.CourseID]?.CourseDescription || course.CourseDescription}
											onChange={(e) => handleInputChange(e, course.CourseID, 'CourseDescription')}
										/>
									) : (
										course.CourseDescription
									)}
								</td>
								<td>{course.CourseComponents}</td>
								<td>
									{editingCourse === course.CourseID ? (
										<input
											className={styles['action-related-input']}
											type="number"
											value={editedValues[course.CourseID]?.Units || course.Units || ''}
											onChange={(e) => handleInputChange(e, course.CourseID, 'Units')}
											min={1}
										/>
									) : (
										course.Units || 'N/A'
									)}
								</td>
								<td>
									{editingCourse === course.CourseID ? (
										<input
											className={styles['action-related-input']}
											type="text"
											value={editedValues[course.CourseID]?.Prerequisites.join(', ') || course.Prerequisites.join(', ')}
											onChange={(e) => handleInputChange(e, course.CourseID, 'Prerequisites')}
										/>
									) : (
										course.Prerequisites.join(', ') || 'None'
									)}
								</td>
								<td>
									{editingCourse === course.CourseID ? (
										<input
											className={styles['action-related-input']}
											type="text"
											value={editedValues[course.CourseID]?.Corequisites.join(', ') || course.Corequisites.join(', ')}
											onChange={(e) => handleInputChange(e, course.CourseID, 'Corequisites')}
										/>
									) : (
										course.Corequisites.join(', ') || 'None'
									)}
								</td>
								{isEditing && (
									<td>
										{editingCourse === course.CourseID ? (
											<button
												className={`btn btn-sm btn-success ${styles['btn-success']}`}
												onClick={() => handleSaveChanges(course.CourseID)}
											>
												Save
											</button>
										) : (
											<button
												className={`btn btn-sm btn-primary ${styles['btn-primary']}`}
												onClick={() => handleEdit(course.CourseID)}
											>
												Edit
											</button>
										)}
										<button
											className={`btn btn-sm btn-danger ${styles['btn-danger']}`}
											onClick={() => handleDelete(course.CourseID)}
										>
											Delete
										</button>
									</td>
								)}
							</tr>
						))
					) : (
						<tr>
							<td colSpan="8" className="text-center">
								No courses available for the selected course type.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</section>
	);
}
