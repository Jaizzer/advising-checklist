import logo from './assets/Logo.svg';
import dashboardIcon from './assets/Sidebar_Dashboard.svg';
import studentRecordsIcon from './assets/Sidebar_StudentRecords.svg';
import advisingRecordsIcon from './assets/Sidebar_AdvisingRecords.svg';
import manageCoursesIcon from './assets/Sidebar_.ManageCourses.svg';
import logoutIcon from './assets/Sidebar_Logout.svg';

// Sidebar component
export default function Sidebar({ onNavItemClick, name, program, position }) {
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

				{/* Advising Records Link */}
				<li className="nav-item">
					<button className="nav-link" onClick={() => onNavItemClick('Course Checklist')}>
						<img src={advisingRecordsIcon} alt="Course Checklist" /> Checklist
					</button>
				</li>

				{/* Manage Courses Link for both Adviser and Student */}
				<li className="nav-item">
					<button className="nav-link" onClick={() => onNavItemClick('Manage Courses')}>
						<img src={manageCoursesIcon} alt="Manage Courses" />
						Courses
					</button>
				</li>

				{/* Submit Course List for Students only */}
				{position === 'Student' && (
					<li className="nav-item">
						<button className="nav-link" onClick={() => onNavItemClick('Get Advised')}>
							<img src={manageCoursesIcon} alt="Submit Course List" /> Get Advised
						</button>
					</li>
				)}

				{/* Logout Link */}
				<li className="nav-item">
					<button className="nav-link" onClick={() => onNavItemClick('Logout')}>
						<img src={logoutIcon} alt="Logout" /> Logout
					</button>
				</li>
			</ul>

			{/* User Info Section */}
			<div className="user-info mt-4 px-3">
				<p className="mb-1">
					<strong>{name}</strong>
				</p>
				<p className="text-muted">
					{program} ({position})
				</p>
			</div>
		</nav>
	);
}
