import { useState } from 'react';
import MainContent from './MainContent';

export default function App() {
	const [id, setId] = useState(''); // State for the ID input
	const [name, setName] = useState(''); // State for the name
	const [position, setPosition] = useState(''); // To store the position (Adviser/Student)
	const [program, setProgram] = useState(''); // To store the program
	const [isLoggedIn, setIsLoggedIn] = useState(false); // To track if the user is logged in
	const [errorMessage, setErrorMessage] = useState(''); // To store the error message

	const handleSubmit = async (event) => {
		event.preventDefault();

		// Check if the ID is provided
		if (!id) {
			setErrorMessage('Please enter your ID.');
			return;
		}

		try {
			// Make a POST request to the backend API
			const response = await fetch('http://localhost:9090/verifyID', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id }), // Send the ID in the request body
			});

			const data = await response.json(); // Parse the JSON response

			if (response.ok) {
				// Save the details in state variables
				setId(data.id);
				setName(data.name);
				setPosition(data.position);
				setProgram(data.program);
				setIsLoggedIn(true); // Set the user as logged in
				setErrorMessage(''); // Clear any previous error message
			} else {
				// Display error message if the ID is invalid
				setErrorMessage(data.message || 'ID not found. Please try again.');
				setIsLoggedIn(false);
			}
		} catch (error) {
			// Handle any errors that occur during the fetch
			setErrorMessage('An error occurred while verifying your ID. Please try again.');
			setIsLoggedIn(false);
		}
	};

	return (
		<div>
			{/* Conditionally render the login form or the MainContent */}
			{!isLoggedIn ? (
				<>
					<h1>Enter Your ID</h1>
					<form onSubmit={handleSubmit}>
						<input
							type="text"
							value={id}
							onChange={(e) => {
								setId(e.target.value);
								setErrorMessage(''); // Clear error message when user starts typing
							}}
							placeholder="Enter ID"
						/>
						<button type="submit">Log In</button>
					</form>
					{/* Display error message if it exists */}
					{errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
				</>
			) : (
				<MainContent id={id} name={name} position={position} program={program} setIsLoggedIn={setIsLoggedIn} />
			)}
		</div>
	);
}
