// =====================================================
// TypeScript Types for Database Schema
// Matching SQL structure from schema.sql
// =====================================================

// =====================================================
// BLOG POSTS TYPES
// =====================================================

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string; // HTML content
  intro?: string;
  seoH2?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostCreate extends Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> {}
export interface BlogPostUpdate extends Partial<BlogPostCreate> {}

export interface BlogPostRelation {
  id: string;
  postId: string;
  relatedPostId: string;
  createdAt: Date;
}

export type BlogPostFull = BlogPost & {
  relatedPosts?: BlogPost[];
};


// =====================================================
// PRODUCT TYPES
// =====================================================

export enum ProductArea {
  GUEST_ROOM = 'GUEST_ROOM',
  BATHROOM = 'BATHROOM',
  LOBBY = 'LOBBY',
  RESTAURANT = 'RESTAURANT',
  HOUSEKEEPING = 'HOUSEKEEPING',
  BEDROOM = 'BEDROOM',
  SPA = 'SPA',
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategoryCreate extends Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'> {}
export interface ProductCategoryUpdate extends Partial<ProductCategoryCreate> {}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  isThumbnail: boolean;
  displayOrder: number;
  createdAt: Date;
}

export interface ProductImageCreate extends Omit<ProductImage, 'id' | 'createdAt'> {}

export interface ProductSpecification {
  id: string;
  productId: string;
  label: string;
  value: string;
  displayOrder: number;
}

export interface ProductSpecificationCreate extends Omit<ProductSpecification, 'id'> {}

export interface ProductFeature {
  id: string;
  productId: string;
  feature: string;
  displayOrder: number;
}

export interface ProductFeatureCreate extends Omit<ProductFeature, 'id'> {}

export interface Product {
  id: string;
  code: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  categoryId: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCreate extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {}
export interface ProductUpdate extends Partial<ProductCreate> {}

export type ProductFull = Product & {
  category: ProductCategory;
  areas: ProductArea[];
  images: ProductImage[];
  specifications: ProductSpecification[];
  features: ProductFeature[];
  thumbnail?: ProductImage;
};


// =====================================================
// CONTACT INFORMATION TYPES
// =====================================================

export interface ContactInfo {
  id: string;
  companyNameEn?: string;
  companyNameTh?: string;
  phone?: string;
  email?: string;
  address?: string;
  updatedAt: Date;
}

export interface ContactInfoCreate extends Omit<ContactInfo, 'id' | 'updatedAt'> {}
export interface ContactInfoUpdate extends Partial<ContactInfoCreate> {}


// =====================================================
// DATABASE QUERY RESPONSE TYPES
// =====================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// View types
export interface ProductFullView extends Product {
  categoryName: string;
  categorySlug: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
}

export interface ProductAreaView {
  id: string;
  name: string;
  slug: string;
  areas: ProductArea[];
}
