CREATE TABLE "accidents" (
	"id" text PRIMARY KEY NOT NULL,
	"accident_number" text NOT NULL,
	"timestamp" text NOT NULL,
	"location_name" text NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"severity" text NOT NULL,
	"status" text NOT NULL,
	"incident_category" text DEFAULT 'حوادث مركبات' NOT NULL,
	"incident_subtype" text DEFAULT 'تصادم' NOT NULL,
	"vehicle_plate" text NOT NULL,
	"driver_name" text NOT NULL,
	"driver_id" text NOT NULL,
	"description" text NOT NULL,
	"assigned_agent_id" text,
	"assigned_agent_name" text,
	"photos" jsonb NOT NULL,
	"police_report_number" text,
	"police_station" text,
	"insurance_claim_status" text NOT NULL,
	"potential_cause" text,
	"road_type" text,
	"weather" text,
	"casualties_count" integer,
	"fatalities_count" integer,
	"parties" jsonb,
	"policy_snapshot" jsonb,
	"financial_estimates" jsonb,
	"classified_evidences" jsonb,
	"property_details" jsonb,
	"vehicles_involved" jsonb,
	"persons_involved" jsonb,
	"ai_analysis" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "accidents_accident_number_unique" UNIQUE("accident_number")
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"status" text NOT NULL,
	"current_location" text NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"secret_token" text NOT NULL,
	"is_active" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_users" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "app_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" text NOT NULL,
	"actor_name" text NOT NULL,
	"actor_role" text NOT NULL,
	"action_type" text NOT NULL,
	"details" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_access_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"incident_id" text NOT NULL,
	"dispatch_id" text NOT NULL,
	"field_officer_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "case_access_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "case_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"sender" text NOT NULL,
	"sender_role" text NOT NULL,
	"content_type" text NOT NULL,
	"content" text NOT NULL,
	"file_name" text,
	"media_duration_seconds" integer,
	"is_delivered" boolean DEFAULT true NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"timestamp" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dispatches" (
	"id" text PRIMARY KEY NOT NULL,
	"accident_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"assigned_at" text NOT NULL,
	"notes" text NOT NULL,
	"priority" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"national_id" text NOT NULL,
	"phone" text NOT NULL,
	"license_number" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"employee_code" text NOT NULL,
	"photo" text,
	"national_id" text NOT NULL,
	"phone" text NOT NULL,
	"whatsapp" text NOT NULL,
	"email" text NOT NULL,
	"job_title" text NOT NULL,
	"license_number" text,
	"governorate" text NOT NULL,
	"service_area" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "employees_employee_code_unique" UNIQUE("employee_code")
);
--> statement-breakpoint
CREATE TABLE "field_officers" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"availability_status" text DEFAULT 'Available' NOT NULL,
	"assigned_vehicle" text,
	"vehicle_plate" text,
	"last_gps_lat" real DEFAULT 31.9522,
	"last_gps_lng" real DEFAULT 35.2332,
	"last_connection_time" text,
	"active_cases_count" integer DEFAULT 0,
	"completed_cases_count" integer DEFAULT 0,
	CONSTRAINT "field_officers_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "import_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"import_type" text NOT NULL,
	"source_system" text,
	"uploaded_by" text,
	"total_rows" integer DEFAULT 0,
	"valid_rows" integer DEFAULT 0,
	"imported_rows" integer DEFAULT 0,
	"updated_rows" integer DEFAULT 0,
	"duplicate_rows" integer DEFAULT 0,
	"failed_rows" integer DEFAULT 0,
	"status" text,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "import_errors" (
	"id" text PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"row_number" integer NOT NULL,
	"field_name" text,
	"original_value" text,
	"error_code" text,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "incident_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"investigator_id" text NOT NULL,
	"assigned_by" text,
	"assigned_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"unassigned_at" timestamp,
	"reassignment_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "incident_events" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"event_type" text NOT NULL,
	"actor_user_id" text,
	"actor_role" text NOT NULL,
	"from_status" text,
	"to_status" text,
	"description" text,
	"metadata" jsonb,
	"latitude" real,
	"longitude" real,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "incident_qr_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"assignment_id" text,
	"token_hash" text NOT NULL,
	"token_reference" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL,
	"expires_at" text,
	"revoked_at" text,
	"last_scanned_at" text,
	"scan_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "incident_qr_codes_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" text PRIMARY KEY NOT NULL,
	"idempotency_key" text,
	"incident_number" text NOT NULL,
	"timestamp" text NOT NULL,
	"location_name" text NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"severity" text NOT NULL,
	"status" text DEFAULT 'RECEIVED' NOT NULL,
	"incident_category" text DEFAULT 'حوادث مركبات',
	"incident_subtype" text DEFAULT 'تصادم',
	"vehicle_plate" text,
	"driver_name" text,
	"driver_id" text,
	"description" text NOT NULL,
	"assigned_agent_id" text,
	"assigned_agent_name" text,
	"photos" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "incidents_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "incidents_incident_number_unique" UNIQUE("incident_number")
);
--> statement-breakpoint
CREATE TABLE "insurance_audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "insurance_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"policy_number" text NOT NULL,
	"policyholder_id" text NOT NULL,
	"insured_asset_id" text,
	"policy_type" text,
	"coverage_type" text,
	"start_date" text,
	"end_date" text,
	"issue_date" text,
	"status" text,
	"premium_amount" real,
	"currency" text,
	"branch_id" text,
	"agent_id" text,
	"source_system" text,
	"legacy_policy_id" text,
	"renewed_from_policy_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "insured_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"policyholder_id" text NOT NULL,
	"asset_type" text NOT NULL,
	"asset_reference" text,
	"description" text,
	"status" text,
	"source_system" text,
	"legacy_asset_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "insured_vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"insured_asset_id" text NOT NULL,
	"plate_number" text NOT NULL,
	"plate_country" text,
	"chassis_number" text,
	"make" text,
	"model" text,
	"model_year" integer,
	"color" text,
	"vehicle_type" text,
	"registration_number" text,
	"usage_type" text
);
--> statement-breakpoint
CREATE TABLE "investigation_audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"assignment_id" text,
	"investigator_id" text NOT NULL,
	"investigator_name" text NOT NULL,
	"action" text NOT NULL,
	"details" jsonb,
	"timestamp" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investigation_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"incident_id" text,
	"assignment_id" text NOT NULL,
	"investigator_id" text NOT NULL,
	"investigator_name" text NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"completed_steps" jsonb NOT NULL,
	"status" text DEFAULT 'IN_PROGRESS' NOT NULL,
	"sync_status" text DEFAULT 'SYNCED' NOT NULL,
	"arrival_data" jsonb,
	"basic_info" jsonb,
	"parties" jsonb,
	"media_checklist" jsonb,
	"diagram_data" jsonb,
	"statements" jsonb,
	"damage_assessment" jsonb,
	"final_report" jsonb,
	"last_saved_at" text NOT NULL,
	"approved_by_user_id" text,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "master_data" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"parent_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"company_id" text,
	"branch_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "policyholder_portal_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"policyholder_id" text NOT NULL,
	"status" text DEFAULT 'NOT_INVITED' NOT NULL,
	"pin_hash" text,
	"password_hash" text,
	"activated_at" timestamp,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "policyholder_portal_accounts_policyholder_id_unique" UNIQUE("policyholder_id")
);
--> statement-breakpoint
CREATE TABLE "policyholder_portal_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"policyholder_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"revoked_at" timestamp,
	"created_by" text,
	"status" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "policyholder_portal_invites_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "policyholder_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"portal_account_id" text NOT NULL,
	"session_token_hash" text NOT NULL,
	"device_id" text,
	"created_at" timestamp DEFAULT now(),
	"last_seen_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "policyholder_sessions_session_token_hash_unique" UNIQUE("session_token_hash")
);
--> statement-breakpoint
CREATE TABLE "policyholders" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_number" text,
	"full_name" text,
	"national_id" text,
	"company_registration_number" text,
	"customer_type" text,
	"mobile" text,
	"phone" text,
	"email" text,
	"address" text,
	"city" text,
	"governorate" text,
	"status" text,
	"source_system" text,
	"legacy_customer_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "qr_scan_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"qr_type" text NOT NULL,
	"qr_id" text NOT NULL,
	"scanned_by" text NOT NULL,
	"investigator_id" text,
	"case_id" text,
	"device_id" text,
	"latitude" real,
	"longitude" real,
	"scanned_at" text NOT NULL,
	"result" text NOT NULL,
	"ip_address" text
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"app_user_id" text NOT NULL,
	"role_name" text DEFAULT 'FIELD_OFFICER' NOT NULL,
	"permissions" jsonb
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "vehicle_qr_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"vehicle_plate" text NOT NULL,
	"vehicle_model" text,
	"policy_id" text NOT NULL,
	"policy_number" text,
	"policy_expires_at" text,
	"customer_id" text,
	"customer_name" text,
	"insurance_company_id" text,
	"insurance_company_name" text,
	"token_hash" text NOT NULL,
	"token_reference" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL,
	"activated_at" text,
	"expires_at" text,
	"revoked_at" text,
	"replaced_by_id" text,
	"last_scanned_at" text,
	"scan_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "vehicle_qr_codes_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"plate_number" text NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"color" text NOT NULL,
	"owner_name" text NOT NULL,
	"insurance_policy" text NOT NULL,
	"status" text NOT NULL,
	"damage_zone" text,
	"damage_details" text,
	"estimated_cost" real,
	CONSTRAINT "vehicles_plate_number_unique" UNIQUE("plate_number")
);
--> statement-breakpoint
ALTER TABLE "import_errors" ADD CONSTRAINT "import_errors_batch_id_import_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."import_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_assignments" ADD CONSTRAINT "incident_assignments_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_assignments" ADD CONSTRAINT "incident_assignments_investigator_id_field_officers_id_fk" FOREIGN KEY ("investigator_id") REFERENCES "public"."field_officers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_policyholder_id_policyholders_id_fk" FOREIGN KEY ("policyholder_id") REFERENCES "public"."policyholders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_insured_asset_id_insured_assets_id_fk" FOREIGN KEY ("insured_asset_id") REFERENCES "public"."insured_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insured_assets" ADD CONSTRAINT "insured_assets_policyholder_id_policyholders_id_fk" FOREIGN KEY ("policyholder_id") REFERENCES "public"."policyholders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insured_vehicles" ADD CONSTRAINT "insured_vehicles_insured_asset_id_insured_assets_id_fk" FOREIGN KEY ("insured_asset_id") REFERENCES "public"."insured_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigation_audit_logs" ADD CONSTRAINT "investigation_audit_logs_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigation_sessions" ADD CONSTRAINT "investigation_sessions_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policyholder_portal_accounts" ADD CONSTRAINT "policyholder_portal_accounts_policyholder_id_policyholders_id_fk" FOREIGN KEY ("policyholder_id") REFERENCES "public"."policyholders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policyholder_portal_invites" ADD CONSTRAINT "policyholder_portal_invites_policyholder_id_policyholders_id_fk" FOREIGN KEY ("policyholder_id") REFERENCES "public"."policyholders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policyholder_sessions" ADD CONSTRAINT "policyholder_sessions_portal_account_id_policyholder_portal_accounts_id_fk" FOREIGN KEY ("portal_account_id") REFERENCES "public"."policyholder_portal_accounts"("id") ON DELETE no action ON UPDATE no action;