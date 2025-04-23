export interface User {
  id: string
  email: string
  name: string | null
  role: string | null
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  name: string
  email: string | null
  phone: string | null
  birth_date: string | null
  gender: string | null
  address: string | null
  medical_history: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  date: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  patient?: Patient
}

export interface Assessment {
  id: string
  patient_id: string
  title: string
  date: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  patient?: Patient
}

export interface AssessmentModel {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface AssessmentSection {
  id: string
  model_id: string
  title: string
  description: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface AssessmentField {
  id: string
  section_id: string
  label: string
  type: string
  required: boolean
  options: any | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface AssessmentResult {
  id: string
  assessment_id: string
  field_id: string
  value: string | null
  created_at: string
  updated_at: string
  field?: AssessmentField
}

export interface Report {
  id: string
  patient_id: string
  title: string
  content: string | null
  created_at: string
  updated_at: string
  patient?: Patient
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string | null
  related_entity_type: string | null
  related_entity_id: string | null
  scheduled_for: string | null
  read: boolean
  created_at: string
}

export interface Setting {
  id: string
  key: string
  value: any | null
  description: string |\
