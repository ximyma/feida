import Database from 'better-sqlite3';
import * as path from 'path';

export class DatabaseService {
  public db!: Database.Database;

  onModuleInit() {
    const dbDir = path.join(process.cwd(), 'data');
    const dbPath = path.join(dbDir, 'ehr.db');
    const fs = require('fs');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.createTables();
    this.migrateColumns();
    this.migrateShopProductFks();
    this.seedDefaultData();
    console.log(`[Database] SQLite at ${dbPath}`);
  }

  private createTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, employeeId TEXT UNIQUE NOT NULL,
        department TEXT, position TEXT, rank TEXT, status TEXT DEFAULT 'active',
        hireDate TEXT, phone TEXT, email TEXT, salaryLocation TEXT DEFAULT 'shenzhen',
        birthday TEXT, gender TEXT, idCard TEXT, address TEXT,
        emergencyContact TEXT, emergencyPhone TEXT, education TEXT, major TEXT,
        probationEnd TEXT, bankCard TEXT, socialSecurityNo TEXT,
        contractId TEXT, headcountId TEXT, sortOrder INTEGER DEFAULT 0,
        isExemptAttendance INTEGER DEFAULT 0, isActive INTEGER DEFAULT 1,
        selfServiceUserId TEXT, tags TEXT DEFAULT '[]', remark TEXT,
        deptId TEXT, positionId TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, parentId TEXT,
        level INTEGER DEFAULT 1, managerId TEXT, headcountPlan INTEGER DEFAULT 0,
        headcountActual INTEGER DEFAULT 0, sortOrder INTEGER DEFAULT 0,
        isActive INTEGER DEFAULT 1, code TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS positions (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, departmentId TEXT,
        level TEXT, rankId TEXT, headcountPlan INTEGER DEFAULT 0,
        headcountActual INTEGER DEFAULT 0, sortOrder INTEGER DEFAULT 0,
        isActive INTEGER DEFAULT 1, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS ranks (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, level INTEGER,
        baseSalary REAL DEFAULT 0, positionSalary REAL DEFAULT 0,
        mealAllowance REAL DEFAULT 0, transportAllowance REAL DEFAULT 0,
        salaryRange TEXT, description TEXT, isActive INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, realName TEXT NOT NULL,
        phone TEXT, email TEXT, password TEXT, userType TEXT DEFAULT 'employee',
        roleIds TEXT DEFAULT '[]', status TEXT DEFAULT 'active', employeeId TEXT,
        lastLoginAt TEXT, lastLoginIp TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT UNIQUE NOT NULL,
        description TEXT, permissionIds TEXT DEFAULT '[]', type TEXT DEFAULT 'custom',
        isActive INTEGER DEFAULT 1, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS permissions (
        id TEXT PRIMARY KEY, moduleName TEXT NOT NULL, moduleKey TEXT UNIQUE NOT NULL,
        actions TEXT DEFAULT '[]', description TEXT
      );
      CREATE TABLE IF NOT EXISTS shift_types (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT DEFAULT 'regular',
        startTime TEXT DEFAULT '09:00', endTime TEXT DEFAULT '18:00',
        lateThreshold INTEGER DEFAULT 15, earlyLeaveThreshold INTEGER DEFAULT 15,
        overtimeThreshold INTEGER DEFAULT 30, workHours REAL DEFAULT 8,
        isActive INTEGER DEFAULT 1, remark TEXT, color TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        department TEXT, date TEXT NOT NULL, shiftTypeId TEXT, shiftTypeName TEXT,
        scheduledStart TEXT, scheduledEnd TEXT,
        isRestDay INTEGER DEFAULT 0, isHoliday INTEGER DEFAULT 0, remark TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(employeeId, date)
      );
      CREATE TABLE IF NOT EXISTS attendance_records (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT, date TEXT NOT NULL,
        shiftTypeId TEXT, shiftTypeName TEXT, scheduledStart TEXT, scheduledEnd TEXT,
        clockIn TEXT, clockOut TEXT, workHours REAL DEFAULT 0,
        lateMinutes INTEGER DEFAULT 0, earlyLeaveMinutes INTEGER DEFAULT 0,
        status TEXT DEFAULT 'normal', lateCount INTEGER DEFAULT 0,
        isRestDay INTEGER DEFAULT 0, isHoliday INTEGER DEFAULT 0, remark TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(employeeId, date)
      );
      CREATE TABLE IF NOT EXISTS leave_records (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        leaveType TEXT DEFAULT 'personal', startDate TEXT, endDate TEXT,
        totalDays REAL DEFAULT 0, reason TEXT, status TEXT DEFAULT 'pending',
        approver TEXT, approveTime TEXT, rejectReason TEXT,
        handlerId TEXT, handlerName TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS leave_balances (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, year TEXT NOT NULL,
        leaveType TEXT NOT NULL, totalDays REAL DEFAULT 0, usedDays REAL DEFAULT 0,
        pendingDays REAL DEFAULT 0, availableDays REAL DEFAULT 0,
        lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(employeeId, year, leaveType)
      );
      CREATE TABLE IF NOT EXISTS overtime_records (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        date TEXT NOT NULL, hours REAL DEFAULT 0, overtimeType TEXT DEFAULT 'workday',
        reason TEXT, status TEXT DEFAULT 'pending', approver TEXT, approveTime TEXT,
        handlerId TEXT, handlerName TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS shift_change_requests (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        date TEXT NOT NULL, originalShiftId TEXT, targetShiftId TEXT,
        reason TEXT, status TEXT DEFAULT 'pending',
        approver TEXT, approveTime TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS attendance_rules (
        id TEXT PRIMARY KEY, name TEXT NOT NULL,
        annualLeaveBase INTEGER DEFAULT 5, annualLeaveIncrement INTEGER DEFAULT 1,
        annualLeaveMax INTEGER DEFAULT 15, annualLeaveCarryOver INTEGER DEFAULT 0,
        annualLeaveCarryMax INTEGER DEFAULT 5, annualLeaveExpireMonths INTEGER DEFAULT 12,
        defaultAttendanceMode TEXT DEFAULT 'app',
        appCheckLocations TEXT DEFAULT '[]', latePenaltyRule TEXT DEFAULT '{}',
        absentPenaltyRule TEXT DEFAULT '{}', exemptEmployeeIds TEXT DEFAULT '[]',
        isActive INTEGER DEFAULT 1, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS check_locations (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, address TEXT,
        latitude REAL DEFAULT 0, longitude REAL DEFAULT 0, radius INTEGER DEFAULT 100,
        isActive INTEGER DEFAULT 1, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS daily_attendance_reports (
        id TEXT PRIMARY KEY, date TEXT NOT NULL, department TEXT,
        totalEmployees INTEGER DEFAULT 0, normalCount INTEGER DEFAULT 0,
        lateCount INTEGER DEFAULT 0, earlyLeaveCount INTEGER DEFAULT 0,
        absentCount INTEGER DEFAULT 0, leaveCount INTEGER DEFAULT 0,
        overtimeCount INTEGER DEFAULT 0, data TEXT DEFAULT '{}',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(date, department)
      );
      CREATE TABLE IF NOT EXISTS monthly_attendance_summary (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        department TEXT, month TEXT NOT NULL,
        totalWorkDays INTEGER DEFAULT 0, actualWorkDays INTEGER DEFAULT 0,
        absentDays REAL DEFAULT 0, lateCount INTEGER DEFAULT 0,
        lateMinutesTotal INTEGER DEFAULT 0, earlyLeaveCount INTEGER DEFAULT 0,
        overtimeWorkday REAL DEFAULT 0, overtimeRestday REAL DEFAULT 0,
        overtimeHoliday REAL DEFAULT 0, leaveTotal REAL DEFAULT 0,
        effectiveHours REAL DEFAULT 0, data TEXT DEFAULT '{}',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(employeeId, month)
      );
      CREATE TABLE IF NOT EXISTS salaries (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT, month TEXT NOT NULL,
        baseSalary REAL DEFAULT 0, positionSalary REAL DEFAULT 0, performance REAL DEFAULT 0,
        overtime REAL DEFAULT 0, mealAllowance REAL DEFAULT 0, transportAllowance REAL DEFAULT 0,
        otherAllowance REAL DEFAULT 0, socialInsurance REAL DEFAULT 0, medicalInsurance REAL DEFAULT 0,
        housingFund REAL DEFAULT 0, otherDeduction REAL DEFAULT 0, tax REAL DEFAULT 0,
        grossSalary REAL DEFAULT 0, netSalary REAL DEFAULT 0,
        companyPension REAL DEFAULT 0, companyMedical REAL DEFAULT 0, companyUnemployment REAL DEFAULT 0,
        companyInjury REAL DEFAULT 0, companyMaternity REAL DEFAULT 0, companyHousingFund REAL DEFAULT 0,
        companyTotal REAL DEFAULT 0, location TEXT,
        status TEXT DEFAULT 'draft', paidAt TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(employeeId, month)
      );
      CREATE TABLE IF NOT EXISTS salary_items (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT UNIQUE NOT NULL,
        type TEXT DEFAULT 'earnings', dataType TEXT DEFAULT 'number',
        decimalPlaces INTEGER DEFAULT 2, formula TEXT, defaultValue REAL DEFAULT 0,
        isTaxable INTEGER DEFAULT 1, sortOrder INTEGER DEFAULT 0,
        isActive INTEGER DEFAULT 1, category TEXT DEFAULT 'salary',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS salary_item_templates (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, rankId TEXT,
        items TEXT DEFAULT '[]', isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS salary_adjustments (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        month TEXT, itemType TEXT, itemName TEXT, amount REAL DEFAULT 0,
        reason TEXT, isRecurring INTEGER DEFAULT 0,
        startMonth TEXT, endMonth TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS location_allowances (
        id TEXT PRIMARY KEY, location TEXT NOT NULL, name TEXT,
        baseAmount REAL DEFAULT 0, housingSubsidy REAL DEFAULT 0,
        mealSubsidy REAL DEFAULT 0, transportSubsidy REAL DEFAULT 0,
        otherSubsidy REAL DEFAULT 0, isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS company_contributions (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, month TEXT NOT NULL,
        pension REAL DEFAULT 0, medical REAL DEFAULT 0, unemployment REAL DEFAULT 0,
        injury REAL DEFAULT 0, maternity REAL DEFAULT 0, housingFund REAL DEFAULT 0,
        enterpriseAnnuity REAL DEFAULT 0, total REAL DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(employeeId, month)
      );
      CREATE TABLE IF NOT EXISTS insurance_schemes (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL,
        pensionRate REAL DEFAULT 16, medicalRate REAL DEFAULT 10,
        unemploymentRate REAL DEFAULT 0.5, injuryRate REAL DEFAULT 0.5,
        maternityRate REAL DEFAULT 0.8, housingRateCompany REAL DEFAULT 7,
        housingRatePersonal REAL DEFAULT 7, baseMin REAL DEFAULT 5975,
        baseMax REAL DEFAULT 31014, isActive INTEGER DEFAULT 1,
        remark TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS insured_employees (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        department TEXT, idCard TEXT, schemeId TEXT, schemeName TEXT,
        baseAmount REAL DEFAULT 0, pensionBase REAL DEFAULT 0,
        medicalBase REAL DEFAULT 0, housingBase REAL DEFAULT 0,
        startDate TEXT, endDate TEXT,
        personalPension REAL DEFAULT 0, personalMedical REAL DEFAULT 0,
        personalUnemployment REAL DEFAULT 0, personalInjury REAL DEFAULT 0,
        personalMaternity REAL DEFAULT 0, personalHousing REAL DEFAULT 0,
        companyPension REAL DEFAULT 0, companyMedical REAL DEFAULT 0,
        companyUnemployment REAL DEFAULT 0, companyInjury REAL DEFAULT 0,
        companyMaternity REAL DEFAULT 0, companyHousing REAL DEFAULT 0,
        status TEXT DEFAULT 'insured', remark TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS insurance_changes (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        department TEXT, changeType TEXT NOT NULL, changeReason TEXT,
        schemeId TEXT, schemeName TEXT, baseAmount REAL DEFAULT 0,
        effectiveDate TEXT, handledBy TEXT, handledAt TEXT,
        status TEXT DEFAULT 'pending', remark TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS insurance_ledger (
        id TEXT PRIMARY KEY, month TEXT NOT NULL, department TEXT,
        employeeCount INTEGER DEFAULT 0,
        pensionTotal REAL DEFAULT 0, medicalTotal REAL DEFAULT 0,
        unemploymentTotal REAL DEFAULT 0, injuryTotal REAL DEFAULT 0,
        maternityTotal REAL DEFAULT 0, housingTotal REAL DEFAULT 0,
        totalPersonal REAL DEFAULT 0, totalCompany REAL DEFAULT 0,
        grandTotal REAL DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS contracts (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        contractType TEXT DEFAULT 'fixed', startDate TEXT, endDate TEXT,
        duration INTEGER DEFAULT 36, signCount INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active', remindDays INTEGER DEFAULT 30,
        attachment TEXT, remark TEXT, electronicContractId TEXT,
        signedAt TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS contract_templates (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, contractType TEXT,
        content TEXT, isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS recruitment_positions (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, department TEXT,
        headcount INTEGER DEFAULT 1, filledCount INTEGER DEFAULT 0,
        salaryRange TEXT, status TEXT DEFAULT 'active',
        priority TEXT DEFAULT 'normal', description TEXT, requirements TEXT,
        workLocation TEXT, employmentType TEXT DEFAULT 'fulltime',
        recruiterId TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT, email TEXT,
        gender TEXT, age INTEGER, education TEXT, major TEXT,
        positionId TEXT, positionTitle TEXT, source TEXT,
        status TEXT DEFAULT 'new', resumeUrl TEXT,
        currentCompany TEXT, currentPosition TEXT, expectedSalary TEXT,
        interviewDate TEXT, interviewResult TEXT, offerStatus TEXT,
        testScore REAL, interviewFeedback TEXT, tags TEXT DEFAULT '[]',
        talentPoolId TEXT, blacklisted INTEGER DEFAULT 0,
        remark TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS talent_pools (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT,
        description TEXT, candidateCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS interviews (
        id TEXT PRIMARY KEY, candidateId TEXT NOT NULL, candidateName TEXT,
        positionId TEXT, positionTitle TEXT,
        interviewRound INTEGER DEFAULT 1, interviewerId TEXT, interviewerName TEXT,
        interviewDate TEXT, interviewTime TEXT, interviewType TEXT DEFAULT 'onsite',
        location TEXT, status TEXT DEFAULT 'scheduled',
        result TEXT, score INTEGER, feedback TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS offers (
        id TEXT PRIMARY KEY, candidateId TEXT NOT NULL, candidateName TEXT,
        positionId TEXT, positionTitle TEXT,
        salary REAL, startDate TEXT, status TEXT DEFAULT 'pending',
        sentAt TEXT, acceptedAt TEXT, rejectedAt TEXT,
        signedContractUrl TEXT, remark TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY, candidateId TEXT NOT NULL,
        fileName TEXT, fileUrl TEXT, parseResult TEXT DEFAULT '{}',
        rawText TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS kpis (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT,
        weight INTEGER DEFAULT 10, target TEXT, description TEXT,
        scoringMethod TEXT DEFAULT 'manual', formula TEXT,
        dataSource TEXT, isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS performance_cycles (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, startDate TEXT, endDate TEXT,
        status TEXT DEFAULT 'draft', cycleType TEXT DEFAULT 'annual',
        participants INTEGER DEFAULT 0, completedCount INTEGER DEFAULT 0,
        gradeDistribution TEXT DEFAULT '{}',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS performance_records (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        cycleId TEXT, cycleName TEXT, kpiScores TEXT DEFAULT '{}',
        totalScore REAL DEFAULT 0, grade TEXT, level TEXT,
        selfScore REAL, managerScore REAL, hrScore REAL,
        feedback TEXT, improvement TEXT,
        status TEXT DEFAULT 'pending', submittedAt TEXT, reviewedAt TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS performance_grades (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, scoreMin REAL, scoreMax REAL,
        description TEXT, color TEXT, sortOrder INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS training_plans (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, department TEXT,
        trainer TEXT, targetEmployees TEXT DEFAULT '[]',
        startDate TEXT, endDate TEXT, location TEXT,
        status TEXT DEFAULT 'draft', content TEXT,
        cost REAL DEFAULT 0, participants INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS training_courses (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT,
        type TEXT DEFAULT 'video', url TEXT,
        duration INTEGER DEFAULT 0, description TEXT,
        isRequired INTEGER DEFAULT 0, isActive INTEGER DEFAULT 1,
        viewCount INTEGER DEFAULT 0, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS training_records (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        trainingPlanId TEXT, courseId TEXT, trainingType TEXT,
        trainingDate TEXT, duration INTEGER DEFAULT 0,
        score REAL, passed INTEGER DEFAULT 0,
        certificateNo TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS training_evaluations (
        id TEXT PRIMARY KEY, planId TEXT NOT NULL, employeeId TEXT,
        scores TEXT DEFAULT '{}', totalScore REAL DEFAULT 0,
        feedback TEXT, submittedAt TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      -- 学习进度表（视频断点、学习时长等）
      CREATE TABLE IF NOT EXISTS training_learning_progress (
        id TEXT PRIMARY KEY,
        employeeId TEXT NOT NULL,
        employeeName TEXT,
        courseId TEXT NOT NULL,
        courseName TEXT,
        planId TEXT,
        -- 视频学习进度
        videoPosition INTEGER DEFAULT 0,        -- 视频播放位置（秒）
        videoDuration INTEGER DEFAULT 0,        -- 视频总时长（秒）
        progressPercent REAL DEFAULT 0,         -- 学习进度百分比
        lastPosition INTEGER DEFAULT 0,         -- 上次保存的位置（秒）
        -- 学习状态
        status TEXT DEFAULT 'not_started',       -- not_started | in_progress | completed
        totalWatchTime INTEGER DEFAULT 0,       -- 累计观看时长（秒）
        watchCount INTEGER DEFAULT 0,            -- 观看次数
        -- 评估状态
        evaluationScore REAL,
        evaluationStatus TEXT DEFAULT 'not_taken',  -- not_taken | pending | passed | failed
        evaluationPassed INTEGER DEFAULT 0,
        -- 时间戳
        firstAccessAt TEXT,
        lastAccessAt TEXT,
        completedAt TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employeeId, courseId)
      );
      -- 培训推送通知表
      CREATE TABLE IF NOT EXISTS training_notifications (
        id TEXT PRIMARY KEY,
        employeeId TEXT NOT NULL,
        employeeName TEXT,
        planId TEXT,
        planTitle TEXT,
        courseId TEXT,
        courseName TEXT,
        type TEXT DEFAULT 'training_assign',    -- training_assign | exam_reminder | completion_notice
        title TEXT NOT NULL,
        content TEXT,
        priority TEXT DEFAULT 'normal',         -- low | normal | high | urgent
        isRead INTEGER DEFAULT 0,
        readAt TEXT,
        deadline TEXT,                           -- 完成截止日期
        pushChannel TEXT DEFAULT 'self_service', -- self_service | sms | email
        pushStatus TEXT DEFAULT 'pending',       -- pending | sent | read | expired
        sentAt TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employeeId, planId, type)
      );
      CREATE TABLE IF NOT EXISTS dormitories (
        id TEXT PRIMARY KEY, building TEXT, room TEXT, floor INTEGER,
        capacity INTEGER DEFAULT 4, occupied INTEGER DEFAULT 0,
        area REAL, managerId TEXT, managerName TEXT,
        status TEXT DEFAULT 'available', remark TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS dormitory_assignments (
        id TEXT PRIMARY KEY, dormitoryId TEXT NOT NULL, employeeId TEXT NOT NULL,
        bedNo INTEGER, checkInDate TEXT, checkOutDate TEXT,
        status TEXT DEFAULT 'active',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(dormitoryId, employeeId)
      );
      CREATE TABLE IF NOT EXISTS dormitory_bills (
        id TEXT PRIMARY KEY, dormitoryId TEXT NOT NULL, month TEXT NOT NULL,
        waterUsed REAL DEFAULT 0, waterFee REAL DEFAULT 0,
        electricityUsed REAL DEFAULT 0, electricityFee REAL DEFAULT 0,
        total REAL DEFAULT 0, status TEXT DEFAULT 'unpaid',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS canteens (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, location TEXT,
        capacity INTEGER DEFAULT 0, managerId TEXT,
        isActive INTEGER DEFAULT 1, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS meal_records (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        date TEXT NOT NULL, mealType TEXT,
        cost REAL DEFAULT 0, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS meal_menus (
        id TEXT PRIMARY KEY,
        canteenId TEXT, date TEXT NOT NULL,
        mealType TEXT DEFAULT 'lunch',       -- breakfast/lunch/dinner
        name TEXT NOT NULL,
        dishes TEXT DEFAULT '',              -- JSON array of dish names
        price REAL DEFAULT 0,
        status TEXT DEFAULT 'draft',          -- draft/published/archived
        calories INTEGER DEFAULT 0,
        imageUrl TEXT DEFAULT '',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS meal_orders (
        id TEXT PRIMARY KEY,
        menuId TEXT NOT NULL,
        employeeId TEXT NOT NULL,
        employeeName TEXT,
        department TEXT,
        date TEXT NOT NULL,
        mealType TEXT,
        quantity INTEGER DEFAULT 1,
        totalPrice REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',        -- pending/confirmed/cancelled
        remark TEXT DEFAULT '',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY, plateNumber TEXT NOT NULL, vehicleType TEXT,
        brand TEXT, model TEXT, color TEXT,
        driverId TEXT, driverName TEXT,
        status TEXT DEFAULT 'available', mileage REAL DEFAULT 0,
        insuranceExpiry TEXT, remark TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS vehicle_usage (
        id TEXT PRIMARY KEY, vehicleId TEXT NOT NULL, driverId TEXT, driverName TEXT,
        userId TEXT, userName TEXT, purpose TEXT,
        startTime TEXT, endTime TEXT, mileageStart REAL, mileageEnd REAL,
        status TEXT DEFAULT 'active', remark TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS visitors (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, company TEXT,
        idCard TEXT, phone TEXT, purpose TEXT,
        contactPerson TEXT, contactDept TEXT,
        visitTime TEXT, leaveTime TEXT,
        badgeNo TEXT, status TEXT DEFAULT 'visiting',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 仓储物流管理
      CREATE TABLE IF NOT EXISTS warehouses (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'raw',              -- raw:原材料仓, wip:半成品仓, finished:成品仓, tool:工具仓
        location TEXT,
        area REAL DEFAULT 0,
        capacity REAL DEFAULT 0,
        manager_id TEXT,
        manager_name TEXT,
        status TEXT DEFAULT 'active',
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        warehouse_id TEXT REFERENCES warehouses(id),
        code TEXT NOT NULL,
        row_no TEXT,
        shelf_no TEXT,
        level_no TEXT,
        area REAL DEFAULT 0,
        capacity REAL DEFAULT 0,
        status TEXT DEFAULT 'available',     -- available:可用, occupied:占用, reserved:预留
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(warehouse_id, code)
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        warehouse_id TEXT REFERENCES warehouses(id),
        location_id TEXT REFERENCES locations(id),
        sku_id TEXT REFERENCES product_skus(id),
        material_id TEXT REFERENCES materials(id),
        qty REAL DEFAULT 0,
        locked_qty REAL DEFAULT 0,
        unit TEXT DEFAULT '双',
        batch_no TEXT,
        expiry_date TEXT,
        cost_price REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id TEXT PRIMARY KEY,
        warehouse_id TEXT REFERENCES warehouses(id),
        location_id TEXT REFERENCES locations(id),
        sku_id TEXT REFERENCES product_skus(id),
        material_id TEXT REFERENCES materials(id),
        type TEXT NOT NULL,                  -- in:入库, out:出库, transfer:调拨, adjust:调整
        qty REAL NOT NULL,
        unit TEXT DEFAULT '双',
        cost_price REAL DEFAULT 0,
        source_doc_id TEXT,                  -- 来源单据ID（如采购单、销售订单、生产工单）
        source_doc_type TEXT,                -- 来源单据类型
        batch_no TEXT,
        operator_id TEXT,
        operator_name TEXT,
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stock_checks (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        warehouse_id TEXT REFERENCES warehouses(id),
        location_id TEXT REFERENCES locations(id),
        status TEXT DEFAULT 'draft',         -- draft:草稿, in_progress:盘点中, completed:已完成
        check_date TEXT,
        operator_id TEXT,
        operator_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS stock_check_items (
        id TEXT PRIMARY KEY,
        check_id TEXT REFERENCES stock_checks(id),
        inventory_id TEXT REFERENCES inventory(id),
        sku_id TEXT REFERENCES product_skus(id),
        material_id TEXT REFERENCES materials(id),
        system_qty REAL DEFAULT 0,
        actual_qty REAL DEFAULT 0,
        diff_qty REAL DEFAULT 0,
        unit TEXT DEFAULT '双',
        remark TEXT
      );

      CREATE TABLE IF NOT EXISTS barcodes (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        type TEXT DEFAULT 'sku',             -- sku:产品条码, material:物料条码, location:货位条码
        target_id TEXT,                      -- 关联的SKU/物料/货位ID
        warehouse_id TEXT REFERENCES warehouses(id),
        location_id TEXT REFERENCES locations(id),
        batch_no TEXT,
        expiry_date TEXT,
        qty REAL DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transfer_orders (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        from_warehouse_id TEXT REFERENCES warehouses(id),
        to_warehouse_id TEXT REFERENCES warehouses(id),
        from_location_id TEXT REFERENCES locations(id),
        to_location_id TEXT REFERENCES locations(id),
        status TEXT DEFAULT 'pending',       -- pending:待审批, approved:已审批, completed:已完成
        transfer_date TEXT,
        operator_id TEXT,
        operator_name TEXT,
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        approved_at TEXT
      );

      CREATE TABLE IF NOT EXISTS transfer_order_items (
        id TEXT PRIMARY KEY,
        transfer_id TEXT REFERENCES transfer_orders(id),
        sku_id TEXT REFERENCES product_skus(id),
        material_id TEXT REFERENCES materials(id),
        qty REAL DEFAULT 0,
        unit TEXT DEFAULT '双',
        remark TEXT
      );

      -- 销售管理
      CREATE TABLE IF NOT EXISTS customer_groups (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        discount REAL DEFAULT 1,
        credit_limit REAL DEFAULT 0,
        payment_terms TEXT,
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        short_name TEXT,
        group_id TEXT REFERENCES customer_groups(id),
        contact_person TEXT,
        phone TEXT,
        mobile TEXT,
        email TEXT,
        address TEXT,
        province TEXT,
        city TEXT,
        district TEXT,
        tax_no TEXT,
        bank_name TEXT,
        bank_account TEXT,
        credit_limit REAL DEFAULT 0,
        available_credit REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sales_orders (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        customer_id TEXT REFERENCES customers(id),
        customer_name TEXT,
        contact_person TEXT,
        contact_phone TEXT,
        order_date TEXT,
        delivery_date TEXT,
        warehouse_id TEXT REFERENCES warehouses(id),
        shipping_address TEXT,
        payment_method TEXT,
        payment_status TEXT DEFAULT 'unpaid',
        total_amount REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',         -- pending:待审核, approved:已审核, production:生产中, shipping:发货中, completed:已完成, cancelled:已取消
        remark TEXT,
        operator_id TEXT,
        operator_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        approved_at TEXT
      );

      CREATE TABLE IF NOT EXISTS sales_order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT REFERENCES sales_orders(id),
        sku_id TEXT REFERENCES product_skus(id),
        style_id TEXT REFERENCES product_styles(id),
        color_id TEXT REFERENCES product_colors(id),
        size_id TEXT REFERENCES product_sizes(id),
        color_code TEXT,
        size_code TEXT,
        qty REAL DEFAULT 0,
        unit TEXT DEFAULT '双',
        unit_price REAL DEFAULT 0,
        amount REAL DEFAULT 0,
        remark TEXT
      );

      CREATE TABLE IF NOT EXISTS deliveries (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        order_id TEXT REFERENCES sales_orders(id),
        warehouse_id TEXT REFERENCES warehouses(id),
        delivery_date TEXT,
        carrier TEXT,
        tracking_no TEXT,
        status TEXT DEFAULT 'pending',         -- pending:待发货, shipped:已发货, delivered:已签收
        total_qty REAL DEFAULT 0,
        remark TEXT,
        operator_id TEXT,
        operator_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        shipped_at TEXT
      );

      CREATE TABLE IF NOT EXISTS delivery_items (
        id TEXT PRIMARY KEY,
        delivery_id TEXT REFERENCES deliveries(id),
        order_item_id TEXT REFERENCES sales_order_items(id),
        sku_id TEXT REFERENCES product_skus(id),
        qty REAL DEFAULT 0,
        unit TEXT DEFAULT '双',
        batch_no TEXT,
        remark TEXT
      );

      CREATE TABLE IF NOT EXISTS returns (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        order_id TEXT REFERENCES sales_orders(id),
        delivery_id TEXT REFERENCES deliveries(id),
        customer_id TEXT REFERENCES customers(id),
        return_date TEXT,
        reason TEXT,
        status TEXT DEFAULT 'pending',         -- pending:待审核, approved:已审核, completed:已完成
        total_amount REAL DEFAULT 0,
        remark TEXT,
        operator_id TEXT,
        operator_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        approved_at TEXT
      );

      CREATE TABLE IF NOT EXISTS return_items (
        id TEXT PRIMARY KEY,
        return_id TEXT REFERENCES returns(id),
        sku_id TEXT REFERENCES product_skus(id),
        qty REAL DEFAULT 0,
        unit TEXT DEFAULT '双',
        unit_price REAL DEFAULT 0,
        amount REAL DEFAULT 0,
        reason TEXT,
        remark TEXT
      );

      -- 采购管理
      CREATE TABLE IF NOT EXISTS supplier_groups (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        short_name TEXT,
        group_id TEXT REFERENCES supplier_groups(id),
        contact_person TEXT,
        phone TEXT,
        mobile TEXT,
        email TEXT,
        address TEXT,
        province TEXT,
        city TEXT,
        district TEXT,
        tax_no TEXT,
        bank_name TEXT,
        bank_account TEXT,
        payment_terms TEXT,
        status TEXT DEFAULT 'active',
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS purchase_orders (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        supplier_id TEXT REFERENCES suppliers(id),
        supplier_name TEXT,
        contact_person TEXT,
        contact_phone TEXT,
        order_date TEXT,
        delivery_date TEXT,
        warehouse_id TEXT REFERENCES warehouses(id),
        payment_method TEXT,
        payment_status TEXT DEFAULT 'unpaid',
        total_amount REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',         -- pending:待审核, approved:已审核, received:已收货, completed:已完成, cancelled:已取消
        remark TEXT,
        operator_id TEXT,
        operator_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        approved_at TEXT
      );

      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT REFERENCES purchase_orders(id),
        material_id TEXT REFERENCES materials(id),
        sku_id TEXT REFERENCES product_skus(id),
        qty REAL DEFAULT 0,
        unit TEXT DEFAULT '双',
        unit_price REAL DEFAULT 0,
        amount REAL DEFAULT 0,
        delivery_qty REAL DEFAULT 0,
        remark TEXT
      );

      CREATE TABLE IF NOT EXISTS purchase_receipts (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        order_id TEXT REFERENCES purchase_orders(id),
        supplier_id TEXT REFERENCES suppliers(id),
        warehouse_id TEXT REFERENCES warehouses(id),
        receipt_date TEXT,
        status TEXT DEFAULT 'pending',         -- pending:待审核, approved:已审核
        total_qty REAL DEFAULT 0,
        remark TEXT,
        operator_id TEXT,
        operator_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        approved_at TEXT
      );

      CREATE TABLE IF NOT EXISTS purchase_receipt_items (
        id TEXT PRIMARY KEY,
        receipt_id TEXT REFERENCES purchase_receipts(id),
        order_item_id TEXT REFERENCES purchase_order_items(id),
        material_id TEXT REFERENCES materials(id),
        sku_id TEXT REFERENCES product_skus(id),
        qty REAL DEFAULT 0,
        unit TEXT DEFAULT '双',
        batch_no TEXT,
        remark TEXT
      );

      -- 生产现场管理
      CREATE TABLE IF NOT EXISTS production_plans (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        style_id TEXT REFERENCES product_styles(id),
        style_code TEXT,
        style_name TEXT,
        planned_qty REAL DEFAULT 0,
        start_date TEXT,
        end_date TEXT,
        status TEXT DEFAULT 'draft',         -- draft:草稿, approved:已审核, in_progress:进行中, completed:已完成
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        approved_at TEXT
      );

      CREATE TABLE IF NOT EXISTS production_work_orders (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        plan_id TEXT REFERENCES production_plans(id),
        plan_code TEXT,
        style_id TEXT REFERENCES product_styles(id),
        style_code TEXT,
        style_name TEXT,
        process_id TEXT REFERENCES processes(id),
        process_code TEXT,
        process_name TEXT,
        work_center_id TEXT,
        work_center_name TEXT,
        scheduled_qty REAL DEFAULT 0,
        actual_qty REAL DEFAULT 0,
        start_date TEXT,
        end_date TEXT,
        status TEXT DEFAULT 'pending',         -- pending:待派工, dispatched:已派工, in_progress:进行中, completed:已完成, cancelled:已取消
        remark TEXT,
        operator_id TEXT,
        operator_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        dispatched_at TEXT
      );

      CREATE TABLE IF NOT EXISTS work_order_operations (
        id TEXT PRIMARY KEY,
        work_order_id TEXT REFERENCES production_work_orders(id),
        seq_no INTEGER DEFAULT 0,
        operation_id TEXT REFERENCES operations(id),
        operation_code TEXT,
        operation_name TEXT,
        status TEXT DEFAULT 'pending',         -- pending:待执行, in_progress:进行中, completed:已完成
        worker_id TEXT,
        worker_name TEXT,
        start_time TEXT,
        end_time TEXT,
        actual_qty REAL DEFAULT 0,
        scrap_qty REAL DEFAULT 0,
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS work_centers (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'sewing',           -- cutting:裁剪, sewing:缝纫, finishing:整烫, packaging:包装
        status TEXT DEFAULT 'active',
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 财务管理
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'asset',             -- asset:资产, liability:负债, equity:权益, income:收入, expense:费用
        parent_id TEXT,
        level INTEGER DEFAULT 1,
        balance REAL DEFAULT 0,
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        entry_date TEXT,
        reference_type TEXT,                   -- sales_order, purchase_order, receipt, payment
        reference_id TEXT,
        description TEXT,
        total_debit REAL DEFAULT 0,
        total_credit REAL DEFAULT 0,
        status TEXT DEFAULT 'draft',           -- draft:草稿, posted:已过账
        remark TEXT,
        operator_id TEXT,
        operator_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        posted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS journal_items (
        id TEXT PRIMARY KEY,
        entry_id TEXT REFERENCES journal_entries(id),
        account_id TEXT REFERENCES accounts(id),
        account_code TEXT,
        account_name TEXT,
        debit REAL DEFAULT 0,
        credit REAL DEFAULT 0,
        remark TEXT
      );

      CREATE TABLE IF NOT EXISTS ar_invoices (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        customer_id TEXT REFERENCES customers(id),
        customer_name TEXT,
        order_id TEXT REFERENCES sales_orders(id),
        order_code TEXT,
        invoice_date TEXT,
        due_date TEXT,
        total_amount REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'unpaid',          -- unpaid:未付款, partial:部分付款, paid:已付清, overdue:逾期
        remark TEXT,
        operator_id TEXT,
        operator_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ap_invoices (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        supplier_id TEXT REFERENCES suppliers(id),
        supplier_name TEXT,
        order_id TEXT REFERENCES purchase_orders(id),
        order_code TEXT,
        invoice_date TEXT,
        due_date TEXT,
        total_amount REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'unpaid',          -- unpaid:未付款, partial:部分付款, paid:已付清, overdue:逾期
        remark TEXT,
        operator_id TEXT,
        operator_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        type TEXT DEFAULT 'receive',           -- receive:收款, pay:付款
        customer_id TEXT REFERENCES customers(id),
        supplier_id TEXT REFERENCES suppliers(id),
        invoice_id TEXT,
        payment_date TEXT,
        amount REAL DEFAULT 0,
        payment_method TEXT,
        bank_account TEXT,
        remark TEXT,
        operator_id TEXT,
        operator_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cost_entries (
        id TEXT PRIMARY KEY,
        order_id TEXT REFERENCES production_work_orders(id),
        style_id TEXT REFERENCES product_styles(id),
        material_cost REAL DEFAULT 0,
        labor_cost REAL DEFAULT 0,
        overhead_cost REAL DEFAULT 0,
        total_cost REAL DEFAULT 0,
        unit_cost REAL DEFAULT 0,
        quantity REAL DEFAULT 0,
        cost_date TEXT,
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 网站管理与商城
      CREATE TABLE IF NOT EXISTS web_articles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        content TEXT,
        summary TEXT,
        category TEXT,
        tags TEXT,
        author TEXT,
        status TEXT DEFAULT 'draft',           -- draft:草稿, published:已发布
        view_count INTEGER DEFAULT 0,
        publish_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS web_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        description TEXT,
        parent_id TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS web_banners (
        id TEXT PRIMARY KEY,
        title TEXT,
        image_url TEXT,
        link_url TEXT,
        position TEXT DEFAULT 'home',          -- home:首页, product:产品页
        sort_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        start_date TEXT,
        end_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shop_products (
        id TEXT PRIMARY KEY,
        style_id TEXT REFERENCES product_styles(id),
        style_code TEXT,
        style_name TEXT,
        sku TEXT UNIQUE,
        price REAL DEFAULT 0,
        sale_price REAL,
        stock_qty INTEGER DEFAULT 0,
        images TEXT,
        description TEXT,
        category TEXT,
        tags TEXT,
        status TEXT DEFAULT 'active',          -- active:上架, inactive:下架
        sort_order INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        sale_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shop_cart_items (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        product_id TEXT,
        sku TEXT,
        quantity INTEGER DEFAULT 1,
        price REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shop_orders (
        id TEXT PRIMARY KEY,
        order_no TEXT UNIQUE NOT NULL,
        user_id TEXT,
        user_name TEXT,
        user_phone TEXT,
        user_email TEXT,
        shipping_address TEXT,
        total_amount REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        pay_amount REAL DEFAULT 0,
        pay_method TEXT,
        pay_status TEXT DEFAULT 'unpaid',      -- unpaid:未支付, paid:已支付
        order_status TEXT DEFAULT 'pending',   -- pending:待处理, confirmed:已确认, shipped:已发货, completed:已完成, cancelled:已取消
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        paid_at TEXT,
        shipped_at TEXT,
        tracking_no TEXT DEFAULT '',
        tracking_company TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS shop_order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT REFERENCES shop_orders(id),
        product_id TEXT REFERENCES shop_products(id),
        sku TEXT,
        product_name TEXT,
        quantity INTEGER DEFAULT 1,
        price REAL,
        amount REAL,
        remark TEXT
      );

      CREATE TABLE IF NOT EXISTS shop_reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT REFERENCES shop_products(id),
        order_id TEXT,
        user_id TEXT,
        user_name TEXT,
        rating INTEGER DEFAULT 5,
        content TEXT,
        images TEXT,
        status TEXT DEFAULT 'pending',         -- pending:待审核, approved:已审核
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- AI模型配置 (支持无限自定义模型)
      CREATE TABLE IF NOT EXISTS ai_model_configs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        base_url TEXT NOT NULL,
        api_key TEXT DEFAULT '',
        model TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        provider_type TEXT DEFAULT 'openai',       -- openai:OpenAI兼容, ollama:Ollama
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
      );

      -- AI知识库系统 (多知识库支持)
      CREATE TABLE IF NOT EXISTS ai_knowledge_bases (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        icon TEXT DEFAULT 'book',
        is_default INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
      );

      CREATE TABLE IF NOT EXISTS ai_knowledge (
        id TEXT PRIMARY KEY,
        kb_id TEXT DEFAULT 'default',
        title TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        content TEXT NOT NULL,
        tags TEXT DEFAULT '',
        source_type TEXT DEFAULT 'manual',       -- manual:手动输入, file:文件导入
        source_file TEXT DEFAULT '',             -- 源文件名
        source_size INTEGER DEFAULT 0,           -- 源文件大小(bytes)
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (kb_id) REFERENCES ai_knowledge_bases(id)
      );

      CREATE TABLE IF NOT EXISTS ai_knowledge_documents (
        id TEXT PRIMARY KEY,
        kb_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_type TEXT DEFAULT 'txt',            -- txt/pdf/docx/xlsx/md/csv/html
        file_size INTEGER DEFAULT 0,
        file_path TEXT DEFAULT '',
        content TEXT DEFAULT '',
        chunk_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',           -- pending/parsing/completed/error
        error_msg TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (kb_id) REFERENCES ai_knowledge_bases(id)
      );

      -- 质量管理
      CREATE TABLE IF NOT EXISTS quality_standards (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'product',            -- product:产品, process:工序, material:物料
        description TEXT,
        items TEXT,                             -- JSON格式的检验项目列表
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quality_inspections (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        type TEXT DEFAULT 'incoming',           -- incoming:来料检验, in_process:过程检验, final:成品检验
        reference_type TEXT,                    -- purchase_receipt, work_order, product
        reference_id TEXT,
        reference_code TEXT,
        inspector TEXT,
        inspection_date TEXT,
        total_items INTEGER DEFAULT 0,
        passed_items INTEGER DEFAULT 0,
        failed_items INTEGER DEFAULT 0,
        result TEXT DEFAULT 'pending',          -- pending:待检, passed:合格, failed:不合格, partial:部分合格
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quality_inspection_items (
        id TEXT PRIMARY KEY,
        inspection_id TEXT REFERENCES quality_inspections(id),
        standard_id TEXT,
        item_name TEXT,
        standard_value TEXT,
        actual_value TEXT,
        result TEXT DEFAULT 'pending',          -- pending:待检, passed:合格, failed:不合格
        remark TEXT
      );

      CREATE TABLE IF NOT EXISTS quality_defects (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        inspection_id TEXT REFERENCES quality_inspections(id),
        defect_type TEXT,                       -- appearance:外观, dimension:尺寸, function:功能, material:材质
        defect_level TEXT DEFAULT 'minor',      -- minor:轻微, major:重大, critical:严重
        description TEXT,
        quantity INTEGER DEFAULT 1,
        cause TEXT,
        solution TEXT,
        status TEXT DEFAULT 'open',             -- open:待处理, processing:处理中, closed:已关闭
        responsible_person TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        closed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS quality_corrective_actions (
        id TEXT PRIMARY KEY,
        defect_id TEXT REFERENCES quality_defects(id),
        action_type TEXT,                       -- correction:纠正, preventive:预防, improvement:改进
        description TEXT,
        responsible_person TEXT,
        due_date TEXT,
        status TEXT DEFAULT 'pending',          -- pending:待执行, in_progress:进行中, completed:已完成
        completed_date TEXT,
        effect_evaluation TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT,
        type TEXT DEFAULT 'notice', priority TEXT DEFAULT 'normal',
        authorId TEXT, authorName TEXT,
        publishAt TEXT, expireAt TEXT,
        attachments TEXT DEFAULT '[]',
        readCount INTEGER DEFAULT 0,
        status TEXT DEFAULT 'draft',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS announcement_reads (
        id TEXT PRIMARY KEY, announcementId TEXT NOT NULL,
        userId TEXT, readAt TEXT,
        UNIQUE(announcementId, userId)
      );
      CREATE TABLE IF NOT EXISTS surveys (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
        type TEXT DEFAULT 'survey', status TEXT DEFAULT 'draft',
        startDate TEXT, endDate TEXT,
        anonymous INTEGER DEFAULT 0, multipleResponses INTEGER DEFAULT 0,
        responseCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS survey_questions (
        id TEXT PRIMARY KEY, surveyId TEXT NOT NULL,
        question TEXT NOT NULL, type TEXT DEFAULT 'radio',
        options TEXT DEFAULT '[]', required INTEGER DEFAULT 1,
        sortOrder INTEGER DEFAULT 0, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS survey_responses (
        id TEXT PRIMARY KEY, surveyId TEXT NOT NULL,
        userId TEXT, answers TEXT DEFAULT '{}',
        submittedAt TEXT, UNIQUE(surveyId, userId)
      );
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, folderId TEXT,
        type TEXT DEFAULT 'file', size INTEGER DEFAULT 0,
        mimeType TEXT, url TEXT, content TEXT,
        accessLevel TEXT DEFAULT 'private',
        uploaderId TEXT, uploaderName TEXT,
        isFavorite INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS document_folders (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, parentId TEXT,
        accessLevel TEXT DEFAULT 'private', createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS assessment_tools (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT,
        description TEXT, questionCount INTEGER DEFAULT 0,
        duration INTEGER DEFAULT 0, isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS assessment_questions (
        id TEXT PRIMARY KEY, toolId TEXT NOT NULL,
        question TEXT NOT NULL, type TEXT DEFAULT 'single',
        options TEXT DEFAULT '[]', dimension TEXT,
        sortOrder INTEGER DEFAULT 0, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS assessment_results (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        toolId TEXT, toolName TEXT,
        score REAL, result TEXT, dimensionScores TEXT DEFAULT '{}',
        completedAt TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS competency_items (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT,
        dimension TEXT, description TEXT,
        isActive INTEGER DEFAULT 1, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS competency_levels (
        id TEXT PRIMARY KEY, itemId TEXT NOT NULL, level INTEGER NOT NULL,
        name TEXT, description TEXT, behavior TEXT,
        scoreRange TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS competency_models (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, positionId TEXT,
        positionName TEXT, description TEXT,
        totalWeight REAL DEFAULT 0,
        isActive INTEGER DEFAULT 1, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS model_competencies (
        id TEXT PRIMARY KEY, modelId TEXT NOT NULL, itemId TEXT,
        weight REAL DEFAULT 0, requiredLevel INTEGER DEFAULT 0,
        sortOrder INTEGER DEFAULT 0,
        UNIQUE(modelId, itemId)
      );
      CREATE TABLE IF NOT EXISTS talent_profiles (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        department TEXT, position TEXT,
        performanceData TEXT DEFAULT '{}',
        competencyData TEXT DEFAULT '{}',
        overallScore REAL DEFAULT 0, talentLevel TEXT,
        talentGrid TEXT, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS talent_reports (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, cycleId TEXT,
        talentSummary TEXT DEFAULT '{}',
        nineBoxGrid TEXT DEFAULT '{}',
        successionPlans TEXT DEFAULT '{}',
        createdBy TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS approval_flows (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, module TEXT,
        steps TEXT DEFAULT '[]', isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS approval_requests (
        id TEXT PRIMARY KEY, flowId TEXT, module TEXT NOT NULL,
        title TEXT NOT NULL, applicantId TEXT NOT NULL, applicantName TEXT,
        status TEXT DEFAULT 'pending', currentStep INTEGER DEFAULT 0,
        formData TEXT DEFAULT '{}', attachmentUrl TEXT,
        submittedAt TEXT, completedAt TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS approval_records (
        id TEXT PRIMARY KEY, requestId TEXT NOT NULL,
        stepIndex INTEGER, approverId TEXT, approverName TEXT,
        action TEXT, comment TEXT,
        handledAt TEXT, nextApprover TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS employee_changes (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, employeeName TEXT,
        changeType TEXT NOT NULL,
        fromDepartment TEXT, toDepartment TEXT,
        fromPosition TEXT, toPosition TEXT,
        fromRank TEXT, toRank TEXT,
        fromSalary REAL, toSalary REAL,
        effectiveDate TEXT, reason TEXT,
        status TEXT DEFAULT 'pending',
        approverId TEXT, approverName TEXT,
        approveTime TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS field_definitions (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, fieldKey TEXT UNIQUE NOT NULL,
        type TEXT DEFAULT 'text', groupName TEXT DEFAULT 'custom',
        visibility TEXT DEFAULT 'visible', required INTEGER DEFAULT 0,
        displayOrder INTEGER DEFAULT 99, isSystem INTEGER DEFAULT 0,
        options TEXT, defaultValue TEXT, validation TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS employee_subsets (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT UNIQUE NOT NULL,
        description TEXT, fields TEXT DEFAULT '[]',
        isActive INTEGER DEFAULT 1, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS subset_records (
        id TEXT PRIMARY KEY, subsetId TEXT NOT NULL, employeeId TEXT NOT NULL,
        data TEXT DEFAULT '{}',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(subsetId, employeeId)
      );
      CREATE TABLE IF NOT EXISTS print_templates (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
        content TEXT, paperSize TEXT DEFAULT 'A4',
        orientation TEXT DEFAULT 'portrait',
        isDefault INTEGER DEFAULT 0, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
        module TEXT, targetModule TEXT,
        advanceDays INTEGER DEFAULT 7, isActive INTEGER DEFAULT 1,
        targetRoles TEXT DEFAULT '[]', targetUsers TEXT DEFAULT '[]',
        template TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS reminder_logs (
        id TEXT PRIMARY KEY, reminderId TEXT NOT NULL, employeeId TEXT,
        triggeredAt TEXT, sentAt TEXT, status TEXT DEFAULT 'pending',
        error TEXT
      );
      CREATE TABLE IF NOT EXISTS system_config (
        id TEXT PRIMARY KEY, key TEXT UNIQUE NOT NULL, label TEXT, value TEXT,
        type TEXT DEFAULT 'string', category TEXT DEFAULT 'other',
        description TEXT, visible INTEGER DEFAULT 1, editable INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY, userId TEXT, username TEXT, realName TEXT,
        action TEXT, module TEXT, targetType TEXT, targetId TEXT,
        detail TEXT, ip TEXT, userAgent TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS login_logs (
        id TEXT PRIMARY KEY, userId TEXT, username TEXT,
        loginAt TEXT, ip TEXT, userAgent TEXT,
        success INTEGER DEFAULT 1, failReason TEXT
      );
      CREATE TABLE IF NOT EXISTS data_backups (
        id TEXT PRIMARY KEY, name TEXT NOT NULL,
        filePath TEXT, fileSize INTEGER DEFAULT 0,
        status TEXT DEFAULT 'completed',
        createdBy TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
      CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
      CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parentId);
      CREATE INDEX IF NOT EXISTS idx_salaries_month ON salaries(month);
      CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
      CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
      CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_records(status);
      CREATE INDEX IF NOT EXISTS idx_overtime_status ON overtime_records(status);
      CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
      CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
      CREATE INDEX IF NOT EXISTS idx_recruitment_status ON recruitment_positions(status);
      CREATE INDEX IF NOT EXISTS idx_performance_cycle ON performance_records(cycleId);
      CREATE INDEX IF NOT EXISTS idx_training_date ON training_records(trainingDate);
      CREATE INDEX IF NOT EXISTS idx_dormitory_building ON dormitories(building);
      CREATE INDEX IF NOT EXISTS idx_visitors_date ON visitors(visitTime);
      CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_requests(status);
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
      -- 统计报表模块
      CREATE TABLE IF NOT EXISTS report_definitions (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
        category TEXT DEFAULT 'custom',
        tableName TEXT, chartType TEXT DEFAULT 'table',
        xField TEXT, yFields TEXT DEFAULT '[]',
        filters TEXT DEFAULT '[]',
        fields TEXT DEFAULT '[]',
        config TEXT DEFAULT '{}',
        isBuiltIn INTEGER DEFAULT 0,
        createdBy TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS data_sources (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
        type TEXT DEFAULT 'internal',
        tableName TEXT, filePath TEXT, apiUrl TEXT, apiHeaders TEXT DEFAULT '{}',
        fields TEXT DEFAULT '[]',
        status TEXT DEFAULT 'connected',
        lastTestedAt TEXT, config TEXT DEFAULT '{}',
        createdBy TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS report_configs (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
        configKey TEXT UNIQUE NOT NULL, configValue TEXT,
        description TEXT, sortOrder INTEGER DEFAULT 0,
        updatedBy TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_report_cat ON report_definitions(category);
      CREATE INDEX IF NOT EXISTS idx_ds_type ON data_sources(type);
            CREATE INDEX IF NOT EXISTS idx_cfg_cat ON report_configs(category);
      -- 考勤设备配置表
      CREATE TABLE IF NOT EXISTS attendance_devices (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        deviceType TEXT NOT NULL DEFAULT 'app',
        status TEXT DEFAULT 'unconfigured',
        config TEXT DEFAULT '{}',
        lastSyncAt TEXT,
        syncCount INTEGER DEFAULT 0,
        remark TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      -- 年假规则全局配置表
      CREATE TABLE IF NOT EXISTS leave_rule_configs (
        id TEXT PRIMARY KEY,
        annualDays INTEGER DEFAULT 15,
        carryoverDays INTEGER DEFAULT 5,
        maxDays INTEGER DEFAULT 30,
        accrueMonth INTEGER DEFAULT 1,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS workflow_templates (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
        description TEXT, steps TEXT DEFAULT '[]', isActive INTEGER DEFAULT 1,
        createdBy TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      -- 增强版工作流引擎表（v2.0）
            CREATE TABLE IF NOT EXISTS workflow_form_configs (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT UNIQUE,
        module TEXT, fields TEXT DEFAULT '[]',
        layout TEXT DEFAULT 'default', createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 工作流定义
      CREATE TABLE IF NOT EXISTS workflow_definitions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        description TEXT,
        isDefault INTEGER DEFAULT 0,
        nodes TEXT DEFAULT '[]',
        edges TEXT DEFAULT '[]',
        variables TEXT DEFAULT '[]',
        version INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active',
        formConfigId TEXT,
        createdBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS workflow_instances (
        id TEXT PRIMARY KEY, definitionId TEXT NOT NULL,
        businessId TEXT NOT NULL, businessType TEXT NOT NULL,
        title TEXT NOT NULL, applicantId TEXT NOT NULL, applicantName TEXT,
        department TEXT, status TEXT DEFAULT 'running',
        currentNodeId TEXT, formData TEXT DEFAULT '{}',
        variables TEXT DEFAULT '{}', businessData TEXT DEFAULT '{}',
        startedAt TEXT, completedAt TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS workflow_instance_nodes (
        id TEXT PRIMARY KEY, instanceId TEXT NOT NULL,
        nodeId TEXT NOT NULL, nodeName TEXT,
        nodeType TEXT,
        status TEXT DEFAULT 'pending',
        assigneeId TEXT, assigneeName TEXT,
        assigneeType TEXT,
        actions TEXT DEFAULT '[]',
        formSnapshot TEXT, comment TEXT,
        startedAt TEXT, completedAt TEXT,
        dueDate TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS workflow_node_assignees (
        id TEXT PRIMARY KEY, instanceId TEXT NOT NULL,
        nodeId TEXT NOT NULL,
        assigneeType TEXT NOT NULL,
        assigneeId TEXT, assigneeName TEXT,
        assigneeMode TEXT DEFAULT 'single',
        signType TEXT DEFAULT 'all',
        signPercent INTEGER DEFAULT 100,
        required INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS workflow_comments (
        id TEXT PRIMARY KEY, instanceId TEXT NOT NULL,
        nodeId TEXT, userId TEXT, userName TEXT,
        content TEXT, type TEXT DEFAULT 'normal',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS meeting_rooms (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, capacity INTEGER DEFAULT 10,
        location TEXT, equipment TEXT DEFAULT '[]', status TEXT DEFAULT 'available',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, roomId TEXT NOT NULL,
        organizer TEXT, organizerId TEXT, startTime TEXT, endTime TEXT,
        participants TEXT DEFAULT '[]', description TEXT, status TEXT DEFAULT 'scheduled',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS office_supplies (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT,
        stock INTEGER DEFAULT 0, unit TEXT, price REAL DEFAULT 0,
        safetyStock INTEGER DEFAULT 10, supplier TEXT, location TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS supply_requests (
        id TEXT PRIMARY KEY, supplyId TEXT NOT NULL, supplyName TEXT,
        quantity INTEGER DEFAULT 1, requesterId TEXT, requesterName TEXT,
        purpose TEXT, pickupTime TEXT, status TEXT DEFAULT 'pending',
        approver TEXT, approvedAt TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS talent_tags (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT DEFAULT 'blue',
        type TEXT DEFAULT 'talent', description TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS email_templates (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
        subject TEXT, content TEXT, variables TEXT DEFAULT '[]',
        isActive INTEGER DEFAULT 1, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS email_logs (
        id TEXT PRIMARY KEY, templateId TEXT, templateName TEXT,
        recipientName TEXT, recipientEmail TEXT, subject TEXT,
        status TEXT DEFAULT 'pending', sentAt TEXT, error TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS training_classes (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, planId TEXT,
        instructor TEXT, startDate TEXT, endDate TEXT,
        location TEXT, capacity INTEGER DEFAULT 30, enrolledCount INTEGER DEFAULT 0,
        status TEXT DEFAULT 'upcoming', qrCode TEXT, description TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS assessment_templates (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, applicableCourse TEXT,
        questionTypes TEXT DEFAULT '[]', totalScore INTEGER DEFAULT 100,
        passingScore INTEGER DEFAULT 60, isActive INTEGER DEFAULT 1,
        questions TEXT DEFAULT '[]', createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- ============ 培训模块 V2.0 升级表 ============
      
      -- 课程分类表
      CREATE TABLE IF NOT EXISTS training_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parentId TEXT,
        icon VARCHAR(50),
        sortOrder INTEGER DEFAULT 0,
        description TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 课程主表（V2.0 增强版）
      CREATE TABLE IF NOT EXISTS training_courses_v2 (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle VARCHAR(500),
        coverUrl VARCHAR(500),
        categoryId TEXT,
        categoryName TEXT,
        courseType TEXT DEFAULT 'video',     -- text/video/live/mixed
        teacherId TEXT,
        teacherName TEXT,
        description TEXT,
        targetType TEXT DEFAULT 'all',       -- all/department/position
        targetValues TEXT DEFAULT '[]',      -- JSON数组
        completionType TEXT DEFAULT 'duration', -- duration/complete/exam
        completionValue DECIMAL(10,2) DEFAULT 100,
        credit DECIMAL(3,1) DEFAULT 0,
        durationMinutes INTEGER DEFAULT 0,
        chapterCount INTEGER DEFAULT 0,
        enrollmentCount INTEGER DEFAULT 0,
        completionCount INTEGER DEFAULT 0,
        rating DECIMAL(2,1) DEFAULT 0,
        reviewCount INTEGER DEFAULT 0,
        isMandatory INTEGER DEFAULT 0,
        isPublic INTEGER DEFAULT 1,
        status TEXT DEFAULT 'draft',         -- draft/published/offline
        publishedAt TEXT,
        tags TEXT DEFAULT '[]',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 章节表（支持文字/视频/直播多种类型）
      CREATE TABLE IF NOT EXISTS training_chapters (
        id TEXT PRIMARY KEY,
        courseId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        chapterType TEXT NOT NULL,           -- text/video/live/exam
        sortOrder INTEGER DEFAULT 0,
        required INTEGER DEFAULT 1,
        -- 文字内容
        content TEXT,
        contentLength INTEGER DEFAULT 0,
        -- 视频信息
        videoUrl VARCHAR(500),
        videoDuration INTEGER DEFAULT 0,
        videoSize INTEGER DEFAULT 0,
        videoQuality TEXT DEFAULT '1080p',
        hlsUrl VARCHAR(500),
        thumbnailUrl VARCHAR(500),
        -- 直播信息
        liveStartTime TEXT,
        liveEndTime TEXT,
        liveStreamKey VARCHAR(100),
        livePullUrl VARCHAR(500),
        liveRecordUrl VARCHAR(500),
        liveStatus TEXT DEFAULT 'pending',   -- pending/live/ended
        -- 考试信息
        examId TEXT,
        examDuration INTEGER DEFAULT 60,
        passingScore INTEGER DEFAULT 60,
        -- 资源附件
        attachments TEXT DEFAULT '[]',        -- JSON数组 [{name, url, size}]
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 课程评价表
      CREATE TABLE IF NOT EXISTS training_reviews (
        id TEXT PRIMARY KEY,
        courseId TEXT NOT NULL,
        employeeId TEXT NOT NULL,
        employeeName TEXT,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        content TEXT,
        pros TEXT,
        cons TEXT,
        isAnonymous INTEGER DEFAULT 0,
        replyCount INTEGER DEFAULT 0,
        likeCount INTEGER DEFAULT 0,
        status TEXT DEFAULT 'published',    -- pending/published/hidden
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 评价回复表
      CREATE TABLE IF NOT EXISTS training_review_replies (
        id TEXT PRIMARY KEY,
        reviewId TEXT NOT NULL,
        employeeId TEXT,
        employeeName TEXT,
        content TEXT NOT NULL,
        likeCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 学习笔记表
      CREATE TABLE IF NOT EXISTS training_notes (
        id TEXT PRIMARY KEY,
        employeeId TEXT NOT NULL,
        employeeName TEXT,
        courseId TEXT,
        chapterId TEXT,
        noteType TEXT DEFAULT 'note',        -- note/highlight/question
        content TEXT NOT NULL,
        highlightText TEXT,                 -- 高亮的原文
        position TEXT,                       -- 位置信息（JSON）
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 直播会话表
      CREATE TABLE IF NOT EXISTS training_live_sessions (
        id TEXT PRIMARY KEY,
        chapterId TEXT,
        courseId TEXT,
        title TEXT NOT NULL,
        hostId TEXT,
        hostName TEXT,
        streamKey VARCHAR(100),
        streamUrl VARCHAR(500),
        pullUrl VARCHAR(500),
        status TEXT DEFAULT 'pending',       -- pending/live/ended
        viewerCount INTEGER DEFAULT 0,
        maxViewerCount INTEGER DEFAULT 0,
        totalDuration INTEGER DEFAULT 0,
        recordUrl VARCHAR(500),
        quality TEXT DEFAULT '1080p',
        startedAt TEXT,
        endedAt TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 直播消息表（弹幕/聊天/问答）
      CREATE TABLE IF NOT EXISTS training_live_messages (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        chapterId TEXT,
        employeeId TEXT NOT NULL,
        employeeName TEXT,
        messageType TEXT NOT NULL,          -- danmu/chat/question/answer/system
        content TEXT NOT NULL,
        isHidden INTEGER DEFAULT 0,
        isPinned INTEGER DEFAULT 0,
        likeCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 直播签到表
      CREATE TABLE IF NOT EXISTS training_live_attendances (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        chapterId TEXT,
        employeeId TEXT NOT NULL,
        employeeName TEXT,
        checkinTime TEXT,
        durationWatched INTEGER DEFAULT 0,
        ipAddress VARCHAR(50),
        deviceInfo TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sessionId, employeeId)
      );
      
      -- 直播预约表
      CREATE TABLE IF NOT EXISTS training_live_reservations (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        chapterId TEXT,
        employeeId TEXT NOT NULL,
        employeeName TEXT,
        notifyEnabled INTEGER DEFAULT 1,
        notifiedAt TEXT,
        reservedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sessionId, employeeId)
      );
      
      -- 学习路径表
      CREATE TABLE IF NOT EXISTS training_learning_paths (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        targetType TEXT DEFAULT 'all',
        targetValues TEXT DEFAULT '[]',
        totalCredit DECIMAL(5,1) DEFAULT 0,
        totalDuration INTEGER DEFAULT 0,
        courseCount INTEGER DEFAULT 0,
        isMandatory INTEGER DEFAULT 0,
        status TEXT DEFAULT 'draft',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 学习路径课程关联表
      CREATE TABLE IF NOT EXISTS training_path_courses (
        id TEXT PRIMARY KEY,
        pathId TEXT NOT NULL,
        courseId TEXT NOT NULL,
        sortOrder INTEGER DEFAULT 0,
        UNIQUE(pathId, courseId)
      );
      
      -- ============ 索引 ============
      CREATE INDEX IF NOT EXISTS idx_course_category ON training_courses_v2(categoryId);
      CREATE INDEX IF NOT EXISTS idx_course_status ON training_courses_v2(status);
      CREATE INDEX IF NOT EXISTS idx_course_type ON training_courses_v2(courseType);
      CREATE INDEX IF NOT EXISTS idx_chapter_course ON training_chapters(courseId);
      CREATE INDEX IF NOT EXISTS idx_chapter_sort ON training_chapters(courseId, sortOrder);
      CREATE INDEX IF NOT EXISTS idx_review_course ON training_reviews(courseId);
      CREATE INDEX IF NOT EXISTS idx_review_employee ON training_reviews(employeeId);
      CREATE INDEX IF NOT EXISTS idx_note_employee ON training_notes(employeeId);
      CREATE INDEX IF NOT EXISTS idx_note_course ON training_notes(courseId);
      CREATE INDEX IF NOT EXISTS idx_live_session_status ON training_live_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_live_message_session ON training_live_messages(sessionId);
      CREATE INDEX IF NOT EXISTS idx_live_attendance_session ON training_live_attendances(sessionId);

      -- ============ 产品基础档案（第一期）============

      -- 颜色库
      CREATE TABLE IF NOT EXISTS colors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        pantone_code TEXT,
        custom_code TEXT,
        hex_color TEXT,
        image_url TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 尺码库
      CREATE TABLE IF NOT EXISTS sizes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 尺码组
      CREATE TABLE IF NOT EXISTS size_groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 尺码组-尺码关联
      CREATE TABLE IF NOT EXISTS size_group_items (
        id TEXT PRIMARY KEY,
        size_group_id TEXT NOT NULL,
        size_id TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (size_group_id) REFERENCES size_groups(id),
        FOREIGN KEY (size_id) REFERENCES sizes(id),
        UNIQUE(size_group_id, size_id)
      );

      -- 产品品类
      CREATE TABLE IF NOT EXISTS product_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        parent_id TEXT,
        type TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 款号（产品SPU）
      CREATE TABLE IF NOT EXISTS product_styles (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category_id TEXT,
        brand TEXT,
        season TEXT,
        year INTEGER,
        description TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 款色（款号+颜色，产品SPU+颜色变体）
      CREATE TABLE IF NOT EXISTS product_style_colors (
        id TEXT PRIMARY KEY,
        style_id TEXT NOT NULL,
        color_id TEXT NOT NULL,
        image_url_1 TEXT,
        image_url_2 TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (style_id) REFERENCES product_styles(id),
        FOREIGN KEY (color_id) REFERENCES colors(id),
        UNIQUE(style_id, color_id)
      );

      -- 款号码制（款号使用哪个尺码组）
      CREATE TABLE IF NOT EXISTS product_style_size_configs (
        id TEXT PRIMARY KEY,
        style_id TEXT NOT NULL,
        size_group_id TEXT NOT NULL,
        FOREIGN KEY (style_id) REFERENCES product_styles(id),
        FOREIGN KEY (size_group_id) REFERENCES size_groups(id)
      );

      -- 箱型
      CREATE TABLE IF NOT EXISTS box_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        qty_per_box INTEGER,
        gross_weight REAL,
        length REAL,
        width REAL,
        height REAL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 产品SKU（款色+尺码）
      CREATE TABLE IF NOT EXISTS product_skus (
        id TEXT PRIMARY KEY,
        style_id TEXT NOT NULL,
        style_color_id TEXT NOT NULL,
        size_id TEXT NOT NULL,
        sku_code TEXT UNIQUE,
        barcode TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (style_id) REFERENCES product_styles(id),
        FOREIGN KEY (style_color_id) REFERENCES product_style_colors(id),
        FOREIGN KEY (size_id) REFERENCES sizes(id)
      );

      -- 编码规则
      CREATE TABLE IF NOT EXISTS coding_rules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target_type TEXT NOT NULL,
        category_id TEXT,
        expression TEXT NOT NULL,
        prefix TEXT,
        sequence_digits INTEGER DEFAULT 4,
        current_sequence INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 配码规则
      CREATE TABLE IF NOT EXISTS size_ratios (
        id TEXT PRIMARY KEY,
        style_id TEXT NOT NULL,
        size_group_id TEXT NOT NULL,
        size_id TEXT NOT NULL,
        ratio INTEGER DEFAULT 1,
        FOREIGN KEY (style_id) REFERENCES product_styles(id),
        FOREIGN KEY (size_group_id) REFERENCES size_groups(id),
        FOREIGN KEY (size_id) REFERENCES sizes(id)
      );

      -- =============================================
      -- 第二期：工艺管理/PLM（鞋服行业核心模块）
      -- =============================================

      -- 物料属性类型（原材料、半成品、成品、辅料等）
      CREATE TABLE IF NOT EXISTS material_attributes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 物料主数据库
      CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category_id TEXT REFERENCES product_categories(id),
        attribute_id TEXT REFERENCES material_attributes(id),
        color_id TEXT REFERENCES colors(id),
        size_id TEXT REFERENCES sizes(id),
        unit TEXT DEFAULT '双',
        spec TEXT,
        gross_weight REAL,
        net_weight REAL,
        image_url_1 TEXT,
        image_url_2 TEXT,
        default_supplier_id TEXT,
        safety_stock REAL DEFAULT 0,
        max_stock REAL,
        min_order_qty REAL DEFAULT 1,
        lead_time INTEGER DEFAULT 7,
        price REAL DEFAULT 0,
        season TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 工序库
      CREATE TABLE IF NOT EXISTS processes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        process_type TEXT,
        standard_time REAL DEFAULT 0,
        piece_rate REAL DEFAULT 0,
        unit TEXT DEFAULT '双',
        department TEXT,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 工艺路线
      CREATE TABLE IF NOT EXISTS process_routes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        description TEXT,
        is_default INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 工艺路线-工序关联
      CREATE TABLE IF NOT EXISTS process_route_items (
        id TEXT PRIMARY KEY,
        route_id TEXT NOT NULL,
        process_id TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        standard_time REAL,
        piece_rate REAL,
        description TEXT,
        FOREIGN KEY (route_id) REFERENCES process_routes(id),
        FOREIGN KEY (process_id) REFERENCES processes(id)
      );

      -- 部件库（鞋面、鞋底、内里等）
      CREATE TABLE IF NOT EXISTS components (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        category TEXT,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- BOM（物料清单）- 支持开发BOM和技术BOM
      CREATE TABLE IF NOT EXISTS boms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        bom_type TEXT NOT NULL DEFAULT 'technical',
        product_style_id TEXT REFERENCES product_styles(id),
        product_sku_id TEXT REFERENCES product_skus(id),
        version TEXT DEFAULT 'V1.0',
        status TEXT DEFAULT 'draft',
        approved_by TEXT,
        approved_at TEXT,
        created_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- BOM明细行
      CREATE TABLE IF NOT EXISTS bom_items (
        id TEXT PRIMARY KEY,
        bom_id TEXT NOT NULL,
        material_id TEXT REFERENCES materials(id),
        component_id TEXT,
        qty REAL NOT NULL DEFAULT 1,
        unit TEXT DEFAULT '双',
        scrap_rate REAL DEFAULT 0,
        loss_rate REAL DEFAULT 0,
        supply_type TEXT DEFAULT 'purchase',
        size_id TEXT REFERENCES sizes(id),
        color_id TEXT REFERENCES colors(id),
        remark TEXT,
        FOREIGN KEY (bom_id) REFERENCES boms(id)
      );

      -- 损耗规则
      CREATE TABLE IF NOT EXISTS scrap_rules (
        id TEXT PRIMARY KEY,
        rule_type TEXT NOT NULL,
        target_id TEXT,
        target_type TEXT,
        order_qty_min REAL DEFAULT 0,
        order_qty_max REAL DEFAULT 999999,
        material_loss_rate REAL DEFAULT 0,
        process_loss_rate REAL DEFAULT 0,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 大底资料库（制鞋行业专项）
      CREATE TABLE IF NOT EXISTS soles (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        sole_type TEXT,
        material TEXT,
        color TEXT,
        mold_no TEXT,
        supplier_id TEXT,
        unit_price REAL DEFAULT 0,
        unit TEXT DEFAULT '双',
        lead_time INTEGER DEFAULT 7,
        image_url TEXT,
        description TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 季节物料库
      CREATE TABLE IF NOT EXISTS season_materials (
        id TEXT PRIMARY KEY,
        season TEXT NOT NULL,
        material_id TEXT NOT NULL,
        season_year INTEGER,
        remark TEXT,
        FOREIGN KEY (material_id) REFERENCES materials(id)
      );

      CREATE INDEX IF NOT EXISTS idx_color_active ON colors(is_active);
      CREATE INDEX IF NOT EXISTS idx_size_active ON sizes(is_active);
      CREATE INDEX IF NOT EXISTS idx_size_category ON sizes(category);
      CREATE INDEX IF NOT EXISTS idx_style_code ON product_styles(code);
      CREATE INDEX IF NOT EXISTS idx_style_status ON product_styles(status);
      CREATE INDEX IF NOT EXISTS idx_sku_code ON product_skus(sku_code);
      CREATE INDEX IF NOT EXISTS idx_coding_target ON coding_rules(target_type);

      -- ============ ShopXO电商系统核心表 ============

      -- 商品分类（多级分类树）
      CREATE TABLE IF NOT EXISTS shop_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        icon TEXT,
        image_url TEXT,
        sort_order INTEGER DEFAULT 0,
        is_show INTEGER DEFAULT 1,
        is_home INTEGER DEFAULT 0,
        description TEXT,
        seo_title TEXT,
        seo_keywords TEXT,
        seo_description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 品牌
      CREATE TABLE IF NOT EXISTS shop_brands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT DEFAULT '',
        description TEXT DEFAULT '',
        website TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        is_show INTEGER DEFAULT 1,
        category_ids TEXT DEFAULT '[]',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 商品主表
      CREATE TABLE IF NOT EXISTS shop_goods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category_id TEXT DEFAULT '',
        brand_id TEXT DEFAULT '',
        sku TEXT DEFAULT '',
        price REAL DEFAULT 0,
        original_price REAL DEFAULT 0,
        cost_price REAL DEFAULT 0,
        stock INTEGER DEFAULT 0,
        virtual_stock INTEGER DEFAULT 0,
        sales_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        favorite_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        images TEXT DEFAULT '[]',
        main_image TEXT DEFAULT '',
        video_url TEXT DEFAULT '',
        description TEXT DEFAULT '',
        spec_data TEXT DEFAULT '{}',
        param_data TEXT DEFAULT '{}',
        seo_title TEXT DEFAULT '',
        seo_keywords TEXT DEFAULT '',
        seo_description TEXT DEFAULT '',
        weight REAL DEFAULT 0,
        volume REAL DEFAULT 0,
        unit TEXT DEFAULT '件',
        barcode TEXT DEFAULT '',
        is_hot INTEGER DEFAULT 0,
        is_new INTEGER DEFAULT 0,
        is_recommend INTEGER DEFAULT 0,
        is_promotion INTEGER DEFAULT 0,
        promotion_price REAL DEFAULT 0,
        promotion_start TEXT DEFAULT '',
        promotion_end TEXT DEFAULT '',
        status TEXT DEFAULT 'active',
        sort_order INTEGER DEFAULT 0,
        title_color TEXT DEFAULT '',
        sub_title TEXT DEFAULT '',
        gift_points INTEGER DEFAULT 0,
        usage_guide TEXT DEFAULT '',
        mobile_content TEXT DEFAULT '',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      );

      -- 商品SKU
      CREATE TABLE IF NOT EXISTS shop_goods_skus (
        id TEXT PRIMARY KEY,
        goods_id TEXT NOT NULL,
        sku_code TEXT DEFAULT '',
        barcode TEXT DEFAULT '',
        spec_values TEXT DEFAULT '',
        price REAL DEFAULT 0,
        original_price REAL DEFAULT 0,
        cost_price REAL DEFAULT 0,
        stock INTEGER DEFAULT 0,
        sales_count INTEGER DEFAULT 0,
        image_url TEXT DEFAULT '',
        weight REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 购物车
      CREATE TABLE IF NOT EXISTS shop_cart (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT DEFAULT '',
        product_image TEXT DEFAULT '',
        price REAL DEFAULT 0,
        quantity INTEGER DEFAULT 1,
        spec TEXT DEFAULT '',
        checked INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 商品相册
      CREATE TABLE IF NOT EXISTS shop_goods_images (
        id TEXT PRIMARY KEY,
        goods_id TEXT NOT NULL,
        image_url TEXT NOT NULL,
        is_main INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 用户地址
      CREATE TABLE IF NOT EXISTS shop_user_addresses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        province TEXT,
        city TEXT,
        district TEXT,
        address TEXT NOT NULL,
        postal_code TEXT,
        is_default INTEGER DEFAULT 0,
        latitude REAL,
        longitude REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 用户收藏
      CREATE TABLE IF NOT EXISTS shop_user_favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        goods_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, goods_id)
      );

      -- 用户浏览历史
      CREATE TABLE IF NOT EXISTS shop_user_browse_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        goods_id TEXT NOT NULL,
        browse_time TEXT DEFAULT CURRENT_TIMESTAMP,
        browse_count INTEGER DEFAULT 1
      );

      -- 用户积分
      CREATE TABLE IF NOT EXISTS shop_user_integral (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        integral INTEGER DEFAULT 0,
        frozen_integral INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 积分日志
      CREATE TABLE IF NOT EXISTS shop_integral_log (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        integral INTEGER DEFAULT 0,
        before_integral INTEGER DEFAULT 0,
        after_integral INTEGER DEFAULT 0,
        related_id TEXT,
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 订单操作追溯日志
      CREATE TABLE IF NOT EXISTS shop_order_logs (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        action TEXT NOT NULL,
        remark TEXT DEFAULT '',
        operator TEXT DEFAULT '',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 优惠券
      -- 用户优惠券
      
      -- 订单主表（增强版）
      CREATE TABLE IF NOT EXISTS shop_orders_v2 (
        id TEXT PRIMARY KEY,
        order_no TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT,
        user_phone TEXT,
        user_email TEXT,
        address_id TEXT,
        address_name TEXT,
        address_phone TEXT,
        address_province TEXT,
        address_city TEXT,
        address_district TEXT,
        address_detail TEXT,
        goods_count INTEGER DEFAULT 0,
        goods_weight REAL DEFAULT 0,
        goods_amount REAL DEFAULT 0,
        shipping_fee REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        coupon_id TEXT,
        coupon_name TEXT,
        coupon_amount REAL DEFAULT 0,
        integral_used INTEGER DEFAULT 0,
        integral_amount REAL DEFAULT 0,
        total_amount REAL DEFAULT 0,
        pay_amount REAL DEFAULT 0,
        pay_type TEXT,
        pay_status TEXT DEFAULT 'unpaid',
        pay_time TEXT,
        pay_transaction_id TEXT,
        order_status TEXT DEFAULT 'pending',
        shipping_type TEXT,
        shipping_company TEXT,
        shipping_no TEXT,
        shipping_time TEXT,
        receive_time TEXT,
        remark TEXT,
        admin_remark TEXT,
        cancel_reason TEXT,
        cancel_time TEXT,
        is_invoice INTEGER DEFAULT 0,
        invoice_type TEXT,
        invoice_title TEXT,
        invoice_no TEXT,
        source TEXT DEFAULT 'web',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 订单商品明细
      CREATE TABLE IF NOT EXISTS shop_order_goods (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        goods_id TEXT NOT NULL,
        sku_id TEXT,
        goods_name TEXT,
        sku_code TEXT,
        spec_values TEXT DEFAULT '{}',
        price REAL DEFAULT 0,
        original_price REAL,
        quantity INTEGER DEFAULT 1,
        amount REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        integral INTEGER DEFAULT 0,
        image_url TEXT,
        weight REAL DEFAULT 0,
        is_comment INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 订单售后
      CREATE TABLE IF NOT EXISTS shop_order_aftersale (
                amount REAL DEFAULT 0,
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        order_goods_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        reason TEXT,
        description TEXT,
        images TEXT DEFAULT '[]',
        refund_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        admin_remark TEXT,
        handle_time TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 物流快递公司
      CREATE TABLE IF NOT EXISTS shop_express (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        logo_url TEXT,
        sort_order INTEGER DEFAULT 0,
        is_enable INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 优惠券
      CREATE TABLE IF NOT EXISTS shop_coupons (
        id TEXT PRIMARY KEY, name TEXT NOT NULL,
        type TEXT DEFAULT 'discount',
        value REAL DEFAULT 0, min_amount REAL DEFAULT 0,
        total INTEGER DEFAULT 0, received INTEGER DEFAULT 0, used INTEGER DEFAULT 0,
        start_time TEXT, end_time TEXT, status TEXT DEFAULT 'active',
        description TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS shop_user_coupons (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL, coupon_id TEXT NOT NULL,
        status TEXT DEFAULT 'unused', used_time TEXT,
        claimed_at TEXT, used_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      -- 秒杀
      CREATE TABLE IF NOT EXISTS shop_seckill (
        id TEXT PRIMARY KEY, goods_id TEXT NOT NULL,
        seckill_price REAL NOT NULL, seckill_stock INTEGER DEFAULT 0,
        sold_count INTEGER DEFAULT 0, limit_count INTEGER DEFAULT 1,
        start_time TEXT NOT NULL, end_time TEXT NOT NULL,
        status TEXT DEFAULT 'upcoming', created_at TEXT DEFAULT CURRENT_TIMESTAMP
      
      );-- 积分
      CREATE TABLE IF NOT EXISTS shop_user_points (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        total_earned INTEGER DEFAULT 0,
        total_used INTEGER DEFAULT 0,
        type TEXT DEFAULT 'earn',
        description TEXT DEFAULT '',
        balance INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS shop_point_logs (
                balance INTEGER DEFAULT 0,
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
        type TEXT, points INTEGER, description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      
      );-- 支付方式
      CREATE TABLE IF NOT EXISTS shop_payment_methods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        logo_url TEXT,
        sort_order INTEGER DEFAULT 0,
        is_enable INTEGER DEFAULT 1,
        config TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 站点配置
      CREATE TABLE IF NOT EXISTS shop_site_config (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        type TEXT DEFAULT 'string',
        config_group TEXT DEFAULT 'basic',
        description TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 导航菜单
      CREATE TABLE IF NOT EXISTS shop_navigation (
                location TEXT DEFAULT "header",
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'header',
        parent_id TEXT,
        link_type TEXT DEFAULT 'page',
        link_url TEXT,
        icon TEXT,
        image_url TEXT,
        sort_order INTEGER DEFAULT 0,
        is_show INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 快递公司
      CREATE TABLE IF NOT EXISTS shop_express_companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        website TEXT,
        phone TEXT,
        is_enabled INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 用户余额日志
      CREATE TABLE IF NOT EXISTS shop_balance_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL DEFAULT 0,
        type TEXT DEFAULT 'recharge',
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 拼团活动
      CREATE TABLE IF NOT EXISTS shop_group_buy (
        id TEXT PRIMARY KEY,
        goods_id TEXT NOT NULL,
        group_price REAL NOT NULL,
        group_stock INTEGER DEFAULT 0,
        sold_count INTEGER DEFAULT 0,
        group_size INTEGER DEFAULT 2,
        limit_count INTEGER DEFAULT 0,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        status TEXT DEFAULT 'upcoming',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 拼团记录（每个团实例）
      CREATE TABLE IF NOT EXISTS shop_group_buy_records (
        id TEXT PRIMARY KEY,
        activity_id TEXT NOT NULL,
        goods_id TEXT,
        leader_id TEXT NOT NULL,
        order_id TEXT,
        current_count INTEGER DEFAULT 1,
        target_count INTEGER DEFAULT 2,
        status TEXT DEFAULT 'ongoing',
        members TEXT DEFAULT '[]',
        end_time TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 砍价活动
      CREATE TABLE IF NOT EXISTS shop_bargain (
        id TEXT PRIMARY KEY,
        goods_id TEXT NOT NULL,
        start_price REAL DEFAULT 0,
        floor_price REAL NOT NULL,
        bargain_stock INTEGER DEFAULT 0,
        sold_count INTEGER DEFAULT 0,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        status TEXT DEFAULT 'upcoming',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 砍价记录（用户发起的砍价实例）
      CREATE TABLE IF NOT EXISTS shop_bargain_records (
        id TEXT PRIMARY KEY,
        activity_id TEXT NOT NULL,
        goods_id TEXT,
        user_id TEXT NOT NULL,
        current_price REAL DEFAULT 0,
        floor_price REAL DEFAULT 0,
        help_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'ongoing',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 砍价助力记录
      CREATE TABLE IF NOT EXISTS shop_bargain_helps (
        id TEXT PRIMARY KEY,
        record_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT,
        amount REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 会员等级
      CREATE TABLE IF NOT EXISTS shop_member_levels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        min_points INTEGER DEFAULT 0,
        discount REAL DEFAULT 1,
        icon TEXT,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 分销全局配置
      CREATE TABLE IF NOT EXISTS shop_distribution_config (
        id TEXT PRIMARY KEY,
        is_open INTEGER DEFAULT 1,
        level_mode INTEGER DEFAULT 2,
        settle_type TEXT DEFAULT 'paid',
        commission_base TEXT DEFAULT 'pay',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 分销等级（含一/二/三级佣金比例）
      CREATE TABLE IF NOT EXISTS shop_distribution_levels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        rate1 REAL DEFAULT 0,
        rate2 REAL DEFAULT 0,
        rate3 REAL DEFAULT 0,
        icon TEXT,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 分销商 / 推广员
      CREATE TABLE IF NOT EXISTS shop_distribution_members (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        user_name TEXT,
        invite_code TEXT NOT NULL UNIQUE,
        parent_id TEXT,
        level_id TEXT,
        status TEXT DEFAULT 'approved',
        total_commission REAL DEFAULT 0,
        withdrawable REAL DEFAULT 0,
        withdrawn REAL DEFAULT 0,
        team_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 分销佣金订单
      CREATE TABLE IF NOT EXISTS shop_distribution_orders (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        buyer_id TEXT,
        distributor_id TEXT NOT NULL,
        distribute_level INTEGER DEFAULT 1,
        goods_money REAL DEFAULT 0,
        commission REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        settled_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 分销提现
      CREATE TABLE IF NOT EXISTS shop_distribution_withdraw (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT,
        amount REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        account TEXT,
        account_name TEXT,
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 仓库
      CREATE TABLE IF NOT EXISTS shop_warehouse (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT DEFAULT '',
        address TEXT DEFAULT '',
        contact TEXT DEFAULT '',
        remark TEXT DEFAULT '',
        is_default INTEGER DEFAULT 0,
        status INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 仓库商品库存
      CREATE TABLE IF NOT EXISTS shop_warehouse_goods (
        id TEXT PRIMARY KEY,
        warehouse_id TEXT NOT NULL,
        goods_id TEXT NOT NULL,
        sku_code TEXT DEFAULT '',
        stock INTEGER DEFAULT 0,
        freeze_stock INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(warehouse_id, goods_id)
      );

      -- 库存变动日志
      CREATE TABLE IF NOT EXISTS shop_stock_logs (
        id TEXT PRIMARY KEY,
        warehouse_id TEXT,
        goods_id TEXT,
        sku_code TEXT DEFAULT '',
        type TEXT DEFAULT 'in',
        num INTEGER DEFAULT 0,
        after_stock INTEGER DEFAULT 0,
        remark TEXT DEFAULT '',
        operator TEXT DEFAULT '',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 地区数据(省市区三级)
      CREATE TABLE IF NOT EXISTS shop_region (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT DEFAULT '0',
        level INTEGER DEFAULT 1,
        code TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 支付方式配置
      CREATE TABLE IF NOT EXISTS shop_pay_methods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        is_open INTEGER DEFAULT 1,
        config TEXT DEFAULT '{}',
        sort_order INTEGER DEFAULT 0
      );

      -- 系统配置(键值)
      CREATE TABLE IF NOT EXISTS shop_sys_config (
        id TEXT PRIMARY KEY,
        cfg_key TEXT UNIQUE NOT NULL,
        cfg_value TEXT DEFAULT '',
        remark TEXT DEFAULT '',
        updated_at TEXT
      );

      -- 页面装修
      CREATE TABLE IF NOT EXISTS shop_page_design (
        id TEXT PRIMARY KEY,
        page_key TEXT NOT NULL,
        title TEXT,
        blocks TEXT DEFAULT '[]',
        status INTEGER DEFAULT 1,
        updated_at TEXT
      );

      -- 友情链接
      CREATE TABLE IF NOT EXISTS shop_links (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        logo_url TEXT,
        sort_order INTEGER DEFAULT 0,
        is_show INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 商品参数
      CREATE TABLE IF NOT EXISTS shop_goods_params (
        id TEXT PRIMARY KEY,
        category_id TEXT,
        name TEXT NOT NULL,
        value TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- CMS文章评论
      CREATE TABLE IF NOT EXISTS cms_comments (
        id TEXT PRIMARY KEY,
        article_id TEXT,
        user_id TEXT,
        user_name TEXT DEFAULT '匿名',
        user_avatar TEXT,
        content TEXT NOT NULL,
        parent_id TEXT,
        reply_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 商品浏览历史
      CREATE TABLE IF NOT EXISTS shop_history (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        goods_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 搜索历史
      CREATE TABLE IF NOT EXISTS shop_search_history (
                type TEXT DEFAULT "goods",
        id TEXT PRIMARY KEY,
        user_id TEXT,
        keyword TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 用户会话
      CREATE TABLE IF NOT EXISTS shop_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        token TEXT,
        expires_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 商城用户
      CREATE TABLE IF NOT EXISTS shop_users (
                last_login TEXT,
        updated_at TEXT,
        points INTEGER DEFAULT 0,
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        email TEXT,
        password TEXT,
        avatar TEXT,
        integral INTEGER DEFAULT 0,
        balance REAL DEFAULT 0,
        level TEXT DEFAULT 'normal',
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );


      CREATE TABLE IF NOT EXISTS document_permissions (
        id TEXT PRIMARY KEY, document_id TEXT, user_id TEXT, role_id TEXT,
        perm_type TEXT DEFAULT 'read', created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS folder_permissions (
        id TEXT PRIMARY KEY, folder_id TEXT, user_id TEXT, role_id TEXT,
        perm_type TEXT DEFAULT 'read', created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS file_storage (
        id TEXT PRIMARY KEY, file_name TEXT, file_path TEXT, file_size INTEGER,
        mime_type TEXT, entity_type TEXT, entity_id TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS survey_options (
        id TEXT PRIMARY KEY, question_id TEXT, option_text TEXT,
        sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS scheduled_tasks (
        id TEXT PRIMARY KEY, name TEXT, cron_expr TEXT, handler TEXT,
        is_active INTEGER DEFAULT 1, last_run TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );


      -- 商品评论（增强版）
      CREATE TABLE IF NOT EXISTS shop_goods_comments (
        id TEXT PRIMARY KEY,
        goods_id TEXT NOT NULL,
        order_id TEXT,
        order_goods_id TEXT,
        user_id TEXT NOT NULL,
        user_name TEXT,
        user_avatar TEXT,
        rating INTEGER DEFAULT 5,
        content TEXT,
        images TEXT DEFAULT '[]',
        videos TEXT DEFAULT '[]',
        is_anonymous INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        admin_reply TEXT,
        admin_reply_time TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 商品评论回复
      CREATE TABLE IF NOT EXISTS shop_comment_replies (
        id TEXT PRIMARY KEY,
        comment_id TEXT NOT NULL,
        user_id TEXT,
        user_name TEXT,
        content TEXT,
        like_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- ============ CMS内容管理系统核心表 ============

      -- 网站栏目（多级栏目树）
      CREATE TABLE IF NOT EXISTS cms_channels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        code TEXT UNIQUE,
        type TEXT DEFAULT 'list',
        content_model TEXT DEFAULT 'article',
        sort_order INTEGER DEFAULT 0,
        is_show INTEGER DEFAULT 1,
        image_url TEXT,
        description TEXT,
        seo_title TEXT,
        seo_keywords TEXT,
        seo_description TEXT,
        template_list TEXT,
        template_detail TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 内容模型
      CREATE TABLE IF NOT EXISTS cms_content_models (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE,
        fields TEXT DEFAULT '[]',
        is_system INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 内容扩展字段
      CREATE TABLE IF NOT EXISTS cms_content_fields (
        id TEXT PRIMARY KEY,
        model_id TEXT NOT NULL,
        name TEXT NOT NULL,
        field_key TEXT NOT NULL,
        field_type TEXT DEFAULT 'text',
        options TEXT DEFAULT '{}',
        is_required INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 文章内容（增强版）
      CREATE TABLE IF NOT EXISTS cms_articles (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        author TEXT,
        source TEXT,
        summary TEXT,
        content TEXT,
        image_url TEXT,
        images TEXT DEFAULT '[]',
        video_url TEXT,
        attachments TEXT DEFAULT '[]',
        tags TEXT DEFAULT '[]',
        keywords TEXT,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        favorite_count INTEGER DEFAULT 0,
        is_top INTEGER DEFAULT 0,
        is_hot INTEGER DEFAULT 0,
        is_recommend INTEGER DEFAULT 0,
        is_bold INTEGER DEFAULT 0,
        status TEXT DEFAULT 'draft',
        publish_time TEXT,
        seo_title TEXT,
        seo_keywords TEXT,
        seo_description TEXT,
        template TEXT,
        created_by TEXT,
        custom_fields TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 文章评论
      CREATE TABLE IF NOT EXISTS cms_article_comments (
        id TEXT PRIMARY KEY,
        article_id TEXT NOT NULL,
        user_id TEXT,
        user_name TEXT,
        user_email TEXT,
        content TEXT,
        parent_id TEXT,
        reply_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        ip TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 内容标签
      CREATE TABLE IF NOT EXISTS cms_tags (
                use_count INTEGER DEFAULT 0,
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT UNIQUE,
        description TEXT,
        article_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 内容-标签关联
      CREATE TABLE IF NOT EXISTS cms_article_tags (
        id TEXT PRIMARY KEY,
        article_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        UNIQUE(article_id, tag_id)
      );

      -- 内容分组（专题）
      CREATE TABLE IF NOT EXISTS cms_content_groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'topic',
        description TEXT,
        image_url TEXT,
        article_ids TEXT DEFAULT '[]',
        sort_order INTEGER DEFAULT 0,
        is_show INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 表单模板
      CREATE TABLE IF NOT EXISTS cms_forms (
                settings TEXT,
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        fields TEXT DEFAULT '[]',
        success_message TEXT,
        redirect_url TEXT,
        is_active INTEGER DEFAULT 1,
        submit_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 表单提交数据
      CREATE TABLE IF NOT EXISTS cms_form_submissions (
        id TEXT PRIMARY KEY,
        form_id TEXT NOT NULL,
        data TEXT DEFAULT '{}',
        user_id TEXT,
        user_name TEXT,
        ip TEXT,
        status TEXT DEFAULT 'new',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 留言板
      CREATE TABLE IF NOT EXISTS cms_messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        content TEXT,
        reply TEXT,
        reply_time TEXT,
        status TEXT DEFAULT 'pending',
        ip TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 模板管理
      CREATE TABLE IF NOT EXISTS cms_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE,
        type TEXT DEFAULT 'page',
        content TEXT,
        is_system INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 网站配置
      CREATE TABLE IF NOT EXISTS cms_site_config (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        type TEXT DEFAULT 'string',
        config_group TEXT DEFAULT 'basic',
        description TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- CMS幻灯片
      CREATE TABLE IF NOT EXISTS cms_slides (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        image_url TEXT,
        link_url TEXT,
        position TEXT DEFAULT 'home',
        sort_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        start_time TEXT,
        end_time TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- CMS导航
      CREATE TABLE IF NOT EXISTS cms_navigation (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT,
        icon TEXT,
        parent_id TEXT,
        location TEXT DEFAULT 'header',
        sort_order INTEGER DEFAULT 0,
        is_show INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- CMS表单字段
      CREATE TABLE IF NOT EXISTS cms_form_fields (
        id TEXT PRIMARY KEY,
        form_id TEXT NOT NULL,
        name TEXT NOT NULL,
        label TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        required INTEGER DEFAULT 0,
        options TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- CMS表单数据
      CREATE TABLE IF NOT EXISTS cms_form_data (
        id TEXT PRIMARY KEY,
        form_id TEXT NOT NULL,
        data TEXT,
        ip TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- CMS用户
      CREATE TABLE IF NOT EXISTS cms_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        nickname TEXT,
        avatar TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- CMS用户会话
      CREATE TABLE IF NOT EXISTS cms_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- CMS链接
      CREATE TABLE IF NOT EXISTS cms_links (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        logo TEXT,
        type TEXT DEFAULT 'friend',
        sort_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- CMS配置
      CREATE TABLE IF NOT EXISTS cms_config (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- ============ 索引 ============
      CREATE INDEX IF NOT EXISTS idx_shop_category_parent ON shop_categories(parent_id);
      CREATE INDEX IF NOT EXISTS idx_shop_goods_category ON shop_goods(category_id);
      CREATE INDEX IF NOT EXISTS idx_shop_goods_brand ON shop_goods(brand_id);
      CREATE INDEX IF NOT EXISTS idx_shop_goods_status ON shop_goods(status);
      CREATE INDEX IF NOT EXISTS idx_shop_goods_hot ON shop_goods(is_hot);
      CREATE INDEX IF NOT EXISTS idx_shop_goods_new ON shop_goods(is_new);
      CREATE INDEX IF NOT EXISTS idx_shop_goods_recommend ON shop_goods(is_recommend);
      CREATE INDEX IF NOT EXISTS idx_shop_order_user ON shop_orders_v2(user_id);
      CREATE INDEX IF NOT EXISTS idx_shop_order_status ON shop_orders_v2(order_status);
      CREATE INDEX IF NOT EXISTS idx_shop_order_pay_status ON shop_orders_v2(pay_status);
      CREATE INDEX IF NOT EXISTS idx_shop_order_no ON shop_orders_v2(order_no);
      CREATE INDEX IF NOT EXISTS idx_shop_comment_goods ON shop_goods_comments(goods_id);
      CREATE INDEX IF NOT EXISTS idx_shop_user_favorite ON shop_user_favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_shop_integral_user ON shop_integral_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_cms_channel_parent ON cms_channels(parent_id);
      CREATE INDEX IF NOT EXISTS idx_cms_article_channel ON cms_articles(channel_id);
      CREATE INDEX IF NOT EXISTS idx_cms_article_status ON cms_articles(status);
      CREATE INDEX IF NOT EXISTS idx_cms_article_publish ON cms_articles(publish_time);
      CREATE INDEX IF NOT EXISTS idx_cms_comment_article ON cms_article_comments(article_id);
      CREATE INDEX IF NOT EXISTS idx_cms_tag_name ON cms_tags(name);
      CREATE INDEX IF NOT EXISTS idx_cms_slides_position ON cms_slides(position);
      CREATE INDEX IF NOT EXISTS idx_cms_slides_status ON cms_slides(status);
      CREATE INDEX IF NOT EXISTS idx_cms_navigation_location ON cms_navigation(location);
      CREATE INDEX IF NOT EXISTS idx_cms_navigation_parent ON cms_navigation(parent_id);
      CREATE INDEX IF NOT EXISTS idx_cms_form_fields_form ON cms_form_fields(form_id);
      CREATE INDEX IF NOT EXISTS idx_cms_form_data_form ON cms_form_data(form_id);
      CREATE INDEX IF NOT EXISTS idx_cms_users_username ON cms_users(username);
      CREATE INDEX IF NOT EXISTS idx_cms_sessions_token ON cms_sessions(token);
      CREATE INDEX IF NOT EXISTS idx_cms_sessions_user ON cms_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_cms_links_type ON cms_links(type);
      CREATE INDEX IF NOT EXISTS idx_cms_links_status ON cms_links(status);
      CREATE INDEX IF NOT EXISTS idx_cms_config_key ON cms_config(key);
    `);
  }

  private migrateColumns() {
    const addCol = (table: string, col: string, def: string) => {
      try {
        const info = this.db.prepare(`PRAGMA table_info(${table})`).all() as any[];
        if (!info.find((c) => c.name === col)) {
          this.db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
        }
      } catch (e) { /* ignore */ }
    };
    addCol('cms_articles', 'is_bold', 'INTEGER DEFAULT 0');
    addCol('shop_goods', 'video_url', 'TEXT DEFAULT \'\'');
    addCol('cms_articles', 'custom_fields', 'TEXT DEFAULT \'{}\'');
    addCol('cms_articles', 'sensitive_hits', 'TEXT DEFAULT \'[]\'');
    // 敏感词表
    this.db.exec(`CREATE TABLE IF NOT EXISTS cms_sensitive_words (
      id TEXT PRIMARY KEY, word TEXT UNIQUE, level INTEGER DEFAULT 1, created_at TEXT
    )`);
    // 文章附件
    this.db.exec(`CREATE TABLE IF NOT EXISTS cms_article_attachments (
      id TEXT PRIMARY KEY, article_id TEXT, file_name TEXT, file_path TEXT, file_size INTEGER, created_at TEXT
    )`);
    const swCount = (this.db.prepare('SELECT COUNT(*) AS c FROM cms_sensitive_words').get() as any).c;
    if (swCount === 0) {
      const demo = ['暴力', '色情', '赌博', '政治敏感词', '诈骗'];
      const ins = this.db.prepare('INSERT OR IGNORE INTO cms_sensitive_words (id, word, level, created_at) VALUES (?, ?, 1, ?)');
      demo.forEach((w, i) => ins.run('sw_' + (i + 1), w, new Date().toISOString()));
    }
    addCol('shop_goods', 'title_color', 'TEXT DEFAULT \'\'');
    addCol('shop_goods', 'sub_title', 'TEXT DEFAULT \'\'');
    addCol('shop_goods', 'gift_points', 'INTEGER DEFAULT 0');
    addCol('shop_goods', 'usage_guide', 'TEXT DEFAULT \'\'');
    addCol('shop_goods', 'mobile_content', 'TEXT DEFAULT \'\'');
    // 商品单/多分类模式
    addCol('shop_goods', 'category_mode', 'TEXT DEFAULT \'single\'');
    addCol('shop_goods', 'category_ids', 'TEXT DEFAULT \'[]\'');
    // 规格图片绑定（规格值 -> 图片URL 映射）
    addCol('shop_goods', 'spec_images', 'TEXT DEFAULT \'[]\'');
    // 商品扩展数据（自定义键值对）
    addCol('shop_goods', 'extend_data', 'TEXT DEFAULT \'[]\'');
    // 订单发货/物流字段（原 schema 缺失，导致发货写入报错）
    addCol('shop_orders', 'tracking_no', 'TEXT DEFAULT \'\'');
    addCol('shop_orders', 'tracking_company', 'TEXT DEFAULT \'\'');
    // 售后退货退款扩展字段（库存回滚 + 退货物流 + 退款状态机）
    addCol('shop_order_aftersale', 'return_tracking_no', 'TEXT DEFAULT \'\'');
    addCol('shop_order_aftersale', 'return_tracking_company', 'TEXT DEFAULT \'\'');
    addCol('shop_order_aftersale', 'return_shipped_at', 'TEXT');
    addCol('shop_order_aftersale', 'received_at', 'TEXT');
    addCol('shop_order_aftersale', 'refunded_at', 'TEXT');
    addCol('shop_order_aftersale', 'refund_method', 'TEXT DEFAULT \'\'');
    addCol('shop_order_aftersale', 'reviewer', 'TEXT DEFAULT \'\'');
    addCol('shop_order_aftersale', 'reject_reason', 'TEXT DEFAULT \'\'');
    addCol('shop_order_aftersale', 'updated_at', 'TEXT');
    addCol('ai_model_configs', 'is_default', 'INTEGER DEFAULT 0');
  }

  // 修正遗留外键：订单/评价明细的 product_id 原指向已弃用的 shop_products，
  // 实际商城使用 shop_goods，导致下单/评价时外键校验失败。将其重定向到 shop_goods。
  private migrateShopProductFks() {
    const retarget = (table: string) => {
      try {
        const fks = this.db.prepare(`PRAGMA foreign_key_list(${table})`).all() as any[];
        if (fks.some((f: any) => f.table === 'shop_products' && f.from === 'product_id')) {
          const tmp = `_${table}_old`;
          this.db.exec(`ALTER TABLE ${table} RENAME TO ${tmp}`);
          const cols = (this.db.prepare(`PRAGMA table_info(${tmp})`).all() as any[]).map((c: any) => c.name).join(', ');
          this.db.exec(`CREATE TABLE ${table} (
            id TEXT PRIMARY KEY,
            order_id TEXT REFERENCES shop_orders(id),
            product_id TEXT REFERENCES shop_goods(id),
            sku TEXT,
            product_name TEXT,
            quantity INTEGER DEFAULT 1,
            price REAL,
            amount REAL,
            remark TEXT
          )`);
          this.db.exec(`INSERT INTO ${table} (${cols}) SELECT ${cols} FROM ${tmp}`);
          this.db.exec(`DROP TABLE ${tmp}`);
          console.log(`[Database] retargeted ${table}.product_id -> shop_goods`);
        }
      } catch (e) { console.error('migrateShopProductFks failed', e); }
    };
    retarget('shop_order_items');
    try {
      const fks = this.db.prepare(`PRAGMA foreign_key_list(shop_reviews)`).all() as any[];
      if (fks.some((f: any) => f.table === 'shop_products' && f.from === 'product_id')) {
        this.db.exec('ALTER TABLE shop_reviews RENAME TO _shop_reviews_old');
        this.db.exec(`CREATE TABLE shop_reviews (
          id TEXT PRIMARY KEY,
          product_id TEXT REFERENCES shop_goods(id),
          order_id TEXT,
          user_id TEXT,
          user_name TEXT,
          rating INTEGER DEFAULT 5,
          content TEXT,
          images TEXT,
          status TEXT DEFAULT 'pending',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);
        this.db.exec('INSERT INTO shop_reviews SELECT * FROM _shop_reviews_old');
        this.db.exec('DROP TABLE _shop_reviews_old');
        console.log('[Database] retargeted shop_reviews.product_id -> shop_goods');
      }
    } catch (e) { console.error('migrateShopProductFks(reviews) failed', e); }
  }

  private seedDefaultData() {
    const empCount = this.db.prepare('SELECT COUNT(*) as c FROM employees').get() as { c: number };
    const permCount = this.db.prepare('SELECT COUNT(*) as c FROM permissions').get() as { c: number };
    const needSeedHRData = empCount.c === 0 || permCount.c === 0;

    if (needSeedHRData) {
      console.log('[Database] Seeding HR data...');
    }

    const now = new Date().toISOString();

    if (needSeedHRData) {
      // Permissions
      const perms = [
      { id: 'p_org', moduleName: '组织管理', moduleKey: 'organization', actions: JSON.stringify(['read', 'create', 'update', 'delete']) },
      { id: 'p_personnel', moduleName: '人事管理', moduleKey: 'personnel', actions: JSON.stringify(['read', 'create', 'update', 'delete']) },
      { id: 'p_attendance', moduleName: '考勤管理', moduleKey: 'attendance', actions: JSON.stringify(['read', 'create', 'update', 'delete']) },
      { id: 'p_salary', moduleName: '薪资管理', moduleKey: 'salary', actions: JSON.stringify(['read', 'create', 'update', 'delete']) },
      { id: 'p_performance', moduleName: '绩效管理', moduleKey: 'performance', actions: JSON.stringify(['read', 'create', 'update', 'delete']) },
      { id: 'p_recruitment', moduleName: '招聘管理', moduleKey: 'recruitment', actions: JSON.stringify(['read', 'create', 'update', 'delete']) },
      { id: 'p_training', moduleName: '培训管理', moduleKey: 'training', actions: JSON.stringify(['read', 'create', 'update', 'delete']) },
      { id: 'p_logistics', moduleName: '后勤管理', moduleKey: 'logistics', actions: JSON.stringify(['read', 'create', 'update', 'delete']) },
      { id: 'p_approval', moduleName: '流程审批', moduleKey: 'approval', actions: JSON.stringify(['read', 'create', 'update', 'delete', 'approve']) },
      { id: 'p_talent', moduleName: '人才发展', moduleKey: 'talent', actions: JSON.stringify(['read', 'create', 'update', 'delete']) },
      { id: 'p_statistics', moduleName: '统计分析', moduleKey: 'statistics', actions: JSON.stringify(['read', 'export']) },
      { id: 'p_system', moduleName: '系统管理', moduleKey: 'system', actions: JSON.stringify(['read', 'create', 'update', 'delete', 'execute']) },
    ];
    for (const p of perms) {
      this.db.prepare('INSERT INTO permissions VALUES (@id,@moduleName,@moduleKey,@actions,@description)').run({ ...p, description: '' });
    }

    // Roles
    const allPerms = perms.map(p => p.id);
    const roleList = [
      { id: 'role_super_admin', name: '超级管理员', code: 'super_admin', description: '系统最高权限', permissionIds: JSON.stringify(allPerms) },
      { id: 'role_hr_admin', name: '人事总监', code: 'hr_admin', description: '人力资源综合管理', permissionIds: JSON.stringify(['p_org','p_personnel','p_attendance','p_salary','p_performance','p_recruitment','p_training','p_logistics','p_approval','p_talent','p_statistics']) },
      { id: 'role_hr_staff', name: '人事专员', code: 'hr_staff', description: '人事日常事务', permissionIds: JSON.stringify(['p_personnel','p_attendance','p_salary','p_recruitment','p_logistics','p_approval']) },
      { id: 'role_dept_manager', name: '部门主管', code: 'dept_manager', description: '部门管理权限', permissionIds: JSON.stringify(['p_org','p_personnel','p_attendance','p_approval','p_performance','p_talent']) },
      { id: 'role_employee', name: '普通员工', code: 'employee', description: '基础权限', permissionIds: JSON.stringify(['p_personnel']) },
    ];
    for (const r of roleList) {
      this.db.prepare('INSERT INTO roles VALUES (@id,@name,@code,@description,@permissionIds,@type,@isActive,@createdAt)').run({ ...r, type: 'system', isActive: 1, createdAt: now });
    }

    // Users
    const userList = [
      { id: 'user_admin', username: 'admin', realName: '系统管理员', phone: '13800000001', email: 'admin@feida.com', password: this.hashPwd('admin123'), userType: 'super_admin', roleIds: JSON.stringify(['role_super_admin']), status: 'active' },
      { id: 'user_hr', username: 'hr_admin', realName: '人事主管', phone: '13800000002', email: 'hr@feida.com', password: this.hashPwd('hr123456'), userType: 'hr_admin', roleIds: JSON.stringify(['role_hr_admin']), status: 'active' },
      { id: 'user_hr2', username: 'hr_staff', realName: '人事专员小王', phone: '13800000003', email: 'hr2@feida.com', password: this.hashPwd('hr123456'), userType: 'hr_staff', roleIds: JSON.stringify(['role_hr_staff']), status: 'active' },
    ];
    for (const u of userList) {
      this.db.prepare('INSERT INTO users VALUES (@id,@username,@realName,@phone,@email,@password,@userType,@roleIds,@status,@employeeId,@lastLoginAt,@lastLoginIp,@createdAt)').run({ ...u, employeeId: null, lastLoginAt: null, lastLoginIp: null, createdAt: now });
    }

    // Departments
    const deptList = [
      { id: 'dept_1', name: '总经理办公室', parentId: null, level: 1, headcountPlan: 3, headcountActual: 2, sortOrder: 1 },
      { id: 'dept_2', name: '技术研发部', parentId: null, level: 1, headcountPlan: 20, headcountActual: 15, sortOrder: 2 },
      { id: 'dept_3', name: '产品设计部', parentId: null, level: 1, headcountPlan: 8, headcountActual: 6, sortOrder: 3 },
      { id: 'dept_4', name: '市场营销部', parentId: null, level: 1, headcountPlan: 12, headcountActual: 10, sortOrder: 4 },
      { id: 'dept_5', name: '人力资源部', parentId: null, level: 1, headcountPlan: 5, headcountActual: 4, sortOrder: 5 },
      { id: 'dept_6', name: '财务管理部', parentId: null, level: 1, headcountPlan: 6, headcountActual: 5, sortOrder: 6 },
      { id: 'dept_7', name: '行政后勤部', parentId: null, level: 1, headcountPlan: 8, headcountActual: 7, sortOrder: 7 },
      { id: 'dept_8', name: '品质管理部', parentId: null, level: 1, headcountPlan: 5, headcountActual: 4, sortOrder: 8 },
      { id: 'dept_9', name: '生产制造部', parentId: null, level: 1, headcountPlan: 30, headcountActual: 25, sortOrder: 9 },
      { id: 'dept_10', name: '前端开发组', parentId: 'dept_2', level: 2, headcountPlan: 6, headcountActual: 5, sortOrder: 10 },
      { id: 'dept_11', name: '后端开发组', parentId: 'dept_2', level: 2, headcountPlan: 8, headcountActual: 6, sortOrder: 11 },
      { id: 'dept_12', name: 'UI设计组', parentId: 'dept_3', level: 2, headcountPlan: 4, headcountActual: 3, sortOrder: 12 },
    ];
    for (const d of deptList) {
      this.db.prepare('INSERT INTO departments VALUES (@id,@name,@parentId,@level,@managerId,@headcountPlan,@headcountActual,@sortOrder,@isActive,@code,@createdAt)').run({ ...d, managerId: null, isActive: 1, code: `DEPT${d.id.split('_')[1]}`, createdAt: now });
    }

    // Ranks
    const rankList = [
      { id: 'rank_1', name: 'P1-初级', level: 1, baseSalary: 6000, positionSalary: 1000, mealAllowance: 300, transportAllowance: 200, salaryRange: '6000-9000' },
      { id: 'rank_2', name: 'P2-中级', level: 2, baseSalary: 9000, positionSalary: 2000, mealAllowance: 400, transportAllowance: 300, salaryRange: '9000-14000' },
      { id: 'rank_3', name: 'P3-高级', level: 3, baseSalary: 14000, positionSalary: 4000, mealAllowance: 500, transportAllowance: 500, salaryRange: '14000-20000' },
      { id: 'rank_4', name: 'M1-主管', level: 4, baseSalary: 18000, positionSalary: 6000, mealAllowance: 600, transportAllowance: 600, salaryRange: '18000-25000' },
      { id: 'rank_5', name: 'M2-经理', level: 5, baseSalary: 25000, positionSalary: 10000, mealAllowance: 800, transportAllowance: 800, salaryRange: '25000-35000' },
      { id: 'rank_6', name: 'D1-总监', level: 6, baseSalary: 35000, positionSalary: 15000, mealAllowance: 1000, transportAllowance: 1000, salaryRange: '35000-50000' },
    ];
    for (const r of rankList) {
      this.db.prepare('INSERT INTO ranks VALUES (@id,@name,@level,@baseSalary,@positionSalary,@mealAllowance,@transportAllowance,@salaryRange,@description,@isActive)').run({ ...r, description: '', isActive: 1 });
    }

    // Positions
    const posList = [
      { id: 'pos_1', name: '前端工程师', departmentId: 'dept_10', level: 'P1-P3', rankId: 'rank_1' },
      { id: 'pos_2', name: '前端主管', departmentId: 'dept_10', level: 'M1', rankId: 'rank_4' },
      { id: 'pos_3', name: '后端工程师', departmentId: 'dept_11', level: 'P1-P3', rankId: 'rank_1' },
      { id: 'pos_4', name: '后端主管', departmentId: 'dept_11', level: 'M1', rankId: 'rank_4' },
      { id: 'pos_5', name: 'UI设计师', departmentId: 'dept_12', level: 'P1-P3', rankId: 'rank_1' },
      { id: 'pos_6', name: '产品经理', departmentId: 'dept_3', level: 'P2-M2', rankId: 'rank_2' },
      { id: 'pos_7', name: 'HR专员', departmentId: 'dept_5', level: 'P1-P2', rankId: 'rank_1' },
      { id: 'pos_8', name: 'HR经理', departmentId: 'dept_5', level: 'M1-M2', rankId: 'rank_4' },
      { id: 'pos_9', name: '财务专员', departmentId: 'dept_6', level: 'P1-P2', rankId: 'rank_1' },
      { id: 'pos_10', name: '销售代表', departmentId: 'dept_4', level: 'P1-P3', rankId: 'rank_1' },
      { id: 'pos_11', name: '生产工人', departmentId: 'dept_9', level: 'P1', rankId: 'rank_1' },
      { id: 'pos_12', name: '质检员', departmentId: 'dept_8', level: 'P1-P2', rankId: 'rank_1' },
    ];
    for (const p of posList) {
      this.db.prepare('INSERT INTO positions VALUES (@id,@name,@departmentId,@level,@rankId,@headcountPlan,@headcountActual,@sortOrder,@isActive,@createdAt)').run({ ...p, headcountPlan: 0, headcountActual: 0, sortOrder: 0, isActive: 1, createdAt: now });
    }

    // Employees
    const empNames = ['张明辉','李雅琴','王志强','刘芳芳','陈建国','赵雅婷','周伟明','吴晓燕','孙国庆','郑海涛','杨秀英','林志远','黄文博','徐丽娟','马建新','胡淑芬','朱洪亮','高峰云','方雅琴','任海波','曾小红','丁建平','冯雅静','于文杰','谢秀兰','邓志强','许海燕','韩丽娟','唐建华','冯雅芳','彭海涛','蒋秀英','蔡志明','余雅琴','杜建新','戴丽娟','焦洪亮','万云峰','段雅静','常文杰','武秀兰','乔海燕','贺建华','赖雅芳','龚志强','翟海涛','窦秀英','邬明辉'];
    const empDepts = ['技术研发部','技术研发部','技术研发部','产品设计部','产品设计部','市场营销部','市场营销部','人力资源部','财务管理部','行政后勤部','品质管理部','生产制造部','前端开发组','前端开发组','前端开发组','后端开发组','后端开发组','后端开发组','UI设计组','UI设计组','技术研发部','产品设计部','市场营销部','人力资源部','财务管理部','行政后勤部','品质管理部','生产制造部','前端开发组','后端开发组','UI设计组','市场营销部','财务管理部','行政后勤部','品质管理部','生产制造部','人力资源部','财务管理部','行政后勤部','品质管理部','生产制造部','技术研发部','产品设计部','市场营销部','人力资源部','财务管理部'];
    const empPos = ['前端工程师','后端工程师','前端主管','UI设计师','产品经理','销售代表','销售代表','HR专员','财务专员','行政专员','质检员','生产工人','前端工程师','前端工程师','前端主管','后端工程师','后端工程师','后端主管','UI设计师','UI设计师','前端工程师','产品经理','销售代表','HR经理','财务专员','行政专员','质检员','生产工人','前端工程师','后端工程师','UI设计师','销售代表','财务专员','行政专员','质检员','生产工人','HR专员','财务专员','行政专员','质检员','生产工人','前端工程师','产品经理','销售代表','HR专员','财务专员'];
    const empDeptIds = ['dept_2','dept_2','dept_2','dept_3','dept_3','dept_4','dept_4','dept_5','dept_6','dept_7','dept_8','dept_9','dept_10','dept_10','dept_10','dept_11','dept_11','dept_11','dept_12','dept_12','dept_2','dept_3','dept_4','dept_5','dept_6','dept_7','dept_8','dept_9','dept_10','dept_11','dept_12','dept_4','dept_6','dept_7','dept_8','dept_9','dept_5','dept_6','dept_7','dept_8','dept_9','dept_2','dept_3','dept_4','dept_5','dept_6'];
    const empRankIds = ['rank_1','rank_2','rank_4','rank_2','rank_3','rank_1','rank_2','rank_1','rank_1','rank_1','rank_1','rank_1','rank_1','rank_2','rank_4','rank_1','rank_2','rank_4','rank_1','rank_2','rank_1','rank_3','rank_1','rank_4','rank_1','rank_1','rank_1','rank_1','rank_1','rank_2','rank_2','rank_2','rank_2','rank_1','rank_1','rank_1','rank_1','rank_2','rank_1','rank_1','rank_1','rank_3','rank_3','rank_2','rank_2','rank_3'];
    const locs = ['shenzhen','nanjing','jiangxi'];
    const ranks = this.db.prepare('SELECT * FROM ranks').all() as any[];

    const insertEmp = this.db.prepare(`INSERT INTO employees (id,name,employeeId,department,position,rank,status,hireDate,phone,email,salaryLocation,birthday,gender,idCard,address,deptId,positionId,createdAt,updatedAt) VALUES (@id,@name,@employeeId,@department,@position,@rank,@status,@hireDate,@phone,@email,@salaryLocation,@birthday,@gender,@idCard,@address,@deptId,@positionId,@createdAt,@updatedAt)`);
    for (let i = 0; i < 48; i++) {
      const rank = ranks.find(r => r.id === empRankIds[i]) || ranks[0];
      insertEmp.run({
        id: `emp-${i + 1}`, name: empNames[i], employeeId: `FD${String(i + 1).padStart(4, '0')}`,
        department: empDepts[i], position: empPos[i], rank: rank.name,
        status: 'active', hireDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        phone: `138${String(10000000 + i).padStart(8, '0')}`, email: `emp${i + 1}@feida.com`,
        salaryLocation: locs[i % 3], birthday: `199${i % 10}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        gender: i % 2 === 0 ? 'male' : 'female',
        idCard: `420106199${i % 10}0101${String(i + 1).padStart(4, '0')}`,
        address: `湖北省武汉市洪山区珞喻路${i + 1}号`,
        deptId: empDeptIds[i], positionId: `pos_${(i % 12) + 1}`,
        createdAt: now, updatedAt: now,
      });
    }

    // Shift types
    const shiftTypes = [
      { id: 'st_1', name: '标准班', kind: 'regular', startTime: '09:00', endTime: '18:00', lateThreshold: 15, earlyLeaveThreshold: 15, overtimeThreshold: 30, workHours: 8, isActive: 1, color: '#3B82F6' },
      { id: 'st_2', name: '早班', kind: 'regular', startTime: '07:00', endTime: '16:00', lateThreshold: 10, earlyLeaveThreshold: 10, overtimeThreshold: 30, workHours: 8, isActive: 1, color: '#F59E0B' },
      { id: 'st_3', name: '晚班', kind: 'night', startTime: '16:00', endTime: '01:00', lateThreshold: 15, earlyLeaveThreshold: 15, overtimeThreshold: 30, workHours: 8, isActive: 1, color: '#6366F1' },
      { id: 'st_4', name: '半天班', kind: 'halfday', startTime: '09:00', endTime: '13:00', lateThreshold: 10, earlyLeaveThreshold: 10, overtimeThreshold: 30, workHours: 4, isActive: 1, color: '#10B981' },
      { id: 'st_5', name: '弹性班', kind: 'flexible', startTime: '08:00', endTime: '20:00', lateThreshold: 30, earlyLeaveThreshold: 30, overtimeThreshold: 60, workHours: 8, isActive: 0, color: '#8B5CF6' },
      { id: 'st_6', name: '休息日', kind: 'rest', startTime: '', endTime: '', lateThreshold: 0, earlyLeaveThreshold: 0, overtimeThreshold: 0, workHours: 0, isActive: 1, color: '#9CA3AF' },
    ];
    for (const s of shiftTypes) {
      this.db.prepare('INSERT INTO shift_types VALUES (@id,@name,@kind,@startTime,@endTime,@lateThreshold,@earlyLeaveThreshold,@overtimeThreshold,@workHours,@isActive,@remark,@color,@createdAt)').run({ ...s, remark: '', createdAt: now });
    }

    // Check locations
    const locs2 = [
      { id: 'loc_1', name: '总部大厦', address: '深圳市南山区科技园南区A1栋', latitude: 22.5431, longitude: 114.0579, radius: 200, isActive: 1 },
      { id: 'loc_2', name: '研发中心', address: '深圳市南山区高新科技园B座', latitude: 22.5401, longitude: 114.0612, radius: 150, isActive: 1 },
      { id: 'loc_3', name: '南昌工厂', address: '江西省南昌市青山湖区高新技术产业开发区', latitude: 28.6820, longitude: 115.8579, radius: 300, isActive: 1 },
      { id: 'loc_4', name: '南京分部', address: '南京市江宁区麒麟科技创新园', latitude: 31.9544, longitude: 118.8681, radius: 200, isActive: 1 },
    ];
    for (const l of locs2) {
      this.db.prepare('INSERT INTO check_locations VALUES (@id,@name,@address,@latitude,@longitude,@radius,@isActive,@createdAt)').run({ ...l, createdAt: now });
    }

    // Attendance rules
    this.db.prepare('INSERT INTO attendance_rules VALUES (@id,@name,@annualLeaveBase,@annualLeaveIncrement,@annualLeaveMax,@annualLeaveCarryOver,@annualLeaveCarryMax,@annualLeaveExpireMonths,@defaultAttendanceMode,@appCheckLocations,@latePenaltyRule,@absentPenaltyRule,@exemptEmployeeIds,@isActive,@createdAt)').run({
      id: 'rule_default', name: '默认考勤规则', annualLeaveBase: 5, annualLeaveIncrement: 1, annualLeaveMax: 15, annualLeaveCarryOver: 1, annualLeaveCarryMax: 5, annualLeaveExpireMonths: 12,
      defaultAttendanceMode: 'app', appCheckLocations: JSON.stringify(['loc_1', 'loc_2']),
      latePenaltyRule: JSON.stringify({ enabled: true, thresholds: [10, 30, 60], penalties: [0, 50, 100] }),
      absentPenaltyRule: JSON.stringify({ enabled: true, halfDayPenalty: 100, fullDayPenalty: 200 }),
      exemptEmployeeIds: JSON.stringify([]), isActive: 1, createdAt: now,
    });

    // Recruitment positions
    const recruitPos = [
      { id: 'rp_1', title: '高级前端工程师', department: '技术研发部', headcount: 2, salaryRange: '18K-28K', status: 'active', priority: 'high' },
      { id: 'rp_2', title: '后端架构师', department: '技术研发部', headcount: 1, salaryRange: '25K-40K', status: 'active', priority: 'high' },
      { id: 'rp_3', title: '产品经理', department: '产品设计部', headcount: 1, salaryRange: '18K-30K', status: 'active', priority: 'normal' },
      { id: 'rp_4', title: 'UI设计师', department: '产品设计部', headcount: 2, salaryRange: '12K-20K', status: 'active', priority: 'normal' },
      { id: 'rp_5', title: '销售经理', department: '市场营销部', headcount: 3, salaryRange: '10K-18K+提成', status: 'active', priority: 'normal' },
      { id: 'rp_6', title: 'HR专员', department: '人力资源部', headcount: 1, salaryRange: '8K-12K', status: 'paused', priority: 'low' },
    ];
    for (const p of recruitPos) {
      this.db.prepare('INSERT INTO recruitment_positions VALUES (@id,@title,@department,@headcount,@filledCount,@salaryRange,@status,@priority,@description,@requirements,@workLocation,@employmentType,@recruiterId,@createdAt)').run({ ...p, filledCount: 0, description: '', requirements: '', workLocation: '深圳', employmentType: 'fulltime', recruiterId: null, createdAt: now });
    }

    // Candidates
    const candNames = ['李明辉','王芳华','张海涛','刘雅琴','陈志强','周丽娟','吴建华','徐文博','孙秀英','郑海燕'];
    const candPos = ['rp_1','rp_1','rp_2','rp_3','rp_4','rp_4','rp_5','rp_5','rp_3','rp_6'];
    const candTitles = ['高级前端工程师','高级前端工程师','后端架构师','产品经理','UI设计师','UI设计师','销售经理','销售经理','产品经理','HR专员'];
    const candStatuses = ['interview','offer','new','interview','screening','new','offer','new','screening','interview'];
    const candSources = ['Boss直聘','智联招聘','猎聘','前程无忧','内部推荐','Boss直聘','智联招聘','猎聘','前程无忧','内部推荐'];
    const candCompanies = ['腾讯','阿里巴巴','字节跳动','美团','京东','小米','华为','网易','百度','滴滴'];
    for (let i = 0; i < 10; i++) {
      this.db.prepare('INSERT INTO candidates VALUES (@id,@name,@phone,@email,@gender,@age,@education,@major,@positionId,@positionTitle,@source,@status,@resumeUrl,@currentCompany,@currentPosition,@expectedSalary,@interviewDate,@interviewResult,@offerStatus,@testScore,@interviewFeedback,@tags,@talentPoolId,@blacklisted,@remark,@createdAt)').run({
        id: `cand_${i + 1}`, name: candNames[i], phone: `139${String(20000000 + i).padStart(8, '0')}`, email: `candidate${i + 1}@email.com`,
        gender: i % 2 === 0 ? 'male' : 'female', age: 25 + (i % 10), education: ['本科','硕士','本科','本科','硕士','大专','本科','本科','硕士','本科'][i],
        major: ['计算机科学','软件工程','工商管理','艺术设计','市场营销','人力资源','机械工程','电子信息','经济学','会计学'][i],
        positionId: candPos[i], positionTitle: candTitles[i], source: candSources[i],
        status: candStatuses[i], resumeUrl: '', currentCompany: candCompanies[i],
        currentPosition: ['高级工程师','产品经理','设计师','销售主管','HR专员'][i % 5], expectedSalary: `${8 + (i % 5) * 2}K-${12 + (i % 5) * 3}K`,
        interviewDate: i < 5 ? `2026-04-${String(15 + i).padStart(2, '0')}` : null, interviewResult: i < 3 ? '优秀' : null, offerStatus: i === 1 ? 'accepted' : null,
        testScore: 70 + (i % 3) * 10, interviewFeedback: '', tags: JSON.stringify([]), talentPoolId: null, blacklisted: 0, remark: '', createdAt: now,
      });
    }

    // KPIs
    const kpiList = [
      { id: 'kpi_1', name: '代码质量', category: '技术类', weight: 25, target: 'Bug率 < 3%', description: '代码评审通过率 + Bug密度', scoringMethod: 'manual' },
      { id: 'kpi_2', name: '项目交付', category: '技术类', weight: 30, target: '按时完成率 >= 90%', description: '按里程碑交付的项目占比', scoringMethod: 'formula' },
      { id: 'kpi_3', name: '需求响应', category: '技术类', weight: 15, target: '平均响应时间 < 2小时', description: '需求平均响应时间', scoringMethod: 'manual' },
      { id: 'kpi_4', name: '团队协作', category: '通用类', weight: 15, target: '满意度 >= 90%', description: '团队成员互评得分', scoringMethod: '360' },
      { id: 'kpi_5', name: '学习成长', category: '通用类', weight: 10, target: '培训完成率 100%', description: '年度培训计划完成情况', scoringMethod: 'manual' },
      { id: 'kpi_6', name: '创新能力', category: '加分项', weight: 5, target: '提案数量', description: '技术改进提案、专利、论文等', scoringMethod: 'manual' },
    ];
    for (const k of kpiList) {
      this.db.prepare('INSERT INTO kpis VALUES (@id,@name,@category,@weight,@target,@description,@scoringMethod,@formula,@dataSource,@isActive,@createdAt)').run({ ...k, formula: '', dataSource: '', isActive: 1, createdAt: now });
    }

    // Performance cycles
    this.db.prepare('INSERT INTO performance_cycles VALUES (@id,@name,@startDate,@endDate,@status,@cycleType,@participants,@completedCount,@gradeDistribution,@createdAt)').run({
      id: 'cycle_2026q1', name: '2026年Q1绩效考核', startDate: '2026-01-01', endDate: '2026-03-31', status: 'completed', cycleType: 'quarterly', participants: 48, completedCount: 48,
      gradeDistribution: JSON.stringify({ S: 5, A: 15, B: 20, C: 6, D: 2 }), createdAt: now,
    });
    this.db.prepare('INSERT INTO performance_cycles VALUES (@id,@name,@startDate,@endDate,@status,@cycleType,@participants,@completedCount,@gradeDistribution,@createdAt)').run({
      id: 'cycle_2026q2', name: '2026年Q2绩效考核', startDate: '2026-04-01', endDate: '2026-06-30', status: 'active', cycleType: 'quarterly', participants: 48, completedCount: 12,
      gradeDistribution: JSON.stringify({ S: 5, A: 15, B: 20, C: 6, D: 2 }), createdAt: now,
    });

    // Performance grades
    const gradeList = [
      { id: 'grade_s', name: 'S-卓越', scoreMin: 95, scoreMax: 100, description: '超出期望', color: '#10B981', sortOrder: 1 },
      { id: 'grade_a', name: 'A-优秀', scoreMin: 85, scoreMax: 94, description: '超出期望', color: '#3B82F6', sortOrder: 2 },
      { id: 'grade_b', name: 'B-良好', scoreMin: 70, scoreMax: 84, description: '符合期望', color: '#F59E0B', sortOrder: 3 },
      { id: 'grade_c', name: 'C-合格', scoreMin: 60, scoreMax: 69, description: '基本符合', color: '#EF4444', sortOrder: 4 },
      { id: 'grade_d', name: 'D-不合格', scoreMin: 0, scoreMax: 59, description: '需改进', color: '#6B7280', sortOrder: 5 },
    ];
    for (const g of gradeList) {
      this.db.prepare('INSERT INTO performance_grades VALUES (@id,@name,@scoreMin,@scoreMax,@description,@color,@sortOrder,@createdAt)').run({ ...g, createdAt: now });
    }

    // Dormitories
    const dormList = [
      { id: 'dorm_a1', building: 'A栋', room: '101', floor: 1, capacity: 4, occupied: 3, managerId: 'emp-5', managerName: '刘芳芳' },
      { id: 'dorm_a2', building: 'A栋', room: '102', floor: 1, capacity: 4, occupied: 4, managerId: 'emp-5', managerName: '刘芳芳' },
      { id: 'dorm_a3', building: 'A栋', room: '201', floor: 2, capacity: 4, occupied: 2, managerId: 'emp-5', managerName: '刘芳芳' },
      { id: 'dorm_b1', building: 'B栋', room: '101', floor: 1, capacity: 2, occupied: 1, managerId: 'emp-10', managerName: '郑海涛' },
      { id: 'dorm_b2', building: 'B栋', room: '102', floor: 1, capacity: 2, occupied: 2, managerId: 'emp-10', managerName: '郑海涛' },
    ];
    for (const d of dormList) {
      this.db.prepare('INSERT INTO dormitories VALUES (@id,@building,@room,@floor,@capacity,@occupied,@area,@managerId,@managerName,@status,@remark,@createdAt)').run({ ...d, area: 25, status: d.occupied >= d.capacity ? 'full' : 'available', remark: '', createdAt: now });
    }

    // Vehicles
    const vehList = [
      { id: 'veh_1', plateNumber: '粤B12345', vehicleType: '轿车', brand: '丰田凯美瑞', model: '2022款', color: '黑色', driverId: 'emp-7', driverName: '周伟明', status: 'available' },
      { id: 'veh_2', plateNumber: '粤B67890', vehicleType: '商务车', brand: '别克GL8', model: '2023款', color: '白色', driverId: 'emp-7', driverName: '周伟明', status: 'available' },
      { id: 'veh_3', plateNumber: '粤B11111', vehicleType: '货车', brand: '东风货车', model: '4.2米', color: '蓝色', driverId: 'emp-11', driverName: '杨秀英', status: 'available' },
    ];
    for (const v of vehList) {
      this.db.prepare('INSERT INTO vehicles VALUES (@id,@plateNumber,@vehicleType,@brand,@model,@color,@driverId,@driverName,@status,@mileage,@insuranceExpiry,@remark,@createdAt)').run({ ...v, mileage: 15000, insuranceExpiry: '2027-03-01', remark: '', createdAt: now });
    }

    // System config
    const configs = [
      { key: 'company_name', label: '公司名称', value: '飞达智能科技有限公司', type: 'string', category: 'basic' },
      { key: 'company_code', label: '统一社会信用代码', value: '91440300MA5xxxxxxx', type: 'string', category: 'basic' },
      { key: 'attendance_threshold', label: '考勤宽限时间(分钟)', value: '15', type: 'number', category: 'attendance' },
      { key: 'enable_overtime', label: '启用加班管理', value: 'true', type: 'boolean', category: 'attendance' },
      { key: 'salary_day', label: '发薪日', value: '15', type: 'number', category: 'salary' },
      { key: 'contract_reminder_days', label: '合同到期提醒天数', value: '30', type: 'number', category: 'contract' },
      { key: 'annual_leave_base', label: '年假基础天数', value: '5', type: 'number', category: 'attendance' },
      { key: 'enable_birthday_card', label: '启用生日祝福', value: 'true', type: 'boolean', category: 'hr' },
      { key: 'enable_approval_flow', label: '启用审批流程', value: 'true', type: 'boolean', category: 'approval' },
      { key: 'system_version', label: '系统版本', value: '3.0.0', type: 'string', category: 'system' },
    ];
    for (const c of configs) {
      this.db.prepare('INSERT INTO system_config VALUES (@id,@key,@label,@value,@type,@category,@description,@visible,@editable)').run({ ...c, id: `cfg_${c.key}`, description: '', visible: 1, editable: 1 });
    }

    // Reminders
    const remList = [
      { id: 'rem_1', name: '劳动合同到期提醒', type: 'contract_expire', module: 'contract', targetModule: 'personnel', advanceDays: 30, isActive: 1, targetRoles: JSON.stringify(['role_hr_admin', 'role_hr_staff']) },
      { id: 'rem_2', name: '试用期到期提醒', type: 'probation_end', module: 'personnel', targetModule: 'personnel', advanceDays: 7, isActive: 1, targetRoles: JSON.stringify(['role_hr_admin', 'role_hr_staff']) },
      { id: 'rem_3', name: '员工生日提醒', type: 'birthday', module: 'hr', targetModule: 'system', advanceDays: 1, isActive: 0, targetRoles: JSON.stringify(['role_dept_manager']) },
      { id: 'rem_4', name: '年假余额提醒', type: 'leave_balance', module: 'attendance', targetModule: 'attendance', advanceDays: 30, isActive: 1, targetRoles: JSON.stringify(['role_employee']) },
      { id: 'rem_5', name: '绩效评估提醒', type: 'performance_review', module: 'performance', targetModule: 'performance', advanceDays: 3, isActive: 1, targetRoles: JSON.stringify(['role_dept_manager', 'role_employee']) },
    ];
    for (const r of remList) {
      this.db.prepare('INSERT INTO reminders VALUES (@id,@name,@type,@module,@targetModule,@advanceDays,@isActive,@targetRoles,@targetUsers,@template,@createdAt)').run({ ...r, targetUsers: JSON.stringify([]), template: '', createdAt: now });
    }

    // Announcements
    const annList = [
      { id: 'ann_1', title: '关于2026年五一劳动节放假安排的通知', content: '各部门：根据国家规定，现将2026年五一劳动节放假安排通知如下：5月1日至5月5日放假调休，共5天。4月26日（星期日）、5月9日（星期六）上班。请各部门做好值班安排。', type: 'notice', priority: 'high', authorId: 'user_admin', authorName: '系统管理员', status: 'published' },
      { id: 'ann_2', title: '2026年度员工体检通知', content: '公司将于5月份组织年度员工体检，请各部门于4月25日前将参检人员名单报至人力资源部。体检地点：深圳市南山区人民医院体检中心。', type: 'notice', priority: 'normal', authorId: 'user_hr', authorName: '人事主管', status: 'published' },
      { id: 'ann_3', title: '新OA系统上线培训通知', content: '公司新版OA系统将于5月10日正式上线，请各部门于5月8日-9日参加系统操作培训。培训地点：总部大楼3楼会议室。时间：每天下午14:00-17:00。', type: 'activity', priority: 'normal', authorId: 'user_admin', authorName: '系统管理员', status: 'published' },
    ];
    for (const a of annList) {
      this.db.prepare('INSERT INTO announcements VALUES (@id,@title,@content,@type,@priority,@authorId,@authorName,@publishAt,@expireAt,@attachments,@readCount,@status,@createdAt)').run({ ...a, publishAt: now, expireAt: null, attachments: JSON.stringify([]), readCount: Math.floor(Math.random() * 30), createdAt: now });
    }

    // Location allowances
    const laList = [
      { id: 'la_1', location: 'shenzhen', name: '深圳地区补贴', baseAmount: 0, housingSubsidy: 2000, mealSubsidy: 500, transportSubsidy: 300, otherSubsidy: 200 },
      { id: 'la_2', location: 'nanjing', name: '南京地区补贴', baseAmount: 0, housingSubsidy: 1500, mealSubsidy: 400, transportSubsidy: 250, otherSubsidy: 150 },
      { id: 'la_3', location: 'jiangxi', name: '江西地区补贴', baseAmount: 0, housingSubsidy: 800, mealSubsidy: 300, transportSubsidy: 150, otherSubsidy: 100 },
    ];
    for (const la of laList) {
      this.db.prepare('INSERT INTO location_allowances VALUES (@id,@location,@name,@baseAmount,@housingSubsidy,@mealSubsidy,@transportSubsidy,@otherSubsidy,@isActive,@createdAt)').run({ ...la, isActive: 1, createdAt: now });
    }

    // Field definitions
    const fldList = [
      { id: 'fld_name', name: '姓名', fieldKey: 'name', type: 'text', groupName: 'basic', visibility: 'required', required: 1, displayOrder: 1, isSystem: 1 },
      { id: 'fld_employeeId', name: '工号', fieldKey: 'employeeId', type: 'text', groupName: 'basic', visibility: 'required', required: 1, displayOrder: 2, isSystem: 1 },
      { id: 'fld_department', name: '部门', fieldKey: 'department', type: 'select', groupName: 'work', visibility: 'required', required: 1, displayOrder: 10, isSystem: 1 },
      { id: 'fld_position', name: '职位', fieldKey: 'position', type: 'text', groupName: 'work', visibility: 'required', required: 1, displayOrder: 11, isSystem: 1 },
      { id: 'fld_phone', name: '手机号', fieldKey: 'phone', type: 'text', groupName: 'contact', visibility: 'required', required: 1, displayOrder: 20, isSystem: 1 },
      { id: 'fld_idCard', name: '身份证号', fieldKey: 'idCard', type: 'text', groupName: 'identity', visibility: 'visible', required: 0, displayOrder: 30, isSystem: 1 },
      { id: 'fld_birthday', name: '出生日期', fieldKey: 'birthday', type: 'date', groupName: 'identity', visibility: 'visible', required: 0, displayOrder: 31, isSystem: 1 },
      { id: 'fld_education', name: '学历', fieldKey: 'education', type: 'select', groupName: 'identity', visibility: 'visible', required: 0, displayOrder: 32, isSystem: 1 },
    ];
    for (const f of fldList) {
      this.db.prepare('INSERT INTO field_definitions VALUES (@id,@name,@fieldKey,@type,@groupName,@visibility,@required,@displayOrder,@isSystem,@options,@defaultValue,@validation,@createdAt)').run({
        ...f, options: f.type === 'select' ? JSON.stringify(['博士','硕士','本科','大专','中专','高中','初中']) : null, defaultValue: null, validation: null, createdAt: now,
      });
    }

    // Assessment tools
    const astList = [
      { id: 'ast_1', name: 'MBTI职业性格测试', type: 'personality', description: '国际权威性格评估工具，帮助了解职业性格倾向', questionCount: 93, duration: 30 },
      { id: 'ast_2', name: 'PDP性格测试', type: 'personality', description: '行为风格测试，识别个人行为特质', questionCount: 60, duration: 20 },
      { id: 'ast_3', name: '九型人格测试', type: 'personality', description: '揭示人深层价值观和注意力焦点', questionCount: 108, duration: 35 },
    ];
    for (const t of astList) {
      this.db.prepare('INSERT INTO assessment_tools VALUES (@id,@name,@type,@description,@questionCount,@duration,@isActive,@createdAt)').run({ ...t, isActive: 1, createdAt: now });
    }

    // Competency items
    const ciList = [
      { id: 'ci_1', name: '专业知识', category: '知识', dimension: '冰山上层', description: '岗位所需的专业技术知识' },
      { id: 'ci_2', name: '沟通能力', category: '能力', dimension: '能力', description: '有效传递信息并理解他人的能力' },
      { id: 'ci_3', name: '团队协作', category: '能力', dimension: '能力', description: '与团队成员有效合作的能力' },
      { id: 'ci_4', name: '问题解决', category: '能力', dimension: '能力', description: '分析并解决问题的能力' },
      { id: 'ci_5', name: '执行力', category: '素质', dimension: '素质', description: '按时按质完成任务的素质' },
      { id: 'ci_6', name: '学习能力', category: '素质', dimension: '素质', description: '快速学习新知识的素质' },
      { id: 'ci_7', name: '责任心', category: '素质', dimension: '素质', description: '对工作结果负责的态度' },
      { id: 'ci_8', name: '创新能力', category: '素质', dimension: '素质', description: '提出新想法并实施的能力' },
    ];
    for (const c of ciList) {
      this.db.prepare('INSERT INTO competency_items VALUES (@id,@name,@category,@dimension,@description,@isActive,@createdAt)').run({ ...c, isActive: 1, createdAt: now });
    }

    // ============ 培训模块 V2.0 初始数据 ============
    
    // 课程分类
    const categories = [
      { id: 'cat_1', name: '技术培训', parentId: null, icon: 'code', sortOrder: 1, description: '技术开发、运维、安全等课程' },
      { id: 'cat_2', name: '管理培训', parentId: null, icon: 'team', sortOrder: 2, description: '领导力、项目管理等课程' },
      { id: 'cat_3', name: '新人培训', parentId: null, icon: 'user-add', sortOrder: 3, description: '入职培训、企业文化课程' },
      { id: 'cat_4', name: '产品培训', parentId: null, icon: 'product', sortOrder: 4, description: '产品知识、用户研究课程' },
      { id: 'cat_5', name: '销售培训', parentId: null, icon: 'money', sortOrder: 5, description: '销售技巧、客户管理课程' },
      { id: 'cat_6', name: '通用素质', parentId: null, icon: 'star', sortOrder: 6, description: '沟通技巧、职业素养课程' },
      // 子分类
      { id: 'cat_1_1', name: '前端开发', parentId: 'cat_1', icon: 'html5', sortOrder: 11, description: 'React/Vue/Angular等' },
      { id: 'cat_1_2', name: '后端开发', parentId: 'cat_1', icon: 'server', sortOrder: 12, description: 'Java/Python/Go等' },
      { id: 'cat_1_3', name: '移动开发', parentId: 'cat_1', icon: 'mobile', sortOrder: 13, description: 'iOS/Android/小程序' },
    ];
    for (const cat of categories) {
      this.db.prepare('INSERT INTO training_categories VALUES (?,?,?,?,?,?,?,?)').run(
        cat.id, cat.name, cat.parentId, cat.icon, cat.sortOrder, cat.description, 1, now
      );
    }

    // 示例课程
    const courses = [
      {
        id: 'course_1', title: 'React 18 核心原理与实战', subtitle: '深入理解 React 新特性与最佳实践',
        coverUrl: 'https://picsum.photos/seed/react/400/225',
        categoryId: 'cat_1_1', categoryName: '前端开发', courseType: 'video',
        teacherId: 'emp-3', teacherName: '王志强',
        description: '本课程深入讲解 React 18 的核心原理，包括并发渲染、Suspense、Server Components 等新特性，以及 Hooks 最佳实践、性能优化技巧。',
        targetType: 'department', targetValues: JSON.stringify(['dept_2', 'dept_10']),
        completionType: 'duration', completionValue: 80, credit: 5, durationMinutes: 180,
        chapterCount: 6, enrollmentCount: 45, completionCount: 32, rating: 4.8, reviewCount: 28,
        isMandatory: 1, isPublic: 1, status: 'published', publishedAt: now, tags: JSON.stringify(['React', '前端', 'Hooks']),
      },
      {
        id: 'course_2', title: 'TypeScript 从入门到精通', subtitle: '类型系统与工程化实践',
        coverUrl: 'https://picsum.photos/seed/ts/400/225',
        categoryId: 'cat_1_1', categoryName: '前端开发', courseType: 'video',
        teacherId: 'emp-16', teacherName: '胡淑芬',
        description: 'TypeScript 已成为现代前端开发的标配。本课程从基础类型系统讲起，逐步深入到泛型、装饰器、工程化配置，帮助你构建类型安全的应用。',
        targetType: 'department', targetValues: JSON.stringify(['dept_2', 'dept_10', 'dept_11']),
        completionType: 'duration', completionValue: 80, credit: 4, durationMinutes: 150,
        chapterCount: 5, enrollmentCount: 52, completionCount: 38, rating: 4.6, reviewCount: 35,
        isMandatory: 0, isPublic: 1, status: 'published', publishedAt: now, tags: JSON.stringify(['TypeScript', '前端']),
      },
      {
        id: 'course_3', title: '职场沟通技巧', subtitle: '高效沟通与团队协作',
        coverUrl: 'https://picsum.photos/seed/comm/400/225',
        categoryId: 'cat_6', categoryName: '通用素质', courseType: 'text',
        teacherId: 'emp-8', teacherName: '吴晓燕',
        description: '职场沟通是每个员工必备的软技能。本课程涵盖日常沟通、会议表达、书面汇报、跨部门协作等场景，提供实用的话术模板和案例分析。',
        targetType: 'all', targetValues: JSON.stringify([]),
        completionType: 'complete', completionValue: 100, credit: 2, durationMinutes: 60,
        chapterCount: 4, enrollmentCount: 128, completionCount: 95, rating: 4.5, reviewCount: 42,
        isMandatory: 1, isPublic: 1, status: 'published', publishedAt: now, tags: JSON.stringify(['沟通', '协作', '职场']),
      },
      {
        id: 'course_4', title: '新员工入职培训', subtitle: '公司文化与制度全解析',
        coverUrl: 'https://picsum.photos/seed/onboard/400/225',
        categoryId: 'cat_3', categoryName: '新人培训', courseType: 'mixed',
        teacherId: 'user_hr', teacherName: '人事主管',
        description: '入职培训是每位新员工融入公司的第一步。本课程涵盖公司发展历程、企业文化、组织架构、规章制度、福利待遇、办公系统使用等内容。',
        targetType: 'all', targetValues: JSON.stringify([]),
        completionType: 'duration', completionValue: 100, credit: 3, durationMinutes: 90,
        chapterCount: 5, enrollmentCount: 56, completionCount: 56, rating: 4.9, reviewCount: 48,
        isMandatory: 1, isPublic: 1, status: 'published', publishedAt: now, tags: JSON.stringify(['入职', '新人', '必学']),
      },
      {
        id: 'course_5', title: '项目管理实战', subtitle: '从需求到交付的全流程管理',
        coverUrl: 'https://picsum.photos/seed/pm/400/225',
        categoryId: 'cat_2', categoryName: '管理培训', courseType: 'video',
        teacherId: 'emp-6', teacherName: '陈建国',
        description: '本课程结合真实项目案例，讲解从需求收集、计划制定、团队协调到交付上线的完整流程，涵盖敏捷、Scrum、Kanban等主流方法论。',
        targetType: 'position', targetValues: JSON.stringify(['pos_2', 'pos_4', 'pos_6', 'pos_8']),
        completionType: 'duration', completionValue: 80, credit: 6, durationMinutes: 240,
        chapterCount: 8, enrollmentCount: 35, completionCount: 20, rating: 4.7, reviewCount: 18,
        isMandatory: 0, isPublic: 1, status: 'published', publishedAt: now, tags: JSON.stringify(['管理', '敏捷', 'Scrum']),
      },
      {
        id: 'course_6', title: '产品经理必修课', subtitle: '需求分析与产品设计方法论',
        coverUrl: 'https://picsum.photos/seed/pm/400/225',
        categoryId: 'cat_4', categoryName: '产品培训', courseType: 'video',
        teacherId: 'emp-5', teacherName: '刘芳芳',
        description: '产品经理是产品的灵魂人物。本课程涵盖用户研究、需求分析、竞品分析、原型设计、PRD撰写等核心技能，帮助你成为合格的产品经理。',
        targetType: 'department', targetValues: JSON.stringify(['dept_3']),
        completionType: 'duration', completionValue: 80, credit: 5, durationMinutes: 200,
        chapterCount: 7, enrollmentCount: 28, completionCount: 18, rating: 4.6, reviewCount: 15,
        isMandatory: 0, isPublic: 1, status: 'published', publishedAt: now, tags: JSON.stringify(['产品', '需求', '设计']),
      },
      {
        id: 'course_7', title: '数据安全与合规', subtitle: '企业信息安全意识培训',
        coverUrl: 'https://picsum.photos/seed/security/400/225',
        categoryId: 'cat_1', categoryName: '技术培训', courseType: 'text',
        teacherId: 'emp-2', teacherName: '李雅琴',
        description: '数据安全关乎企业命脉。本课程讲解信息安全基础知识、常见威胁与防护措施、数据合规要求（如GDPR、个人信息保护法），提升全员安全意识。',
        targetType: 'all', targetValues: JSON.stringify([]),
        completionType: 'complete', completionValue: 100, credit: 2, durationMinutes: 45,
        chapterCount: 3, enrollmentCount: 200, completionCount: 185, rating: 4.4, reviewCount: 52,
        isMandatory: 1, isPublic: 1, status: 'published', publishedAt: now, tags: JSON.stringify(['安全', '合规', '必学']),
      },
      {
        id: 'course_8', title: '销售技巧提升', subtitle: '顾问式销售与客户关系管理',
        coverUrl: 'https://picsum.photos/seed/sales/400/225',
        categoryId: 'cat_5', categoryName: '销售培训', courseType: 'video',
        teacherId: 'emp-7', teacherName: '周伟明',
        description: '销售不仅是卖产品，更是卖价值。本课程从客户需求洞察、方案呈现、异议处理到成交技巧，系统提升你的销售能力。',
        targetType: 'department', targetValues: JSON.stringify(['dept_4']),
        completionType: 'duration', completionValue: 80, credit: 4, durationMinutes: 120,
        chapterCount: 5, enrollmentCount: 22, completionCount: 15, rating: 4.3, reviewCount: 12,
        isMandatory: 0, isPublic: 1, status: 'published', publishedAt: now, tags: JSON.stringify(['销售', 'CRM', '技巧']),
      },
    ];
    for (const c of courses) {
      this.db.prepare(`INSERT INTO training_courses_v2 (
        id, title, subtitle, coverUrl, categoryId, categoryName, courseType,
        teacherId, teacherName, description, targetType, targetValues,
        completionType, completionValue, credit, durationMinutes,
        chapterCount, enrollmentCount, completionCount, rating, reviewCount,
        isMandatory, isPublic, status, publishedAt, tags, createdAt, updatedAt
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        c.id, c.title, c.subtitle, c.coverUrl, c.categoryId, c.categoryName, c.courseType,
        c.teacherId, c.teacherName, c.description, c.targetType, c.targetValues,
        c.completionType, c.completionValue, c.credit, c.durationMinutes,
        c.chapterCount, c.enrollmentCount, c.completionCount, c.rating, c.reviewCount,
        c.isMandatory, c.isPublic, c.status, c.publishedAt, c.tags, now, now
      );
    }

    // 示例章节
    const chapters = [
      // React课程章节
      { id: 'ch_1_1', courseId: 'course_1', title: 'React 18 新特性概览', chapterType: 'video', sortOrder: 1, videoUrl: '', videoDuration: 1800, description: '了解 React 18 的主要更新' },
      { id: 'ch_1_2', courseId: 'course_1', title: '并发渲染原理', chapterType: 'video', sortOrder: 2, videoUrl: '', videoDuration: 2400, description: '深入理解 Concurrent Mode' },
      { id: 'ch_1_3', courseId: 'course_1', title: 'Suspense 与数据获取', chapterType: 'video', sortOrder: 3, videoUrl: '', videoDuration: 2100, description: 'Suspense 的使用场景' },
      { id: 'ch_1_4', courseId: 'course_1', title: 'Hooks 进阶技巧', chapterType: 'video', sortOrder: 4, videoUrl: '', videoDuration: 2700, description: '自定义 Hook 与 Hook 模式' },
      { id: 'ch_1_5', courseId: 'course_1', title: '性能优化实战', chapterType: 'video', sortOrder: 5, videoUrl: '', videoDuration: 1800, description: 'Profiler 与优化策略' },
      { id: 'ch_1_6', courseId: 'course_1', title: '课程总结与测验', chapterType: 'exam', sortOrder: 6, videoUrl: '', videoDuration: 0, description: '检验学习成果', examDuration: 60, passingScore: 80 },
      // 职场沟通章节
      { id: 'ch_3_1', courseId: 'course_3', title: '沟通的基本原理', chapterType: 'text', sortOrder: 1, content: '## 沟通的基本原理\n\n沟通是信息传递与理解的过程。有效的沟通需要做到：\n\n1. **明确目的** - 每次沟通前明确你想要达到的结果\n2. **选择渠道** - 根据内容选择合适的沟通方式（当面/电话/邮件/IM）\n3. **关注反馈** - 确认对方是否理解了你的意思\n\n### 常见沟通障碍\n\n- 信息衰减\n- 理解偏差\n- 情绪干扰\n- 文化差异', contentLength: 1500 },
      { id: 'ch_3_2', courseId: 'course_3', title: '会议沟通技巧', chapterType: 'text', sortOrder: 2, content: '## 会议沟通技巧\n\n会议是职场沟通的重要场景。\n\n### 会前准备\n\n- 明确会议目标\n- 准备讨论材料\n- 提前发送议程\n\n### 会中表达\n\n- 结论先行\n- 逻辑清晰\n- 控制时间\n\n### 会后跟进\n\n- 发送会议纪要\n- 跟踪待办事项', contentLength: 1200 },
      // 新人培训章节
      { id: 'ch_4_1', courseId: 'course_4', title: '公司发展历程', chapterType: 'text', sortOrder: 1, content: '## 公司发展历程\n\n飞达智能科技有限公司成立于2015年，专注于企业智能化解决方案。\n\n### 里程碑\n\n- **2015年**：公司成立\n- **2018年**：获得A轮融资\n- **2020年**：推出核心产品\n- **2023年**：用户突破100万\n- **2026年**：启动IPO准备', contentLength: 800 },
      { id: 'ch_4_2', courseId: 'course_4', title: '企业文化解读', chapterType: 'video', sortOrder: 2, videoUrl: '', videoDuration: 1200, description: '深入了解飞达的核心价值观' },
      { id: 'ch_4_3', courseId: 'course_4', title: '规章制度须知', chapterType: 'text', sortOrder: 3, content: '## 规章制度须知\n\n### 考勤制度\n\n- 上班时间：9:00-18:00\n- 弹性打卡：30分钟宽限\n- 请假流程：通过OA系统申请\n\n### 办公规范\n\n- 保持工位整洁\n- 注意信息安全\n- 准时参加会议', contentLength: 600 },
      { id: 'ch_4_4', courseId: 'course_4', title: 'IT系统使用指南', chapterType: 'video', sortOrder: 4, videoUrl: '', videoDuration: 900, description: '办公系统操作演示' },
      { id: 'ch_4_5', courseId: 'course_4', title: '入职测验', chapterType: 'exam', sortOrder: 5, examDuration: 30, passingScore: 60 },
    ];
    for (const ch of chapters) {
      this.db.prepare(`INSERT INTO training_chapters (
        id, courseId, title, description, chapterType, sortOrder, required,
        content, contentLength, videoUrl, videoDuration,
        examDuration, passingScore, createdAt
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        ch.id, ch.courseId, ch.title, ch.description || '', ch.chapterType, ch.sortOrder, 1,
        ch.content || null, ch.contentLength || 0, ch.videoUrl || '', ch.videoDuration || 0,
        ch.examDuration || null, ch.passingScore || null, now
      );
    }

    // 示例评价
    const reviews = [
      { id: 'rev_1', courseId: 'course_1', employeeId: 'emp-13', employeeName: '马建新', rating: 5, content: '讲解非常清晰，深入浅出！特别是并发渲染那部分，终于理解透了。', status: 'published' },
      { id: 'rev_2', courseId: 'course_1', employeeId: 'emp-14', employeeName: '胡淑芬', rating: 4, content: '内容很实用，性能优化的技巧可以直接用到项目中。', status: 'published' },
      { id: 'rev_3', courseId: 'course_4', employeeId: 'emp-21', employeeName: '曾小红', rating: 5, content: '入职培训很全面，让我快速了解了公司。文化部分印象很深。', status: 'published' },
      { id: 'rev_4', courseId: 'course_3', employeeId: 'emp-25', employeeName: '冯雅静', rating: 4, content: '学到了很多沟通技巧，特别是会议表达那部分很实用。', status: 'published' },
    ];
    for (const r of reviews) {
      this.db.prepare('INSERT INTO training_reviews VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(
        r.id, r.courseId, r.employeeId, r.employeeName, r.rating, r.content,
        null, null, 0, 0, 0, r.status, now, now
      );
    }

    } // end of needSeedHRData

    // 产品基础档案默认数据
    const sizeCount = this.db.prepare('SELECT COUNT(*) as c FROM sizes').get() as { c: number };
    if (sizeCount.c === 0) {
      console.log('[Database] Seeding product default data...');

      // 默认颜色（如果为空）
      const colorCount = this.db.prepare('SELECT COUNT(*) as c FROM colors').get() as { c: number };
      if (colorCount.c === 0) {
        const defaultColors = [
          { id: 'color_1', name: '黑色', pantone_code: 'Black C', hex_color: '#000000', sort_order: 1 },
          { id: 'color_2', name: '白色', pantone_code: 'White', hex_color: '#FFFFFF', sort_order: 2 },
          { id: 'color_3', name: '红色', pantone_code: '18-1662 TCX', hex_color: '#DC2626', sort_order: 3 },
          { id: 'color_4', name: '蓝色', pantone_code: '18-3949 TCX', hex_color: '#2563EB', sort_order: 4 },
          { id: 'color_5', name: '灰色', pantone_code: '17-4402 TCX', hex_color: '#6B7280', sort_order: 5 },
          { id: 'color_6', name: '棕色', pantone_code: '18-1148 TCX', hex_color: '#78350F', sort_order: 6 },
          { id: 'color_7', name: '绿色', pantone_code: '17-5936 TCX', hex_color: '#16A34A', sort_order: 7 },
          { id: 'color_8', name: '粉色', pantone_code: '13-1520 TCX', hex_color: '#EC4899', sort_order: 8 },
          { id: 'color_9', name: '紫色', pantone_code: '18-3838 TCX', hex_color: '#7C3AED', sort_order: 9 },
          { id: 'color_10', name: '橙色', pantone_code: '16-1359 TCX', hex_color: '#EA580C', sort_order: 10 },
        ];
        for (const c of defaultColors) {
          this.db.prepare('INSERT INTO colors (id, name, pantone_code, custom_code, hex_color, image_url, sort_order, is_active, created_at) VALUES (?,?,?,?,?,?,?,?,?)').run(
            c.id, c.name, c.pantone_code, null, c.hex_color, null, c.sort_order, 1, now
          );
        }
      }

      // 默认尺码（鞋类）
      const shoeSizes = [
        { id: 'size_35', name: '35', category: 'shoe', sort_order: 1 },
        { id: 'size_36', name: '36', category: 'shoe', sort_order: 2 },
        { id: 'size_37', name: '37', category: 'shoe', sort_order: 3 },
        { id: 'size_38', name: '38', category: 'shoe', sort_order: 4 },
        { id: 'size_39', name: '39', category: 'shoe', sort_order: 5 },
        { id: 'size_40', name: '40', category: 'shoe', sort_order: 6 },
        { id: 'size_41', name: '41', category: 'shoe', sort_order: 7 },
        { id: 'size_42', name: '42', category: 'shoe', sort_order: 8 },
        { id: 'size_43', name: '43', category: 'shoe', sort_order: 9 },
        { id: 'size_44', name: '44', category: 'shoe', sort_order: 10 },
        { id: 'size_45', name: '45', category: 'shoe', sort_order: 11 },
      ];
      for (const s of shoeSizes) {
        this.db.prepare('INSERT INTO sizes (id, name, category, sort_order, is_active, created_at) VALUES (?,?,?,?,?,?)').run(
          s.id, s.name, s.category, s.sort_order, 1, now
        );
      }

      // 默认尺码（服装）
      const clothingSizes = [
        { id: 'size_s', name: 'S', category: 'clothing', sort_order: 1 },
        { id: 'size_m', name: 'M', category: 'clothing', sort_order: 2 },
        { id: 'size_l', name: 'L', category: 'clothing', sort_order: 3 },
        { id: 'size_xl', name: 'XL', category: 'clothing', sort_order: 4 },
        { id: 'size_2xl', name: '2XL', category: 'clothing', sort_order: 5 },
        { id: 'size_3xl', name: '3XL', category: 'clothing', sort_order: 6 },
      ];
      for (const s of clothingSizes) {
        this.db.prepare('INSERT INTO sizes (id, name, category, sort_order, is_active, created_at) VALUES (?,?,?,?,?,?)').run(
          s.id, s.name, s.category, s.sort_order, 1, now
        );
      }

      // 默认尺码组
      const sizeGroups = [
        { id: 'sg_male', name: '男鞋尺码组', description: '男鞋标准尺码 39-45' },
        { id: 'sg_female', name: '女鞋尺码组', description: '女鞋标准尺码 35-40' },
        { id: 'sg_clothing', name: '服装尺码组', description: '服装标准尺码 S-3XL' },
      ];
      for (const g of sizeGroups) {
        this.db.prepare('INSERT INTO size_groups (id, name, description, is_active, created_at) VALUES (?,?,?,?,?)').run(
          g.id, g.name, g.description, 1, now
        );
      }

      // 尺码组成员
      const maleItems = [
        { id: 'sgi_m_39', size_group_id: 'sg_male', size_id: 'size_39', sort_order: 1 },
        { id: 'sgi_m_40', size_group_id: 'sg_male', size_id: 'size_40', sort_order: 2 },
        { id: 'sgi_m_41', size_group_id: 'sg_male', size_id: 'size_41', sort_order: 3 },
        { id: 'sgi_m_42', size_group_id: 'sg_male', size_id: 'size_42', sort_order: 4 },
        { id: 'sgi_m_43', size_group_id: 'sg_male', size_id: 'size_43', sort_order: 5 },
        { id: 'sgi_m_44', size_group_id: 'sg_male', size_id: 'size_44', sort_order: 6 },
        { id: 'sgi_m_45', size_group_id: 'sg_male', size_id: 'size_45', sort_order: 7 },
      ];
      const femaleItems = [
        { id: 'sgi_f_35', size_group_id: 'sg_female', size_id: 'size_35', sort_order: 1 },
        { id: 'sgi_f_36', size_group_id: 'sg_female', size_id: 'size_36', sort_order: 2 },
        { id: 'sgi_f_37', size_group_id: 'sg_female', size_id: 'size_37', sort_order: 3 },
        { id: 'sgi_f_38', size_group_id: 'sg_female', size_id: 'size_38', sort_order: 4 },
        { id: 'sgi_f_39', size_group_id: 'sg_female', size_id: 'size_39', sort_order: 5 },
        { id: 'sgi_f_40', size_group_id: 'sg_female', size_id: 'size_40', sort_order: 6 },
      ];
      const clothingItems = [
        { id: 'sgi_c_s', size_group_id: 'sg_clothing', size_id: 'size_s', sort_order: 1 },
        { id: 'sgi_c_m', size_group_id: 'sg_clothing', size_id: 'size_m', sort_order: 2 },
        { id: 'sgi_c_l', size_group_id: 'sg_clothing', size_id: 'size_l', sort_order: 3 },
        { id: 'sgi_c_xl', size_group_id: 'sg_clothing', size_id: 'size_xl', sort_order: 4 },
        { id: 'sgi_c_2xl', size_group_id: 'sg_clothing', size_id: 'size_2xl', sort_order: 5 },
        { id: 'sgi_c_3xl', size_group_id: 'sg_clothing', size_id: 'size_3xl', sort_order: 6 },
      ];
      for (const item of [...maleItems, ...femaleItems, ...clothingItems]) {
        this.db.prepare('INSERT INTO size_group_items (id, size_group_id, size_id, sort_order) VALUES (?,?,?,?)').run(
          item.id, item.size_group_id, item.size_id, item.sort_order
        );
      }

      // 默认品类
      const categories = [
        { id: 'cat_shoe', name: '鞋类', code: 'SHOE', type: 'shoe', sort_order: 1 },
        { id: 'cat_shoe_run', name: '运动鞋', code: 'SHOE-RUN', type: 'shoe', parent_id: 'cat_shoe', sort_order: 1 },
        { id: 'cat_shoe_casual', name: '休闲鞋', code: 'SHOE-CAS', type: 'shoe', parent_id: 'cat_shoe', sort_order: 2 },
        { id: 'cat_shoe_leather', name: '皮鞋', code: 'SHOE-LEA', type: 'shoe', parent_id: 'cat_shoe', sort_order: 3 },
        { id: 'cat_clothing', name: '服装', code: 'CLOTH', type: 'clothing', sort_order: 2 },
        { id: 'cat_clothing_tshirt', name: 'T恤', code: 'CLOTH-TS', type: 'clothing', parent_id: 'cat_clothing', sort_order: 1 },
        { id: 'cat_clothing_jacket', name: '外套', code: 'CLOTH-JK', type: 'clothing', parent_id: 'cat_clothing', sort_order: 2 },
        { id: 'cat_accessory', name: '配件', code: 'ACC', type: 'accessory', sort_order: 3 },
      ];
      for (const c of categories) {
        this.db.prepare('INSERT INTO product_categories (id, name, code, parent_id, type, sort_order, is_active, created_at) VALUES (?,?,?,?,?,?,?,?)').run(
          c.id, c.name, c.code, c.parent_id || null, c.type, c.sort_order, 1, now
        );
      }

      // 默认编码规则
      const codingRules = [
        { id: 'rule_sku', name: 'SKU标准编码', target_type: 'sku', expression: '${prefix}${year}${sequence}', prefix: 'FD', sequence_digits: 6, current_sequence: 0 },
        { id: 'rule_style', name: '款号编码', target_type: 'style', expression: '${categ.code}${year}${sequence}', prefix: '', sequence_digits: 4, current_sequence: 0 },
      ];
      for (const r of codingRules) {
        this.db.prepare('INSERT INTO coding_rules (id, name, target_type, category_id, expression, prefix, sequence_digits, current_sequence, is_active, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(
          r.id, r.name, r.target_type, null, r.expression, r.prefix, r.sequence_digits, r.current_sequence, 1, now
        );
      }

      // 默认箱型
      const boxTypes = [
        { id: 'box_10', name: '10双装标准箱', qty_per_box: 10, gross_weight: 2.5, length: 40, width: 30, height: 20 },
        { id: 'box_12', name: '12双装大箱', qty_per_box: 12, gross_weight: 3.0, length: 45, width: 35, height: 25 },
      ];
      for (const b of boxTypes) {
        this.db.prepare('INSERT INTO box_types (id, name, qty_per_box, gross_weight, length, width, height, is_active, created_at) VALUES (?,?,?,?,?,?,?,?,?)').run(
          b.id, b.name, b.qty_per_box, b.gross_weight, b.length, b.width, b.height, 1, now
        );
      }
    }

    // Seed AI model configs if empty
    const modelCount = this.db.prepare('SELECT COUNT(*) as c FROM ai_model_configs').get() as { c: number };
    if (modelCount.c === 0) {
      const defaultModels = [
        { id: 'model_deepseek', name: 'DeepSeek', base_url: 'https://api.deepseek.com', api_key: '', model: 'deepseek-chat', is_active: 1, provider_type: 'openai' },
        { id: 'model_openai', name: 'OpenAI', base_url: 'https://api.openai.com', api_key: '', model: 'gpt-4o-mini', is_active: 1, provider_type: 'openai' },
        { id: 'model_ollama', name: 'Ollama Local', base_url: 'http://localhost:11434', api_key: '', model: 'deepseek-r1:8b', is_active: 0, provider_type: 'ollama' },
      ];
      const insertModel = this.db.prepare('INSERT INTO ai_model_configs (id, name, base_url, api_key, model, is_active, provider_type) VALUES (?, ?, ?, ?, ?, ?, ?)');
      for (const m of defaultModels) insertModel.run(m.id, m.name, m.base_url, m.api_key, m.model, m.is_active, m.provider_type);
    }

    // Seed meal menus if empty
    const menuCount = this.db.prepare('SELECT COUNT(*) as c FROM meal_menus').get() as { c: number };
    if (menuCount.c === 0) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const menus = [
        { id: 'mm_001', canteenId: '', date: today, mealType: 'lunch', name: '周一午餐', dishes: JSON.stringify(['宫保鸡丁 ¥12', '清炒西兰花 ¥8', '番茄蛋汤 ¥5', '白米饭 ¥2']), status: 'published' },
        { id: 'mm_002', canteenId: '', date: today, mealType: 'dinner', name: '周一晚餐', dishes: JSON.stringify(['红烧肉 ¥15', '蒜蓉菜心 ¥8', '紫菜蛋花汤 ¥5', '白米饭 ¥2']), status: 'published' },
        { id: 'mm_003', canteenId: '', date: tomorrow, mealType: 'lunch', name: '周二午餐', dishes: JSON.stringify(['鱼香肉丝 ¥12', '酸辣土豆丝 ¥8', '冬瓜排骨汤 ¥10', '白米饭 ¥2']), status: 'draft' },
      ];
      const insertMenu = this.db.prepare('INSERT INTO meal_menus (id, canteenId, date, mealType, name, dishes, price, status) VALUES (?, ?, ?, ?, ?, ?, 0, ?)');
      for (const m of menus) insertMenu.run(m.id, m.canteenId, m.date, m.mealType, m.name, m.dishes, m.status);
    }

    // Seed AI knowledge base system
    const kbBaseCount = this.db.prepare('SELECT COUNT(*) as c FROM ai_knowledge_bases').get() as { c: number };
    if (kbBaseCount.c === 0) {
      // Create default knowledge base
      this.db.prepare('INSERT INTO ai_knowledge_bases (id, name, description, is_default) VALUES (?, ?, ?, ?)')
        .run('default', 'HR知识库', 'HR管理系统预置知识库', 1);

      // Migrate existing knowledge items to default KB (set kb_id)
      this.db.prepare("UPDATE ai_knowledge SET kb_id='default' WHERE kb_id IS NULL OR kb_id=''").run();

      // Insert default knowledge items if table is empty
      const kbCount = this.db.prepare('SELECT COUNT(*) as c FROM ai_knowledge').get() as { c: number };
      if (kbCount.c === 0) {
        const knowledgeItems = [
          { id: 'kb_default_01', title: '年假制度', category: 'attendance', content: '年假（带薪年休假）标准：\n1. 工作满1年不满10年：5天/年\n2. 工作满10年不满20年：10天/年\n3. 工作满20年及以上：15天/年\n\n年假可分段使用，当年未休完可延期至次年3月31日。', tags: '年假,休假,福利' },
          { id: 'kb_default_02', title: '加班管理规定', category: 'attendance', content: '加班管理制度：\n1. 工作日加班：按基本工资的150%计算\n2. 休息日加班：按基本工资的200%计算\n3. 法定节假日加班：按基本工资的300%计算\n\n加班需提前申请并经主管审批，每月总加班时长不超过36小时。', tags: '加班,考勤,薪酬' },
          { id: 'kb_default_03', title: '招聘面试流程', category: 'recruitment', content: '招聘面试标准流程：\n1. 简历筛选（HR初筛）\n2. 电话初试（15-30分钟）\n3. 技术/专业面试（部门主管，约60分钟）\n4. HR面试（素质评估，约30分钟）\n5. 背景调查\n6. 发放Offer\n\n整个流程应在10个工作日内完成。', tags: '招聘,面试,流程' },
          { id: 'kb_default_04', title: '绩效考核制度', category: 'performance', content: '绩效考核周期与标准：\n1. 季度考核（每季度末进行）\n2. 年度考核（12月进行）\n\n评分等级：\n- S级（卓越）：绩效分≥95，占比≤10%\n- A级（优秀）：绩效分85-94，占比≤20%\n- B级（良好）：绩效分70-84，占比≤50%\n- C级（需改进）：绩效分60-69，占比≤15%\n- D级（不合格）：绩效分<60', tags: '绩效,考核,评估' },
          { id: 'kb_default_05', title: '五险一金说明', category: 'salary', content: '五险一金缴纳说明：\n\n养老保险：公司16%，个人8%\n医疗保险：公司8%，个人2%\n失业保险：公司0.5%，个人0.5%\n工伤保险：公司0.2%-1.9%（按行业浮动），个人0%\n生育保险：公司0.8%，个人0%\n住房公积金：公司5%-12%，个人5%-12%\n\n缴纳基数按上年度月平均工资确定。', tags: '社保,五险一金,薪酬' },
        ];
        const insertKb = this.db.prepare('INSERT INTO ai_knowledge (id, kb_id, title, category, content, tags) VALUES (?, ?, ?, ?, ?, ?)');
        for (const item of knowledgeItems) {
          insertKb.run(item.id, 'default', item.title, item.category, item.content, item.tags);
        }
      }
    }

    
    console.log('[Database] Seeding completed');
  }

  findAll(table: string): any[] {
    return this.db.prepare(`SELECT * FROM ${table}`).all();
  }

  findById(table: string, id: string): any | undefined {
    return this.db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
  }

  findOne(table: string, where: Record<string, any>): any | undefined {
    const keys = Object.keys(where);
    if (keys.length === 0) return undefined;
    const clause = keys.map(k => `${k} = @${k}`).join(' AND ');
    return this.db.prepare(`SELECT * FROM ${table} WHERE ${clause} LIMIT 1`).get(where);
  }

  findWhere(table: string, where: Record<string, any>, limit?: number): any[] {
    const keys = Object.keys(where);
    if (keys.length === 0) {
      const q = limit ? `SELECT * FROM ${table} LIMIT ${limit}` : `SELECT * FROM ${table}`;
      return this.db.prepare(q).all();
    }
    const clause = keys.map(k => `${k} = @${k}`).join(' AND ');
    const sql = limit ? `SELECT * FROM ${table} WHERE ${clause} LIMIT ${limit}` : `SELECT * FROM ${table} WHERE ${clause}`;
    return this.db.prepare(sql).all(where);
  }

  insert(table: string, data: Record<string, any>): any {
    const keys = Object.keys(data);
    const fields = keys.join(', ');
    const placeholders = keys.map(k => `@${k}`).join(', ');
    this.db.prepare(`INSERT INTO ${table} (${fields}) VALUES (${placeholders})`).run(data);
    return this.findById(table, data.id);
  }

  update(table: string, id: string, data: Record<string, any>): any {
    const keys = Object.keys(data).filter(k => k !== 'id');
    if (keys.length === 0) return this.findById(table, id);
    const clause = keys.map(k => `${k} = @${k}`).join(', ');
    this.db.prepare(`UPDATE ${table} SET ${clause} WHERE id = @id`).run({ ...data, id });
    return this.findById(table, id);
  }

  delete(table: string, id: string): boolean {
    const result = this.db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    return result.changes > 0;
  }

  deleteById(table: string, id: string): boolean {
    const result = this.db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    return result.changes > 0;
  }

  deleteWhere(table: string, conditions: Record<string, any>): number {
    const keys = Object.keys(conditions);
    const whereClause = keys.map(k => `${k} = ?`).join(' AND ');
    const values = Object.values(conditions);
    const result = this.db.prepare(`DELETE FROM ${table} WHERE ${whereClause}`).run(...values);
    return result.changes;
  }

  query(sql: string, params: any[] = []): any[] {
    return this.db.prepare(sql).all(...params);
  }

  authenticate(username: string, password: string): any | null {
    const user = this.db.prepare('SELECT * FROM users WHERE username = ? OR phone = ?').get(username, username) as any;
    if (!user) return null;
    if (user.status !== 'active') return null;
    if (user.password !== this.hashPwd(password)) return null;
    return user;
  }

  updateLoginTime(userId: string, ip: string): void {
    this.db.prepare('UPDATE users SET lastLoginAt = ?, lastLoginIp = ? WHERE id = ?').run(new Date().toISOString(), ip, userId);
  }

  addAuditLog(log: Record<string, any>): void {
    this.db.prepare(`INSERT INTO audit_logs (id,userId,username,realName,action,module,targetType,targetId,detail,ip,userAgent,timestamp) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      log.userId || null, log.username || null, log.realName || null, log.action, log.module,
      log.targetType || null, log.targetId || null, log.detail || null, log.ip || null, log.userAgent || null,
      new Date().toISOString()
    );
  }

  // ============ 统计分析数据 ============
  getStatistics(): any {
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = now.toISOString().slice(0, 7);
    const today = now.toISOString().slice(0, 10);

    // 1. 员工相关统计
    const totalEmployees = (this.db.prepare('SELECT COUNT(*) as c FROM employees').get() as any).c;
    const activeEmployees = (this.db.prepare("SELECT COUNT(*) as c FROM employees WHERE status = 'active'").get() as any).c;

    // 部门人员分布
    const deptDistribution = this.db.prepare(
      "SELECT department as name, COUNT(*) as value FROM employees WHERE status='active' GROUP BY department ORDER BY value DESC"
    ).all() as { name: string; value: number }[];

    // 学历分布
    const eduDistribution = this.db.prepare(
      "SELECT education as name, COUNT(*) as value FROM employees WHERE status='active' AND education IS NOT NULL AND education!='' GROUP BY education ORDER BY value DESC"
    ).all() as { name: string; value: number }[];

    // 性别分布
    const genderDistribution = this.db.prepare(
      "SELECT gender as name, COUNT(*) as value FROM employees WHERE status='active' AND gender IS NOT NULL AND gender!='' GROUP BY gender"
    ).all() as { name: string; value: number }[];

    // 司龄分布
    const tenureDist = this.db.prepare("SELECT hireDate FROM employees WHERE status='active' AND hireDate IS NOT NULL").all() as { hireDate: string }[];
    const tenureDistribution = [
      { name: '1年以下', value: tenureDist.filter(e => {
        const years = (now.getTime() - new Date(e.hireDate).getTime()) / (365.25 * 86400000);
        return years < 1;
      }).length },
      { name: '1-3年', value: tenureDist.filter(e => {
        const years = (now.getTime() - new Date(e.hireDate).getTime()) / (365.25 * 86400000);
        return years >= 1 && years < 3;
      }).length },
      { name: '3-5年', value: tenureDist.filter(e => {
        const years = (now.getTime() - new Date(e.hireDate).getTime()) / (365.25 * 86400000);
        return years >= 3 && years < 5;
      }).length },
      { name: '5-10年', value: tenureDist.filter(e => {
        const years = (now.getTime() - new Date(e.hireDate).getTime()) / (365.25 * 86400000);
        return years >= 5 && years < 10;
      }).length },
      { name: '10年以上', value: tenureDist.filter(e => {
        const years = (now.getTime() - new Date(e.hireDate).getTime()) / (365.25 * 86400000);
        return years >= 10;
      }).length },
    ].filter(d => d.value > 0);

    // 入职趋势（月度）
    const hireTrendData = this.db.prepare(
      `SELECT strftime('%Y-%m', hireDate) as month, COUNT(*) as value
       FROM employees WHERE hireDate IS NOT NULL
       GROUP BY month ORDER BY month DESC LIMIT 12`
    ).all() as { month: string; value: number }[];

    // 2. 考勤统计
    const monthAttendance = this.db.prepare(
      'SELECT status as name, COUNT(*) as value FROM attendance_records WHERE date LIKE ? GROUP BY status'
    ).all(currentMonth + '%') as { name: string; value: number }[];

    // 月度考勤趋势（近6月）
    const attendanceTrendData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.toISOString().slice(0, 7);
      const normal = (this.db.prepare("SELECT COUNT(*) as c FROM attendance_records WHERE date LIKE ? AND (status='正常' OR status='normal')").get(m + '%') as any).c;
      const late = (this.db.prepare("SELECT COUNT(*) as c FROM attendance_records WHERE date LIKE ? AND (status='迟到' OR status='late' OR status LIKE '%迟到%')").get(m + '%') as any).c;
      const absent = (this.db.prepare("SELECT COUNT(*) as c FROM attendance_records WHERE date LIKE ? AND (status='缺勤' OR status='absent' OR isRestDay=1)").get(m + '%') as any).c;
      attendanceTrendData.push({ month: m, normal, late, absent });
    }

    // 今日考勤
    const todayAttendanceCount = (this.db.prepare('SELECT COUNT(*) as c FROM attendance_records WHERE date = ?').get(today) as any).c;
    const todayLateCount = (this.db.prepare("SELECT COUNT(*) as c FROM attendance_records WHERE date = ? AND lateCount > 0").get(today) as any).c;

    // 3. 薪资统计
    const salaries = this.db.prepare('SELECT * FROM salaries WHERE month = ?').all(currentMonth) as any[];
    const salaryStats = {
      totalGross: salaries.reduce((sum, s) => sum + (s.grossSalary || s.totalSalary || 0), 0),
      totalNet: salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0),
      avgGross: salaries.length > 0 ? Math.round(salaries.reduce((sum, s) => sum + (s.grossSalary || s.totalSalary || 0), 0) / salaries.length) : 0,
      avgNet: salaries.length > 0 ? Math.round(salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0) / salaries.length) : 0,
      count: salaries.length,
    };

    // 薪资分布（按档）
    const allSalaries = this.db.prepare('SELECT netSalary FROM salaries WHERE netSalary > 0').all() as { netSalary: number }[];
    const salaryDistribution = [
      { name: '5k以下', value: allSalaries.filter(s => s.netSalary < 5000).length },
      { name: '5k-10k', value: allSalaries.filter(s => s.netSalary >= 5000 && s.netSalary < 10000).length },
      { name: '10k-20k', value: allSalaries.filter(s => s.netSalary >= 10000 && s.netSalary < 20000).length },
      { name: '20k-30k', value: allSalaries.filter(s => s.netSalary >= 20000 && s.netSalary < 30000).length },
      { name: '30k以上', value: allSalaries.filter(s => s.netSalary >= 30000).length },
    ].filter(d => d.value > 0);

    // 月度薪资趋势
    const salaryTrendData = this.db.prepare(
      'SELECT month as name, SUM(netSalary) as value FROM salaries GROUP BY month ORDER BY month DESC LIMIT 12'
    ).all() as { name: string; value: number }[];

    // 4. 招聘统计
    const recruitmentStats = {
      total: (this.db.prepare('SELECT COUNT(*) as c FROM candidates').get() as any).c,
      interviewing: (this.db.prepare("SELECT COUNT(*) as c FROM candidates WHERE status = 'interviewing'").get() as any).c,
      offerExtended: (this.db.prepare("SELECT COUNT(*) as c FROM candidates WHERE status = 'offer_extended'").get() as any).c,
      offerAccepted: (this.db.prepare("SELECT COUNT(*) as c FROM candidates WHERE status = 'offer_accepted'").get() as any).c,
    };

    // 招聘来源分布
    const sourceDistribution = this.db.prepare(
      "SELECT source as name, COUNT(*) as value FROM candidates WHERE source IS NOT NULL AND source!='' GROUP BY source"
    ).all() as { name: string; value: number }[];

    // 5. 绩效统计
    const currentCycle = this.db.prepare("SELECT * FROM performance_cycles WHERE status = 'active' LIMIT 1").get() as any;
    const performanceStats = {
      totalCycles: (this.db.prepare('SELECT COUNT(*) as c FROM performance_cycles').get() as any).c,
      activeCycle: currentCycle?.name || '暂无',
      totalRecords: (this.db.prepare('SELECT COUNT(*) as c FROM performance_records').get() as any).c,
      avgScore: 0,
    };
    const scores = this.db.prepare('SELECT totalScore FROM performance_records WHERE totalScore > 0').all() as { totalScore: number }[];
    if (scores.length > 0) {
      performanceStats.avgScore = Math.round(scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length * 10) / 10;
    }

    // 绩效等级分布
    const gradeDistribution = this.db.prepare(
      "SELECT grade as name, COUNT(*) as value FROM performance_records WHERE grade IS NOT NULL AND grade!='' GROUP BY grade ORDER BY value DESC"
    ).all() as { name: string; value: number }[];

    // 6. 请假统计（本年度）
    const leaveStats = {
      total: (this.db.prepare('SELECT COUNT(*) as c FROM leave_records WHERE startDate LIKE ?').get(currentYear + '%') as any).c,
      pending: (this.db.prepare("SELECT COUNT(*) as c FROM leave_records WHERE status = 'pending'").get() as any).c,
      approved: (this.db.prepare("SELECT COUNT(*) as c FROM leave_records WHERE status = 'approved'").get() as any).c,
    };

    // 请假类型分布
    const leaveTypeDistribution = this.db.prepare(
      'SELECT leaveType as name, COUNT(*) as value FROM leave_records GROUP BY leaveType ORDER BY value DESC'
    ).all() as { name: string; value: number }[];

    // 7. 合同统计
    const contractStats = {
      total: (this.db.prepare('SELECT COUNT(*) as c FROM contracts').get() as any).c,
      active: (this.db.prepare("SELECT COUNT(*) as c FROM contracts WHERE status = 'active'").get() as any).c,
      expiringSoon: (this.db.prepare("SELECT COUNT(*) as c FROM contracts WHERE status = 'active' AND date(endDate, '-30 days') <= date('now')").get() as any).c,
    };

    // 合同类型分布
    const contractTypeDistribution = this.db.prepare(
      'SELECT contractType as name, COUNT(*) as value FROM contracts GROUP BY contractType ORDER BY value DESC'
    ).all() as { name: string; value: number }[];

    // 8. 培训统计
    const trainingStats = {
      totalPlans: (this.db.prepare('SELECT COUNT(*) as c FROM training_plans').get() as any).c,
      totalCourses: (this.db.prepare('SELECT COUNT(*) as c FROM training_courses').get() as any).c,
      totalRecords: (this.db.prepare('SELECT COUNT(*) as c FROM training_records').get() as any).c,
      activePlans: (this.db.prepare("SELECT COUNT(*) as c FROM training_plans WHERE status = 'active'").get() as any).c,
    };

    return {
      overview: {
        totalEmployees, activeEmployees,
        todayAttendanceCount, todayLateCount,
        salaryStats, recruitmentStats, performanceStats, leaveStats, contractStats, trainingStats,
      },
      deptDistribution, eduDistribution, genderDistribution, tenureDistribution,
      hireTrendData: hireTrendData.reverse(),
      monthAttendance, attendanceTrendData,
      salaryDistribution, salaryTrendData: salaryTrendData.reverse(),
      sourceDistribution, gradeDistribution,
      leaveTypeDistribution, contractTypeDistribution,
    };
  }

  // 报表配置 CRUD
  getReportConfigs(): any[] {
    return this.db.prepare('SELECT * FROM report_configs ORDER BY category, sortOrder').all();
  }

  getDataSources(): any[] {
    return this.db.prepare('SELECT * FROM data_sources ORDER BY createdAt DESC').all();
  }

  getReportDefinitions(): any[] {
    return this.db.prepare('SELECT * FROM report_definitions ORDER BY isBuiltIn DESC, updatedAt DESC').all();
  }

  testDataSourceConnection(id: string): any {
    const ds = this.db.prepare('SELECT * FROM data_sources WHERE id = ?').get(id) as any;
    if (!ds) return { success: false, message: '数据源不存在' };
    if (ds.type === 'internal') {
      // 测试内部数据库连接
      try {
        const tableInfo = this.db.prepare(`PRAGMA table_info(${ds.tableName})`).all();
        if (tableInfo && tableInfo.length > 0) {
          this.db.prepare('UPDATE data_sources SET status=?, lastTestedAt=? WHERE id=?').run('connected', new Date().toISOString(), id);
          return { success: true, message: '连接成功，字段数：' + tableInfo.length, fields: tableInfo };
        }
      } catch (e: any) {
        this.db.prepare('UPDATE data_sources SET status=? WHERE id=?').run('error', id);
        return { success: false, message: '连接失败：' + e.message };
      }
    }
    return { success: true, message: '数据源配置已保存' };
  }

  getDashboardStats(): any {
    const totalEmployees = (this.db.prepare('SELECT COUNT(*) as c FROM employees').get() as any).c;
    const activeEmployees = (this.db.prepare("SELECT COUNT(*) as c FROM employees WHERE status = 'active'").get() as any).c;
    const pendingLeaves = (this.db.prepare("SELECT COUNT(*) as c FROM leave_records WHERE status = 'pending'").get() as any).c;
    const activeRecruitments = (this.db.prepare("SELECT COUNT(*) as c FROM recruitment_positions WHERE status = 'active'").get() as any).c;
    const activeCandidates = (this.db.prepare("SELECT COUNT(*) as c FROM candidates WHERE status NOT IN ('rejected','offer_accepted')").get() as any).c;
    const activeCycle = this.findOne('performance_cycles', { status: 'active' });
    const expiringContracts = (this.db.prepare("SELECT COUNT(*) as c FROM contracts WHERE status = 'active' AND date(endDate, '-30 days') <= date('now')").get() as any).c;
    const todayAttendance = (this.db.prepare("SELECT COUNT(*) as c FROM attendance_records WHERE date = date('now')").get() as any).c;
    const departments = (this.db.prepare('SELECT COUNT(*) as c FROM departments WHERE isActive = 1').get() as any).c;
    const pendingApprovals = (this.db.prepare("SELECT COUNT(*) as c FROM approval_requests WHERE status = 'pending'").get() as any).c;
    return { totalEmployees, activeEmployees, pendingLeaves, activeRecruitments, activeCandidates, expiringContracts, todayAttendance, departments, pendingApprovals, activeCycle };
  }

  private hashPwd(pwd: string): string {
    let hash = 0;
    for (let i = 0; i < pwd.length; i++) {
      hash = ((hash << 5) - hash) + pwd.charCodeAt(i);
      hash = hash & hash;
    }
    return String(hash);
  }
}
