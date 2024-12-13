import { useState } from 'react';
import Sidebar from './Sidebar';

// Pretend these components already exist
import Dashboard from './Dashboard';
import StudentRecords from './StudentRecords';
import AdvisingRecords from './AdvisingRecords';
import ManageCourses from './ManageCourses';
import Logout from './Logout';

export default function MainContent({ id, position }) {
	const [activeItem, setActiveItem] = useState('Dashboard');

	// Function to handle navbar item clicks
	const handleNavItemClick = (item) => {
		setActiveItem(item);
	};

	// Function to render content based on active item
	const renderContent = () => {
		switch (activeItem) {
			case 'Dashboard':
				return <Dashboard />;
			case 'Student Records':
				return <StudentRecords />;
			case 'Advising Records':
				return <AdvisingRecords />;
			case 'Manage Courses':
				return <ManageCourses />;
			case 'Logout':
				return <Logout />;
			default:
				return <div>Please select a menu item</div>;
		}
	};

	return (
		<>
			<div className="container-fluid">
				<div className="row">
					<Sidebar onNavItemClick={handleNavItemClick} />
					<main className="container-content col-md-10 ms-sm-auto">
						{/* Render content based on active item */}
						{renderContent()}
					</main>
				</div>
			</div>
		</>
	);
}
