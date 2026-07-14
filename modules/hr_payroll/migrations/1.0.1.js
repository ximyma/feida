// 1.0.0 → 1.0.1 迁移: 添加 payroll_records 索引
module.exports = function(db) {
  try {
    db.exec('CREATE INDEX IF NOT EXISTS idx_payroll_employeeId ON payroll_records(employeeId)');
  } catch(e) { /* index may exist */ }
};
