import { useState } from 'react';
import Sidebar from './Sidebar';
import CourseChecklist from './CourseChecklist';
import DashboardPage from './DashboardPage';
import ManageCoursePage from './ManageCoursePage';
import GetAdvised from './GetAdvised';
import StudentDashboard from './StudentDashboard';

export default function MainContent({ id, name, position, program, setIsLoggedIn }) {
	const [activeItem, setActiveItem] = useState('Dashboard');

	// Function to handle navbar item clicks
	const handleNavItemClick = (item) => {
		if (item === 'Logout') {
			// Set isLoggedIn to false and stop further rendering
			setIsLoggedIn(false);
			return;
		}
		setActiveItem(item);
	};

	// Function to render content based on active item
	const renderContent = () => {
		if (position === 'Adviser') {
			switch (activeItem) {
				case 'Dashboard':
					return <DashboardPage adviserId={id} adviserName={name} />;
				case 'Course Checklist':
					return <CourseChecklist program={program} isAdviser={true} />;
				case 'Manage Courses':
					return <ManageCoursePage program={program} isAdviser={true} />;
				default:
					return <div>Please select a menu item</div>;
			}
		} else if (position === 'Student') {
			switch (activeItem) {
				case 'Dashboard':
					return <StudentDashboard studentNumber={id}/>;
				case 'Course Checklist':
					return <CourseChecklist program={program} isAdviser={false} />;
				case 'Manage Courses':
					return <ManageCoursePage program={program} isAdviser={false} />;
				case 'Get Advised':
					return <GetAdvised studentNumber={id} program={program} />;
				default:
					return <div>Please select a menu item</div>;
			}
		} else {
			return <div>Access Denied. Please log in again.</div>;
		}
	};

	return (
		<>
			<div className="container-fluid">
				<div className="row">
					<Sidebar onNavItemClick={handleNavItemClick} name={name} program={program} position={position} />
					<main className="container-content col-md-10 ms-sm-auto">{renderContent()}</main>
				</div>
			</div>
		</>
	);
}
