import { useState, useEffect } from 'react';

export default function AdvisingCourses({ studentNumber }) {
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isApproved, setIsApproved] = useState(false); // Flag to indicate approval status

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const response = await fetch(`http://localhost:9090/getCoursesForStudent/${studentNumber}`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setCourses(data.CoursesForAdvising.map((course) => ({ ...course, isSaved: true })));
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchCourses();
	}, [studentNumber]);

	const handleApprove = async () => {
		try {
			const response = await fetch('http://localhost:9090/approveStudentCourseList', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ studentNumber }),
			});

			if (!response.ok) {
				throw new Error(`Error approving course list: ${await response.text()}`);
			}

			const data = await response.json();
			setIsApproved(true); // Update flag to indicate successful approval
			console.log('Course list approved:', data.message); // Log success message
		} catch (error) {
			console.error('Error approving course list:', error.message);
			setError(error.message); // Update error state for potential display
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div className="card shadow-sm card-list">
			<div className="card-body">
				{isApproved ? (
					<h1 className="mb-0 text-success">Course List Approved Successfully</h1>
				) : courses.length === 0 ? (
					<h1 className="mb-0 text-muted">No Course to Approve</h1>
				) : (
					<h1 className="mb-0">Course List for Advising</h1>
				)}

				{courses.length > 0 && ( // Only display table and button if there are courses
					<>
						<div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
							<table className="table table-hover align-middle">
								<thead>
									<tr>
										<th scope="col">Course</th>
										<th scope="col">Course Type</th>
										<th scope="col">Units</th>
									</tr>
								</thead>
								<tbody>
									{courses.map((course) => (
										<tr key={course.CourseId}>
											<td>{course.CourseId}</td>
											<td>{course.CourseType}</td>
											<td>{course.Units}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<p className="text-end">TOTAL UNITS: {courses.reduce((total, course) => total + (course.Units || 0), 0)}</p>
					</>
				)}

				<div className="advising-buttons d-flex gap-2 mt-4">
					<button className="btn btn-primary flex-grow-1" disabled={isApproved || courses.length === 0} onClick={handleApprove}>
						{isApproved ? 'Approved' : 'Approve'}
					</button>
				</div>
			</div>
		</div>
	);
}
