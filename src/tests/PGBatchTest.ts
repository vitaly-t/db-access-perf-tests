import {UsageStats} from "../UsageStats";

const pgp = require('pg-promise')({noWarnings: true});
import {Document} from "../Document";

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
        let db = pgp({
            host: "localhost",
            port: 5432,
            user: "postgres",
            password: "test",
            database: "perf_test"
        });

        let start = new Date().getTime();
        const us = new UsageStats();
        us.start();

        const sql = pgp.helpers.insert(docs, cs) + ` ON CONFLICT (id) DO UPDATE SET
                "docsId" = excluded."docId",
                label = excluded.label,
                context = excluded.context,
                distributions = excluded.distributions,
                date = excluded.date`;

        return db.none(sql)
            .then(() => {
                let end = new Date().getTime();
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
