import pool from './database.js';

export default async function approveStudentCourseList(studentNumber) {
	if (!studentNumber) {
		throw new Error('Student number is required.');
	}

	const connection = await pool.getConnection();

	try {
		await connection.beginTransaction();

		// Update StudentCourseList with "Taken" status and NULL grade, only for courses with "For Advising" status
		const [updateResult] = await connection.query(
			`UPDATE StudentCourseList
                SET CourseStatus = 'Taken', Grade = NULL
                WHERE StudentNumber = ? AND CourseStatus = 'For Advising'`,
			[studentNumber]
		);

		await connection.commit();

		return {
			success: true,
			message: `${updateResult.affectedRows} course(s) successfully approved for student ${studentNumber}.`,
		};
	} catch (error) {
		await connection.rollback();
		throw new Error(error.message);
	} finally {
		connection.release();
	}
}
