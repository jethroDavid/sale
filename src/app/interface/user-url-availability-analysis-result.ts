export interface UserUrlAvailabilityAnalysisResult {
  id: number;
  screenshot_id: number;
  is_ecommerce: number;
  is_product_page: number;
  is_available: number;
  confidence: number;
  product_name: string;
  stock_status: string;
  availability_details: string;
  notification_sent: number;
  created_at: string;
  url: string;
  frequency_hours: number;
  last_checked: string;
  active: number;
}