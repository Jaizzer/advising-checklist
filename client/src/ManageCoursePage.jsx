import { useState } from 'react';
import CourseTable from './CourseTable'; // Make sure this path is correct
import styles from './ManageCoursePage.module.css'; // Create a corresponding CSS module file
import AddCourseForm from './AddCourseForm';
export default function ManageCoursePage({ program }) {
	const [isEdit, setIsEdit] = useState(false); // State to manage whether we are in edit mode
	const [isAddingCourse, setIsAddingCourse] = useState(false);

	// Handler function for the "Make Edits" button
	const handleMakeEdits = () => {
		setIsEdit(!isEdit); // Toggle the isEdit state
	};

	const handleAddButton = () => {
		setIsAddingCourse(true); // Set to true to show the AddCourseForm component
	};

	return (
		<main className={`${styles['container-content']} col-md-10 ms-sm-auto`}>
			{isAddingCourse ? (
				<AddCourseForm StudentProgram={program} setIsAdding={setIsAddingCourse} />
			) : (
				<>
					{/* Manage Courses Title and Buttons */}
					<div className="d-flex align-items-center mb-4">
						<h1 className={`${styles['title_page']} fw-bold`}>Manage Courses</h1>
						<div className={`${styles['btn-func']}`}>
							<button className={`${styles['btn-custom']} ${styles['btn-add']}`} onClick={handleMakeEdits}>
								{isEdit ? 'Done Editing' : 'Make Edits'} {/* Button text changes based on isEdit */}
							</button>
						</div>
						<div className={`${styles['btn-func']}`}>
							<button className={`${styles['btn-custom']} ${styles['btn-add']}`} onClick={handleAddButton}>
								Add Course
							</button>
						</div>
					</div>

					{/* Major Courses Section */}
					<section className="mb-5">
						<CourseTable
							studentProgram={program}
							tableTitle="Major Courses"
							typeOfCourse="Major"
							isEditing={isEdit} // Pass isEdit state as isEditing prop
						/>
					</section>

					{/* Qualified Electives Section */}
					<section className="mb-5">
						<CourseTable
							studentProgram={program}
							tableTitle="Qualified Electives (9 Units)"
							typeOfCourse="Qualified Elective"
							isEditing={isEdit} // Pass isEdit state as isEditing prop
						/>
					</section>

					{/* Foundation Courses Section */}
					<section className="mb-5">
						<CourseTable
							studentProgram={program}
							tableTitle="Foundation Courses (15 Units)"
							typeOfCourse="Foundation"
							isEditing={isEdit} // Pass isEdit state as isEditing prop
						/>
					</section>

					{/* GE Requirements Section */}
					<section className="mb-5">
						<CourseTable
							studentProgram={program}
							tableTitle="GE Requirements (36 Units)"
							typeOfCourse="GE Requirement"
							isEditing={isEdit} // Pass isEdit state as isEditing prop
						/>
					</section>

					{/* Other Required Courses Section */}
					<section className="mb-5">
						<CourseTable
							studentProgram={program}
							tableTitle="Other Required Courses (12 Units)"
							typeOfCourse="Other"
							isEditing={isEdit} // Pass isEdit state as isEditing prop
						/>
					</section>
				</>
			)}
		</main>
	);
}
