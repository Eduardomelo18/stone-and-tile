export type PaymentStatus = 'unpaid' | 'partial' | 'paid'
export type JobStatus = 'booked' | 'in_progress' | 'completed' | 'cancelled'
export type ExpenseFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'cheque'

export interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  suburb: string | null
  notes: string | null
  created_at: string
}

export interface Staff {
  id: string
  name: string
  role: string | null
  hourly_rate: number
  phone: string | null
  email: string | null
}

export interface Job {
  id: string
  client_id: string | null
  date: string
  start_time: string | null
  end_time: string | null
  address: string | null
  suburb: string | null
  service_type: string | null
  description: string | null
  quote_amount: number
  invoice_amount: number
  payment_received: number
  payment_status: PaymentStatus
  status: JobStatus
  notes: string | null
  created_at: string
  client?: Client
}

export interface JobLabour {
  id: string
  job_id: string
  person_name: string
  hours: number
  hourly_rate: number
  total_cost: number
}

export interface JobMaterial {
  id: string
  job_id: string
  item_name: string
  quantity: number
  unit: string | null
  unit_cost: number
  total_cost: number
}

export interface JobSealer {
  id: string
  job_id: string
  item_name: string
  quantity: number
  unit: string | null
  unit_cost: number
  total_cost: number
}

export interface JobTravel {
  id: string
  job_id: string
  fuel_cost: number
  tolls: number
  parking: number
  total_cost: number
}

export interface JobEquipment {
  id: string
  job_id: string
  equipment_name: string
  usage_cost: number
  hire_cost: number
  wear_and_tear_cost: number
  total_cost: number
}

export interface JobOtherCost {
  id: string
  job_id: string
  category: string
  description: string | null
  amount: number
}

export interface JobCosts {
  labour: JobLabour[]
  materials: JobMaterial[]
  sealers: JobSealer[]
  travel: JobTravel[]
  equipment: JobEquipment[]
  other: JobOtherCost[]
}

export interface CompanyExpense {
  id: string
  category: string
  description: string | null
  amount: number
  frequency: ExpenseFrequency
  expense_date: string | null
  notes: string | null
}

export interface Payment {
  id: string
  job_id: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  notes: string | null
}

export interface JobWithCosts extends Job {
  costs: JobCosts
  total_labour_cost: number
  total_materials_cost: number
  total_sealer_cost: number
  total_travel_cost: number
  total_equipment_cost: number
  total_other_cost: number
  total_direct_cost: number
  gross_profit: number
  gross_margin_pct: number
}

export interface DashboardStats {
  total_revenue: number
  total_direct_costs: number
  gross_profit: number
  monthly_overhead: number
  yearly_overhead: number
  net_profit: number
  jobs_booked: number
  jobs_completed: number
  jobs_unpaid: number
  profit_this_week: number
  profit_this_month: number
}
