CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'project_manager', 'team_lead', 'member')),
  industry VARCHAR(50) NOT NULL CHECK (industry IN ('programming', 'legal', 'logistics', 'other')),
  is_email_verified BOOLEAN DEFAULT FALSE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  industry VARCHAR(50) NOT NULL CHECK (industry IN ('programming', 'legal', 'logistics', 'other')),
  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_key VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  industry VARCHAR(50) NOT NULL CHECK (industry IN ('programming', 'legal', 'logistics', 'other')),
  planning_type VARCHAR(50) NOT NULL CHECK (planning_type IN ('sprint', 'kanban', 'timeline', 'calendar')),
  status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  matter_number VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project Views
CREATE TABLE project_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  view_type VARCHAR(50) NOT NULL CHECK (view_type IN ('list', 'kanban', 'gantt', 'calendar')),
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'delivered')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  story_points INTEGER,
  billable_hours DECIMAL(5,2),
  delivery_address TEXT,
  delivery_window TSTZRANGE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Task Status Logs
CREATE TABLE task_status_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('todo', 'in_progress', 'done', 'delivered')),
  location POINT,
  updated_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roadmaps
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roadmap Items
CREATE TABLE roadmap_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  dependencies JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Client Portal Access
CREATE TABLE client_portal_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  access_token VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('viewer', 'collaborator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms')),
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- History
CREATE TABLE history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('user', 'project', 'task', 'customer', 'document', 'notification')),
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  performed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);