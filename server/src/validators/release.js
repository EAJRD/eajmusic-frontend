import { z } from 'zod';

const trackSchema = z.object({
  title: z.string().min(1, 'Track title is required').max(500),
  version: z.string().max(100).optional().nullable(),
  trackNumber: z.number().int().positive(),
  discNumber: z.number().int().positive().default(1),
  isrc: z.string().length(12, 'ISRC must be 12 characters').optional().nullable(),
  isExplicit: z.boolean().default(false),
  lyrics: z.string().optional().nullable(),
  lyricsLanguage: z.string().length(2).optional().nullable(),
  audioKey: z.string().optional().nullable(), // S3 key or local path
});

const contributorSchema = z.object({
  name: z.string().min(1, 'Contributor name is required').max(255),
  role: z.enum([
    'PRIMARY_ARTIST',
    'FEATURED',
    'PRODUCER',
    'SONGWRITER',
    'COMPOSER',
    'LYRICIST',
    'MIXER',
    'MASTERING',
  ]),
  royaltyPercentage: z.number().min(0).max(100).default(0),
  ipiNumber: z.string().max(20).optional().nullable(),
});

export const createReleaseSchema = z.object({
  // Basic info
  title: z.string().min(1, 'Title is required').max(500),
  version: z.string().max(100).optional().nullable(),
  releaseType: z.enum(['SINGLE', 'EP', 'ALBUM', 'COMPILATION']),
  genre: z.string().min(1, 'Genre is required').max(100),
  subgenre: z.string().max(100).optional().nullable(),
  language: z.string().length(2).default('EN'),

  // Dates
  releaseDate: z.string().refine((date) => {
    const releaseDate = new Date(date);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 14); // Minimum 14 days from now
    return releaseDate >= minDate;
  }, 'Release date must be at least 14 days in the future'),
  originalReleaseDate: z.string().optional().nullable(),

  // Identifiers
  upc: z.string().length(13, 'UPC must be 13 digits').optional().nullable(),
  catalogNumber: z.string().max(50).optional().nullable(),

  // Rights
  cLineYear: z.number().int().min(1900).max(2100).optional().nullable(),
  cLineText: z.string().max(255).optional().nullable(),
  pLineYear: z.number().int().min(1900).max(2100).optional().nullable(),
  pLineText: z.string().max(255).optional().nullable(),

  // Flags
  isExplicit: z.boolean().default(false),

  // Distribution
  selectedStores: z.array(z.string()).default(['all']),
  territories: z.array(z.string()).default(['worldwide']),

  // Cover art
  coverArtKey: z.string().optional().nullable(),

  // Tracks
  tracks: z.array(trackSchema).min(1, 'At least one track is required'),

  // Artist profile
  artistProfileId: z.string().uuid().optional().nullable(),
  labelId: z.string().uuid().optional().nullable(),
});

export const updateReleaseSchema = createReleaseSchema.partial().extend({
  status: z.enum(['DRAFT', 'PENDING']).optional(),
});

export const submitReleaseSchema = z.object({
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

export const trackContributorsSchema = z.object({
  trackId: z.string().uuid(),
  contributors: z.array(contributorSchema).min(1, 'At least one contributor is required'),
});

export const adminReviewSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().max(1000).optional().nullable(),
});
