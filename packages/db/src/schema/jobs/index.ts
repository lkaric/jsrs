import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { organization, user } from '../auth/index';

// ── Enums ────────────────────────────────────────────────────────────────────

export const companySizeRangeEnum = pgEnum('company_size_range', [
  '1_10',
  '11_50',
  '51_200',
  '201_500',
  '501_1000',
  '1001_5000',
  '5001_plus',
]);

export const remoteTypeEnum = pgEnum('remote_type', ['onsite', 'hybrid', 'remote']);

export const employmentTypeEnum = pgEnum('employment_type', [
  'full_time',
  'part_time',
  'contract',
  'internship',
]);

export const jobStatusEnum = pgEnum('job_status', ['draft', 'published', 'closed']);

export const applicationStatusEnum = pgEnum('application_status', [
  'submitted',
  'reviewing',
  'interview',
  'offer',
  'rejected',
]);

// ── Tables ───────────────────────────────────────────────────────────────────

export const companies = pgTable(
  'company',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    // FK into auth domain — the org owns this company profile
    organizationId: text('organization_id')
      .notNull()
      .unique()
      .references(() => organization.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    website: text('website'),
    logoUrl: text('logo_url'),
    description: text('description'),
    industry: text('industry'),
    sizeRange: companySizeRangeEnum('size_range'),
    verified: boolean('verified').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('company_slug_uidx').on(table.slug),
    uniqueIndex('company_organization_id_uidx').on(table.organizationId),
  ],
);

export const jobs = pgTable(
  'job',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    companyId: text('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    location: text('location'),
    remoteType: remoteTypeEnum('remote_type').notNull().default('onsite'),
    employmentType: employmentTypeEnum('employment_type').notNull().default('full_time'),
    salaryMin: integer('salary_min'),
    salaryMax: integer('salary_max'),
    currency: text('currency').notNull().default('USD'),
    skills: text('skills').array().notNull().default([]),
    status: jobStatusEnum('status').notNull().default('draft'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('job_company_id_idx').on(table.companyId),
    index('job_status_idx').on(table.status),
  ],
);

export const applications = pgTable(
  'application',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    jobId: text('job_id')
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    // FK into auth domain — the applicant
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    resumeUrl: text('resume_url'),
    coverLetter: text('cover_letter'),
    status: applicationStatusEnum('status').notNull().default('submitted'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('application_job_user_uidx').on(table.jobId, table.userId),
    index('application_job_id_idx').on(table.jobId),
    index('application_user_id_idx').on(table.userId),
  ],
);

// ── Relations ────────────────────────────────────────────────────────────────

export const companiesRelations = relations(companies, ({ one, many }) => ({
  organization: one(organization, {
    fields: [companies.organizationId],
    references: [organization.id],
  }),
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  user: one(user, {
    fields: [applications.userId],
    references: [user.id],
  }),
}));
