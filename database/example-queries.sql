-- =====================================================
-- EXAMPLE QUERIES FOR BLOG POSTS
-- =====================================================

-- Get single blog post with related posts
SELECT 
    bp.id,
    bp.slug,
    bp.title,
    bp.summary,
    bp.content,
    bp.intro,
    bp.seoH2,
    bp.created_at,
    bp.updated_at
FROM blog_posts bp
WHERE bp.slug = 'why-hotels-use-white-bed-sheets'
AND bp.is_active = TRUE;

-- Get related blog posts
SELECT 
    bp2.id,
    bp2.slug,
    bp2.title,
    bp2.summary,
    bp2.created_at
FROM blog_post_relations bpr
INNER JOIN blog_posts bp2 ON bpr.related_post_id = bp2.id
WHERE bpr.post_id = (SELECT id FROM blog_posts WHERE slug = 'why-hotels-use-white-bed-sheets')
AND bp2.is_active = TRUE;

-- Get all active blog posts (paginated)
SELECT 
    id,
    slug,
    title,
    summary,
    created_at
FROM blog_posts
WHERE is_active = TRUE
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

-- Insert new blog post
INSERT INTO blog_posts (id, slug, title, summary, content, intro, seoH2, is_active)
VALUES (
    UUID(),
    'how-to-care-hotel-linen',
    'วิธีดูแลผ้าลินินโรงแรม',
    'เรียนรู้วิธีการดูแลรักษาผ้าลินินโรงแรมให้อยู่ในสภาพดีเสมอ',
    '<p>ผ้าลินินโรงแรมต้องการการดูแลพิเศษ...</p>',
    'เรียนรู้วิธีการดูแลรักษาผ้าลินินโรงแรม',
    'ผ้าลินินโรงแรมดูแลยากไหม?',
    TRUE
);

-- Add related blog posts
INSERT INTO blog_post_relations (id, post_id, related_post_id)
SELECT 
    UUID(),
    (SELECT id FROM blog_posts WHERE slug = 'why-hotels-use-white-bed-sheets'),
    (SELECT id FROM blog_posts WHERE slug = 'how-to-care-hotel-linen');


-- =====================================================
-- EXAMPLE QUERIES FOR PRODUCTS
-- =====================================================

-- Get single product with all details
SELECT 
    p.id,
    p.code,
    p.name,
    p.slug,
    p.short_description,
    p.description,
    p.category_id,
    pc.name AS category_name,
    pc.slug AS category_slug,
    p.is_featured,
    p.is_active,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
WHERE p.slug = 'hotel-white-stripe-bedding-set'
AND p.is_active = TRUE;

-- Get product images with thumbnail first
SELECT 
    pi.id,
    pi.product_id,
    pi.url,
    pi.alt,
    pi.is_thumbnail,
    pi.display_order
FROM product_images pi
WHERE pi.product_id = (SELECT id FROM products WHERE slug = 'hotel-white-stripe-bedding-set')
ORDER BY pi.is_thumbnail DESC, pi.display_order ASC;

-- Get product areas
SELECT 
    area
FROM product_areas
WHERE product_id = (SELECT id FROM products WHERE slug = 'hotel-white-stripe-bedding-set')
ORDER BY area;

-- Get product specifications
SELECT 
    label,
    value,
    display_order
FROM product_specifications
WHERE product_id = (SELECT id FROM products WHERE slug = 'hotel-white-stripe-bedding-set')
ORDER BY display_order ASC;

-- Get product features
SELECT 
    feature,
    display_order
FROM product_features
WHERE product_id = (SELECT id FROM products WHERE slug = 'hotel-white-stripe-bedding-set')
ORDER BY display_order ASC;

-- Get all products in category with pagination
SELECT 
    p.id,
    p.code,
    p.name,
    p.slug,
    p.short_description,
    p.is_featured,
    (SELECT url FROM product_images WHERE product_id = p.id AND is_thumbnail = TRUE LIMIT 1) AS thumbnail_url
FROM products p
JOIN product_categories pc ON p.category_id = pc.id
WHERE pc.slug = 'bedding' 
AND p.is_active = TRUE
ORDER BY p.display_order ASC, p.created_at DESC
LIMIT 12 OFFSET 0;

-- Get featured products
SELECT 
    p.id,
    p.code,
    p.name,
    p.slug,
    p.short_description,
    (SELECT url FROM product_images WHERE product_id = p.id AND is_thumbnail = TRUE LIMIT 1) AS thumbnail_url
FROM products p
WHERE p.is_featured = TRUE 
AND p.is_active = TRUE
ORDER BY p.created_at DESC
LIMIT 6;

-- Get products by area
SELECT DISTINCT
    p.id,
    p.code,
    p.name,
    p.slug,
    p.short_description,
    (SELECT url FROM product_images WHERE product_id = p.id AND is_thumbnail = TRUE LIMIT 1) AS thumbnail_url
FROM products p
JOIN product_areas pa ON p.id = pa.product_id
WHERE pa.area = 'BATHROOM'
AND p.is_active = TRUE
ORDER BY p.name;

-- Get product with all related data (full product details)
SELECT 
    p.id,
    p.code,
    p.name,
    p.slug,
    p.short_description,
    p.description,
    p.category_id,
    pc.id AS category_id,
    pc.name AS category_name,
    pc.slug AS category_slug,
    p.is_featured,
    p.is_active,
    p.created_at,
    p.updated_at,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', pi.id,
            'url', pi.url,
            'alt', pi.alt,
            'isThumbnail', pi.is_thumbnail
        )
    ) AS images,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'label', ps.label,
            'value', ps.value
        )
    ) AS specifications,
    JSON_ARRAYAGG(pf.feature) AS features
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN product_specifications ps ON p.id = ps.product_id
LEFT JOIN product_features pf ON p.id = pf.product_id
WHERE p.slug = 'hotel-white-stripe-bedding-set'
AND p.is_active = TRUE
GROUP BY p.id;

-- Insert new product
INSERT INTO products (id, code, name, slug, short_description, description, category_id, is_featured, is_active)
VALUES (
    UUID(),
    'A02',
    'Hotel Premium Pillowcase Set',
    'hotel-premium-pillowcase-set',
    'ชุดปลอกหมอนเกรดโรงแรม เนื้อผ้าดี นุ่มสะบาย',
    'ชุดปลอกหมอนสีขาวเกรดโรงแรม ผลิตจากผ้าคุณภาพสูง ให้สัมผัสนุ่ม สะบาย...',
    (SELECT id FROM product_categories WHERE slug = 'bedding'),
    FALSE,
    TRUE
);

-- Insert product images
INSERT INTO product_images (id, product_id, url, alt, is_thumbnail, display_order)
VALUES 
    (UUID(), (SELECT id FROM products WHERE slug = 'hotel-premium-pillowcase-set'), 'https://...jpg', 'Premium pillowcase', TRUE, 0),
    (UUID(), (SELECT id FROM products WHERE slug = 'hotel-premium-pillowcase-set'), 'https://...jpg', 'Pillowcase detail', FALSE, 1);

-- Insert product areas
INSERT INTO product_areas (id, product_id, area)
VALUES 
    (UUID(), (SELECT id FROM products WHERE slug = 'hotel-premium-pillowcase-set'), 'BEDROOM'),
    (UUID(), (SELECT id FROM products WHERE slug = 'hotel-premium-pillowcase-set'), 'GUEST_ROOM');

-- Insert product specifications
INSERT INTO product_specifications (id, product_id, label, value, display_order)
VALUES 
    (UUID(), (SELECT id FROM products WHERE slug = 'hotel-premium-pillowcase-set'), 'Material', '100% Cotton', 0),
    (UUID(), (SELECT id FROM products WHERE slug = 'hotel-premium-pillowcase-set'), 'Size', '50x75 cm', 1),
    (UUID(), (SELECT id FROM products WHERE slug = 'hotel-premium-pillowcase-set'), 'Color', 'White', 2);

-- Insert product features
INSERT INTO product_features (id, product_id, feature, display_order)
VALUES 
    (UUID(), (SELECT id FROM products WHERE slug = 'hotel-premium-pillowcase-set'), 'เนื้อผ้านุ่ม ระบายอากาศดี', 0),
    (UUID(), (SELECT id FROM products WHERE slug = 'hotel-premium-pillowcase-set'), 'สีขาว มาตรฐานโรงแรม', 1),
    (UUID(), (SELECT id FROM products WHERE slug = 'hotel-premium-pillowcase-set'), 'ทนทานต่อการซัก', 2);


-- =====================================================
-- UPDATE QUERIES
-- =====================================================

-- Update blog post
UPDATE blog_posts
SET title = 'New Title', 
    summary = 'New summary',
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'why-hotels-use-white-bed-sheets';

-- Update product
UPDATE products
SET short_description = 'Updated description',
    is_featured = TRUE,
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'hotel-white-stripe-bedding-set';

-- Update product category
UPDATE product_categories
SET name = 'Premium Bedding',
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'bedding';


-- =====================================================
-- DELETE QUERIES
-- =====================================================

-- Soft delete blog post (set inactive)
UPDATE blog_posts
SET is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'old-blog-post';

-- Hard delete blog post and related data
DELETE FROM blog_post_relations 
WHERE post_id = (SELECT id FROM blog_posts WHERE slug = 'to-delete-post')
OR related_post_id = (SELECT id FROM blog_posts WHERE slug = 'to-delete-post');

DELETE FROM blog_posts WHERE slug = 'to-delete-post';

-- Soft delete product
UPDATE products
SET is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'discontinued-product';

-- Hard delete product and all related data
DELETE FROM product_areas WHERE product_id = (SELECT id FROM products WHERE slug = 'to-delete-product');
DELETE FROM product_images WHERE product_id = (SELECT id FROM products WHERE slug = 'to-delete-product');
DELETE FROM product_specifications WHERE product_id = (SELECT id FROM products WHERE slug = 'to-delete-product');
DELETE FROM product_features WHERE product_id = (SELECT id FROM products WHERE slug = 'to-delete-product');
DELETE FROM products WHERE slug = 'to-delete-product';


-- =====================================================
-- ANALYTICS & REPORTING QUERIES
-- =====================================================

-- Count products by category
SELECT 
    pc.name,
    COUNT(p.id) AS product_count
FROM product_categories pc
LEFT JOIN products p ON pc.id = p.category_id AND p.is_active = TRUE
GROUP BY pc.id, pc.name
ORDER BY product_count DESC;

-- Get most appeared blog posts (by relations)
SELECT 
    bp.slug,
    bp.title,
    COUNT(bpr.id) AS relation_count
FROM blog_posts bp
LEFT JOIN blog_post_relations bpr ON bp.id = bpr.post_id
WHERE bp.is_active = TRUE
GROUP BY bp.id, bp.slug, bp.title
ORDER BY relation_count DESC;

-- Get products with most images
SELECT 
    p.name,
    p.slug,
    COUNT(pi.id) AS image_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, p.slug
ORDER BY image_count DESC;

-- Get featured products count by category
SELECT 
    pc.name,
    COUNT(p.id) AS featured_count
FROM product_categories pc
LEFT JOIN products p ON pc.id = p.category_id 
    AND p.is_active = TRUE 
    AND p.is_featured = TRUE
GROUP BY pc.id, pc.name
HAVING featured_count > 0
ORDER BY featured_count DESC;
