import { z } from 'zod';

export const createProductSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
