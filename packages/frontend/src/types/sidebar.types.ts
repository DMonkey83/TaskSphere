export interface NavigationItem {
  name: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

export interface ProjectItem {
  id: string
  name: string
}

export interface Project {
  id: string
  name: string
  items: ProjectItem[]
}

export interface Team {
  id: string
  name: string
  logo: string
}

export interface User {
  name: string
  email: string
  avatar: string
}