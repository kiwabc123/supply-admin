-- =====================================================
-- Company Web Project SQL Schema
-- BlogPost and Product Management System
-- =====================================================

-- =====================================================
-- BLOG POSTS TABLES
-- =====================================================

-- Blog Posts Table
CREATE TABLE blog_posts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    intro TEXT,
    seoH2 VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_slug (slug),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blog Post Related Slugs (Many-to-Many)
CREATE TABLE blog_post_relations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id VARCHAR(36) NOT NULL,
    related_post_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (related_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_relation (post_id, related_post_id),
    INDEX idx_post_id (post_id),
    INDEX idx_related_post_id (related_post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- PRODUCT TABLES
-- =====================================================

-- Product Categories Table
CREATE TABLE product_categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    short_description VARCHAR(1000),
    description LONGTEXT,
    category_id VARCHAR(36) NOT NULL,
    
    -- Status
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE RESTRICT,
    
    INDEX idx_slug (slug),
    INDEX idx_code (code),
    INDEX idx_category_id (category_id),
    INDEX idx_is_featured (is_featured),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Areas (Many-to-Many)
-- Areas: GUEST_ROOM, BATHROOM, LOBBY, RESTAURANT, HOUSEKEEPING, BEDROOM, SPA
CREATE TABLE product_areas (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36) NOT NULL,
    area ENUM('GUEST_ROOM', 'BATHROOM', 'LOBBY', 'RESTAURANT', 'HOUSEKEEPING', 'BEDROOM', 'SPA') NOT NULL,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_product_area (product_id, area),
    INDEX idx_product_id (product_id),
    INDEX idx_area (area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Images Table
CREATE TABLE product_images (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36) NOT NULL,
    url TEXT NOT NULL,
    alt VARCHAR(500),
    is_thumbnail BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    INDEX idx_product_id (product_id),
    INDEX idx_is_thumbnail (is_thumbnail),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Specifications Table
CREATE TABLE product_specifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36) NOT NULL,
    label VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    display_order INT DEFAULT 0,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    INDEX idx_product_id (product_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Features Table
CREATE TABLE product_features (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36) NOT NULL,
    feature TEXT NOT NULL,
    display_order INT DEFAULT 0,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    INDEX idx_product_id (product_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- ADDITIONAL TABLES
-- =====================================================

-- Contact Information Table
CREATE TABLE contact_info (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_name_en VARCHAR(255),
    company_name_th VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_contact (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- VIEWS
-- =====================================================

-- Full Product View with all related data
CREATE VIEW v_products_full AS
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
    p.updated_at,
    (SELECT url FROM product_images WHERE product_id = p.id AND is_thumbnail = TRUE LIMIT 1) AS thumbnail_url,
    (SELECT alt FROM product_images WHERE product_id = p.id AND is_thumbnail = TRUE LIMIT 1) AS thumbnail_alt
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id;

-- Product with all areas
CREATE VIEW v_product_areas AS
SELECT 
    p.id,
    p.name,
    p.slug,
    GROUP_CONCAT(pa.area SEPARATOR ', ') AS areas
FROM products p
LEFT JOIN product_areas pa ON p.id = pa.product_id
GROUP BY p.id, p.name, p.slug;
