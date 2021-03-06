"use strict";

const JsonFileTelemetryFetcher = require('./JsonFileTelemetryFetcher');
const DbManager = require('../db/DbManager');
const TelemetryParser = require('../../defs/TelemetryParser');

const config = {
    "debug": true
};

const def = {
    parser: "NA",
    fetcher: "JSON",
    type: "fc",
    structPath: "defs/structs/fc_v0.0.3_GeneralT_file.txt",
    filePath: ""
};

let db = new DbManager(config);
let parser = new TelemetryParser([def]);

test('no file input yields empty output', async () => {
    let fetcher = new JsonFileTelemetryFetcher(def, db, config, parser);
    let result = await fetcher.fetch();

    expect(result).toEqual([]);
});

test('invalid (non-JSON) file input yields empty output', async () => {
    def.filePath = "server/telemetry/JsonFileTelemetryFetcher.js";

    let fetcher = new JsonFileTelemetryFetcher(def, db, config, parser);
    let result = await fetcher.fetch();

    expect(result).toEqual([]);
});

test('valid input file yields non-empty output', async () => {
    def.filePath = "samples/fc_test_archive_v.json";

    let fetcher = new JsonFileTelemetryFetcher(def, db, config, parser);
    let result = await fetcher.fetch();

    expect(result).not.toEqual([]);
    expect(result.length).toBeGreaterThan(0);
});

test('starting fetcher returns data to callback', () => {return new Promise(done => {
    def.filePath = "samples/fc_test_archive_v.json";
    let fetcher = new JsonFileTelemetryFetcher(def, db, config, parser);

    function callback(data) {
        try {
            expect(data).not.toEqual([]);
            expect(data.length).toBeGreaterThan(0);
            done();
        } catch (error) {
            done(error);
        }
    }

    fetcher.callback = callback;
    fetcher.start();
})});

test('can write fetched points to database', async () => {
    def.filePath = "samples/fc_test_archive_v.json";
    db.clearRows();

    let fetcher = new JsonFileTelemetryFetcher(def, db, config, parser);

    let points = await fetcher.fetch();
    fetcher.store(points);

    let results = db.reader.read(def.type, 0, 9999999999999999);
    expect(results.length).toEqual(points.length);
});

test('does not write duplicate points to database', async () => {
    def.filePath = "samples/fc_test_archive_v.json";
    db.clearRows();

    let fetcher = new JsonFileTelemetryFetcher(def, db, config, parser);

    let points = await fetcher.fetch();

    fetcher.store(points);
    fetcher.store(points);
    fetcher.store(points);

    let results = db.reader.read(def.type, 0, 9999999999999999);
    expect(results.length).toEqual(points.length);
});

/* add test for fetcher calling callback after defined interval */
