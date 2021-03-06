"use strict";

const MetadataServer = require('./MetadataServer');
const Config = require('../../shared/Config');
const MctDepot = require('../MctDepot');
const supertest = require('supertest');
const NATelemetryDefinition = require('../../defs/NATelemetryDefinition');

const def = {
    "type": "fc",
    "name": "Flight Computer",
    "parser": "NA",
    "structPath": "defs/structs/fc_v0.0.3_GeneralT_file.txt"
}

const config = new Config();
config.debug = true;

const depotInstance = new MctDepot(config);
const definition = new NATelemetryDefinition(def);
const metadataServer = new MetadataServer(def, definition.getMctMetadata());

const testUrl = '/' + def.type + '/metadata';

depotInstance.server.use(testUrl, metadataServer.router);

const request = supertest(depotInstance.server);

test('metadata server responds to HTTP GET for fc metadata', async () => {
    const response = await request.get(testUrl);

    expect(response.statusCode).toBe(200);
});

test('metadata server returns non-empty fc metadata', async () => {
    const response = await request.get(testUrl);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(definition.getMctMetadata());
});
