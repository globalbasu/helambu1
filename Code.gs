// ==========================================================
// ELECTION OPERATIONS MANAGEMENT SYSTEM - ENTERPRISE BACKEND
// Google Apps Script backend for Gokarneshwor 9-ward Pilot
// Dual support: Web App UI and Headless API for Vercel/External Clients
// ==========================================================

var CONFIG = {
  TZ: 'Asia/Kathmandu',
  MUNICIPALITY: 'Gokarneshwor Municipality',
  DEFAULT_ADMIN_PIN: '1234',
  SHEETS: {
    USERS: 'Users',
    WARDS: 'Wards',
    TOLES: 'Toles',
    LOCATIONS: 'PollingLocations',
    BOOTHS: 'Booths',
    HOUSEHOLDS: 'Households',
    VOTERS: 'Voters',
    VISITS: 'Visits',
    FOLLOWUPS: 'FollowUps',
    ISSUES: 'Issues',
    ASSIGNMENTS: 'Assignments',
    NOTICES: 'Notices',
    MESSAGES: 'Messages',
    NOTES: 'Notes',
    PUBLIC_SUBMISSIONS: 'PublicSubmissions',
    ELECTION_DAY: 'ElectionDayReports',
    AUDIT: 'AuditLogs',
    SETTINGS: 'Settings'
  }
};

function doGet(e) {
  initializeSheets();
  e = e || { parameter: {} };
  
  // Public Form Route (?public=1)
  if (e.parameter.public === '1') {
    var output = HtmlService.createTemplateFromFile('index');
    output.mode = 'public';
    output.prefillWard = e.parameter.ward || '';
    output.source = e.parameter.source || 'PublicLink';
    return output.evaluate()
      .setTitle('Public Voter Update — ' + CONFIG.MUNICIPALITY)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=5');
  }

  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Election Operations Management System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=5');
}

function doPost(e) {
  // Support REST/JSON POST for external Vercel deployment
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var args = contents.args || [];
    var result = api(action, args);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Master API Dispatcher
function api(name, args) {
  var allowed = {
    // Auth & Init
    getBootstrap: getBootstrap,
    verifyAdminPin: verifyAdminPin,
    verifyStaffToken: verifyStaffToken,
    verifyStaffPin: verifyStaffPin,
    changeAdminPin: changeAdminPin,
    repairAdminLogin: repairAdminLogin,
    
    // Masters
    getMasterData: getMasterData,
    getDashboardData: getDashboardData,
    getReportData: getReportData,
    getAuditLogs: getAuditLogs,
    getSettings: getSettings,
    updateSetting: updateSetting,

    // Voters
    getVotersData: getVotersData,
    addVoter: addVoter,
    updateVoterFull: updateVoterFull,
    deleteVoter: deleteVoter,
    getVoterDetail: getVoterDetail,
    importVoters: importVoters,

    // Households
    getHouseholdsData: getHouseholdsData,
    addHousehold: addHousehold,
    updateHousehold: updateHousehold,
    deleteHousehold: deleteHousehold,
    getHouseholdDetail: getHouseholdDetail,

    // Visits & Follow-ups
    getVisitsData: getVisitsData,
    addVisit: addVisit,
    deleteVisit: deleteVisit,
    getFollowUps: getFollowUps,
    updateFollowUp: updateFollowUp,
    completeFollowUp: completeFollowUp,
    deleteFollowUp: deleteFollowUp,

    // Areas & Booths
    addTole: addTole,
    updateTole: updateTole,
    deleteTole: deleteTole,
    addPollingLocation: addPollingLocation,
    updatePollingLocation: updatePollingLocation,
    deletePollingLocation: deletePollingLocation,
    addBooth: addBooth,
    updateBooth: updateBooth,
    deleteBooth: deleteBooth,

    // Issues
    getIssuesData: getIssuesData,
    addIssue: addIssue,
    updateIssue: updateIssue,
    resolveIssue: resolveIssue,
    deleteIssue: deleteIssue,

    // Team & Assignments
    getVolunteersData: getVolunteersData,
    addVolunteer: addVolunteer,
    updateVolunteer: updateVolunteer,
    deactivateVolunteer: deactivateVolunteer,
    regenerateUserToken: regenerateUserToken,
    resetUserPin: resetUserPin,
    getAssignments: getAssignments,
    addAssignment: addAssignment,
    deleteAssignment: deleteAssignment,

    // Notices & Messaging & Notes
    getNotices: getNotices,
    addNotice: addNotice,
    deleteNotice: deleteNotice,
    getMessages: getMessages,
    sendMessage: sendMessage,
    markMessageRead: markMessageRead,
    getNotes: getNotes,
    addNote: addNote,
    deleteNote: deleteNote,

    // Public Form
    submitPublicForm: submitPublicForm,
    getPublicSubmissions: getPublicSubmissions,
    reviewSubmission: reviewSubmission,

    // Election Day
    getElectionDayData: getElectionDayData,
    recordParticipation: recordParticipation,
    updateElectionDayReport: updateElectionDayReport,
    deleteElectionDayReport: deleteElectionDayReport
  };

  if (!allowed[name]) return { success: false, message: 'Unknown API action: ' + name };
  try {
    return allowed[name].apply(null, args || []);
  } catch (e) {
    return fail(e);
  }
}

// ---------------- SHEET INITIALIZATION & MIGRATION ----------------
function initializeSheets() {
  var defs = {};
  defs[CONFIG.SHEETS.USERS] = ['UserID','Name','Phone','Role','PIN','AccessToken','Ward','Tole','BoothNo','Active','Notes','CreatedDate','UpdatedDate'];
  defs[CONFIG.SHEETS.WARDS] = ['WardID','WardNo','Municipality','Active','Notes'];
  defs[CONFIG.SHEETS.TOLES] = ['ToleID','WardNo','ToleName','Active','Notes'];
  defs[CONFIG.SHEETS.LOCATIONS] = ['PollingLocationID','WardNo','LocationName','Address','Active','Notes'];
  defs[CONFIG.SHEETS.BOOTHS] = ['BoothID','WardNo','PollingLocationID','BoothCode','BoothName','RegisteredCount','MaleCount','FemaleCount','OtherCount','Active','Notes'];
  defs[CONFIG.SHEETS.HOUSEHOLDS] = ['HouseholdID','WardNo','Tole','BlockCluster','HouseNo','Address','PrimaryContactName','PrimaryPhone','AssignedUserID','VerificationStatus','Notes','CreatedBy','CreatedDate','UpdatedBy','UpdatedDate'];
  defs[CONFIG.SHEETS.VOTERS] = ['VoterID','Name','Phone','Gender','AgeGroup','Municipality','Ward','Tole','BlockCluster','HouseholdID','HouseNo','AddressNote','PollingLocationID','BoothNo','VoterSerial','RecordSource','VerificationStatus','ContactStatus','SelfReportedResponse','ResponseDate','ResponseSource','AssignedUserID','Active','Notes','CreatedBy','CreatedDate','UpdatedBy','UpdatedDate'];
  defs[CONFIG.SHEETS.VISITS] = ['VisitID','VoterID','HouseholdID','Date','VisitOutcome','ContactStatus','SelfReportedResponse','ResponseSource','FollowUpRequired','NextVisitDate','AssignFollowUpTo','Notes','RecordedBy','CreatedDate'];
  defs[CONFIG.SHEETS.FOLLOWUPS] = ['FollowUpID','VoterID','AssignedUserID','DueDate','Reason','Status','Notes','CreatedBy','CreatedDate','CompletedDate'];
  defs[CONFIG.SHEETS.ISSUES] = ['IssueID','WardNo','ToleID','PollingLocationID','BoothID','IssueCategory','Priority','Status','Description','AssignedUserID','ReportedBy','ReportedDate','ResolvedDate'];
  defs[CONFIG.SHEETS.ASSIGNMENTS] = ['AssignmentID','UserID','Ward','ToleID','PollingLocationID','BoothID','AssignmentType','SupervisorUserID','Active','CreatedDate'];
  defs[CONFIG.SHEETS.NOTICES] = ['NoticeID','Title','Message','Priority','Audience','AudienceTarget','PublishedBy','PublishedDate','ExpiryDate','CreatedDate'];
  defs[CONFIG.SHEETS.MESSAGES] = ['MessageID','SenderUserID','RecipientType','RecipientID','Subject','Body','Priority','IsRead','ReadDate','CreatedDate'];
  defs[CONFIG.SHEETS.NOTES] = ['NoteID','Title','Content','Visibility','RelatedType','RelatedID','WardNo','CreatedBy','CreatedDate','UpdatedDate'];
  defs[CONFIG.SHEETS.PUBLIC_SUBMISSIONS] = ['SubmissionID','FullName','Phone','WardNo','Tole','HouseArea','PollingLocation','BoothNo','VoterSerial','Gender','AgeGroup','SubmissionType','CorrectionDetails','Consent','Status','ReviewedBy','ReviewedDate','ReviewNotes','CreatedDate'];
  defs[CONFIG.SHEETS.ELECTION_DAY] = ['ReportID','WardNo','PollingLocationID','BoothID','ReportTime','TeamStatus','OperationalStatus','AggregateParticipation','OpenIssueCount','Notes','ReportedBy','CreatedDate'];
  defs[CONFIG.SHEETS.AUDIT] = ['AuditID','UserID','Action','EntityType','EntityID','Details','CreatedDate'];
  defs[CONFIG.SHEETS.SETTINGS] = ['Key','Value','UpdatedDate'];

  Object.keys(defs).forEach(function(name) { ensureSheet(name, defs[name]); });
  migrateLegacyData();
  seedWards();
  seedAdmin();
  seedDefaultSettings();
  return { success: true, message: 'System initialized successfully' };
}

function ensureSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    var existing = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
    var missing = headers.filter(function(h) { return existing.indexOf(h) < 0; });
    if (missing.length) {
      sh.getRange(1, sh.getLastColumn() + 1, 1, missing.length).setValues([missing]);
    }
  }
  sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
  sh.setFrozenRows(1);
}

function migrateLegacyData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var voters = getSheet(CONFIG.SHEETS.VOTERS);
  if (voters && voters.getLastRow() > 1) {
    var vals = voters.getDataRange().getValues(), h = vals[0].map(String);
    var cContact = h.indexOf('ContactStatus'), cVerify = h.indexOf('VerificationStatus');
    for (var r = 1; r < vals.length; r++) {
      if (cContact >= 0 && !vals[r][cContact]) voters.getRange(r + 1, cContact + 1).setValue('Not Contacted');
      if (cVerify >= 0 && !vals[r][cVerify]) voters.getRange(r + 1, cVerify + 1).setValue('Pending');
    }
  }
}

function seedWards() {
  var sh = getSheet(CONFIG.SHEETS.WARDS), data = objects(CONFIG.SHEETS.WARDS), seen = {};
  data.forEach(function(x) { seen[String(x.WardNo)] = true; });
  var rows = [];
  for (var w = 1; w <= 9; w++) {
    if (!seen[String(w)]) rows.push(['WARD_' + pad(w, 2), w, CONFIG.MUNICIPALITY, true, '']);
  }
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function seedAdmin() {
  var sh = getSheet(CONFIG.SHEETS.USERS);
  var admin = find(CONFIG.SHEETS.USERS, 'UserID', 'USR_ADMIN');
  if (!admin) {
    append(CONFIG.SHEETS.USERS, {
      UserID: 'USR_ADMIN',
      Name: 'System Admin',
      Phone: '9841234567',
      Role: 'Super Admin',
      PIN: '1234',
      AccessToken: 'TOKEN_ADMIN_MASTER_SECURE',
      Ward: 'All',
      Tole: '',
      BoothNo: '',
      Active: true,
      Notes: 'Master Administrator',
      CreatedDate: new Date(),
      UpdatedDate: new Date()
    });
  }
}

function seedDefaultSettings() {
  var sh = getSheet(CONFIG.SHEETS.SETTINGS);
  if (sh.getLastRow() <= 1) {
    var defaults = [
      ['admin_pin', '1234'],
      ['election_day_mode', 'false'],
      ['municipality_name', CONFIG.MUNICIPALITY],
      ['public_form_enabled', 'true'],
      ['household_module_enabled', 'true'],
      ['notices_enabled', 'true'],
      ['messages_enabled', 'true'],
      ['notes_enabled', 'true']
    ];
    defaults.forEach(function(pair) {
      append(CONFIG.SHEETS.SETTINGS, { Key: pair[0], Value: pair[1], UpdatedDate: new Date() });
    });
  }
}

// ---------------- AUTHENTICATION & LOGIN ----------------
function getAdminPin() {
  var prop = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN');
  if (prop) return prop;
  var row = find(CONFIG.SHEETS.SETTINGS, 'Key', 'admin_pin');
  if (row && row.Value) return String(row.Value);
  return CONFIG.DEFAULT_ADMIN_PIN;
}

function verifyAdminPin(pin) {
  var valid = String(pin).trim() === getAdminPin();
  if (valid) {
    audit('LOGIN', 'Admin', 'USR_ADMIN', 'Successful Admin PIN Login');
    return ok({
      authenticated: true,
      user: {
        UserID: 'USR_ADMIN',
        Name: 'System Admin',
        Role: 'Super Admin',
        Ward: 'All'
      }
    });
  }
  audit('LOGIN_FAILED', 'Admin', 'USR_ADMIN', 'Failed PIN attempt');
  return fail('Incorrect 4-digit PIN. Please try again.');
}

function repairAdminLogin() {
  PropertiesService.getScriptProperties().setProperty('ADMIN_PIN', CONFIG.DEFAULT_ADMIN_PIN);
  update(CONFIG.SHEETS.SETTINGS, 'Key', 'admin_pin', { Value: CONFIG.DEFAULT_ADMIN_PIN, UpdatedDate: new Date() });
  update(CONFIG.SHEETS.USERS, 'UserID', 'USR_ADMIN', { PIN: CONFIG.DEFAULT_ADMIN_PIN, Active: true, UpdatedDate: new Date() });
  audit('REPAIR', 'Admin', 'USR_ADMIN', 'Emergency repairAdminLogin executed. PIN reset to 1234');
  return ok({ message: 'Admin PIN reset to default 1234' });
}

function changeAdminPin(oldPin, newPin) {
  if (String(oldPin).trim() !== getAdminPin()) return fail('Current PIN is incorrect');
  if (!/^\d{4}$/.test(String(newPin).trim())) return fail('New PIN must be exactly 4 digits');
  PropertiesService.getScriptProperties().setProperty('ADMIN_PIN', String(newPin).trim());
  update(CONFIG.SHEETS.SETTINGS, 'Key', 'admin_pin', { Value: String(newPin).trim(), UpdatedDate: new Date() });
  update(CONFIG.SHEETS.USERS, 'UserID', 'USR_ADMIN', { PIN: String(newPin).trim(), UpdatedDate: new Date() });
  audit('CHANGE_PIN', 'Admin', 'USR_ADMIN', 'Admin PIN changed');
  return ok({ message: 'Admin PIN changed successfully' });
}

function verifyStaffToken(token) {
  if (!token) return fail('Invalid token');
  var user = find(CONFIG.SHEETS.USERS, 'AccessToken', token);
  if (!user || !truthy(user.Active)) return fail('Invalid or expired access token');
  return ok({
    UserID: user.UserID,
    Name: user.Name,
    Role: user.Role,
    Ward: user.Ward,
    Tole: user.Tole,
    BoothNo: user.BoothNo
  });
}

function verifyStaffPin(token, pin) {
  var user = find(CONFIG.SHEETS.USERS, 'AccessToken', token);
  if (!user || !truthy(user.Active)) return fail('User not found or disabled');
  if (String(user.PIN).trim() !== String(pin).trim()) {
    audit('LOGIN_FAILED', 'User', user.UserID, 'Incorrect staff PIN');
    return fail('Incorrect 4-digit PIN');
  }
  audit('LOGIN', 'User', user.UserID, 'Staff logged in via personal link');
  return ok({
    authenticated: true,
    user: {
      UserID: user.UserID,
      Name: user.Name,
      Role: user.Role,
      Ward: user.Ward,
      Tole: user.Tole,
      BoothNo: user.BoothNo
    }
  });
}

function getBootstrap(token) {
  initializeSheets();
  var settings = getSettingsMap();
  if (token) {
    var staff = find(CONFIG.SHEETS.USERS, 'AccessToken', token);
    if (staff && truthy(staff.Active)) {
      return ok({
        user: { UserID: staff.UserID, Name: staff.Name, Role: staff.Role, Ward: staff.Ward, Tole: staff.Tole, BoothNo: staff.BoothNo },
        settings: settings
      });
    }
  }
  return ok({
    user: { UserID: 'USR_ADMIN', Name: 'System Admin', Role: 'Super Admin', Ward: 'All' },
    settings: settings
  });
}

function getSettingsMap() {
  var rows = objects(CONFIG.SHEETS.SETTINGS);
  var map = {};
  rows.forEach(function(r) { map[r.Key] = r.Value; });
  return map;
}

function getSettings() {
  return ok(getSettingsMap());
}

function updateSetting(key, value) {
  if (update(CONFIG.SHEETS.SETTINGS, 'Key', key, { Value: String(value), UpdatedDate: new Date() })) {
    audit('SETTING_UPDATE', 'Setting', key, String(value));
    return ok();
  }
  append(CONFIG.SHEETS.SETTINGS, { Key: key, Value: String(value), UpdatedDate: new Date() });
  return ok();
}

function getMasterData() {
  return ok({
    wards: objects(CONFIG.SHEETS.WARDS),
    toles: objects(CONFIG.SHEETS.TOLES),
    locations: objects(CONFIG.SHEETS.LOCATIONS),
    booths: objects(CONFIG.SHEETS.BOOTHS)
  });
}

// ---------------- VOTERS MODULE ----------------
function getVotersData(filters, userWard) {
  filters = filters || {};
  var rows = objects(CONFIG.SHEETS.VOTERS);
  // Ward-level scoping enforcement if user is assigned to a specific ward
  if (userWard && userWard !== 'All') {
    rows = rows.filter(function(v) { return String(v.Ward) === String(userWard); });
  }
  return ok(rows);
}

function addVoter(data, callerId) {
  try {
    validateWard(data.Ward);
    if (!trim(data.Name)) throw new Error('Name is required');
    var id = uid('VOT'), now = new Date();
    append(CONFIG.SHEETS.VOTERS, {
      VoterID: id,
      Name: trim(data.Name),
      Phone: trim(data.Phone),
      Gender: data.Gender || '',
      AgeGroup: data.AgeGroup || '',
      Municipality: CONFIG.MUNICIPALITY,
      Ward: Number(data.Ward),
      Tole: trim(data.Tole),
      BlockCluster: trim(data.BlockCluster),
      HouseholdID: data.HouseholdID || '',
      HouseNo: trim(data.HouseNo),
      AddressNote: data.AddressNote || '',
      PollingLocationID: data.PollingLocationID || '',
      BoothNo: trim(data.BoothNo),
      VoterSerial: trim(data.VoterSerial),
      RecordSource: data.RecordSource || 'Manual',
      VerificationStatus: data.VerificationStatus || 'Pending',
      ContactStatus: data.ContactStatus || 'Not Contacted',
      SelfReportedResponse: data.SelfReportedResponse || '',
      ResponseDate: data.SelfReportedResponse ? now : '',
      ResponseSource: data.SelfReportedResponse ? 'Self-reported' : '',
      AssignedUserID: data.AssignedUserID || '',
      Active: true,
      Notes: data.Notes || '',
      CreatedBy: callerId || 'USR_ADMIN',
      CreatedDate: now,
      UpdatedBy: callerId || 'USR_ADMIN',
      UpdatedDate: now
    });
    audit('CREATE', 'Voter', id, data.Name);
    return ok({ id: id });
  } catch (e) {
    return fail(e);
  }
}

function updateVoterFull(id, data, callerId) {
  try {
    validateWard(data.Ward);
    var p = {
      Name: trim(data.Name),
      Phone: trim(data.Phone),
      Gender: data.Gender || '',
      AgeGroup: data.AgeGroup || '',
      Ward: Number(data.Ward),
      Tole: trim(data.Tole),
      BlockCluster: trim(data.BlockCluster),
      HouseholdID: data.HouseholdID || '',
      HouseNo: trim(data.HouseNo),
      AddressNote: data.AddressNote || '',
      PollingLocationID: data.PollingLocationID || '',
      BoothNo: trim(data.BoothNo),
      VoterSerial: trim(data.VoterSerial),
      VerificationStatus: data.VerificationStatus || 'Pending',
      AssignedUserID: data.AssignedUserID || '',
      Notes: data.Notes || '',
      UpdatedBy: callerId || 'USR_ADMIN',
      UpdatedDate: new Date()
    };
    if (!update(CONFIG.SHEETS.VOTERS, 'VoterID', id, p)) throw new Error('Record not found');
    audit('UPDATE', 'Voter', id, JSON.stringify(p));
    return ok();
  } catch (e) {
    return fail(e);
  }
}

function deleteVoter(id) {
  try {
    removeRelated(CONFIG.SHEETS.VISITS, 'VoterID', id, 'VisitID');
    removeRelated(CONFIG.SHEETS.FOLLOWUPS, 'VoterID', id, 'FollowUpID');
    if (!del(CONFIG.SHEETS.VOTERS, 'VoterID', id)) throw new Error('Record not found');
    audit('DELETE', 'Voter', id, 'Deleted with linked visits & follow-ups');
    return ok();
  } catch (e) {
    return fail(e);
  }
}

function getVoterDetail(id) {
  var v = find(CONFIG.SHEETS.VOTERS, 'VoterID', id);
  if (!v) return fail('Record not found');
  return ok({
    voter: v,
    visits: objects(CONFIG.SHEETS.VISITS).filter(function(x) { return String(x.VoterID) === String(id); }),
    followups: objects(CONFIG.SHEETS.FOLLOWUPS).filter(function(x) { return String(x.VoterID) === String(id); }),
    household: v.HouseholdID ? find(CONFIG.SHEETS.HOUSEHOLDS, 'HouseholdID', v.HouseholdID) : null
  });
}

function importVoters(rows, callerId) {
  try {
    if (!Array.isArray(rows)) throw new Error('Invalid import data');
    var existing = objects(CONFIG.SHEETS.VOTERS), keys = {};
    existing.forEach(function(v) { keys[dupKey(v)] = true; });
    var res = { imported: 0, duplicates: 0, invalid: 0, errors: [] };
    var sh = getSheet(CONFIG.SHEETS.VOTERS), headers = getHeaders(sh), batch = [], now = new Date();
    
    rows.forEach(function(r, i) {
      try {
        if (!trim(r.Name || r.FullName)) throw new Error('Name required');
        validateWard(r.Ward || r.WardNo);
        var o = {
          VoterID: uid('VOT'),
          Name: trim(r.Name || r.FullName),
          Phone: trim(r.Phone),
          Gender: r.Gender || '',
          AgeGroup: r.AgeGroup || '',
          Municipality: CONFIG.MUNICIPALITY,
          Ward: Number(r.Ward || r.WardNo),
          Tole: trim(r.Tole),
          BlockCluster: trim(r.BlockCluster || r.HouseArea),
          HouseholdID: r.HouseholdID || '',
          HouseNo: trim(r.HouseNo),
          AddressNote: r.Notes || '',
          PollingLocationID: r.PollingLocationID || '',
          BoothNo: trim(r.BoothNo || r.BoothID),
          VoterSerial: trim(r.VoterSerial),
          RecordSource: 'Import',
          VerificationStatus: r.VerificationStatus || 'Pending',
          ContactStatus: 'Not Contacted',
          SelfReportedResponse: '',
          ResponseDate: '',
          ResponseSource: '',
          AssignedUserID: '',
          Active: true,
          Notes: r.Notes || '',
          CreatedBy: callerId || 'USR_ADMIN',
          CreatedDate: now,
          UpdatedBy: callerId || 'USR_ADMIN',
          UpdatedDate: now
        };
        var k = dupKey(o);
        if (keys[k]) { res.duplicates++; return; }
        keys[k] = true;
        batch.push(headers.map(function(h) { return o[h] !== undefined ? o[h] : ''; }));
        res.imported++;
      } catch (er) {
        res.invalid++;
        if (res.errors.length < 30) res.errors.push({ row: i + 1, error: er.message });
      }
    });

    if (batch.length) sh.getRange(sh.getLastRow() + 1, 1, batch.length, headers.length).setValues(batch);
    audit('IMPORT', 'Voter', '', JSON.stringify(res));
    return ok(res);
  } catch (e) {
    return fail(e);
  }
}

// ---------------- HOUSEHOLDS MODULE ----------------
function getHouseholdsData(userWard) {
  var rows = objects(CONFIG.SHEETS.HOUSEHOLDS);
  if (userWard && userWard !== 'All') {
    rows = rows.filter(function(h) { return String(h.WardNo) === String(userWard); });
  }
  return ok(rows);
}

function addHousehold(d, callerId) {
  try {
    validateWard(d.WardNo);
    if (!trim(d.PrimaryContactName)) throw new Error('Primary contact name is required');
    var id = uid('HHD'), now = new Date();
    append(CONFIG.SHEETS.HOUSEHOLDS, {
      HouseholdID: id,
      WardNo: Number(d.WardNo),
      Tole: trim(d.Tole),
      BlockCluster: trim(d.BlockCluster),
      HouseNo: trim(d.HouseNo),
      Address: trim(d.Address),
      PrimaryContactName: trim(d.PrimaryContactName),
      PrimaryPhone: trim(d.PrimaryPhone),
      AssignedUserID: d.AssignedUserID || '',
      VerificationStatus: d.VerificationStatus || 'Pending',
      Notes: d.Notes || '',
      CreatedBy: callerId || 'USR_ADMIN',
      CreatedDate: now,
      UpdatedBy: callerId || 'USR_ADMIN',
      UpdatedDate: now
    });
    audit('CREATE', 'Household', id, d.PrimaryContactName);
    return ok({ id: id });
  } catch (e) {
    return fail(e);
  }
}

function updateHousehold(id, d, callerId) {
  try {
    validateWard(d.WardNo);
    var p = {
      WardNo: Number(d.WardNo),
      Tole: trim(d.Tole),
      BlockCluster: trim(d.BlockCluster),
      HouseNo: trim(d.HouseNo),
      Address: trim(d.Address),
      PrimaryContactName: trim(d.PrimaryContactName),
      PrimaryPhone: trim(d.PrimaryPhone),
      AssignedUserID: d.AssignedUserID || '',
      VerificationStatus: d.VerificationStatus || 'Pending',
      Notes: d.Notes || '',
      UpdatedBy: callerId || 'USR_ADMIN',
      UpdatedDate: new Date()
    };
    if (!update(CONFIG.SHEETS.HOUSEHOLDS, 'HouseholdID', id, p)) throw new Error('Household not found');
    audit('UPDATE', 'Household', id, JSON.stringify(p));
    return ok();
  } catch (e) {
    return fail(e);
  }
}

function deleteHousehold(id) {
  try {
    if (!del(CONFIG.SHEETS.HOUSEHOLDS, 'HouseholdID', id)) throw new Error('Household not found');
    audit('DELETE', 'Household', id, 'Deleted');
    return ok();
  } catch (e) {
    return fail(e);
  }
}

function getHouseholdDetail(id) {
  var h = find(CONFIG.SHEETS.HOUSEHOLDS, 'HouseholdID', id);
  if (!h) return fail('Household not found');
  var members = objects(CONFIG.SHEETS.VOTERS).filter(function(v) { return String(v.HouseholdID) === String(id); });
  return ok({ household: h, members: members });
}

// ---------------- VISITS & FOLLOWUPS ----------------
function getVisitsData(userWard) {
  var voters = lookup(CONFIG.SHEETS.VOTERS, 'VoterID');
  var rows = objects(CONFIG.SHEETS.VISITS);
  rows.forEach(function(x) {
    var v = voters[x.VoterID] || {};
    x.VoterName = v.Name || 'Unknown';
    x.Ward = v.Ward || '';
  });
  if (userWard && userWard !== 'All') {
    rows = rows.filter(function(x) { return String(x.Ward) === String(userWard); });
  }
  return ok(rows);
}

function addVisit(d, callerId) {
  try {
    if (!find(CONFIG.SHEETS.VOTERS, 'VoterID', d.VoterID)) throw new Error('Voter not found');
    var id = uid('VIS'), now = new Date();
    var response = allowed(d.SelfReportedResponse, ['', 'Support', 'Not Support', 'Undecided', 'Declined to Answer']);
    append(CONFIG.SHEETS.VISITS, {
      VisitID: id,
      VoterID: d.VoterID,
      HouseholdID: d.HouseholdID || '',
      Date: d.Date || formatDate(now),
      VisitOutcome: d.VisitOutcome || 'Met',
      ContactStatus: d.ContactStatus || 'Contacted',
      SelfReportedResponse: response,
      ResponseSource: response ? 'Self-reported' : '',
      FollowUpRequired: d.FollowUpRequired || 'No',
      NextVisitDate: d.NextVisitDate || '',
      AssignFollowUpTo: d.AssignFollowUpTo || '',
      Notes: d.Notes || '',
      RecordedBy: callerId || 'USR_ADMIN',
      CreatedDate: now
    });
    update(CONFIG.SHEETS.VOTERS, 'VoterID', d.VoterID, {
      ContactStatus: d.ContactStatus || 'Contacted',
      SelfReportedResponse: response,
      ResponseDate: response ? now : '',
      ResponseSource: response ? 'Self-reported' : '',
      UpdatedBy: callerId || 'USR_ADMIN',
      UpdatedDate: now
    });
    if (d.FollowUpRequired === 'Yes' && d.NextVisitDate) {
      append(CONFIG.SHEETS.FOLLOWUPS, {
        FollowUpID: uid('FUP'),
        VoterID: d.VoterID,
        AssignedUserID: d.AssignFollowUpTo || callerId || 'USR_ADMIN',
        DueDate: d.NextVisitDate,
        Reason: 'Field Follow-up',
        Status: 'Pending',
        Notes: d.Notes || '',
        CreatedBy: callerId || 'USR_ADMIN',
        CreatedDate: now,
        CompletedDate: ''
      });
    }
    audit('CREATE', 'Visit', id, d.VoterID);
    return ok({ id: id });
  } catch (e) {
    return fail(e);
  }
}

function deleteVisit(id) {
  try {
    if (!del(CONFIG.SHEETS.VISITS, 'VisitID', id)) throw new Error('Visit not found');
    audit('DELETE', 'Visit', id, 'Deleted');
    return ok();
  } catch (e) {
    return fail(e);
  }
}

function getFollowUps(userWard) {
  var voters = lookup(CONFIG.SHEETS.VOTERS, 'VoterID');
  var rows = objects(CONFIG.SHEETS.FOLLOWUPS);
  rows.forEach(function(x) {
    var v = voters[x.VoterID] || {};
    x.VoterName = v.Name || 'Unknown';
    x.Ward = v.Ward || '';
  });
  if (userWard && userWard !== 'All') {
    rows = rows.filter(function(x) { return String(x.Ward) === String(userWard); });
  }
  return ok(rows);
}

function updateFollowUp(id, data) {
  try {
    var p = {
      AssignedUserID: data.AssignedUserID || '',
      DueDate: data.DueDate || '',
      Status: data.Status || 'Pending',
      Notes: data.Notes || ''
    };
    if (p.Status === 'Completed') p.CompletedDate = new Date();
    if (!update(CONFIG.SHEETS.FOLLOWUPS, 'FollowUpID', id, p)) throw new Error('Follow-up not found');
    audit('UPDATE', 'FollowUp', id, JSON.stringify(p));
    return ok();
  } catch (e) {
    return fail(e);
  }
}

function completeFollowUp(id) {
  return updateFollowUp(id, { Status: 'Completed' });
}

function deleteFollowUp(id) {
  try {
    if (!del(CONFIG.SHEETS.FOLLOWUPS, 'FollowUpID', id)) throw new Error('Follow-up not found');
    audit('DELETE', 'FollowUp', id, 'Deleted');
    return ok();
  } catch (e) {
    return fail(e);
  }
}

// ---------------- AREAS & BOOTHS ----------------
function addTole(d) {
  try {
    validateWard(d.WardNo);
    var id = uid('TOL');
    append(CONFIG.SHEETS.TOLES, { ToleID: id, WardNo: Number(d.WardNo), ToleName: trim(d.ToleName), Active: true, Notes: d.Notes || '' });
    audit('CREATE', 'Tole', id, d.ToleName);
    return ok({ id: id });
  } catch (e) { return fail(e); }
}

function updateTole(id, d) {
  try {
    if (!update(CONFIG.SHEETS.TOLES, 'ToleID', id, { WardNo: Number(d.WardNo), ToleName: trim(d.ToleName), Notes: d.Notes || '' })) throw new Error('Tole not found');
    audit('UPDATE', 'Tole', id, d.ToleName);
    return ok();
  } catch (e) { return fail(e); }
}

function deleteTole(id) {
  try {
    if (!del(CONFIG.SHEETS.TOLES, 'ToleID', id)) throw new Error('Tole not found');
    audit('DELETE', 'Tole', id, 'Deleted');
    return ok();
  } catch (e) { return fail(e); }
}

function addPollingLocation(d) {
  try {
    validateWard(d.WardNo);
    var id = uid('LOC');
    append(CONFIG.SHEETS.LOCATIONS, { PollingLocationID: id, WardNo: Number(d.WardNo), LocationName: trim(d.LocationName), Address: trim(d.Address), Active: true, Notes: '' });
    audit('CREATE', 'PollingLocation', id, d.LocationName);
    return ok({ id: id });
  } catch (e) { return fail(e); }
}

function updatePollingLocation(id, d) {
  try {
    if (!update(CONFIG.SHEETS.LOCATIONS, 'PollingLocationID', id, { WardNo: Number(d.WardNo), LocationName: trim(d.LocationName), Address: trim(d.Address) })) throw new Error('Location not found');
    audit('UPDATE', 'PollingLocation', id, d.LocationName);
    return ok();
  } catch (e) { return fail(e); }
}

function deletePollingLocation(id) {
  try {
    if (!del(CONFIG.SHEETS.LOCATIONS, 'PollingLocationID', id)) throw new Error('Location not found');
    audit('DELETE', 'PollingLocation', id, 'Deleted');
    return ok();
  } catch (e) { return fail(e); }
}

function addBooth(d) {
  try {
    validateWard(d.WardNo);
    var id = uid('BTH');
    append(CONFIG.SHEETS.BOOTHS, {
      BoothID: id,
      WardNo: Number(d.WardNo),
      PollingLocationID: d.PollingLocationID || '',
      BoothCode: trim(d.BoothCode),
      BoothName: trim(d.BoothName),
      RegisteredCount: num(d.RegisteredCount),
      MaleCount: num(d.MaleCount),
      FemaleCount: num(d.FemaleCount),
      OtherCount: num(d.OtherCount),
      Active: true,
      Notes: ''
    });
    audit('CREATE', 'Booth', id, d.BoothCode);
    return ok({ id: id });
  } catch (e) { return fail(e); }
}

function updateBooth(id, d) {
  try {
    var p = {
      WardNo: Number(d.WardNo),
      PollingLocationID: d.PollingLocationID || '',
      BoothCode: trim(d.BoothCode),
      BoothName: trim(d.BoothName),
      RegisteredCount: num(d.RegisteredCount),
      MaleCount: num(d.MaleCount),
      FemaleCount: num(d.FemaleCount),
      OtherCount: num(d.OtherCount)
    };
    if (!update(CONFIG.SHEETS.BOOTHS, 'BoothID', id, p)) throw new Error('Booth not found');
    audit('UPDATE', 'Booth', id, JSON.stringify(p));
    return ok();
  } catch (e) { return fail(e); }
}

function deleteBooth(id) {
  try {
    if (!del(CONFIG.SHEETS.BOOTHS, 'BoothID', id)) throw new Error('Booth not found');
    audit('DELETE', 'Booth', id, 'Deleted');
    return ok();
  } catch (e) { return fail(e); }
}

// ---------------- ISSUES ----------------
function getIssuesData(userWard) {
  var rows = objects(CONFIG.SHEETS.ISSUES);
  if (userWard && userWard !== 'All') {
    rows = rows.filter(function(i) { return String(i.WardNo) === String(userWard); });
  }
  return ok(rows);
}

function addIssue(d, callerId) {
  try {
    validateWard(d.WardNo);
    var id = uid('ISS'), now = new Date();
    append(CONFIG.SHEETS.ISSUES, {
      IssueID: id,
      WardNo: Number(d.WardNo),
      ToleID: d.ToleID || '',
      PollingLocationID: d.PollingLocationID || '',
      BoothID: d.BoothID || '',
      IssueCategory: d.IssueCategory || 'Other',
      Priority: d.Priority || 'Medium',
      Status: d.Status || 'Open',
      Description: d.Description || '',
      AssignedUserID: d.AssignedUserID || '',
      ReportedBy: callerId || 'USR_ADMIN',
      ReportedDate: now,
      ResolvedDate: ''
    });
    audit('CREATE', 'Issue', id, d.Description);
    return ok({ id: id });
  } catch (e) { return fail(e); }
}

function updateIssue(id, d) {
  try {
    var p = {
      IssueCategory: d.IssueCategory || 'Other',
      Priority: d.Priority || 'Medium',
      Status: d.Status || 'Open',
      Description: d.Description || '',
      AssignedUserID: d.AssignedUserID || ''
    };
    if (p.Status === 'Resolved') p.ResolvedDate = new Date();
    if (!update(CONFIG.SHEETS.ISSUES, 'IssueID', id, p)) throw new Error('Issue not found');
    audit('UPDATE', 'Issue', id, JSON.stringify(p));
    return ok();
  } catch (e) { return fail(e); }
}

function resolveIssue(id) {
  try {
    if (!update(CONFIG.SHEETS.ISSUES, 'IssueID', id, { Status: 'Resolved', ResolvedDate: new Date() })) throw new Error('Issue not found');
    audit('RESOLVE', 'Issue', id, 'Resolved');
    return ok();
  } catch (e) { return fail(e); }
}

function deleteIssue(id) {
  try {
    if (!del(CONFIG.SHEETS.ISSUES, 'IssueID', id)) throw new Error('Issue not found');
    audit('DELETE', 'Issue', id, 'Deleted');
    return ok();
  } catch (e) { return fail(e); }
}

// ---------------- TEAM & VOLUNTEERS ----------------
function getVolunteersData() {
  return ok(objects(CONFIG.SHEETS.USERS));
}

function addVolunteer(d) {
  try {
    var id = uid('USR'), now = new Date();
    if (!trim(d.Name) || !trim(d.Phone)) throw new Error('Name and phone are required');
    var token = 'tok_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16);
    append(CONFIG.SHEETS.USERS, {
      UserID: id,
      Name: trim(d.Name),
      Phone: trim(d.Phone),
      Role: d.Role || 'Field Worker',
      PIN: d.PIN || '1234',
      AccessToken: token,
      Ward: d.Ward || '',
      Tole: d.Tole || '',
      BoothNo: d.BoothNo || '',
      Active: true,
      Notes: d.Notes || '',
      CreatedDate: now,
      UpdatedDate: now
    });
    audit('CREATE', 'User', id, d.Name);
    return ok({ id: id, token: token });
  } catch (e) { return fail(e); }
}

function updateVolunteer(id, d) {
  try {
    var p = {
      Name: trim(d.Name),
      Phone: trim(d.Phone),
      Role: d.Role || 'Field Worker',
      Ward: d.Ward || '',
      Tole: d.Tole || '',
      BoothNo: d.BoothNo || '',
      Notes: d.Notes || '',
      UpdatedDate: new Date()
    };
    if (d.PIN) p.PIN = d.PIN;
    if (!update(CONFIG.SHEETS.USERS, 'UserID', id, p)) throw new Error('User not found');
    audit('UPDATE', 'User', id, d.Name);
    return ok();
  } catch (e) { return fail(e); }
}

function deactivateVolunteer(id) {
  try {
    if (id === 'USR_ADMIN') throw new Error('Super Admin cannot be deactivated');
    if (!update(CONFIG.SHEETS.USERS, 'UserID', id, { Active: false, UpdatedDate: new Date() })) throw new Error('User not found');
    audit('DEACTIVATE', 'User', id, 'Inactive');
    return ok();
  } catch (e) { return fail(e); }
}

function regenerateUserToken(id) {
  try {
    var token = 'tok_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16);
    if (!update(CONFIG.SHEETS.USERS, 'UserID', id, { AccessToken: token, UpdatedDate: new Date() })) throw new Error('User not found');
    audit('REGENERATE_TOKEN', 'User', id, token);
    return ok({ token: token });
  } catch (e) { return fail(e); }
}

function resetUserPin(id, pin) {
  try {
    pin = pin || '1234';
    if (!update(CONFIG.SHEETS.USERS, 'UserID', id, { PIN: pin, UpdatedDate: new Date() })) throw new Error('User not found');
    audit('RESET_PIN', 'User', id, 'Reset to ' + pin);
    return ok({ message: 'User PIN reset to ' + pin });
  } catch (e) { return fail(e); }
}

function getAssignments() {
  return ok(objects(CONFIG.SHEETS.ASSIGNMENTS));
}

function addAssignment(d) {
  try {
    if (!d.UserID) throw new Error('User required');
    var id = uid('ASN');
    append(CONFIG.SHEETS.ASSIGNMENTS, {
      AssignmentID: id,
      UserID: d.UserID,
      Ward: d.Ward || '',
      ToleID: d.ToleID || '',
      PollingLocationID: d.PollingLocationID || '',
      BoothID: d.BoothID || '',
      AssignmentType: d.AssignmentType || 'Normal',
      SupervisorUserID: d.SupervisorUserID || '',
      Active: true,
      CreatedDate: new Date()
    });
    audit('CREATE', 'Assignment', id, d.UserID);
    return ok({ id: id });
  } catch (e) { return fail(e); }
}

function deleteAssignment(id) {
  try {
    if (!del(CONFIG.SHEETS.ASSIGNMENTS, 'AssignmentID', id)) throw new Error('Assignment not found');
    audit('DELETE', 'Assignment', id, 'Deleted');
    return ok();
  } catch (e) { return fail(e); }
}

// ---------------- NOTICES, MESSAGES & NOTES ----------------
function getNotices() {
  return ok(objects(CONFIG.SHEETS.NOTICES));
}

function addNotice(d, callerId) {
  try {
    var id = uid('NOT');
    append(CONFIG.SHEETS.NOTICES, {
      NoticeID: id,
      Title: trim(d.Title),
      Message: trim(d.Message),
      Priority: d.Priority || 'Normal',
      Audience: d.Audience || 'Everyone',
      AudienceTarget: d.AudienceTarget || '',
      PublishedBy: callerId || 'USR_ADMIN',
      PublishedDate: new Date(),
      ExpiryDate: d.ExpiryDate || '',
      CreatedDate: new Date()
    });
    audit('CREATE', 'Notice', id, d.Title);
    return ok({ id: id });
  } catch (e) { return fail(e); }
}

function deleteNotice(id) {
  try {
    if (!del(CONFIG.SHEETS.NOTICES, 'NoticeID', id)) throw new Error('Notice not found');
    return ok();
  } catch (e) { return fail(e); }
}

function getMessages(userId) {
  var rows = objects(CONFIG.SHEETS.MESSAGES);
  if (userId) {
    rows = rows.filter(function(m) {
      return m.SenderUserID === userId || m.RecipientID === userId || m.RecipientType === 'Everyone';
    });
  }
  return ok(rows);
}

function sendMessage(d, senderId) {
  try {
    var id = uid('MSG');
    append(CONFIG.SHEETS.MESSAGES, {
      MessageID: id,
      SenderUserID: senderId || 'USR_ADMIN',
      RecipientType: d.RecipientType || 'User',
      RecipientID: d.RecipientID || '',
      Subject: trim(d.Subject),
      Body: trim(d.Body),
      Priority: d.Priority || 'Normal',
      IsRead: false,
      ReadDate: '',
      CreatedDate: new Date()
    });
    return ok({ id: id });
  } catch (e) { return fail(e); }
}

function markMessageRead(id) {
  update(CONFIG.SHEETS.MESSAGES, 'MessageID', id, { IsRead: true, ReadDate: new Date() });
  return ok();
}

function getNotes(userWard) {
  var rows = objects(CONFIG.SHEETS.NOTES);
  if (userWard && userWard !== 'All') {
    rows = rows.filter(function(n) { return !n.WardNo || String(n.WardNo) === String(userWard); });
  }
  return ok(rows);
}

function addNote(d, callerId) {
  try {
    var id = uid('NTE');
    append(CONFIG.SHEETS.NOTES, {
      NoteID: id,
      Title: trim(d.Title),
      Content: trim(d.Content),
      Visibility: d.Visibility || 'Team',
      RelatedType: d.RelatedType || 'General',
      RelatedID: d.RelatedID || '',
      WardNo: d.WardNo ? Number(d.WardNo) : '',
      CreatedBy: callerId || 'USR_ADMIN',
      CreatedDate: new Date(),
      UpdatedDate: new Date()
    });
    return ok({ id: id });
  } catch (e) { return fail(e); }
}

function deleteNote(id) {
  if (!del(CONFIG.SHEETS.NOTES, 'NoteID', id)) return fail('Note not found');
  return ok();
}

// ---------------- PUBLIC VOTER UPDATE FORM ----------------
function submitPublicForm(d) {
  try {
    if (!trim(d.FullName) || !trim(d.Phone)) throw new Error('Name and phone are required');
    validateWard(d.WardNo);
    var id = uid('PUB'), now = new Date();
    append(CONFIG.SHEETS.PUBLIC_SUBMISSIONS, {
      SubmissionID: id,
      FullName: trim(d.FullName),
      Phone: trim(d.Phone),
      WardNo: Number(d.WardNo),
      Tole: trim(d.Tole),
      HouseArea: trim(d.HouseArea),
      PollingLocation: trim(d.PollingLocation),
      BoothNo: trim(d.BoothNo),
      VoterSerial: trim(d.VoterSerial),
      Gender: d.Gender || '',
      AgeGroup: d.AgeGroup || '',
      SubmissionType: d.SubmissionType || 'New Information',
      CorrectionDetails: d.CorrectionDetails || '',
      Consent: truthy(d.Consent),
      Status: 'Pending Review',
      ReviewedBy: '',
      ReviewedDate: '',
      ReviewNotes: '',
      CreatedDate: now
    });
    audit('PUBLIC_SUBMIT', 'PublicSubmission', id, d.FullName);
    return ok({ id: id, message: 'Submission received for review' });
  } catch (e) { return fail(e); }
}

function getPublicSubmissions() {
  return ok(objects(CONFIG.SHEETS.PUBLIC_SUBMISSIONS));
}

function reviewSubmission(id, action, notes, reviewerId) {
  try {
    var sub = find(CONFIG.SHEETS.PUBLIC_SUBMISSIONS, 'SubmissionID', id);
    if (!sub) throw new Error('Submission not found');
    var now = new Date();
    if (action === 'Approve New') {
      addVoter({
        Name: sub.FullName,
        Phone: sub.Phone,
        Ward: sub.WardNo,
        Tole: sub.Tole,
        HouseNo: sub.HouseArea,
        BoothNo: sub.BoothNo,
        VoterSerial: sub.VoterSerial,
        Gender: sub.Gender,
        AgeGroup: sub.AgeGroup,
        RecordSource: 'Public Form',
        VerificationStatus: 'Field Checked',
        Notes: 'Approved from public submission ' + id
      }, reviewerId);
      update(CONFIG.SHEETS.PUBLIC_SUBMISSIONS, 'SubmissionID', id, {
        Status: 'Approved New',
        ReviewedBy: reviewerId || 'USR_ADMIN',
        ReviewedDate: now,
        ReviewNotes: notes || ''
      });
    } else if (action === 'Merge') {
      update(CONFIG.SHEETS.PUBLIC_SUBMISSIONS, 'SubmissionID', id, {
        Status: 'Merged',
        ReviewedBy: reviewerId || 'USR_ADMIN',
        ReviewedDate: now,
        ReviewNotes: notes || ''
      });
    } else {
      update(CONFIG.SHEETS.PUBLIC_SUBMISSIONS, 'SubmissionID', id, {
        Status: 'Rejected',
        ReviewedBy: reviewerId || 'USR_ADMIN',
        ReviewedDate: now,
        ReviewNotes: notes || ''
      });
    }
    audit('REVIEW_PUBLIC', 'PublicSubmission', id, action + ': ' + (notes || ''));
    return ok();
  } catch (e) { return fail(e); }
}

// ---------------- ELECTION DAY AGGREGATE ----------------
function getElectionDayData() {
  return ok(objects(CONFIG.SHEETS.ELECTION_DAY));
}

function recordParticipation(d, callerId) {
  try {
    validateWard(d.WardNo);
    var id = uid('EDR'), now = new Date();
    append(CONFIG.SHEETS.ELECTION_DAY, {
      ReportID: id,
      WardNo: Number(d.WardNo),
      PollingLocationID: d.PollingLocationID || '',
      BoothID: d.BoothID || '',
      ReportTime: d.ReportTime || formatDateTime(now),
      TeamStatus: d.TeamStatus || 'All Present',
      OperationalStatus: d.OperationalStatus || 'Normal',
      AggregateParticipation: num(d.AggregateParticipation),
      OpenIssueCount: num(d.OpenIssueCount),
      Notes: d.Notes || '',
      ReportedBy: callerId || 'USR_ADMIN',
      CreatedDate: now
    });
    audit('CREATE', 'ElectionDayReport', id, d.BoothID || '');
    return ok({ id: id });
  } catch (e) { return fail(e); }
}

function updateElectionDayReport(id, d) {
  try {
    var p = {
      WardNo: Number(d.WardNo),
      PollingLocationID: d.PollingLocationID || '',
      BoothID: d.BoothID || '',
      ReportTime: d.ReportTime || formatDateTime(new Date()),
      TeamStatus: d.TeamStatus || '',
      OperationalStatus: d.OperationalStatus || 'Normal',
      AggregateParticipation: num(d.AggregateParticipation),
      OpenIssueCount: num(d.OpenIssueCount),
      Notes: d.Notes || ''
    };
    if (!update(CONFIG.SHEETS.ELECTION_DAY, 'ReportID', id, p)) throw new Error('Report not found');
    audit('UPDATE', 'ElectionDayReport', id, JSON.stringify(p));
    return ok();
  } catch (e) { return fail(e); }
}

function deleteElectionDayReport(id) {
  try {
    if (!del(CONFIG.SHEETS.ELECTION_DAY, 'ReportID', id)) throw new Error('Report not found');
    audit('DELETE', 'ElectionDayReport', id, 'Deleted');
    return ok();
  } catch (e) { return fail(e); }
}

// ---------------- DASHBOARD & REPORT METRICS ----------------
function getDashboardData(userWard) {
  initializeSheets();
  var d = buildReport(userWard);
  var voters = objects(CONFIG.SHEETS.VOTERS);
  var visits = objects(CONFIG.SHEETS.VISITS);
  var issues = objects(CONFIG.SHEETS.ISSUES);
  var users = objects(CONFIG.SHEETS.USERS);
  var ed = objects(CONFIG.SHEETS.ELECTION_DAY);
  var households = objects(CONFIG.SHEETS.HOUSEHOLDS);
  var publicSubs = objects(CONFIG.SHEETS.PUBLIC_SUBMISSIONS);
  var followups = objects(CONFIG.SHEETS.FOLLOWUPS);
  var today = formatDate(new Date());

  if (userWard && userWard !== 'All') {
    voters = voters.filter(function(v) { return String(v.Ward) === String(userWard); });
    households = households.filter(function(h) { return String(h.WardNo) === String(userWard); });
    issues = issues.filter(function(i) { return String(i.WardNo) === String(userWard); });
  }

  return ok({
    voters: {
      total: voters.length,
      contacted: voters.filter(function(v) { return v.ContactStatus === 'Contacted'; }).length,
      notContacted: voters.filter(function(v) { return v.ContactStatus !== 'Contacted'; }).length,
      verified: voters.filter(function(v) { return v.VerificationStatus === 'Verified'; }).length,
      pending: voters.filter(function(v) { return v.VerificationStatus !== 'Verified'; }).length
    },
    households: {
      total: households.length
    },
    visits: {
      total: visits.length,
      today: visits.filter(function(v) { return String(v.Date).slice(0, 10) === today; }).length
    },
    followups: {
      pending: followups.filter(function(x) { return x.Status === 'Pending'; }).length
    },
    issues: {
      open: issues.filter(function(x) { return x.Status !== 'Resolved'; }).length,
      critical: issues.filter(function(x) { return x.Status !== 'Resolved' && x.Priority === 'Critical'; }).length
    },
    volunteers: {
      active: users.filter(function(x) { return truthy(x.Active); }).length,
      total: users.length
    },
    booths: {
      total: objects(CONFIG.SHEETS.BOOTHS).length
    },
    publicPending: publicSubs.filter(function(s) { return s.Status === 'Pending Review'; }).length,
    electionDay: {
      reports: ed.length
    },
    wardRows: d.ward
  });
}

function getReportData(userWard) {
  return ok(buildReport(userWard));
}

function buildReport(userWard) {
  var voters = objects(CONFIG.SHEETS.VOTERS);
  var follow = objects(CONFIG.SHEETS.FOLLOWUPS);
  var booths = objects(CONFIG.SHEETS.BOOTHS);
  var issues = objects(CONFIG.SHEETS.ISSUES);
  var visits = objects(CONFIG.SHEETS.VISITS);
  var users = objects(CONFIG.SHEETS.USERS);
  var e = objects(CONFIG.SHEETS.ELECTION_DAY);
  var ward = [];

  for (var w = 1; w <= 9; w++) {
    if (userWard && userWard !== 'All' && String(w) !== String(userWard)) continue;
    var vs = voters.filter(function(v) { return String(v.Ward) === String(w); });
    var ids = {};
    vs.forEach(function(v) { ids[v.VoterID] = 1; });
    ward.push({
      WardNo: w,
      Records: vs.length,
      Contacted: vs.filter(function(v) { return v.ContactStatus === 'Contacted'; }).length,
      Verified: vs.filter(function(v) { return v.VerificationStatus === 'Verified'; }).length,
      FollowUps: follow.filter(function(f) { return ids[f.VoterID] && f.Status === 'Pending'; }).length,
      Booths: booths.filter(function(b) { return String(b.WardNo) === String(w); }).length,
      OpenIssues: issues.filter(function(i) { return String(i.WardNo) === String(w) && i.Status !== 'Resolved'; }).length
    });
  }

  return {
    ward: ward,
    totals: {
      voters: voters.length,
      visits: visits.length,
      followups: follow.length,
      booths: booths.length,
      users: users.length,
      issues: issues.length,
      electionReports: e.length
    }
  };
}

function getAuditLogs() {
  var r = objects(CONFIG.SHEETS.AUDIT);
  r.reverse();
  return ok(r.slice(0, 500));
}

// ---------------- UTILITIES & HELPERS ----------------
function getSheet(n) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(n); }
function getHeaders(sh) { return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String); }

function objects(n) {
  var sh = getSheet(n);
  if (!sh || sh.getLastRow() < 2) return [];
  var v = sh.getDataRange().getValues(), h = v[0].map(String);
  return v.slice(1).filter(function(r) {
    return r.some(function(c) { return c !== '' && c !== null; });
  }).map(function(r) {
    var o = {};
    h.forEach(function(k, i) { o[k] = serialize(r[i]); });
    return o;
  });
}

function serialize(v) {
  return Object.prototype.toString.call(v) === '[object Date]' ? Utilities.formatDate(v, CONFIG.TZ, "yyyy-MM-dd'T'HH:mm:ss") : v;
}

function append(n, o) {
  var sh = getSheet(n), h = getHeaders(sh);
  sh.appendRow(h.map(function(k) { return o[k] !== undefined ? o[k] : ''; }));
}

function update(n, key, id, p) {
  var sh = getSheet(n), v = sh.getDataRange().getValues(), h = v[0], c = h.indexOf(key);
  for (var r = 1; r < v.length; r++) {
    if (String(v[r][c]) === String(id)) {
      Object.keys(p).forEach(function(k) {
        var j = h.indexOf(k);
        if (j >= 0) sh.getRange(r + 1, j + 1).setValue(p[k]);
      });
      return true;
    }
  }
  return false;
}

function del(n, key, id) {
  var sh = getSheet(n), v = sh.getDataRange().getValues(), h = v[0], c = h.indexOf(key);
  for (var r = 1; r < v.length; r++) {
    if (String(v[r][c]) === String(id)) {
      sh.deleteRow(r + 1);
      return true;
    }
  }
  return false;
}

function find(n, key, id) {
  var a = objects(n);
  for (var i = 0; i < a.length; i++) {
    if (String(a[i][key]) === String(id)) return a[i];
  }
  return null;
}

function lookup(n, key) {
  var m = {};
  objects(n).forEach(function(x) { m[x[key]] = x; });
  return m;
}

function removeRelated(n, key, id, idHeader) {
  objects(n).filter(function(x) { return String(x[key]) === String(id); }).forEach(function(x) {
    del(n, idHeader, x[idHeader]);
  });
}

function uid(p) { return p + '_' + Utilities.getUuid().split('-')[0].toUpperCase(); }
function pad(n, l) { var s = String(n); while (s.length < l) s = '0' + s; return s; }
function trim(v) { return String(v || '').trim(); }
function num(v) { var n = Number(v || 0); return isNaN(n) ? 0 : n; }
function validateWard(v) { var n = Number(v); if (!(n >= 1 && n <= 9)) throw new Error('Ward must be 1 to 9'); return n; }
function allowed(v, a) { return a.indexOf(v) >= 0 ? v : ''; }
function truthy(v) { return v === true || String(v).toLowerCase() === 'true' || String(v) === '1'; }
function formatDate(d) { return Utilities.formatDate(new Date(d), CONFIG.TZ, 'yyyy-MM-dd'); }
function formatDateTime(d) { return Utilities.formatDate(new Date(d), CONFIG.TZ, 'yyyy-MM-dd HH:mm'); }
function dupKey(v) { return [trim(v.Name || v.FullName).toLowerCase(), trim(v.Ward || v.WardNo), trim(v.BoothNo), trim(v.VoterSerial)].join('|'); }

function audit(action, type, id, details) {
  append(CONFIG.SHEETS.AUDIT, {
    AuditID: uid('AUD'),
    UserID: 'USR_ADMIN',
    Action: action,
    EntityType: type,
    EntityID: id,
    Details: details || '',
    CreatedDate: new Date()
  });
}

function ok(data) { return { success: true, data: data || {} }; }
function fail(e) { Logger.log(e); return { success: false, message: e && e.message ? e.message : String(e) }; }
