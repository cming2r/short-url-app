let dbClient = null;

async function getClient() {
  if (!dbClient) {
    dbClient = createClient({
      connectionString: process.env.POSTGRES_URL_NON_POOLING,
    });
    await dbClient.connect();
  }
  return dbClient;
}

export async function POST(request) {
  const client = await getClient();
  console.log('Reusing database client');

  const { url } = await request.json();
  let shortCode = nanoid(6);

  try {
    let existing = await client.query('SELECT short_code FROM urls WHERE short_code = $1', [shortCode]);
    console.log('Existing check result:', existing.rows);
    while (existing.rows.length > 0) {
      shortCode = nanoid(6);
      existing = await client.query('SELECT short_code FROM urls WHERE short_code = $1', [shortCode]);
      console.log('Generated new shortCode:', shortCode);
    }

    console.log('Inserting into database:', { shortCode, url });
    await client.query('INSERT INTO urls (short_code, original_url) VALUES ($1, $2)', [shortCode, url]);
    const shortUrl = `https://${process.env.VERCEL_URL || 'localhost:3000'}/${shortCode}`;
    console.log('Generated short URL:', shortUrl);

    return new Response(JSON.stringify({ shortUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}