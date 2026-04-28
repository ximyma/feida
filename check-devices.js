const D = require('better-sqlite3');
const db = new D('./data/ehr.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
const hasDevices = tables.includes('attendance_devices');
const hasLeaveRules = tables.includes('leave_rule_configs');
console.log('attendance_devices:', hasDevices ? 'EXISTS' : 'MISSING');
console.log('leave_rule_configs:', hasLeaveRules ? 'EXISTS' : 'MISSING');
if (!hasDevices) {
  db.exec(`CREATE TABLE IF NOT EXISTS attendance_devices (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, deviceType TEXT NOT NULL DEFAULT 'app',
    status TEXT DEFAULT 'unconfigured', config TEXT DEFAULT '{}',
    lastSyncAt TEXT, syncCount INTEGER DEFAULT 0, remark TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log('Created attendance_devices');
}
if (!hasLeaveRules) {
  db.exec(`CREATE TABLE IF NOT EXISTS leave_rule_configs (
    id TEXT PRIMARY KEY, annualDays INTEGER DEFAULT 15, carryoverDays INTEGER DEFAULT 5,
    maxDays INTEGER DEFAULT 30, accrueMonth INTEGER DEFAULT 1, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log('Created leave_rule_configs');
}
console.log('Done');
