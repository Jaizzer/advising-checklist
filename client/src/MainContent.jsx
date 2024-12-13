import { useState } from 'react';
import Sidebar from './Sidebar';

export default function MainContent({ id, position }) {
	const [activeItem, setActiveItem] = useState('');

	// Function to handle navbar item clicks
	const handleNavItemClick = (item) => {
		setActiveItem(item);
	};

	return (
		<>
			<div className="container-fluid">
				<div className="row">
					<Sidebar onNavItemClick={handleNavItemClick} />
				</div>
                
			</div>
		</>
	);
}
