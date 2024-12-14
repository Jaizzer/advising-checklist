import logo from './assets/Logo.svg';
import dashboardIcon from './assets/Sidebar_Dashboard.svg';
import advisingRecordsIcon from './assets/Sidebar_AdvisingRecords.svg';
import manageCoursesIcon from './assets/Sidebar_.ManageCourses.svg';
import logoutIcon from './assets/Sidebar_Logout.svg';
import styles from './Sidebar.module.css';

export default function Sidebar({ onNavItemClick, name, program, position }) {
	return (
		<nav className={`${styles.sidebar} col-md-2 d-none d-md-block`}>
			{/* Logo Section */}
			<div className={styles.logo}>
				<img src={logo} alt="Logo" />
			</div>

			{/* Navigation Links */}
			<ul className="nav flex-column px-3">
				<li className="nav-item">
					<button className={`nav-link ${styles['nav-link']}`} onClick={() => onNavItemClick('Dashboard')}>
						<img src={dashboardIcon} alt="Dashboard" /> Dashboard
					</button>
				</li>
				<li className="nav-item">
					<button className={`nav-link ${styles['nav-link']}`} onClick={() => onNavItemClick('Course Checklist')}>
						<img src={advisingRecordsIcon} alt="Course Checklist" /> Checklist
					</button>
				</li>
				<li className="nav-item">
					<button className={`nav-link ${styles['nav-link']}`} onClick={() => onNavItemClick('Manage Courses')}>
						<img src={manageCoursesIcon} alt="Manage Courses" /> Courses
					</button>
				</li>
				{position === 'Student' && (
					<li className="nav-item">
						<button className={`nav-link ${styles['nav-link']}`} onClick={() => onNavItemClick('Get Advised')}>
							<img src={manageCoursesIcon} alt="Submit Course List" /> Get Advised
						</button>
					</li>
				)}
				<li className="nav-item">
					<button className={`nav-link ${styles['nav-link']}`} onClick={() => onNavItemClick('Logout')}>
						<img src={logoutIcon} alt="Logout" /> Logout
					</button>
				</li>
			</ul>

			{/* User Info Section */}
			<div className={`${styles['account-container']} mt-4 px-3`}>
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
