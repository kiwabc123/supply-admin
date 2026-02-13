const { db } = require('./src/db/db');
const { sql } = require('drizzle-orm');

async function migrate() {
  try {
    console.log('🔄 Running migrations...');

    // Create user role enum
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'USER', 'GUEST');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Created user_role enum');

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role user_role DEFAULT 'USER',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created users table');

    // Create sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created sessions table');

    // Create indices
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_is_active ON users(is_active)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_session_user_id ON sessions(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_session_token ON sessions(token)`);
    console.log('✅ Created indices');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
