import {UsageStats} from "../UsageStats";

const pgp = require('pg-promise')();
import {Document} from "../Document";

const db = pgp({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "test",
    database: "perf_test"
});

const cs = new pgp.helpers.ColumnSet([
    'id',
    'docId',
    'label',
    'context',
    'distributions:json',
    'date'
], {table: 'document'});

export class PGBatchTest {

    public static start(docs: Document[]) {

        const start = Date.now();
        const us = new UsageStats();
        us.start();

        const sql = pgp.helpers.insert(docs, cs) + ` ON CONFLICT (id) DO UPDATE SET
                "docsId" = EXCLUDED."docId",
                label = EXCLUDED.label,
                context = EXCLUDED.context,
                distributions = EXCLUDED.distributions,
                date = EXCLUDED.date`;

        return db.none(sql)
            .then(() => {
                const end = Date.now();
                const stats = us.stop();

                console.log("[PG-Batch] Call to persist took " + (end - start) + " milliseconds.");
                // console.log(`
                // 	avg cpu: ${stats.avgCpu}
                // 	avg memory: ${stats.avgMemory}
                // `);
                pgp.end();
            })
    }
}
