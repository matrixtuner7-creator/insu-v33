export const INCIDENT_TAXONOMY = {
  'حوادث مركبات': [
    'تصادم',
    'انقلاب',
    'دهس',
    'حريق مركبة',
    'سرقة مركبة'
  ],
  'سرقة وسطو': [
    'سطو مسكن',
    'سرقة محل تجاري',
    'سرقة مركبة',
    'نشل'
  ],
  'حريق': [
    'حريق سكني',
    'حريق تجاري',
    'حريق صناعي'
  ],
  'كوارث طبيعية': [
    'سيول',
    'زلزال',
    'عواصف',
    'انهيار أرضي'
  ],
  'أضرار ممتلكات': [
    'تسرب مياه',
    'أضرار كهربائية',
    'انهيار جزئي لمبنى'
  ],
  'مسؤولية مدنية': [
    'إصابة طرف ثالث',
    'ضرر بممتلكات الغير'
  ],
  'صحي/حياة': [
    'عجز مؤقت',
    'وفاة مؤمَّن عليها'
  ]
} as const;

export type IncidentCategory = keyof typeof INCIDENT_TAXONOMY;
export type IncidentSubtype = typeof INCIDENT_TAXONOMY[IncidentCategory][number] | string;

// الهيكل الجغرافي الفلسطيني ونوع التجمع السكاني
export type PalestineRegion = 'الضفة الغربية' | 'قطاع غزة';

export const PALESTINE_GOVERNORATES = {
  'الضفة الغربية': [
    'جنين',
    'طوباس',
    'طولكرم',
    'نابلس',
    'قلقيلية',
    'سلفيت',
    'رام الله والبيرة',
    'أريحا والأغوار',
    'القدس',
    'بيت لحم',
    'الخليل'
  ],
  'قطاع غزة': [
    'شمال غزة',
    'غزة',
    'دير البلح',
    'خان يونس',
    'رفح'
  ]
} as const;

export type WestBankGovernorate = typeof PALESTINE_GOVERNORATES['الضفة الغربية'][number];
export type GazaGovernorate = typeof PALESTINE_GOVERNORATES['قطاع غزة'][number];
export type PalestineGovernorate = WestBankGovernorate | GazaGovernorate;

export type PalestineLocalityType = 'مدينة' | 'بلدة' | 'قرية' | 'مخيم لاجئين';

export interface IncidentLocation {
  region: PalestineRegion;
  governorate: PalestineGovernorate;
  localityType: PalestineLocalityType;
  city: string; // e.g. نابلس، رام الله، مخيم بلاطة، جباليا
  neighborhood?: string; // e.g. رفيديا، المخفية، الماصيون، الرمال
  street?: string;
  buildingNumber?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
}

// سجل الحركات والتدقيق الشامل للقضية (Case Movement & Audit Trail)
export type MovementType =
  // حركات تخص البلاغ والتنسيب
  | 'case_created'
  | 'case_assigned'
  | 'case_reassigned'
  | 'permit_issued'
  | 'permit_rejected'
  | 'status_changed'
  | 'case_closed'
  | 'case_reopened'
  // حركات تخص جمع الأدلة
  | 'document_uploaded'
  | 'document_deleted'
  | 'photo_captured'
  | 'witness_statement_added'
  | 'note_added'
  // حركات تخص الاتصال والمتابعة
  | 'call_logged'
  | 'reminder_set'
  // حركات نظامية وأمنية
  | 'login'
  | 'logout'
  | 'permission_changed'
  | 'export_generated';

export type ActorRole = 'investigator' | 'admin' | 'call_center' | 'system';
export type DeviceInfo = 'mobile-ios' | 'mobile-android' | 'web-admin' | 'web-callcenter';

export interface CaseMovement {
  id: string; // e.g. MV-000123
  case_id: string; // e.g. CLM-2026-000145
  type: MovementType;
  actor_id: string; // e.g. USR-004, ag-2
  actor_name: string; // Immutable historical snapshot at time of event
  actor_role: ActorRole;
  from_value?: string; // Value before change
  to_value?: string; // Value after change
  note?: string; // Free text note e.g. "تنسيب بسبب قرب المنطقة"
  attachment_ref?: string; // Reference to uploaded document or photo
  location_lat?: number; // Mandatory for photo_captured or field investigations
  location_lng?: number;
  device_info: DeviceInfo;
  created_at: string; // UTC ISO string
}

export interface IncidentParty {
  id: string;
  partyRole: 'مؤمَّن له' | 'طرف ثالث' | 'شاهد' | 'سائق';
  fullName: string;
  nationalId: string;
  phone: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  injuryStatus: 'لا إصابة' | 'إصابة طفيفة' | 'إصابة بالغة' | 'وفاة';
  statementTaken: boolean;
  statementSummary?: string;
}

export interface PolicySnapshot {
  policyNumber: string;
  policyType: 'شامل' | 'ضد الغير' | 'حريق وسرقة' | 'ممتلكات شاملة' | 'مسؤولية مدنية' | 'صحي وحياة' | 'هندسي وبناء';
  coverageLimit: number; // حد التغطية بالريال
  deductible: number; // مبلغ التحمل
  policyStatusAtIncident: 'سارية ومطابقة' | 'منتهية الصلاحية' | 'معلقة لعدم السداد' | 'خارج نطاق التغطية';
  effectiveDate?: string;
  expiryDate?: string;
}

export interface FinancialEstimates {
  estimatedLossAmount: number; // تقدير أولي من المحقق
  finalApprovedAmount: number; // المبلغ المعتمد نهائيًا
  currency: 'SAR' | 'ر.س';
  fraudRiskFlag: 'لا يوجد اشتباه' | 'اشتباه منخفض' | 'قيد المراجعة والتدقيق الجنائي' | 'مؤشر احتيال مرتفع' | 'مؤكد احتيال';
  fraudNotes?: string;
}

export interface ClassifiedEvidence {
  id: string;
  evidenceType: 'صورة فوتوغرافية' | 'فيديو ميداني' | 'محضر شرطة' | 'إفادة شاهد' | 'تقرير فني' | 'مستند رسمي';
  fileRef: string;
  fileHash: string; // بصمة رقمية SHA-256 لمنع التلاعب
  capturedAt: string;
  capturedLocation: string;
  description?: string;
  verified?: boolean;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  color: string;
  ownerName: string;
  insurancePolicy: string;
  status: 'نشطة' | 'في ورشة الصيانة' | 'متضررة بحادث';
  damageZone?: string;
  damageDetails?: string;
  estimatedCost?: number;
}

export interface Driver {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string;
  licenseNumber: string;
}

export interface InvolvedPerson {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string;
  role: 'سائق' | 'راكب' | 'مصاب' | 'شاهد';
  injurySeverity: 'سليم' | 'إصابات طفيفة' | 'متوسطة' | 'حرجة' | 'متوفي';
}

export interface FieldAgent {
  id: string;
  name: string;
  phone: string;
  status: 'متاح' | 'في مهمة' | 'غير متصل';
  currentLocation: string;
  lat: number;
  lng: number;
  secretToken: string; // e.g., AHMD2025
  isActive: boolean;
  badgeNumber?: string;
  photo?: string;
}

export interface Accident {
  id: string;
  accidentNumber: string;
  incidentNumber?: string;
  timestamp: string;
  locationName: string;
  lat: number;
  lng: number;
  severity: 'خفيف' | 'متوسط' | 'بليغ' | 'حرج';
  status: 'جديد' | 'مُوَجَّه' | 'قيد التحقيق' | 'مكتمل' | 'مغلق';
  
  // الهيكل الهرمي لنوع الحادث
  incidentCategory: IncidentCategory;
  incidentSubtype: string;
  
  vehiclePlate: string;
  driverName: string;
  driverId: string;
  description: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  photos: string[]; // up to 12 images
  policeReportNumber?: string;
  policeStation?: string;
  insuranceClaimStatus: 'معلق' | 'مرفق المستندات' | 'قيد التسوية' | 'معتمد' | 'مرفوض';
  potentialCause?: string;
  roadType?: string;
  weather?: string;
  casualtiesCount?: number;
  fatalitiesCount?: number;
  
  // الكيانات الجديدة الموسعة للحقيبة الرقمية
  locationDetails?: IncidentLocation;
  parties?: IncidentParty[];
  policySnapshot?: PolicySnapshot;
  financialEstimates?: FinancialEstimates;
  classifiedEvidences?: ClassifiedEvidence[];
  movements?: CaseMovement[];
  messages?: CaseMessage[];
  missionStage?: MissionLifecycleStage;
  
  propertyDetails?: {
    propertyType?: string;
    affectedUnitsCount?: number;
    damageDescription?: string;
  };
  
  vehiclesInvolved?: Vehicle[];
  personsInvolved?: InvolvedPerson[];
  aiAnalysis?: {
    liabilityScore: string;
    damageEstimate: string;
    recommendedAction: string;
    summary: string;
  };
}

export type MissionLifecycleStage =
  | 'تم استلام القضية'
  | 'في الطريق'
  | 'وصل إلى الموقع'
  | 'بدأ التحقيق'
  | 'أنهى المعاينة'
  | 'غادر الموقع'
  | 'عاد إلى المكتب';

export type MessageContentType = 'text' | 'voice' | 'image' | 'video' | 'document';

export interface CaseMessage {
  id: string;
  caseId: string;
  senderId: string;
  senderName: string;
  senderRole: ActorRole | 'supervisor' | 'expert';
  recipientTarget: 'hq' | 'supervisor' | 'group' | 'all';
  contentType: MessageContentType;
  content: string; // text body or URL for media/voice/pdf
  mediaDurationSeconds?: number; // for voice notes
  fileName?: string; // for documents/PDF
  sentAt: string;
  deliveredAt?: string;
  replyToMessageId?: string;
  isTask?: boolean;
  isImportantInfo?: boolean;
  taskStatus?: 'pending' | 'completed';
}

export interface EmergencySOS {
  id: string;
  caseId?: string;
  agentId: string;
  agentName: string;
  lat: number;
  lng: number;
  locationName: string;
  timestamp: string;
  audioNoteRef?: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface Dispatch {
  id: string;
  accidentId: string;
  agentId: string;
  assignedAt: string;
  notes: string;
  priority: 'عادية' | 'عاجلة';
  status: 'قيد التوجيه' | 'قبول' | 'انطلاق' | 'وصل للموقع' | 'أتم التقارير' | 'ملغى';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string; // HQ or Agent Name
  actorRole: 'الإدارة المركزية (HQ)' | 'الوكيل الميداني' | 'النظام';
  action: string;
  details: string;
}

export type AuditLog = AuditLogEntry;
