import { useState, useEffect } from 'react';
import styles from './GetAdvised.module.css';

export default function GetAdvised({ studentNumber, program }) {
	const [coursesNotTaken, setCoursesNotTaken] = useState([]);
	const [coursesForAdvising, setCoursesForAdvising] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [coursesToAdd, setCoursesToAdd] = useState([]);
	const [coursesToDelete, setCoursesToDelete] = useState([]);

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const response = await fetch(`http://localhost:9090/getCoursesForStudent/${studentNumber}`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setCoursesNotTaken(data.CourseNotYetTaken);
				setCoursesForAdvising(data.CoursesForAdvising.map((course) => ({ ...course, isSaved: true })));
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchCourses();
	}, [studentNumber]);

	const handleAddCourse = (course) => {
		setCoursesToAdd([
			...coursesToAdd,
			{
				StudentNumber: studentNumber,
				CourseId: course.CourseId,
				CourseStatus: 'For Advising',
				Units: course.Units,
				CourseType: course.CourseType,
				isSaved: false,
			},
		]);
		setCoursesNotTaken(coursesNotTaken.filter((c) => c.CourseId !== course.CourseId));
	};

	const handleDeleteCourse = (courseToDelete) => {
		setCoursesForAdvising(coursesForAdvising.filter((course) => course.CourseId !== courseToDelete.CourseId));
		setCoursesToAdd(coursesToAdd.filter((course) => course.CourseId !== courseToDelete.CourseId));
		setCoursesNotTaken([...coursesNotTaken, courseToDelete]);

		if (courseToDelete.isSaved) {
			setCoursesToDelete([...coursesToDelete, { StudentNumber: studentNumber, CourseId: courseToDelete.CourseId }]);
		}
	};

	const handleSubmitCourseList = async () => {
		try {
			const response = await fetch('http://localhost:9090/updateCourseList', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					coursesToAdd: coursesToAdd,
					coursesToDelete: coursesToDelete,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.success) {
				const updatedCoursesToAdd = coursesToAdd.map((course) => ({ ...course, isSaved: true }));
				setCoursesForAdvising([...coursesForAdvising.filter((course) => course.isSaved), ...updatedCoursesToAdd]);
				setCoursesToAdd([]);
				setCoursesToDelete([]);
			} else {
				console.error('Error updating course list:', data.error);
				setCoursesNotTaken([...coursesNotTaken, ...coursesToAdd]);
				setCoursesToAdd([]);
			}
		} catch (error) {
			console.error('Error updating course list:', error);
			setCoursesNotTaken([...coursesNotTaken, ...coursesToAdd]);
			setCoursesToAdd([]);
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div className={styles['row']}>
			{/* Left Column: Checklist */}
			<div className={`col-7 ${styles['advising-container']}`}>
				<div className={`card shadow-sm ${styles['card-checklist']}`}>
					<div className={`card-body ${styles['card-body']}`}>
						<h1 className="mb-0">Student Course Checklist</h1>
						<h2>{program}</h2>

						<div className={`table-responsive ${styles['table-responsive']}`}>
							<table className={`table table-hover align-middle ${styles['table']}`}>
								<thead>
									<tr>
										<th scope="col">Course</th>
										<th scope="col">Course Type</th>
										<th scope="col">Units</th>
										<th scope="col">Actions</th>
									</tr>
								</thead>
								<tbody>
									{coursesNotTaken.map((course) => (
										<tr key={course.CourseId}>
											<td>{course.CourseId}</td>
											<td>{course.CourseType}</td>
											<td>{course.Units}</td>
											<td>
												<button
													className={`btn btn-sm btn-primary ${styles['btn-primary']}`}
													onClick={() => handleAddCourse(course)}
												>
													Add
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<p className={`text-end ${styles['text-end']}`}>
							TOTAL UNITS: {coursesNotTaken.reduce((total, course) => total + (course.Units || 0), 0)}
						</p>
					</div>
				</div>
			</div>

			{/* Right Column: Advising */}
			<div className={`col-5 ${styles['advising-container']}`}>
				<div className={`card shadow-sm ${styles['card-list']}`}>
					<div className={`card-body ${styles['card-body']}`}>
						<h1 className="mb-0">Course List for Advising</h1>

						<div className={`table-responsive ${styles['table-responsive']}`}>
							<table className={`table table-hover align-middle ${styles['table']}`}>
								<thead>
									<tr>
										<th scope="col">Course</th>
										<th scope="col">Course Type</th>
										<th scope="col">Units</th>
										<th scope="col">Actions</th>
									</tr>
								</thead>
								<tbody>
									{[...coursesForAdvising, ...coursesToAdd].map((course) => (
										<tr key={course.CourseId}>
											<td>{course.CourseId}</td>
											<td>{course.CourseType}</td>
											<td>{course.Units}</td>
											<td>
												<button
													className={`btn btn-sm btn-danger ${styles['btn-danger']}`}
													onClick={() => handleDeleteCourse(course)}
												>
													Remove
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<p className={`text-end ${styles['text-end']}`}>
							TOTAL UNITS: {[...coursesForAdvising, ...coursesToAdd].reduce((total, course) => total + (course.Units || 0), 0)}
						</p>
						<div className={`advising-buttons d-flex gap-2 mt-4 ${styles['advising-buttons']}`}>
							{(coursesToAdd.length > 0 || coursesToDelete.length > 0) && (
								<button className={`btn btn-primary flex-grow-1 ${styles['btn-primary']}`} onClick={handleSubmitCourseList}>
									Save Course List
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
