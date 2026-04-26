import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  sort: z
    .enum(['createdAt_desc', 'createdAt_asc', 'healthScore_desc', 'healthScore_asc'])
    .default('createdAt_desc'),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
