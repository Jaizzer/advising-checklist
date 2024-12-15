import { useState } from 'react';
import MainContent from './MainContent';
import logo from './assets/Logo.svg'; 
import './login.css'; 

export default function App() {
	const [id, setId] = useState('');
	const [name, setName] = useState('');
	const [position, setPosition] = useState('');
	const [program, setProgram] = useState('');
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!id) {
			setErrorMessage('Please enter your ID.');
			return;
		}

		try {
			const response = await fetch('http://localhost:9090/verifyID', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id }),
			});

			const data = await response.json();

			if (response.ok) {
				setId(data.id);
				setName(data.name);
				setPosition(data.position);
				setProgram(data.program);
				setIsLoggedIn(true);
				setErrorMessage('');
			} else {
				setErrorMessage('ID not found. Please try again.');
				setIsLoggedIn(false);
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div>
			{!isLoggedIn ? (
				<div className="login-container">
					<div className="login-logo">
						<img src={logo} alt="Logo" />
					</div>
					<h1 className="login-heading">Enter Your ID</h1>
					<form onSubmit={handleSubmit} className="login-form">
						<input
							type="text"
							className="login-input"
							value={id}
							onChange={(e) => {
								setId(e.target.value);
								setErrorMessage('');
							}}
							placeholder="Enter ID"
						/>
						<button type="submit" className="login-button">
							Log In
						</button>
					</form>
					{errorMessage && <p className="login-error">{errorMessage}</p>}
				</div>
			) : (
				<MainContent id={id} name={name} position={position} program={program} setIsLoggedIn={setIsLoggedIn} />
			)}
		</div>
	);
}
