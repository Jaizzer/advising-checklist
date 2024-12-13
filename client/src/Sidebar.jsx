// Import images
import logo from './assets/Logo.svg';
import dashboardIcon from './assets/Sidebar_Dashboard.svg';
import studentRecordsIcon from './assets/Sidebar_StudentRecords.svg';
import advisingRecordsIcon from './assets/Sidebar_AdvisingRecords.svg';
import manageCoursesIcon from './assets/Sidebar_.ManageCourses.svg';
import logoutIcon from './assets/Sidebar_Logout.svg';

// Sidebar component
export default function Sidebar({ onNavItemClick }) {
	return (
		<nav className="col-md-2 d-none d-md-block sidebar py-4">
			{/* Logo Section */}
			<div className="logo mb-4">
				<img src={logo} alt="Logo" />
			</div>

			{/* Navigation Links */}
			<ul className="nav flex-column px-3">
				{/* Dashboard Link */}
				<li className="nav-item">
					<button className="nav-link active" onClick={() => onNavItemClick('Dashboard')}>
						<img src={dashboardIcon} alt="Dashboard" /> Dashboard
					</button>
				</li>

				{/* Student Records Link */}
				<li className="nav-item">
					<button className="nav-link" onClick={() => onNavItemClick('Student Records')}>
						<img src={studentRecordsIcon} alt="Student Records" /> Student Records
					</button>
				</li>

				{/* Advising Records Link */}
				<li className="nav-item">
					<button className="nav-link" onClick={() => onNavItemClick('Course Checklist')}>
						<img src={advisingRecordsIcon} alt="Course Checklist" /> Course Checklist
					</button>
				</li>

				{/* Manage Courses Link */}
				<li className="nav-item">
					<button className="nav-link" onClick={() => onNavItemClick('Manage Courses')}>
						<img src={manageCoursesIcon} alt="Manage Courses" /> Manage Courses
					</button>
				</li>

				{/* Logout Link */}
				<li className="nav-item">
					<button className="nav-link" onClick={() => onNavItemClick('Logout')}>
						<img src={logoutIcon} alt="Logout" /> Logout
					</button>
				</li>
			</ul>
		</nav>
	);
}
