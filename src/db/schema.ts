import { pgTable, serial, text, timestamp, jsonb, boolean, integer, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const incidents = pgTable('incidents', {
  id: text('id').primaryKey(),
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
  photo: text('photo'),
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

