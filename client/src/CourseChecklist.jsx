import { useState, useEffect } from 'react';
import styles from './CourseChecklist.module.css';

export default function CourseChecklist({ program, isAdviser }) {
	const [courseData, setCourseData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [editingCourse, setEditingCourse] = useState(null);
	const [editedValues, setEditedValues] = useState({});
	const [isUpdating, setIsUpdating] = useState(false); // Track whether update mode is active

	useEffect(() => {
		const fetchCourseData = async () => {
			try {
				const encodedProgram = encodeURIComponent(program);
				const response = await fetch(`http://localhost:9090/courseChecklist/${encodedProgram}`);
				if (!response.ok) {
					throw new Error('Failed to fetch course data');
				}
				const data = await response.json();
				const groupedData = groupCoursesByYearAndSemester(data);
				setCourseData(groupedData);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCourseData();
	}, [program]);

	const groupCoursesByYearAndSemester = (courses) => {
		const grouped = {};
		courses.forEach((course) => {
			const year = course.PrescribedYear || 'No Year';
			const semester = course.PrescribedSemester || 'No Semester';
			if (!grouped[year]) {
				grouped[year] = {};
			}
			if (!grouped[year][semester]) {
				grouped[year][semester] = [];
			}
			grouped[year][semester].push(course);
		});
		return grouped;
	};

	const handleDelete = async (courseId) => {
		try {
			const response = await fetch('http://localhost:9090/deleteCourseFromProgramChecklist', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ courseId, program: program }), // Send studentProgram in the request body
			});

			if (!response.ok) {
				throw new Error('Failed to delete course');
			}

			// Update courseData by filtering out the deleted course
			setCourseData((prevCourseData) => {
				const updatedCourseData = { ...prevCourseData };
				for (const year in updatedCourseData) {
					for (const semester in updatedCourseData[year]) {
						updatedCourseData[year][semester] = updatedCourseData[year][semester].filter((course) => course.CourseId !== courseId);
					}
				}
				return updatedCourseData;
			});
		} catch (error) {
			console.error('Error deleting course:', error);
			// Handle the error, e.g., display an error message to the user
		}
	};

	const handleEdit = (courseId) => {
		setEditingCourse(courseId);
		const originalCourse = getCourseById(courseId);
		setEditedValues({
			[courseId]: {
				CourseId: originalCourse.CourseId,
				CourseType: originalCourse.CourseType,
				Units: originalCourse.Units,
			},
		});
	};

	const handleSaveChanges = async (courseId) => {
		try {
			// Prepare request body with current and edited values
			const requestBody = {
				currentCourseID: courseId,
				updatedCourseData: {
					CourseID: editedValues[courseId].CourseId,
					Units: editedValues[courseId].Units,
					CourseType: editedValues[courseId].CourseType,
				},
				studentProgram: program,
			};

			// Send POST request to edit the course
			const response = await fetch('http://localhost:9090/editCourseFromProgramChecklist', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				throw new Error(`Failed to edit course: ${response.status}`);
			}

			const data = await response.json();

			if (data.success) {
				console.log('Course edited successfully:', data.message);

				// Update courseData locally after successful server-side edit
				setCourseData((prevCourseData) => {
					const updatedCourseData = { ...prevCourseData };
					for (const year in updatedCourseData) {
						for (const semester in updatedCourseData[year]) {
							const courseIndex = updatedCourseData[year][semester].findIndex((course) => course.CourseId === courseId);
							if (courseIndex !== -1) {
								updatedCourseData[year][semester][courseIndex] = {
									...updatedCourseData[year][semester][courseIndex],
									CourseId: editedValues[courseId].CourseId,
									Units: editedValues[courseId].Units,
									CourseType: editedValues[courseId].CourseType,
								};
							}
						}
					}
					return updatedCourseData;
				});
			} else {
				console.error('Error editing course:', data.error);
				// Display error message to the user (e.g., using a modal or alert)
				alert(`Error editing course: ${data.error}`);
			}

			// Reset editing state
			setEditingCourse(null);
			setEditedValues({});
		} catch (error) {
			console.error('Error editing course:', error);
			// Handle unexpected errors (e.g., display error message to the user)
			alert('An unexpected error occurred while editing the course.');
		}
	};

	const handleInputChange = (e, courseId, field) => {
		const { value } = e.target;
		setEditedValues((prevValues) => ({
			...prevValues,
			[courseId]: {
				...prevValues[courseId],
				[field]: field === 'Units' ? Number(value) : value,
			},
		}));
	};

	const getCourseById = (courseId) => {
		for (const year in courseData) {
			for (const semester in courseData[year]) {
				const course = courseData[year][semester].find((course) => course.CourseId === courseId);
				if (course) {
					return course;
				}
			}
		}
		return null;
	};

	const isCourseEdited = (courseId) => {
		const originalCourse = getCourseById(courseId);
		const editedCourse = editedValues[courseId];
		return (
			editedCourse &&
			(editedCourse.CourseId !== originalCourse.CourseId ||
				editedCourse.CourseType !== originalCourse.CourseType ||
				editedCourse.Units !== originalCourse.Units)
		);
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const renderSemester = (semester, courses) => {
		const totalUnits = courses.reduce((sum, course) => sum + (course.Units || 0), 0);
		return (
			<div className={styles['semester']}>
				<div className={styles['semester-header']}>
					<h3 className={styles['semester-title']}>{semester}</h3>
					<p className={styles['total-units']}>Total Units: {totalUnits}</p>
				</div>
				<div className={styles['semester-table-container']}>
					<table className={styles['semester-table']}>
						<thead>
							<tr>
								<th>Course Name</th>
								<th>Course Type</th>
								<th>Units</th>
								{isUpdating && isAdviser && <th>Actions</th>} {/* Conditionally render Actions column */}
							</tr>
						</thead>
						<tbody>
							{courses.map((course, index) => (
								<tr key={index}>
									<td>
										{editingCourse === course.CourseId ? (
											<input
												className={styles['action-related-input']}
												type="text"
												value={editedValues[course.CourseId]?.CourseId || course.CourseId}
												onChange={(e) => handleInputChange(e, course.CourseId, 'CourseId')}
											/>
										) : (
											course.CourseId
										)}
									</td>
									<td>
										{editingCourse === course.CourseId ? (
											<select
												className={styles['action-related-input']}
												value={editedValues[course.CourseId]?.CourseType || course.CourseType}
												onChange={(e) => handleInputChange(e, course.CourseId, 'CourseType')}
											>
												<option value="Major">Major</option>
												<option value="Foundation">Foundation</option>
												<option value="Other">Other</option>
												<option value="Qualified Elective">Qualified Elective</option>
												<option value="GE Requirement">GE Requirement</option>
											</select>
										) : (
											course.CourseType
										)}
									</td>
									<td>
										{editingCourse === course.CourseId ? (
											<input
												className={styles['action-related-input']}
												type="number"
												value={editedValues[course.CourseId]?.Units || course.Units || ''}
												onChange={(e) => handleInputChange(e, course.CourseId, 'Units')}
												min={1}
											/>
										) : (
											course.Units || 'N/A'
										)}
									</td>
									{isUpdating && isAdviser && (
										<td>
											{editingCourse === course.CourseId ? (
												<button
													className={`btn btn-sm btn-success ${styles['btn-success']}`}
													onClick={() => handleSaveChanges(course.CourseId)}
													disabled={!isCourseEdited(course.CourseId)}
												>
													Save
												</button>
											) : (
												<button
													className={`btn btn-sm btn-primary ${styles['btn-primary']}`}
													onClick={() => handleEdit(course.CourseId)}
												>
													Edit
												</button>
											)}
											<button
												className={`btn btn-sm btn-danger ${styles['btn-danger']}`}
												onClick={() => handleDelete(course.CourseId)}
											>
												Delete
											</button>
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	return (
		<div>
			<h1 className={`adviser-checklist-title ${styles['adviser-checklist-title']}`}>Program Checklist</h1>
			<h4 className={`adviser-checklist-subtitle ${styles['adviser-checklist-subtitle']}`}>{program}</h4>
			{/* Update Button */}
			{isAdviser && (
				<div className="text-end mt-4">
					<button className={`${styles['btn-update']}`} onClick={() => setIsUpdating(!isUpdating)}>
						{isUpdating ? 'Done Updating' : 'Update Record'}
					</button>
				</div>
			)}
			{Object.keys(courseData)
				.sort((a, b) => {
					const yearA = parseInt(a.split(' ')[1]);
					const yearB = parseInt(b.split(' ')[1]);
					return yearA - yearB;
				})
				.map((year, index) => (
					<div key={index} className={styles['year-container']}>
						<h2 className={styles['year-title']}>{year}</h2>
						<div className={styles['semester-row']}>
							{Object.keys(courseData[year])
								.sort()
								.map((semester, index) => renderSemester(semester, courseData[year][semester], index))}
						</div>
					</div>
				))}
		</div>
	);
}
