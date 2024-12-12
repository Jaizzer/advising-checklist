import { useState, useEffect } from 'react';

const AddCourseListForAdvising = ({ studentNumber }) => {
	const [coursesNotTaken, setCoursesNotTaken] = useState([]);
	const [coursesForAdvising, setCoursesForAdvising] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [coursesToAdd, setCoursesToAdd] = useState([]);

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const response = await fetch(`http://localhost:9090/getCoursesForStudent/${studentNumber}`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setCoursesNotTaken(data.CourseNotYetTaken);
				setCoursesForAdvising(data.CoursesForAdvising);
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
			},
		]);
		setCoursesNotTaken(coursesNotTaken.filter((c) => c.CourseId !== course.CourseId));
	};

	const handleSubmitCourseList = async () => {
		try {
			const response = await fetch('http://localhost:9090/addCoursesForAdvising', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					studentNumber: studentNumber,
					coursesToAdd: coursesToAdd,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.success) {
				setCoursesForAdvising([...coursesForAdvising, ...coursesToAdd]);
				setCoursesToAdd([]);
			} else {
				console.error('Error adding courses for advising:', data.error);
				setCoursesNotTaken([...coursesNotTaken, ...coursesToAdd]);
				setCoursesToAdd([]);
			}
		} catch (error) {
			console.error('Error adding courses for advising:', error);
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
		<>
			<div>hello</div>
			<div className="row">
				{/* Left Column: Checklist */}
				<div className="col-7">
					<div className="card shadow-sm card-checklist">
						<div className="card-body">
							<h1 className="mb-0">Student Course Checklist</h1>
							<p>I - BS COMPUTER SCIENCE</p>

							{/* Dropdown Filter (Optional) */}
							{/* ... (Dropdown filter code as in the original HTML) ... */}

							<div className="checklist-table table-responsive mt-4">
								<table className="table table-hover align-middle">
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
													<button className="btn btn-sm btn-primary" onClick={() => handleAddCourse(course)}>
														Add to Advising
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								<p className="text-end">TOTAL UNITS: {coursesNotTaken.reduce((total, course) => total + (course.Units || 0), 0)}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: Advising */}
				<div className="col-5">
					<div className="card shadow-sm card-list">
						<div className="card-body">
							<h1 className="mb-0">Course List for Advising</h1>
							<p className="submission-label">Submitted: November 23, 2024</p>

							<div className="checklist-table table-responsive mt-4">
								<table className="table table-hover align-middle">
									<thead>
										<tr>
											<th scope="col">Course</th>
											<th scope="col">Course Type</th>
											<th scope="col">Units</th>
										</tr>
									</thead>
									<tbody>
										{[...coursesForAdvising, ...coursesToAdd].map((course) => (
											<tr key={course.CourseId}>
												<td>{course.CourseId}</td>
												<td>{course.CourseType}</td>
												<td>{course.Units}</td>
											</tr>
										))}
									</tbody>
								</table>
								<p className="text-end">
									TOTAL UNITS: {[...coursesForAdvising, ...coursesToAdd].reduce((total, course) => total + (course.Units || 0), 0)}
								</p>
							</div>

							<div className="advising-buttons d-flex gap-2 mt-4">
								<button className="btn btn-outline-secondary flex-grow-1">Navigate Back</button>
								{coursesToAdd.length > 0 && (
									<button className="btn btn-primary flex-grow-1" onClick={handleSubmitCourseList}>
										Save Course List
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default AddCourseListForAdvising;
