#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/bd6cd4febdccf911cbc0230a0ee66d1eeb16a0f11a9a95931dbe32fc35a3feeb/contract';
import startContract from '../../snapshots/bd6cd4febdccf911cbc0230a0ee66d1eeb16a0f11a9a95931dbe32fc35a3feeb/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e65978b9001e4c45f97a621cd4c55c0f01c3e26d0a98d8860de746c8a678050f/contract';
import endContract from '../../snapshots/e65978b9001e4c45f97a621cd4c55c0f01c3e26d0a98d8860de746c8a678050f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'Post' }),
      this.dropTable({ schema: 'public', table: 'User' }),
      this.createTable({
        schema: 'public',
        table: 'JobApplication',
        columns: [
          col('atsKeywordsIncluded', 'jsonb', {
            notNull: true,
            codecRef: { codecId: 'pg/jsonb@1' },
          }),
          col('company', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('cons', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('dateAdded', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('dateApplied', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('estimatedSeniority', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('fitScore', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('interviewTips', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('keyPitchAngle', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('location', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('matchingSkills', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('missingSkills', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('outcomeReason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('pros', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('qaPairs', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('reasoning', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('recommendation', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('recommendationHeadline', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('salaryRange', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('sourceText', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('tailoredCoverLetterMarkdown', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('tailoredHeadline', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('tailoredResumeMarkdown', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('tailoredSummary', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('workType', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'MasterProfile',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('education', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('experiences', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('githubUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('headline', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('linkedinUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('location', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('portfolioUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('projects', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('skills', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('summary', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('targetRoles', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('targetSalary', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
