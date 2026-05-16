export interface TargetingEmployee {
  id: string;
  name: string;
  email: string;
  department: string | null;
}

export interface TargetingOptions {
  departments: string[];
  employees: TargetingEmployee[];
}
