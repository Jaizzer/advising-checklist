import mysql from 'mysql2';

// Create pool of connections to the Advising_Checklist database
const pool = mysql
	.createPool({
		host: '127.0.0.1',
		user: 'root',
		password: 'root',
		database: 'Advising_Checklist',
	})
	.promise();

export default pool;