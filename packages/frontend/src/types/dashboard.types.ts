export interface DashboardStat {
    label: string
    value: number
    href: string
  }
  
  export interface Project {
    id: string
    name: string
    progress: number
    dueDate: string
  }
  
  export interface Activity {
    id: string
    user: {
      name: string
      avatar: string
      initials: string
    }
    action: string
    target: string
    project: string
    time: string
  }
  
  export interface Deadline {
    id: string
    task: string
    project: string
    dueDate: string
  }
  