import { useState, useEffect } from 'react';
import StudentAdvising from './StudentAdvising'; 

function AdviserDashboard({ adviserId }) {
	const [adviserData, setAdviserData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedStudent, setSelectedStudent] = useState(null); // State to store selected student

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

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const { AdviserName, Program, StudentsForAdvising, StudentsUnderAdvising } = adviserData;

	const handleViewChecklist = (student) => {
		setSelectedStudent(student); // Set selected student on button click
	};

	return (
		<div>
			{/* Summary Section (unchanged) */}
			<div className="summary-container row g-3 mb-4">
				<div className="col-md-4">
					<div className="card card-summary p-3 shadow-sm">
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<p>For Advising</p>
								<h3 className="fw-bold">{StudentsForAdvising.length}</h3>
							</div>
							<img src="svg/Icon_ForAdvising.svg" alt="For Advising" className="card-logo" />
						</div>
					</div>
				</div>

				<div className="col-md-4">
					<div className="card card-summary p-3 shadow-sm">
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<p>Accomplished</p>
								<h3 className="fw-bold">{StudentsUnderAdvising - StudentsForAdvising.length}</h3>
							</div>
							<img src="svg/Icon_Accomplished.svg" alt="Accomplished" className="card-logo" />
						</div>
					</div>
				</div>

				<div className="col-md-4">
					<div className="card card-summary p-3 shadow-sm">
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<p>Total Students</p>
								<h3 className="fw-bold">{StudentsUnderAdvising}</h3>
							</div>
							<img src="svg/Icon_TotalStudents.svg" alt="Total Students" className="card-logo" />
						</div>
					</div>
				</div>
			</div>

			{/* Search and Filter (unchanged) */}
			<div className="row search-container mb-4">
				<div className="col-8 p-0">
					<div className="input-group search-box">
						<input type="search" className="form-control" placeholder="Search for student..." />
					</div>
				</div>
				<div className="col-3 p-0">
					<div className="dropdown p-0">
						<button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
							<img src="svg/Filter.svg" alt="Filter" /> Filter
						</button>
						<ul className="dropdown-menu">
							<li>
								<a className="dropdown-item" href="#">
									Name
								</a>
							</li>
							<li>
								<a className="dropdown-item" href="#">
									Student Number
								</a>
							</li>
							<li>
								<a className="dropdown-item" href="#">
									Last Update
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Student Table */}
			{selectedStudent ? (
				<StudentAdvising studentNumber={selectedStudent.Student.StudentNumber} /> // Render StudentAdvising if a student is selected
			) : (
				<div className="card-table card shadow-sm">
					<div className="card-body">
						<div className="table-responsive">
							<table className="table table-hover align-middle">
								<thead>
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

										// Date and time parsing logic (unchanged)
										const [datePart, timePart] = CombinedDateTime.split('T'); // Separate date and time
										const [hour, minute] = timePart.split(':').map(Number); // Extract hours and minutes

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
													<button className="btn btn-sm btn-custom" onClick={() => handleViewChecklist(student)}>
														View Checklist
													</button>
													<button className="btn">
														<img src="svg/Icon_Delete.svg" alt="Delete" />
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
			)}
		</div>
	);
}

export default AdviserDashboard;
