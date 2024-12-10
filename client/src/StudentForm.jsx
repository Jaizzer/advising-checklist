import { useState } from 'react';

export default function StudentForm() {
	const [formData, setFormData] = useState({
		StudentNumber: '',
		S_FirstName: '',
		S_MiddleName: '',
		S_LastName: '',
		StudentProgram: '',
		AdviserID: '',
		CurrentStanding: '',
		TotalUnitsTaken: '',
	});

	const [submissionStatus, setSubmissionStatus] = useState(null);

	// Update state on input change
	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	};

	// Handle form submission
	const handleSubmit = async (event) => {
		event.preventDefault();

		try {
			const response = await fetch('http://localhost:9090/students', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const result = await response.json();

			if (response.ok) {
				setSubmissionStatus({ success: true, message: result.message });
			} else {
				setSubmissionStatus({ success: false, message: result.error });
			}
		} catch (error) {
			setSubmissionStatus({
				success: false,
				message: `An error occurred: ${error.message}`,
			});
		}
	};

	return (
		<div>
			<h2>Student Form</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="StudentNumber">Student Number:</label>
					<input type="text" id="StudentNumber" name="StudentNumber" value={formData.StudentNumber} onChange={handleChange} required />
				</div>
				<div>
					<label htmlFor="S_FirstName">First Name:</label>
					<input type="text" id="S_FirstName" name="S_FirstName" value={formData.S_FirstName} onChange={handleChange} required />
				</div>
				<div>
					<label htmlFor="S_MiddleName">Middle Name:</label>
					<input type="text" id="S_MiddleName" name="S_MiddleName" value={formData.S_MiddleName} onChange={handleChange} />
				</div>
				<div>
					<label htmlFor="S_LastName">Last Name:</label>
					<input type="text" id="S_LastName" name="S_LastName" value={formData.S_LastName} onChange={handleChange} required />
				</div>
				<div>
					<label htmlFor="StudentProgram">Student Program:</label>
					<input type="text" id="StudentProgram" name="StudentProgram" value={formData.StudentProgram} onChange={handleChange} required />
				</div>
				<div>
					<label htmlFor="AdviserID">Adviser ID:</label>
					<input type="text" id="AdviserID" name="AdviserID" value={formData.AdviserID} onChange={handleChange} />
				</div>
				<div>
					<label htmlFor="CurrentStanding">Current Standing:</label>
					<input
						type="text"
						id="CurrentStanding"
						name="CurrentStanding"
						value={formData.CurrentStanding}
						onChange={handleChange}
						required
					/>
				</div>
				<div>
					<label htmlFor="TotalUnitsTaken">Total Units Taken:</label>
					<input
						type="number"
						id="TotalUnitsTaken"
						name="TotalUnitsTaken"
						value={formData.TotalUnitsTaken}
						onChange={handleChange}
						required
					/>
				</div>
				<button type="submit">Submit Student</button>
			</form>

			{submissionStatus && (
				<div
					style={{
						marginTop: '1rem',
						color: submissionStatus.success ? 'green' : 'red',
					}}
				>
					{submissionStatus.message}
				</div>
			)}
		</div>
	);
}
