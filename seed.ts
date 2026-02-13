import { db } from './src/db/db';
import { users } from './src/db/schema';
import { hashPassword } from './src/lib/auth';
import { eq } from 'drizzle-orm';

async function seed() {
  try {
    console.log('🌱 Seeding database with demo user...');

    // Check if admin already exists
    const existing = await db.select().from(users).where(
      eq(users.email, 'admin@example.com')
    );

    if (existing.length > 0) {
      console.log('✅ Demo user already exists');
      return;
    }

    // Insert demo user
    const newUser = await db.insert(users).values({
      email: 'admin@example.com',
      password: hashPassword('password123'),
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
    }).returning();

    console.log('✅ Demo user created:', newUser[0].email);
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: password123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
