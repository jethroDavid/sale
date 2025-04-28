import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DatetimeCustomEvent, IonItemSliding, RefresherCustomEvent } from '@ionic/angular';
import * as moment from 'moment';
import { PriceHistory } from 'src/app/interface/price-history';
import Chart from 'chart.js/auto';
import { ToastService } from 'src/app/services/toast.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { RegisterUrlService } from 'src/app/services/api/register-url/register-url.service';
import { UserUrlService } from 'src/app/services/api/user-url/user-url.service';
import { UserUrl } from 'src/app/interface/user-url';
import { UserUrlAnalysisResult } from 'src/app/interface/user-url-analysis-result';
import { first } from 'rxjs';
import { Browser } from '@capacitor/browser';
import { RegisterUrl } from 'src/app/interface/register-url';

@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.page.html',
  styleUrls: ['./tracker.page.scss'],
  standalone: false,
  animations: [
    trigger('itemAnimation', [
      // Item entering the DOM
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      // Item leaving the DOM
      transition(':leave', [
        animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
  ]
})
export class TrackerPage implements OnInit {
  public url: string = '';
  private dateMonthFormat: string = 'MMM DD, YYYY';
  public dateFromLabel: string = moment().subtract(7, 'days').format(this.dateMonthFormat);
  public dateToLabel: string = moment().format(this.dateMonthFormat);
  public dateFrom: string | null = null;
  public dateTo: string | null = null;
  public disableUrlInput: boolean = false;

  public data: {
    id: number,
    url: string,
    lastChecked: string,
    active: number,
    failed_attempts: number,
    status: string,
    priceHistory: PriceHistory[]
  }[] = [];

  @ViewChildren('priceChart') chartElements!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('slidingItem') slidingItems!: QueryList<IonItemSliding>;
  private charts: Chart[] = [];

  constructor(
    private toastService: ToastService,
    public auth: AngularFireAuth,
    public router: Router,
    private registerUrlService: RegisterUrlService,
    private userUrlService: UserUrlService,
  ) {}

  ngOnInit(): void {
    this.getUserUrls();
    setTimeout(() => {
      this.showItemDeleteButton(0);
    }, 500);
  }

  ngAfterViewInit() {
  }

  showItemDeleteButton(index: number = 0) {
    // Check if we have at least 2 items in the list
    const items = this.slidingItems.toArray();
    if (items.length >= index + 1) {
      // Open the options for the second item
      items[index].open('end');
    }
  }

  getUserUrls(fromDate: string | null = null, toDate: string | null = null) {
    if (!fromDate && !toDate) {
      this.dateFrom = null;
      this.dateTo = null;
    }
    
    this.userUrlService.getUserUrls<UserUrl[]>(fromDate, toDate).subscribe({
      next: (response) => {
        const { result } = response;

        this.data = result.map((item) => ({id: item.id, url: item.url, lastChecked: item.lastChecked, active: item.active, failed_attempts: item.failed_attempts, status: item.status,  priceHistory: []}));
        
        if (this.data.length > 0) {
          this.getUserUrlAnalysisResults(this.data[0].id, 0);
        } else {
          setTimeout(() => this.renderCharts(), 100);
        }
      },
      error: (error) => {
        console.error('Error fetching user URLs:', error);
      }
    }); 
  }

  formatLastChecked(lastChecked: string): string {
    const now = moment();
    const lastCheckedDate = moment(lastChecked);
    
    // If it's today
    if (lastCheckedDate.isSame(now, 'day')) {
      return 'Today at ' + lastCheckedDate.format('h:mm A');
    }
    
    // If it was yesterday
    if (lastCheckedDate.isSame(now.clone().subtract(1, 'day'), 'day')) {
      return 'Yesterday at ' + lastCheckedDate.format('h:mm A');
    }
    
    // If it was within the last week
    if (lastCheckedDate.isAfter(now.clone().subtract(7, 'days'))) {
      return lastCheckedDate.format('dddd [at] h:mm A'); // e.g., "Monday at 2:30 PM"
    }
    
    // For other dates
    return lastCheckedDate.format('MMM DD, YYYY [at] h:mm A'); // e.g., "Apr 15, 2025 at 2:30 PM"
  }

  getUserUrlAnalysisResults(urlId: number, index: number = 0) {
    this.userUrlService.getUserUrlAnalysisResults<UserUrlAnalysisResult[]>(urlId)
      .pipe(first())
      .subscribe({
        next: (response) => {
          const { result } = response;
          const priceHistory = result.map((item) => ({
            date: moment(item.created_at).format('MMM DD, YYYY'),
            price: item.price
          }));
          
          this.data[index].priceHistory = priceHistory;
          
          // Render charts after fetching data
          setTimeout(() => this.renderCharts(index), 100);
        }
      });
  }

  deleteUserUrl(urlId: number) {
    this.userUrlService.deleteUserUrl<UserUrlAnalysisResult[]>(urlId)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.data = this.data.filter(item => item.id !== urlId);
          this.toastService.presentToast('URL deleted!', 'bottom', 'success');
          // this.renderCharts();
        }
      });
  }
  
  refresh(ev: any) {
    setTimeout(() => {
      this.getUserUrls();
      
      (ev as RefresherCustomEvent).detail.complete();
    }, 1500);
  }

  dateFromChange(event: DatetimeCustomEvent) {
    const { value } = event.detail;
    this.dateFromLabel = moment(value).format(this.dateMonthFormat);
    this.dateFrom = moment(value).format('YYYY-MM-DD');

    this.getUserUrls(this.dateFrom, this.dateTo);
  }

  dateToChange(event: DatetimeCustomEvent) {
    const { value } = event.detail;
    this.dateToLabel = moment(value).format(this.dateMonthFormat);
    this.dateTo = moment(value).format('YYYY-MM-DD');

    this.getUserUrls(this.dateFrom, this.dateTo);
  }

  pasteClipboard() {
    if (!this.url) {
      navigator.clipboard.readText().then((text) => {
        this.url = text;
      });
    }
  }

  async openUrl(url: string) {
    await Browser.open({ url });
  }

  /**
   * Separates a URL into domain (with trailing slash) and path (without leading slash)
   * @param url The full URL to parse
   * @returns An object containing the domain and path
   */
  separateUrl(url: string): { domain: string, path: string } {
    try {
      const urlObj = new URL(url);
      // Include trailing slash with domain
      const domain = `${urlObj.protocol}//${urlObj.host}/`;
      
      // Remove leading slash from path
      const path = urlObj.pathname.substring(1) + urlObj.search + urlObj.hash;
      
      return { domain, path };
    } catch (e) {
      console.error('Invalid URL:', e);
      return { domain: '', path: '' };
    }
  }

  addUrl() {
    if (!this.url) {
      this.toastService.presentToast('URL is required!', 'bottom', 'danger');
      return;
    } else if (!this.isValidUrl(this.url)) {
      this.toastService.presentToast('Invalid URL!', 'bottom', 'danger');
      return;
    }

    this.disableUrlInput = true;

    this.registerUrlService.registerUrl<RegisterUrl>(this.url).subscribe({
      next: (response) => {
        const { url } = response.result;
        
        this.getUserUrls();

        this.url = '';
        this.disableUrlInput = false;

        this.toastService.presentToast('URL added!', 'bottom', 'success');
      },
      error: (error) => {
        this.disableUrlInput = false;

        this.toastService.presentToast('Error registering URL!', 'bottom', 'danger');
      }
    });
  }

  /**
   * Checks if a string is a valid URL
   * @param urlString The string to validate
   * @returns boolean indicating if string is a valid URL
   */
  isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      // Only accept HTTP or HTTPS protocols
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  /**
   * Extracts numeric value from a currency string
   * Works with various currency formats: $180, php 7,500.23, €1.234,56, etc.
   */
  extractCurrencyValue(currencyString: string): number {
    if (!currencyString || typeof currencyString !== 'string') {
      return 0;
    }
    
    // Step 1: Remove currency symbols and non-numeric characters except for . , and -
    let cleanedString = currencyString.replace(/[^\d.,\-]/g, '');
    
    // Step 2: Handle different number formats
    
    // Check if the string uses comma as decimal separator (e.g., European format: 1.234,56)
    const commaDecimalFormat = /\d+\.\d+,\d+/.test(cleanedString);
    
    if (commaDecimalFormat) {
      // European format: replace dots (thousands) and keep comma as decimal point
      cleanedString = cleanedString.replace(/\./g, '').replace(',', '.');
    } else {
      // Standard format: remove commas and keep dots
      cleanedString = cleanedString.replace(/,/g, '');
    }
    
    // Step 3: Convert to number
    const value = parseFloat(cleanedString);
    
    // Return 0 if the result is NaN, otherwise return the value
    return isNaN(value) ? 0 : value;
  }

  /**
   * Determines the price status (up/down) by comparing current price with the next price in history
   * @param index Current index in the price history array
   * @param price Current price object
   * @param priceHistory Full array of price history
   * @returns 'up' if price increased, 'down' if decreased, empty string if it's the last item
   */
  getPriceStatus(
    index: number,
    price: {
      date: string;
      price: string;
    },
    priceHistory: {
      date: string;
      price: string;
    }[]
  ): string {
    // If this is the last item in the history, return empty string
    if (index === priceHistory.length - 1) {
      return '';
    }
    
    // Get numeric values for comparison
    const currentValue = this.extractCurrencyValue(price.price);
    const nextValue = this.extractCurrencyValue(priceHistory[index + 1].price);
    
    if (currentValue === nextValue) {
      return '';
    }

    // Return status based on price comparison
    return currentValue > nextValue ? 'up' : 'down';
  }

  renderCharts(index: number | null = null) {
    if (index !== null) {
      // Only render/update the specific chart at the given index
      this.renderSingleChart(index);
    } else {
      // Destroy all existing charts and rerender them
      this.charts.forEach((chart) => {
        chart.destroy();
      });
      this.charts = [];
      
      // Render all charts
      this.chartElements.forEach((_, i) => {
        this.renderSingleChart(i);
      });
    }
  }

  renderSingleChart(index: number) {
    const chartElem = this.chartElements.get(index);
    if (!chartElem) return;
    
    const ctx = chartElem.nativeElement.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart at this index if it exists
    if (this.charts[index]) {
      this.charts[index].destroy();
      this.charts[index] = null as any;
    }
    
    if (this.data[index]?.priceHistory?.length > 0) {
      const history = this.data[index].priceHistory.slice().reverse();
      const labels = history.map(item => moment(item.date, 'MMM DD, YYYY').format('MMM DD'));
      const prices = history.map(item => this.extractCurrencyValue(item.price));
      
      // New transparent gradient: starts semi-transparent and fades to fully transparent
      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, 'rgba(0,123,255,0.4)'); // softened color start
      gradient.addColorStop(1, 'rgba(0,123,255,0)');   // fully transparent end

      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Price History',
            data: prices,
            fill: true,
            backgroundColor: gradient,
            borderColor: 'rgba(0,123,255,1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(0,123,255,1)',
            pointBorderColor: '#fff',
            pointRadius: 3,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                callback: value => 'PHP ' + value,
                font: { size: 11 },
                color: '#333'
              }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 }, color: '#333' }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#333',
              callbacks: {
                label: context => 'PHP ' + context.parsed.y
              }
            }
          },
          interaction: { mode: 'index', intersect: false },
          animation: { duration: 1000, easing: 'easeOutQuart' }
        }
      });
      
      // Store the chart in the charts array at the specific index
      this.charts[index] = chart;
    } else {
      // Get the actual canvas dimensions
      const canvasWidth = chartElem.nativeElement.width;
      const canvasHeight = chartElem.nativeElement.height;
      
      // Clear the canvas first
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      // Calculate center points based on actual canvas size
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      
      // Calculate proportional spacing based on canvas height
      const iconOffset = Math.min(30, canvasHeight * 0.15);
      const textSpacing = Math.min(20, canvasHeight * 0.1);
      const subtextSpacing = Math.min(45, canvasHeight * 0.2);
      
      // Draw the icon first (positioned proportionally from center)
      this.drawNoDataIcon(ctx, centerX, centerY - iconOffset);
      
      // Main text with proportional spacing
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText(
        'No price history available', 
        centerX, 
        centerY + textSpacing
      );
      
      // Subtext with proportional spacing
      ctx.font = '12px Arial';
      ctx.fillStyle = '#999';
      ctx.fillText(
        'Price tracking will start automatically', 
        centerX, 
        centerY + subtextSpacing
      );
    }
  }

  // Helper method to draw a simple icon
  drawNoDataIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Save the current context state
    ctx.save();
    
    // Chart outline (make it slightly bigger)
    ctx.beginPath();
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.5;
    ctx.rect(x - 25, y - 20, 50, 35);
    ctx.stroke();
    
    // Draw a dashed horizontal line in the middle (like a chart line)
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x + 20, y);
    ctx.stroke();
    
    // Draw the "no" slash
    ctx.beginPath();
    ctx.setLineDash([]); // Reset to solid line
    ctx.strokeStyle = '#d32f2f'; // Red color for the slash
    ctx.lineWidth = 2;
    ctx.moveTo(x - 30, y - 25);
    ctx.lineTo(x + 30, y + 25);
    ctx.stroke();
    
    // Restore the context state
    ctx.restore();
  }

  openUserUrlAnalysisResults(event: any, index: number) {
    const value = event.detail.value;
    if (value) {
      this.getUserUrlAnalysisResults(value, index);
    }
  }
}
