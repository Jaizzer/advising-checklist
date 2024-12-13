import pool from './database.js';

export default async function approveStudentCourseList(studentNumber) {
	if (!studentNumber) {
		throw new Error('Student number is required.');
	}

	const connection = await pool.getConnection();

	try {
		await connection.beginTransaction();

		// Update StudentCourseList with "Taken" status and NULL grade
		const [updateResult] = await connection.query(
			`UPDATE StudentCourseList
       SET CourseStatus = 'Taken', Grade = NULL
       WHERE StudentNumber = ?`,
			[studentNumber]
		);

		await connection.commit();

		return { success: true, message: `Student course list approved successfully.` };
	} catch (error) {
		await connection.rollback();
		throw new Error(error.message);
	} finally {
		connection.release();
	}
}
