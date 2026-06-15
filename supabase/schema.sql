-- AuditIQ Pro Supabase schema
-- This schema uses auth.users as the identity source and stores every business record with user_id.
-- The user_id column keeps an audit record tied to the signed-in person, and RLS ensures a user can only see their own data.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text,
  organization text,
  job_title text,
  department text,
  phone text,
  location text,
  certifications text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- Add new columns to existing profiles
alter table public.profiles add column if not exists job_title text;
alter table public.profiles add column if not exists department text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists certifications text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists updated_at timestamptz;

create table if not exists public.audit_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  project_name text not null,
  client_name text not null,
  audit_type text not null,
  industry text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  project_id uuid references public.audit_projects(id) on delete cascade,
  risk_score integer,
  risk_level text,
  key_risks jsonb,
  recommendations jsonb,
  fraud_indicators jsonb,
  likelihood integer,
  magnitude integer,
  inherent_risk_score integer,
  control_risk_score integer,
  significant_risk boolean default false,
  risk_area text,
  assertion text,
  created_at timestamptz default now()
);

alter table public.risk_assessments add column if not exists likelihood integer;
alter table public.risk_assessments add column if not exists magnitude integer;
alter table public.risk_assessments add column if not exists inherent_risk_score integer;
alter table public.risk_assessments add column if not exists control_risk_score integer;
alter table public.risk_assessments add column if not exists significant_risk boolean default false;
alter table public.risk_assessments add column if not exists risk_area text;
alter table public.risk_assessments add column if not exists assertion text;
alter table public.risk_assessments add column if not exists fraud_indicators jsonb;

create table if not exists public.audit_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.audit_projects(id) on delete cascade,
  title text not null,
  description text,
  category text default 'Planning',
  is_completed boolean default false,
  priority text default 'Medium',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.audit_checklists add column if not exists title text;
alter table public.audit_checklists add column if not exists description text;
alter table public.audit_checklists add column if not exists category text default 'Planning';
alter table public.audit_checklists add column if not exists is_completed boolean default false;
alter table public.audit_checklists add column if not exists due_date date;
alter table public.audit_checklists add column if not exists completed_at timestamptz;

create table if not exists public.financial_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  project_id uuid references public.audit_projects(id) on delete cascade,
  file_name text,
  ratios jsonb,
  red_flags jsonb,
  chart_data jsonb,
  created_at timestamptz default now()
);

create table if not exists public.working_papers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  project_id uuid references public.audit_projects(id) on delete cascade,
  observation text,
  criteria text,
  condition text,
  cause text,
  effect text,
  recommendation text,
  risk_rating text,
  created_at timestamptz default now()
);

create table if not exists public.audit_procedures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  project_id uuid references public.audit_projects(id) on delete cascade,
  audit_area text,
  assertions jsonb,
  procedures jsonb,
  evidence_required jsonb,
  sampling_approach text,
  created_at timestamptz default now()
);

create table if not exists public.management_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  project_id uuid references public.audit_projects(id) on delete cascade,
  observation text,
  risk text,
  recommendation text,
  management_response_template text,
  created_at timestamptz default now()
);

create table if not exists public.planning_memos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  project_id uuid references public.audit_projects(id) on delete cascade,
  client_background text,
  audit_scope text,
  key_risks jsonb,
  materiality_considerations text,
  audit_strategy text,
  team_planning_notes text,
  timeline_considerations text,
  created_at timestamptz default now()
);

-- Ensure new columns exist (migration for existing tables)
alter table public.planning_memos add column if not exists client_background text;
alter table public.planning_memos add column if not exists audit_scope text;
alter table public.planning_memos add column if not exists materiality_considerations text;
alter table public.planning_memos add column if not exists audit_strategy text;
alter table public.planning_memos add column if not exists team_planning_notes text;
alter table public.planning_memos add column if not exists timeline_considerations text;

create table if not exists public.ai_chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  project_id uuid references public.audit_projects(id) on delete cascade,
  user_question text,
  ai_response text,
  created_at timestamptz default now()
);

create table if not exists public.prompt_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  category text,
  prompt_text text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.audit_projects enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.audit_checklists enable row level security;
alter table public.financial_analyses enable row level security;
alter table public.working_papers enable row level security;
alter table public.audit_procedures enable row level security;
alter table public.management_letters enable row level security;
alter table public.planning_memos enable row level security;
alter table public.ai_chat_logs enable row level security;
alter table public.prompt_library enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, organization)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.raw_user_meta_data->>'role', 'Auditor'), coalesce(new.raw_user_meta_data->>'organization', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create policy "Users can view their own profiles" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can delete their own profile" on public.profiles
  for delete using (auth.uid() = id);

-- RLS policies for all user-owned audit data.
create policy "Users can view their own projects" on public.audit_projects
  for select using (auth.uid() = user_id);
create policy "Users can insert their own projects" on public.audit_projects
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own projects" on public.audit_projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own projects" on public.audit_projects
  for delete using (auth.uid() = user_id);

create policy "Users can view their own risk assessments" on public.risk_assessments
  for select using (auth.uid() = user_id);
create policy "Users can insert their own risk assessments" on public.risk_assessments
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own risk assessments" on public.risk_assessments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own risk assessments" on public.risk_assessments
  for delete using (auth.uid() = user_id);

create policy "Users can view their own checklists" on public.audit_checklists
  for select using (auth.uid() = user_id);
create policy "Users can insert their own checklists" on public.audit_checklists
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own checklists" on public.audit_checklists
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own checklists" on public.audit_checklists
  for delete using (auth.uid() = user_id);

create policy "Users can view their own financial analyses" on public.financial_analyses
  for select using (auth.uid() = user_id);
create policy "Users can insert their own financial analyses" on public.financial_analyses
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own financial analyses" on public.financial_analyses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own financial analyses" on public.financial_analyses
  for delete using (auth.uid() = user_id);

create policy "Users can view their own working papers" on public.working_papers
  for select using (auth.uid() = user_id);
create policy "Users can insert their own working papers" on public.working_papers
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own working papers" on public.working_papers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own working papers" on public.working_papers
  for delete using (auth.uid() = user_id);

create policy "Users can view their own procedures" on public.audit_procedures
  for select using (auth.uid() = user_id);
create policy "Users can insert their own procedures" on public.audit_procedures
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own procedures" on public.audit_procedures
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own procedures" on public.audit_procedures
  for delete using (auth.uid() = user_id);

create policy "Users can view their own management letters" on public.management_letters
  for select using (auth.uid() = user_id);
create policy "Users can insert their own management letters" on public.management_letters
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own management letters" on public.management_letters
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own management letters" on public.management_letters
  for delete using (auth.uid() = user_id);

create policy "Users can view their own planning memos" on public.planning_memos
  for select using (auth.uid() = user_id);
create policy "Users can insert their own planning memos" on public.planning_memos
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own planning memos" on public.planning_memos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own planning memos" on public.planning_memos
  for delete using (auth.uid() = user_id);

create policy "Users can view their own chat logs" on public.ai_chat_logs
  for select using (auth.uid() = user_id);
create policy "Users can insert their own chat logs" on public.ai_chat_logs
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own chat logs" on public.ai_chat_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own chat logs" on public.ai_chat_logs
  for delete using (auth.uid() = user_id);

create policy "Users can view their own prompt entries" on public.prompt_library
  for select using (auth.uid() = user_id);
create policy "Users can insert their own prompt entries" on public.prompt_library
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own prompt entries" on public.prompt_library
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own prompt entries" on public.prompt_library
  for delete using (auth.uid() = user_id);
