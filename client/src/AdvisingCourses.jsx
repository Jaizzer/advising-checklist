import { useState, useEffect } from 'react';
import styles from './StudentAdvising.module.css';

export default function AdvisingCourses({ studentNumber }) {
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isApproved, setIsApproved] = useState(false); // Flag to indicate approval status
	const [remarks, setRemarks] = useState(''); // State to store the remarks text

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const response = await fetch(`http://localhost:9090/getCoursesForStudent/${studentNumber}`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setCourses(data.CoursesForAdvising);
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
		<div className={`col-5 ${styles['advising-container']}`}>
			<div className={`card shadow-sm ${styles['card-list']}`}>
				<div className={styles[`card-body`]}>
					<h1 className="mb-0">Course List for Advising</h1>
					<p className={styles['submission-label']}>Submitted: November 23, 2024</p>

					{/* Advising Table */}
					<div className={`${styles['checklist-table']} table-responsive mt-4`}>
						<table className="table table-hover align-middle">
							<thead>
								<tr>
									<th scope="col">Course</th>
									<th scope="col">Course Type</th>
									<th scope="col">Units</th>
								</tr>
							</thead>
							<tbody>
								{courses.map((course, index) => (
									<tr key={index}>
										<td>{course.CourseId}</td>
										<td>{course.CourseType}</td>
										<td>{course.Units}</td>
									</tr>
								))}
							</tbody>
						</table>
						<p className="text-end">TOTAL UNITS: {courses.reduce((total, course) => total + (course.Units || 0), 0)}</p>
					</div>

					{/* Remarks Section */}
					<div className={`${styles['advising-remarks']} mb-3`}>
						<h2>Advising Remarks</h2>
						<textarea
							className={`${styles['fixed-size']} form-control txt-size`}
							id="advising-remarks"
							placeholder="Enter Advising Notes/Remarks here..."
							value={remarks}
							onChange={(e) => setRemarks(e.target.value)} // Update remarks state on input change
						></textarea>
					</div>

					{/* Buttons */}
					<div className={`${styles['advising-buttons']} d-flex gap-2`}>
						<button
							className={`btn ${styles['btn-primary']} flex-grow-1`}
							disabled={isApproved || courses.length === 0}
							onClick={handleApprove}
						>
							{isApproved ? 'Approved' : 'Approve Course List'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
