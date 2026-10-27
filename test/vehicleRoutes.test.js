
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../src/app');
const vehicleService = require('../src/services/vehicleService');

let server;
let baseUrl;

const originalGetAllVehicles = vehicleService.getAllVehicles;
const originalGetVehicleById = vehicleService.getVehicleById;

before(async () => {
  // Mock the service so tests never query or modify the real database.
  vehicleService.getAllVehicles = async () => [
    { vehicle_id: 9001, plate_number: 'TEST-001' },
    { vehicle_id: 9002, plate_number: 'TEST-002' }
  ];

  vehicleService.getVehicleById = async (id) => {
    if (String(id) === '9001') {
      return { vehicle_id: 9001, plate_number: 'TEST-001' };
    }

    return null;
  };

  server = app.listen(0);

  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  vehicleService.getAllVehicles = originalGetAllVehicles;
  vehicleService.getVehicleById = originalGetVehicleById;

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});

test('GET /api/vehicles returns a list of vehicles', async () => {
  const response = await fetch(`${baseUrl}/api/vehicles`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.count, 2);
  assert.equal(body.data[0].plate_number, 'TEST-001');
});

test('GET /api/vehicles/9001 returns the requested vehicle', async () => {
  const response = await fetch(`${baseUrl}/api/vehicles/9001`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.vehicle_id, 9001);
  assert.equal(body.data.plate_number, 'TEST-001');
});

test('GET /api/vehicles/abc rejects an invalid vehicle ID', async () => {
  const response = await fetch(`${baseUrl}/api/vehicles/abc`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Vehicle ID must be a positive integer');
});

test('GET /api/vehicles/999999 returns 404 when the vehicle is missing', async () => {
  const response = await fetch(`${baseUrl}/api/vehicles/999999`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error, 'Vehicle not found');
});
