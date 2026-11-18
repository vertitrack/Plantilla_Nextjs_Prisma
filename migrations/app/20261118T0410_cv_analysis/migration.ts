#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/8bef07bebcd39bcfbb627640e8a9f22c23d5d030a2401210b1a0f563078e9a79/contract';
import endContract from '../../snapshots/8bef07bebcd39bcfbb627640e8a9f22c23d5d030a2401210b1a0f563078e9a79/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e65978b9001e4c45f97a621cd4c55c0f01c3e26d0a98d8860de746c8a678050f/contract';
import startContract from '../../snapshots/e65978b9001e4c45f97a621cd4c55c0f01c3e26d0a98d8860de746c8a678050f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'MasterProfile',
        column: col('cvAnalysis', 'jsonb', { codecRef: { codecId: 'pg/jsonb@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'MasterProfile',
        column: col('cvAnalyzedAt', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
