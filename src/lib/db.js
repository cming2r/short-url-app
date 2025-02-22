import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL_NON_POOLING);
export default sql;