export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    error?: string;
    result: T;
}
