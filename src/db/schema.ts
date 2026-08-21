import { pgTable, serial, text, timestamp, jsonb, boolean, integer, real, uniqueIndex } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const incidents = pgTable('incidents', {
  id: text('id').primaryKey(),
  idempotencyKey: text('idempotency_key').unique(),
  incidentNumber: text('incident_number').notNull().unique(),
  timestamp: text('timestamp').notNull(),
  locationName: text('location_name').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  severity: text('severity').notNull(),
  status: text('status').notNull().default('RECEIVED'),
  
  incidentCategory: text('incident_category').default('حوادث مركبات'),
  incidentSubtype: text('incident_subtype').default('تصادم'),
  
  vehiclePlate: text('vehicle_plate'),
  driverName: text('driver_name'),
  driverId: text('driver_id'),
  description: text('description').notNull(),
  assignedAgentId: text('assigned_agent_id'),
  assignedAgentName: text('assigned_agent_name'),
  photos: jsonb('photos'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const incidentAssignments = pgTable('incident_assignments', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').notNull().references(() => incidents.id),
  investigatorId: text('investigator_id').notNull().references(() => fieldOfficers.id),
  assignedBy: text('assigned_by'),
  assignedAt: timestamp('assigned_at').defaultNow(),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, REASSIGNED, CLOSED
  unassignedAt: timestamp('unassigned_at'),
  reassignmentReason: text('reassignment_reason'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const incidentEvents = pgTable('incident_events', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').notNull(),
  eventType: text('event_type').notNull(),
  actorUserId: text('actor_user_id'),
  actorRole: text('actor_role').notNull(),
  fromStatus: text('from_status'),
  toStatus: text('to_status'),
  description: text('description'),
  metadata: jsonb('metadata'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const accidents = pgTable('accidents', {
  id: text('id').primaryKey(),
  accidentNumber: text('accident_number').notNull().unique(),
  timestamp: text('timestamp').notNull(),
  locationName: text('location_name').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  severity: text('severity').notNull(),
  status: text('status').notNull(),
  
  // Hierarchical Incident Classification
  incidentCategory: text('incident_category').notNull().default('حوادث مركبات'),
  incidentSubtype: text('incident_subtype').notNull().default('تصادم'),
  
  vehiclePlate: text('vehicle_plate').notNull(),
  driverName: text('driver_name').notNull(),
  driverId: text('driver_id').notNull(),
  description: text('description').notNull(),
  assignedAgentId: text('assigned_agent_id'),
  assignedAgentName: text('assigned_agent_name'),
  photos: jsonb('photos').notNull(),
  policeReportNumber: text('police_report_number'),
  policeStation: text('police_station'),
  insuranceClaimStatus: text('insurance_claim_status').notNull(),
  potentialCause: text('potential_cause'),
  roadType: text('road_type'),
  weather: text('weather'),
  casualtiesCount: integer('casualties_count'),
  fatalitiesCount: integer('fatalities_count'),
  
  // Extended Digital Briefcase Entities
  parties: jsonb('parties'),
  policySnapshot: jsonb('policy_snapshot'),
  financialEstimates: jsonb('financial_estimates'),
  classifiedEvidences: jsonb('classified_evidences'),
  propertyDetails: jsonb('property_details'),
  
  vehiclesInvolved: jsonb('vehicles_involved'),
  personsInvolved: jsonb('persons_involved'),
  aiAnalysis: jsonb('ai_analysis'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vehicles = pgTable('vehicles', {
  id: text('id').primaryKey(),
  plateNumber: text('plate_number').notNull().unique(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  color: text('color').notNull(),
  ownerName: text('owner_name').notNull(),
  insurancePolicy: text('insurance_policy').notNull(),
  status: text('status').notNull(),
  damageZone: text('damage_zone'),
  damageDetails: text('damage_details'),
  estimatedCost: real('estimated_cost'),
});

export const drivers = pgTable('drivers', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  nationalId: text('national_id').notNull(),
  phone: text('phone').notNull(),
  licenseNumber: text('license_number').notNull(),
});

export const agents = pgTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  status: text('status').notNull(),
  currentLocation: text('current_location').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  secretToken: text('secret_token').notNull(),
  isActive: boolean('is_active').notNull(),
});

export const dispatches = pgTable('dispatches', {
  id: text('id').primaryKey(),
  accidentId: text('accident_id').notNull(),
  agentId: text('agent_id').notNull(),
  assignedAt: text('assigned_at').notNull(),
  notes: text('notes').notNull(),
  priority: text('priority').notNull(),
  status: text('status').notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  actionType: text('action_type').notNull(),
  details: text('details').notNull(),
});

export const caseMessages = pgTable('case_messages', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').notNull(),
  sender: text('sender').notNull(),
  senderRole: text('sender_role').notNull(),
  contentType: text('content_type').notNull(), // 'text', 'voice', 'photo', 'document'
  content: text('content').notNull(),
  fileName: text('file_name'),
  mediaDurationSeconds: integer('media_duration_seconds'),
  isDelivered: boolean('is_delivered').notNull().default(true),
  isRead: boolean('is_read').notNull().default(false),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const employees = pgTable('employees', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  employeeCode: text('employee_code').notNull().unique(),
  photo: text('photo'),
  nationalId: text('national_id').notNull(),
  phone: text('phone').notNull(),
  whatsapp: text('whatsapp').notNull(),
  email: text('email').notNull(),
  jobTitle: text('job_title').notNull(),
  licenseNumber: text('license_number'),
  governorate: text('governorate').notNull(),
  serviceArea: text('service_area').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const appUsers = pgTable('app_users', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userRoles = pgTable('user_roles', {
  id: text('id').primaryKey(),
  appUserId: text('app_user_id').notNull(),
  roleName: text('role_name').notNull().default('FIELD_OFFICER'),
  permissions: jsonb('permissions'),
});

export const fieldOfficers = pgTable('field_officers', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull().unique(),
  availabilityStatus: text('availability_status').notNull().default('Available'), // Available, Busy, Offline
  assignedVehicle: text('assigned_vehicle'),
  vehiclePlate: text('vehicle_plate'),
  lastGpsLat: real('last_gps_lat').default(31.9522),
  lastGpsLng: real('last_gps_lng').default(35.2332),
  lastConnectionTime: text('last_connection_time'),
  activeCasesCount: integer('active_cases_count').default(0),
  completedCasesCount: integer('completed_cases_count').default(0),
});

export const caseAccessTokens = pgTable('case_access_tokens', {
  id: serial('id').primaryKey(),
  tokenHash: text('token_hash').notNull().unique(),
  incidentId: text('incident_id').notNull(),
  dispatchId: text('dispatch_id').notNull(),
  fieldOfficerId: text('field_officer_id').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const masterData = pgTable('master_data', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  parentId: text('parent_id'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  companyId: text('company_id'),
  branchId: text('branch_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const investigationSessions = pgTable('investigation_sessions', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull(),
  incidentId: text('incident_id').references(() => incidents.id),
  assignmentId: text('assignment_id').notNull(),
  investigatorId: text('investigator_id').notNull(),
  investigatorName: text('investigator_name').notNull(),
  currentStep: integer('current_step').notNull().default(1),
  completedSteps: jsonb('completed_steps').notNull(),
  status: text('status').notNull().default('IN_PROGRESS'),
  syncStatus: text('sync_status').notNull().default('SYNCED'),
  arrivalData: jsonb('arrival_data'),
  basicInfo: jsonb('basic_info'),
  parties: jsonb('parties'),
  mediaChecklist: jsonb('media_checklist'),
  diagramData: jsonb('diagram_data'),
  statements: jsonb('statements'),
  damageAssessment: jsonb('damage_assessment'),
  finalReport: jsonb('final_report'),
  lastSavedAt: text('last_saved_at').notNull(),
  approvedByUserId: text('approved_by_user_id'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const investigationAuditLogs = pgTable('investigation_audit_logs', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').notNull().references(() => incidents.id),
  assignmentId: text('assignment_id'),
  investigatorId: text('investigator_id').notNull(),
  investigatorName: text('investigator_name').notNull(),
  action: text('action').notNull(),
  details: jsonb('details'),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vehicleQrCodes = pgTable('vehicle_qr_codes', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull(),
  vehiclePlate: text('vehicle_plate').notNull(),
  vehicleModel: text('vehicle_model'),
  policyId: text('policy_id').notNull(),
  policyNumber: text('policy_number'),
  policyExpiresAt: text('policy_expires_at'),
  customerId: text('customer_id'),
  customerName: text('customer_name'),
  insuranceCompanyId: text('insurance_company_id'),
  insuranceCompanyName: text('insurance_company_name'),
  tokenHash: text('token_hash').notNull().unique(),
  tokenReference: text('token_reference').notNull(),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, SUSPENDED, EXPIRED, REVOKED, REPLACED
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').notNull(),
  activatedAt: text('activated_at'),
  expiresAt: text('expires_at'),
  revokedAt: text('revoked_at'),
  replacedById: text('replaced_by_id'),
  lastScannedAt: text('last_scanned_at'),
  scanCount: integer('scan_count').notNull().default(0),
});

export const incidentQrCodes = pgTable('incident_qr_codes', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull(),
  assignmentId: text('assignment_id'),
  tokenHash: text('token_hash').notNull().unique(),
  tokenReference: text('token_reference').notNull(),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, READ_ONLY, EXPIRED, REVOKED
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at'),
  revokedAt: text('revoked_at'),
  lastScannedAt: text('last_scanned_at'),
  scanCount: integer('scan_count').notNull().default(0),
});

export const qrScanLogs = pgTable('qr_scan_logs', {
  id: text('id').primaryKey(),
  qrType: text('qr_type').notNull(), // VEHICLE or INCIDENT
  qrId: text('qr_id').notNull(),
  scannedBy: text('scanned_by').notNull(),
  investigatorId: text('investigator_id'),
  caseId: text('case_id'),
  deviceId: text('device_id'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  scannedAt: text('scanned_at').notNull(),
  result: text('result').notNull(), // SUCCESS, EXPIRED, REVOKED, INVALID, POLICY_SUSPENDED
  ipAddress: text('ip_address'),
});

export const policyholders = pgTable('policyholders', {
  id: text('id').primaryKey(),
  customerNumber: text('customer_number'),
  fullName: text('full_name'),
  nationalId: text('national_id'),
  companyRegistrationNumber: text('company_registration_number'),
  customerType: text('customer_type'), // INDIVIDUAL, COMPANY
  mobile: text('mobile'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  city: text('city'),
  governorate: text('governorate'),
  status: text('status'),
  sourceSystem: text('source_system'),
  legacyCustomerId: text('legacy_customer_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insuredAssets = pgTable('insured_assets', {
  id: text('id').primaryKey(),
  policyholderId: text('policyholder_id').notNull().references(() => policyholders.id),
  assetType: text('asset_type').notNull(), // VEHICLE, PROPERTY, HOME, COMMERCIAL_PROPERTY, EQUIPMENT, MACHINERY, OTHER
  assetReference: text('asset_reference'),
  description: text('description'),
  status: text('status'),
  sourceSystem: text('source_system'),
  legacyAssetId: text('legacy_asset_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insuredVehicles = pgTable('insured_vehicles', {
  id: text('id').primaryKey(),
  insuredAssetId: text('insured_asset_id').notNull().references(() => insuredAssets.id),
  plateNumber: text('plate_number').notNull(),
  plateCountry: text('plate_country'),
  chassisNumber: text('chassis_number'),
  make: text('make'),
  model: text('model'),
  modelYear: integer('model_year'),
  color: text('color'),
  vehicleType: text('vehicle_type'),
  registrationNumber: text('registration_number'),
  usageType: text('usage_type'),
});

export const insurancePolicies = pgTable('insurance_policies', {
  id: text('id').primaryKey(),
  policyNumber: text('policy_number').notNull(),
  policyholderId: text('policyholder_id').notNull().references(() => policyholders.id),
  insuredAssetId: text('insured_asset_id').references(() => insuredAssets.id),
  policyType: text('policy_type'),
  coverageType: text('coverage_type'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  issueDate: text('issue_date'),
  status: text('status'), // DRAFT, ACTIVE, EXPIRED, CANCELLED, SUSPENDED
  premiumAmount: real('premium_amount'),
  currency: text('currency'),
  branchId: text('branch_id'),
  agentId: text('agent_id'),
  sourceSystem: text('source_system'),
  legacyPolicyId: text('legacy_policy_id'),
  renewedFromPolicyId: text('renewed_from_policy_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const importBatches = pgTable('import_batches', {
  id: text('id').primaryKey(),
  fileName: text('file_name').notNull(),
  importType: text('import_type').notNull(), // policyholders, policies, assets_vehicles
  sourceSystem: text('source_system'),
  uploadedBy: text('uploaded_by'),
  totalRows: integer('total_rows').default(0),
  validRows: integer('valid_rows').default(0),
  importedRows: integer('imported_rows').default(0),
  updatedRows: integer('updated_rows').default(0),
  duplicateRows: integer('duplicate_rows').default(0),
  failedRows: integer('failed_rows').default(0),
  status: text('status'), // PENDING, COMPLETED, FAILED
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const importErrors = pgTable('import_errors', {
  id: text('id').primaryKey(),
  batchId: text('batch_id').notNull().references(() => importBatches.id),
  rowNumber: integer('row_number').notNull(),
  fieldName: text('field_name'),
  originalValue: text('original_value'),
  errorCode: text('error_code'),
  errorMessage: text('error_message'),
});

export const policyholderPortalAccounts = pgTable('policyholder_portal_accounts', {
  id: text('id').primaryKey(),
  policyholderId: text('policyholder_id').notNull().unique().references(() => policyholders.id),
  status: text('status').notNull().default('NOT_INVITED'), // NOT_INVITED, INVITED, ACTIVE, SUSPENDED, LOCKED
  pinHash: text('pin_hash'), // password or pin hash
  passwordHash: text('password_hash'),
  activatedAt: timestamp('activated_at'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const policyholderPortalInvites = pgTable('policyholder_portal_invites', {
  id: text('id').primaryKey(),
  policyholderId: text('policyholder_id').notNull().references(() => policyholders.id),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  revokedAt: timestamp('revoked_at'),
  createdBy: text('created_by'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const policyholderSessions = pgTable('policyholder_sessions', {
  id: text('id').primaryKey(),
  portalAccountId: text('portal_account_id').notNull().references(() => policyholderPortalAccounts.id),
  sessionTokenHash: text('session_token_hash').notNull().unique(),
  deviceId: text('device_id'),
  createdAt: timestamp('created_at').defaultNow(),
  lastSeenAt: timestamp('last_seen_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
});

export const insuranceAuditLogs = pgTable('insurance_audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  timestamp: timestamp('timestamp').defaultNow(),
});




