import AdvisingCourses from './AdvisingCourses';
import SemestralRecords from './SemestralRecords';
import styles from './StudentAdvising.module.css';

export default function StudentAdvising({ handleBack, studentNumber, studentName }) {
	return (
		<div className={`container-fluid d-flex justify-content-center align-items-center min-vh-100 ${styles['container-content']}`}>
			<main className={styles['container-content']}>
				{/* Back Button */}
				<button className={`${styles['btn-back']}`} onClick={handleBack}>
					Back To Dashboard
				</button>
				{/* Title Section */}
				<div className={styles['student-advising-title']}>
					<p id="student_name">{studentName}</p>
					<h1 className="fw-bold">For Advising</h1>
				</div>

				{/* Main Content Row */}
				<div className={styles['side-by-side']}>
					{/* Left Column: Checklist */}
					<div className={`${styles['advising-container']} ${styles['col-7']}`}>
						<div className={`card shadow-sm ${styles['card-checklist']}`}>
							<div className="card-body">
								{/* Checklist Table */}
								<SemestralRecords studentNumber={studentNumber} />
							</div>
						</div>
					</div>

					{/* Right Column: Advising */}
					<AdvisingCourses studentNumber={studentNumber} />
				</div>
			</main>
		</div>
	);
}
