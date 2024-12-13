import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css'; // Import the CSS module
import forAdvisingIcon from './assets/Icon_ForAdvising.svg';
import accomplishedIcon from './assets/Icon_Accomplished.svg';
import totalStudentsIcon from './assets/Icon_TotalStudents.svg';
import StudentAdvising from './StudentAdvising';

function AdviserDashboard({ adviserId }) {
	const [adviserData, setAdviserData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedStudent, setSelectedStudent] = useState(null);

	useEffect(() => {
		const fetchAdviserData = async () => {
			try {
				const response = await fetch(`http://localhost:9090/adviser/${adviserId}`);

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				const { data } = await response.json();
				setAdviserData(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAdviserData();
	}, [adviserId]);

	const handleViewChecklist = (student) => {
		setSelectedStudent({
			studentNumber: student.Student.StudentNumber,
			studentName: student.Student.StudentName,
		});
	};

	const handleBack = () => {
		setSelectedStudent(null);
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const { StudentsForAdvising, StudentsUnderAdvising } = adviserData;

	return (
		<div className={styles['container-content']}>
			{selectedStudent ? (
				<StudentAdvising handleBack={handleBack} studentNumber={selectedStudent.studentNumber} studentName={selectedStudent.studentName} />
			) : (
				<>
					<div className={`${styles['summary-container']} row g-3 mb-4`}>
						<div className="col-md-4">
							<div className={`${styles['card-summary']} ${styles['card']} shadow-sm`}>
								<div className="d-flex justify-content-between align-items-center">
									<div>
										<p>For Advising</p>
										<h3 className="fw-bold">{StudentsForAdvising.length}</h3>
									</div>
									<img src={forAdvisingIcon} alt="For Advising" className={styles['card-logo']} />
								</div>
							</div>
						</div>

						<div className="col-md-4">
							<div className={`${styles['card-summary']} ${styles['card']} shadow-sm`}>
								<div className="d-flex justify-content-between align-items-center">
									<div>
										<p>Accomplished</p>
										<h3 className="fw-bold">{StudentsUnderAdvising - StudentsForAdvising.length}</h3>
									</div>
									<img src={accomplishedIcon} alt="Accomplished" className={styles['card-logo']} />
								</div>
							</div>
						</div>

						<div className="col-md-4">
							<div className={`${styles['card-summary']} ${styles['card']} shadow-sm`}>
								<div className="d-flex justify-content-between align-items-center">
									<div>
										<p>Total Students</p>
										<h3 className="fw-bold">{StudentsUnderAdvising}</h3>
									</div>
									<img src={totalStudentsIcon} alt="Total Students" className={styles['card-logo']} />
								</div>
							</div>
						</div>
					</div>

					<div className={`${styles['card-table']} ${styles['card']} shadow-sm`}>
						<div className="card-body">
							<div className={styles['table-responsive']}>
								<table className="table table-hover align-middle">
									<thead className={styles['student-table']}>
										<tr>
											<th>#</th>
											<th>Name</th>
											<th>Student Number</th>
											<th>Standing</th>
											<th colSpan="2">Last Update of Checklist</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{StudentsForAdvising.map((student, index) => {
											const { Student, CombinedDateTime } = student;

											const [datePart, timePart] = CombinedDateTime.split('T');
											const [hour, minute] = timePart.split(':').map(Number);

											const period = hour >= 12 ? 'PM' : 'AM';
											const hour12 = hour % 12 === 0 ? 12 : hour % 12;
											const formattedTime = `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;

											const date = new Date(datePart);
											const monthNames = [
												'Jan.',
												'Feb.',
												'Mar.',
												'Apr.',
												'May',
												'Jun.',
												'Jul.',
												'Aug.',
												'Sep.',
												'Oct.',
												'Nov.',
												'Dec.',
											];
											const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

											return (
												<tr key={Student.StudentNumber}>
													<td>{index + 1}</td>
													<td>{Student.StudentName}</td>
													<td>{Student.StudentNumber}</td>
													<td>{Student.CurrentStanding}</td>
													<td>{formattedDate}</td>
													<td>{formattedTime}</td>
													<td>
														<button
															className={`${styles['btn-custom']} btn btn-sm`}
															onClick={() => handleViewChecklist(student)}
														>
															View Checklist
														</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export default AdviserDashboard;
