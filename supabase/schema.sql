-- Stone & Tile Care - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CLIENTS
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  email text,
  address text,
  suburb text,
  notes text,
  created_at timestamptz default now()
);

-- STAFF
create table if not exists staff (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text,
  hourly_rate numeric(10,2) not null default 0,
  phone text,
  email text
);

-- JOBS
create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete set null,
  date date not null,
  start_time time,
  end_time time,
  address text,
  suburb text,
  service_type text,
  description text,
  quote_amount numeric(10,2) not null default 0,
  invoice_amount numeric(10,2) not null default 0,
  payment_received numeric(10,2) not null default 0,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','partial','paid')),
  status text not null default 'booked' check (status in ('booked','in_progress','completed','cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- JOB LABOUR
create table if not exists job_labour (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  person_name text not null,
  hours numeric(6,2) not null default 0,
  hourly_rate numeric(10,2) not null default 0,
  total_cost numeric(10,2) generated always as (hours * hourly_rate) stored
);

-- JOB MATERIALS
create table if not exists job_materials (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  item_name text not null,
  quantity numeric(10,3) not null default 0,
  unit text,
  unit_cost numeric(10,2) not null default 0,
  total_cost numeric(10,2) generated always as (quantity * unit_cost) stored
);

-- JOB SEALERS
create table if not exists job_sealers (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  item_name text not null,
  quantity numeric(10,3) not null default 0,
  unit text,
  unit_cost numeric(10,2) not null default 0,
  total_cost numeric(10,2) generated always as (quantity * unit_cost) stored
);

-- JOB TRAVEL
create table if not exists job_travel (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  fuel_cost numeric(10,2) not null default 0,
  tolls numeric(10,2) not null default 0,
  parking numeric(10,2) not null default 0,
  total_cost numeric(10,2) generated always as (fuel_cost + tolls + parking) stored
);

-- JOB EQUIPMENT
create table if not exists job_equipment (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  equipment_name text not null,
  usage_cost numeric(10,2) not null default 0,
  hire_cost numeric(10,2) not null default 0,
  wear_and_tear_cost numeric(10,2) not null default 0,
  total_cost numeric(10,2) generated always as (usage_cost + hire_cost + wear_and_tear_cost) stored
);

-- JOB OTHER COSTS
create table if not exists job_other_costs (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  category text not null,
  description text,
  amount numeric(10,2) not null default 0
);

-- COMPANY EXPENSES (overheads)
create table if not exists company_expenses (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  description text,
  amount numeric(10,2) not null default 0,
  frequency text not null default 'monthly' check (frequency in ('weekly','monthly','quarterly','yearly')),
  expense_date date,
  notes text
);

-- PAYMENTS
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  amount numeric(10,2) not null default 0,
  payment_date date not null,
  payment_method text not null default 'cash' check (payment_method in ('cash','card','bank_transfer','cheque')),
  notes text
);

-- Indexes for performance
create index if not exists idx_jobs_date on jobs(date);
create index if not exists idx_jobs_client_id on jobs(client_id);
create index if not exists idx_jobs_status on jobs(status);
create index if not exists idx_jobs_payment_status on jobs(payment_status);
create index if not exists idx_job_labour_job_id on job_labour(job_id);
create index if not exists idx_job_materials_job_id on job_materials(job_id);
create index if not exists idx_job_sealers_job_id on job_sealers(job_id);
create index if not exists idx_job_travel_job_id on job_travel(job_id);
create index if not exists idx_job_equipment_job_id on job_equipment(job_id);
create index if not exists idx_job_other_costs_job_id on job_other_costs(job_id);
