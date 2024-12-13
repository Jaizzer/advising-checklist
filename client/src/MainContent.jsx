import { useState } from 'react';
import Sidebar from './Sidebar';

// Pretend these components already exist
import DashboardPage from './Dashboard';
import StudentRecordsPage from './StudentRecords';
import AdvisingRecordsPage from './AdvisingRecords';
import ManageCoursesPage from './ManageCourses';
import LogoutPage from './Logout';

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
				return <DashboardPage />;
			case 'Student Records':
				return <StudentRecordsPage />;
			case 'Advising Records':
				return <AdvisingRecordsPage />;
			case 'Manage Courses':
				return <ManageCoursesPage />;
			case 'Logout':
				return <LogoutPage />;
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
