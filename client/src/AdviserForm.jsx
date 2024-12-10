import { useState } from 'react';

export default function AdviserForm() {
	const [formData, setFormData] = useState({
		AdviserID: '',
		A_FirstName: '',
		A_MiddleName: '',
		A_LastName: '',
		AdvisingProgram: '',
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
			const response = await fetch('http://localhost:9090/advisers', {
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
			<h2>Adviser Form</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="AdviserID">Adviser ID:</label>
					<input type="text" id="AdviserID" name="AdviserID" value={formData.AdviserID} onChange={handleChange} required />
				</div>
				<div>
					<label htmlFor="A_FirstName">First Name:</label>
					<input type="text" id="A_FirstName" name="A_FirstName" value={formData.A_FirstName} onChange={handleChange} required />
				</div>
				<div>
					<label htmlFor="A_MiddleName">Middle Name:</label>
					<input type="text" id="A_MiddleName" name="A_MiddleName" value={formData.A_MiddleName} onChange={handleChange} />
				</div>
				<div>
					<label htmlFor="A_LastName">Last Name:</label>
					<input type="text" id="A_LastName" name="A_LastName" value={formData.A_LastName} onChange={handleChange} required />
				</div>
				<div>
					<label htmlFor="AdvisingProgram">Advising Program:</label>
					<input
						type="text"
						id="AdvisingProgram"
						name="AdvisingProgram"
						value={formData.AdvisingProgram}
						onChange={handleChange}
						required
					/>
				</div>
				<button type="submit">Submit Adviser</button>
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
