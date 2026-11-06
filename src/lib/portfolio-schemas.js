
import { z } from "zod";

const optionalUrl = z.union([
  z.string().url(),
  z.literal(""),
]).optional();

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
});

// PROFILE
export const profileSchema = z.object({
  name: z.string().trim().min(1),
  designation: z.string().trim().min(1),
  headline: z.string().optional(),
  heroDescription: z.string().optional(),
  about: z.string().optional(),
  programmingJourney: z.string().optional(),
  interests: z.array(z.string()).default([]),
  profileImage: imageSchema.optional(),
  resumeUrl: optionalUrl,
  email: z.string().email(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  location: z.string().optional(),
});

// SKILL
export const skillSchema = z.object({
  name: z.string().trim().min(1),
  category: z.enum([
    "frontend",
    "backend",
    "database",
    "tools",
    "devops",
    "iot",
    "ai",
    "other",
  ]),
  description: z.string().optional(),
  icon: z.string().optional(),
  proficiencyLabel: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// PROJECT
export const projectSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().trim().min(1),
  description: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  challenges: z.string().optional(),
  futurePlans: z.array(z.string()).default([]),
  liveUrl: optionalUrl,
  githubUrl: optionalUrl,
  coverImage: imageSchema.optional(),
  gallery: z.array(imageSchema).default([]),
  status: z.enum(["completed", "in-progress", "planned"]),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// ACHIEVEMENT
export const achievementSchema = z.object({
  title: z.string().trim().min(1),
  issuer: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  credentialUrl: optionalUrl,
  image: imageSchema.optional(),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// EXPERIENCE
export const experienceSchema = z.object({
  company: z.string().trim().min(1),
  role: z.string().trim().min(1),
  employmentType: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  responsibilities: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// EDUCATION
export const educationSchema = z.object({
  institution: z.string().trim().min(1),
  degree: z.string().trim().min(1),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["studying", "completed"]).default("studying"),
  description: z.string().optional(),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// CERTIFICATION
export const certificationSchema = z.object({
  name: z.string().trim().min(1),
  issuer: z.string().trim().min(1),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: optionalUrl,
  image: imageSchema.optional(),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// SOCIAL LINKS
export const socialLinkSchema = z.object({
  platform: z.string().trim().min(1),
  label: z.string().trim().min(1),
  url: z.string().url(),
  icon: z.string().optional(),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional().default(""),
});