export interface UserUrl {
    id: number;
    url: string;
    frequency_hours: number; 
    lastChecked: string;
    created_at: string;
    active: number;
    status: string;
    failed_attempts: number;
}
