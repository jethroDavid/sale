import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { DatetimeCustomEvent, IonItemSliding, RefresherCustomEvent } from '@ionic/angular';
import * as moment from 'moment';
import { RegisterUrlService } from 'src/app/services/api/register-url/register-url.service';
import { UserUrlService } from 'src/app/services/api/user-url/user-url.service';
import { ToastService } from 'src/app/services/toast.service';
import Chart from 'chart.js/auto';
import { UserUrl } from 'src/app/interface/user-url';
import { Browser } from '@capacitor/browser';
import { first } from 'rxjs';
import { RegisterUrl } from 'src/app/interface/register-url';
import { UserUrlAvailabilityAnalysisResult } from 'src/app/interface/user-url-availability-analysis-result';
// Import Chart.js date adapter
import 'chartjs-adapter-moment';

@Component({
  selector: 'app-checker',
  templateUrl: './checker.page.html',
  styleUrls: ['./checker.page.scss'],
  standalone: false,
  animations: [
    trigger('itemAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
  ]
})
export class CheckerPage implements OnInit {
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
    availabilityHistory: {
      date: string,
      isAvailable: number
    }[]
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
    this.getUserAvailabilityUrls();
    setTimeout(() => {
      this.showItemDeleteButton(0);
    }, 500);
  }

  ngAfterViewInit() {
  }

  showItemDeleteButton(index: number = 0) {
    const items = this.slidingItems.toArray();
    if (items.length >= index + 1) {
      items[index].open('end');
    }
  }

  getUserAvailabilityUrls(fromDate: string | null = null, toDate: string | null = null) {
    if (!fromDate && !toDate) {
      this.dateFrom = null;
      this.dateTo = null;
    }
    
    this.userUrlService.getUserAvailabilityUrls<UserUrl[]>(fromDate, toDate).subscribe({
      next: (response) => {
        const { result } = response;

        this.data = result.map((item) => ({id: item.id, url: item.url, lastChecked: item.lastChecked, active: item.active, failed_attempts: item.failed_attempts, status: item.status,  availabilityHistory: []}));
        
        if (this.data.length > 0) {
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
    
    if (lastCheckedDate.isSame(now, 'day')) {
      return 'Today at ' + lastCheckedDate.format('h:mm A');
    }
    
    if (lastCheckedDate.isSame(now.clone().subtract(1, 'day'), 'day')) {
      return 'Yesterday at ' + lastCheckedDate.format('h:mm A');
    }
    
    if (lastCheckedDate.isAfter(now.clone().subtract(7, 'days'))) {
      return lastCheckedDate.format('dddd [at] h:mm A');
    }
    
    return lastCheckedDate.format('MMM DD, YYYY [at] h:mm A');
  }

  getUserUrlAnalysisResults(urlId: number, index: number = 0) {
    this.userUrlService.getUserAvailabilityUrlAnalysisResults<UserUrlAvailabilityAnalysisResult[]>(urlId)
      .pipe(first())
      .subscribe({
        next: (response) => {
          const { result } = response;
          const availabilityHistory = result.map((item) => ({
            date: moment(item.created_at).format('MMM DD, YYYY'),
            isAvailable: item.is_available
          }));
          
          this.data[index].availabilityHistory = availabilityHistory;
          
          setTimeout(() => this.renderCharts(index), 100);
        }
      });
  }

  deleteAvailabilityUserUrl(urlId: number) {
    this.userUrlService.deleteAvailabilityUserUrl<UserUrlAvailabilityAnalysisResult[]>(urlId)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.data = this.data.filter(item => item.id !== urlId);
          this.toastService.presentToast('URL deleted!', 'bottom', 'success');
        }
      });
  }
  
  refresh(ev: any) {
    setTimeout(() => {
      this.getUserAvailabilityUrls();
      
      (ev as RefresherCustomEvent).detail.complete();
    }, 1500);
  }

  dateFromChange(event: DatetimeCustomEvent) {
    const { value } = event.detail;
    this.dateFromLabel = moment(value).format(this.dateMonthFormat);
    this.dateFrom = moment(value).format('YYYY-MM-DD');

    this.getUserAvailabilityUrls(this.dateFrom, this.dateTo);
  }

  dateToChange(event: DatetimeCustomEvent) {
    const { value } = event.detail;
    this.dateToLabel = moment(value).format(this.dateMonthFormat);
    this.dateTo = moment(value).format('YYYY-MM-DD');

    this.getUserAvailabilityUrls(this.dateFrom, this.dateTo);
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

  separateUrl(url: string): { domain: string, path: string } {
    try {
      const urlObj = new URL(url);
      const domain = `${urlObj.protocol}//${urlObj.host}/`;
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

    this.registerUrlService.registerAvailabilityUrl<RegisterUrl>(this.url).subscribe({
      next: (response) => {
        this.getUserAvailabilityUrls();

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

  isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  renderCharts(index: number | null = null) {
    if (index !== null) {
      this.renderSingleChart(index);
    } else {
      this.charts.forEach((chart) => {
        chart.destroy();
      });
      this.charts = [];
      
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
    
    if (this.charts[index]) {
      this.charts[index].destroy();
      this.charts[index] = null as any;
    }
    
    if (this.data[index]?.availabilityHistory?.length > 0) {
      const history = this.data[index].availabilityHistory.slice().reverse();
      
      // Use a simpler approach for scatter chart points
      const availablePoints = [];
      const unavailablePoints = [];
      
      for (const item of history) {
        const date = moment(item.date, 'MMM DD, YYYY').valueOf(); // Convert to timestamp
        
        if (item.isAvailable === 1) {
          availablePoints.push({ x: date, y: 1 });
        } else {
          unavailablePoints.push({ x: date, y: 0 });
        }
      }

      const chart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'Available',
              data: availablePoints,
              backgroundColor: 'rgba(40, 167, 69, 1)', // Green
              pointRadius: 6,
              pointHoverRadius: 8,
            },
            {
              label: 'Unavailable',
              data: unavailablePoints,
              backgroundColor: 'rgba(220, 53, 69, 1)', // Red
              pointRadius: 6,
              pointHoverRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day'
              },
              title: {
                display: true,
                text: 'Date',
                color: '#fff'
              },
              ticks: {
                color: '#fff'
              }
            },
            y: {
              min: -0.5,
              max: 1.5,
              ticks: {
                color: '#fff',
                callback: value => {
                  if (value === 0) return 'Unavailable';
                  if (value === 1) return 'Available';
                  return '';
                },
                stepSize: 1
              },
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#fff',
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark background for tooltip
              titleColor: '#fff', // White title text
              bodyColor: '#fff', // White body text
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1,
              callbacks: {
                title: (tooltipItems) => {
                  return moment(tooltipItems[0].parsed.x).format('MMM DD, YYYY');
                },
                label: (tooltipItem) => {
                  return tooltipItem.dataset.label || '';
                }
              }
            }
          },
          animation: {
            duration: 1000
          }
        }
      });
      
      this.charts[index] = chart;
    } else {
      const canvasWidth = chartElem.nativeElement.width;
      const canvasHeight = chartElem.nativeElement.height;
      
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      
      const iconOffset = Math.min(30, canvasHeight * 0.15);
      const textSpacing = Math.min(20, canvasHeight * 0.1);
      const subtextSpacing = Math.min(45, canvasHeight * 0.2);
      
      this.drawNoDataIcon(ctx, centerX, centerY - iconOffset);
      
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText(
        'No availability history available', 
        centerX, 
        centerY + textSpacing
      );
      
      ctx.font = '12px Arial';
      ctx.fillStyle = '#999';
      ctx.fillText(
        'Availability tracking will start automatically', 
        centerX, 
        centerY + subtextSpacing
      );
    }
  }

  drawNoDataIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    
    ctx.beginPath();
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.5;
    ctx.rect(x - 25, y - 20, 50, 35);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x + 20, y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#d32f2f';
    ctx.lineWidth = 2;
    ctx.moveTo(x - 30, y - 25);
    ctx.lineTo(x + 30, y + 25);
    ctx.stroke();
    
    ctx.restore();
  }

  openUserUrlAnalysisResults(event: any, index: number) {
    const value = event.detail.value;
    if (value) {
      this.getUserUrlAnalysisResults(value, index);
    }
  }
}
