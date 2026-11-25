#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/5b8f49cd4476c2e9429e6aaa96d1974953bfb28be2b740b40145bd5f53afddf8/contract';
import endContract from '../../snapshots/5b8f49cd4476c2e9429e6aaa96d1974953bfb28be2b740b40145bd5f53afddf8/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/8bef07bebcd39bcfbb627640e8a9f22c23d5d030a2401210b1a0f563078e9a79/contract';
import startContract from '../../snapshots/8bef07bebcd39bcfbb627640e8a9f22c23d5d030a2401210b1a0f563078e9a79/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'JobApplication',
        column: col('interviewStages', 'jsonb', { codecRef: { codecId: 'pg/jsonb@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'JobApplication',
        column: col('nextAction', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'JobApplication',
        column: col('nextActionAt', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
