import Database from 'better-sqlite3';
import * as path from 'path';

export class DatabaseService {
  private db!: Database.Database;

  onModuleInit() {
    const dbDir = path.join(process.cwd(), 'data');
    const dbPath = path.join(dbDir, 'ehr.db');
    const fs = require('fs');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.createTables();
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
    `);
  }

  private seedDefaultData() {
    const count = this.db.prepare('SELECT COUNT(*) as c FROM employees').get() as { c: number };
    if (count.c > 0) return;
    console.log('[Database] Seeding...');

    const now = new Date().toISOString();

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
