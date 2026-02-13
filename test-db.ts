import { db } from './src/db/db';
import { products, productCategories } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Test 1: Query products table
    console.log('Test 1: Fetching products...');
    const productsList = await db.select().from(products).limit(5);
    console.log(`✅ Successfully fetched ${productsList.length} products\n`);

    // Test 2: Query categories
    console.log('Test 2: Fetching categories...');
    const categoriesList = await db.select().from(productCategories).limit(5);
    console.log(`✅ Successfully fetched ${categoriesList.length} categories\n`);

    // Test 3: Insert test data
    console.log('Test 3: Inserting test category...');
    const newCategory = await db.insert(productCategories).values({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test category for verification',
      displayOrder: 1,
      isActive: true,
    }).returning();
    console.log(`✅ Successfully created category: ${newCategory[0].id}\n`);

    // Test 4: Query the inserted category
    console.log('Test 4: Verifying inserted category...');
    const verified = await db.select().from(productCategories)
      .where(eq(productCategories.id, newCategory[0].id));
    console.log(`✅ Verified category exists: ${verified[0].name}\n`);

    // Test 5: Update the category
    console.log('Test 5: Updating category...');
    const updated = await db.update(productCategories)
      .set({ description: 'Updated test category' })
      .where(eq(productCategories.id, newCategory[0].id))
      .returning();
    console.log(`✅ Successfully updated category\n`);

    // Test 6: Delete test data
    console.log('Test 6: Deleting test category...');
    await db.delete(productCategories)
      .where(eq(productCategories.id, newCategory[0].id));
    console.log(`✅ Successfully deleted category\n`);

    console.log('✅✅✅ All tests passed! Database is working correctly! ✅✅✅\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:');
    console.error(error);
    process.exit(1);
  }
}

testDatabase();
