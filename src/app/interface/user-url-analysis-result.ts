export interface UserUrlAnalysisResult {
  id: number;
  screenshot_id: number;
  is_ecommerce: number;
  is_product_page: number;
  is_on_sale: number;
  confidence: number;
  product_name: string;
  price: string;
  currency: string;
  discount_percentage: number | null;
  other_insights: string;
  notification_sent: number;
  created_at: string;
  discount_details: string;
  url: string;
  frequency_hours: number;
  last_checked: string;
  active: number;
}