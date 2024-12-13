import { useState } from 'react';
import MainContent from './MainContent';

export default function App() {
	const [id, setId] = useState(''); // State for the ID input
	const [position, setPosition] = useState(''); // To store the position (Adviser/Student)
	const [isLoggedIn, setIsLoggedIn] = useState(false); // To track if the user is logged in

	const handleSubmit = async (event) => {
		event.preventDefault();

		// Check if the ID is provided
		if (!id) {
			return; // Do nothing if no ID is entered
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
				// Save the position (Adviser/Student) in the state
				setPosition(data.position);
				setIsLoggedIn(true); // Set the user as logged in
			} else {
				// Clear position if the ID is invalid
				setPosition('');
				setIsLoggedIn(false); // Ensure the user is not logged in if the ID is invalid
			}
		} catch (error) {
			// Handle any errors that occur during the fetch
			setPosition('');
			setIsLoggedIn(false); // Ensure the user is not logged in if there's an error
		}
	};

	return (
		<div>
			{/* Conditionally render the login button or logged-in message */}
			{!isLoggedIn ? (
				<>
					<h1>Enter Your ID</h1>
					<form onSubmit={handleSubmit}>
						<input type="text" value={id} onChange={(e) => setId(e.target.value)} placeholder="Enter ID" />
						<button type="submit">Log In</button>
					</form>
				</>
			) : (
				<MainContent id={id}></MainContent>
			)}
		</div>
	);
}
