import { CommonModule } from '@angular/common';
import { Component, inject, ViewChildren, ElementRef, AfterViewInit, QueryList } from '@angular/core';
import { RefresherCustomEvent, DatetimeCustomEvent, IonicModule } from '@ionic/angular';
import * as moment from 'moment';
import { Browser } from '@capacitor/browser';
import { animate, style, transition, trigger } from '@angular/animations';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Route, Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { StorageService } from '../services/storage.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
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
export class HomePage implements AfterViewInit {
  public url: string = '';
  private dateMonthFormat: string = 'MMM DD, YYYY';
  public dateFromLabel: string = moment().subtract(7, 'days').format(this.dateMonthFormat);
  public dateToLabel: string = moment().format(this.dateMonthFormat);
  public dateFrom: string = moment().subtract(7, 'days').format('YYYY-MM-DD');
  public dateTo: string = moment().format('YYYY-MM-DD');

  public week = ['sun','mon','tue','wed','thu','fri','sat'];
  public data = [
    {
      url: 'https://www.nike.com/ph/t/pegasus-plus-road-running-shoes-vsskjR/FQ7262-002',
      priceHistory: [
        {
          date: 'Mar 11, 2025',
          price: 'PHP 7,500'
        },
        {
          date: 'Mar 10, 2025',
          price: 'PHP 7,500'
        },
        {
          date: 'Mar 09, 2025',
          price: 'PHP 7,500'
        },
        {
          date: 'Mar 7, 2025',
          price: 'PHP 5,500'
        },
        {
          date: 'Mar 6, 2025',
          price: 'PHP 7,500'
        },
        {
          date: 'Mar 5, 2025',
          price: 'PHP 6,500'
        },
      ]
    },
    {
      url: 'https://runnr.com.ph/collections/cushioned/products/saucony-unisex-kinvara-13-running-shoes',
      priceHistory: [
        {
          date: 'Mar 09, 2025',
          price: 'PHP 7,500'
        },
        {
          date: 'Mar 10, 2025',
          price: 'PHP 7,600'
        },
        {
          date: 'Mar 11, 2025',
          price: 'PHP 7,800'
        },
      ]
    },
    {
      url: 'https://www.adidas.com.ph/supernova-rise-2-running-shoes/JI1413.html?pr=taxonomy_rr&slot=2&rec=mt',
      priceHistory: [
        {
          date: 'Mar 09, 2025',
          price: 'PHP 7,500'
        },
        {
          date: 'Mar 10, 2025',
          price: 'PHP 7,600'
        },
        {
          date: 'Mar 11, 2025',
          price: 'PHP 7,800'
        },
      ]
    },
    {
      url: 'https://www.nike.com/ph/t/pegasus-plus-road-running-shoes-vsskjR/FQ7262-002',
      priceHistory: [
        {
          date: 'Mar 09, 2025',
          price: 'PHP 7,500'
        },
        {
          date: 'Mar 10, 2025',
          price: 'PHP 7,600'
        },
        {
          date: 'Mar 11, 2025',
          price: 'PHP 7,800'
        },
      ]
    },
    {
      url: 'https://runnr.com.ph/collections/cushioned/products/saucony-unisex-kinvara-13-running-shoes',
      priceHistory: [
        {
          date: 'Mar 09, 2025',
          price: 'PHP 7,500'
        },
        {
          date: 'Mar 10, 2025',
          price: 'PHP 7,600'
        },
        {
          date: 'Mar 11, 2025',
          price: 'PHP 7,800'
        },
      ]
    },
    {
      url: 'https://www.adidas.com.ph/supernova-rise-2-running-shoes/JI1413.html?pr=taxonomy_rr&slot=2&rec=mt',
      priceHistory: [
        {
          date: 'Mar 09, 2025',
          price: 'PHP 7,500'
        },
        {
          date: 'Mar 10, 2025',
          price: 'PHP 7,600'
        },
        {
          date: 'Mar 11, 2025',
          price: 'PHP 7,800'
        },
      ]
    },
  ];

  @ViewChildren('priceChart') chartElements!: QueryList<ElementRef<HTMLCanvasElement>>;
  private charts: Chart[] = [];

  constructor(
    private toastService: ToastService,
    public auth: AngularFireAuth,
    public router: Router,
    private storageService: StorageService,
  ) {}

  ngAfterViewInit() {
    // Slight delay to ensure accordions are rendered
    setTimeout(() => this.renderCharts(), 100);
  }

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }

  dateFromChange(event: DatetimeCustomEvent) {
    const { value } = event.detail;
    this.dateFromLabel = moment(value).format(this.dateMonthFormat);
    this.dateFrom = moment(value).format('YYYY-MM-DD');
  }

  dateToChange(event: DatetimeCustomEvent) {
    const { value } = event.detail;
    this.dateToLabel = moment(value).format(this.dateMonthFormat);
    this.dateTo = moment(value).format('YYYY-MM-DD');
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
      this.toastService.presentToast('URL is required!', 'bottom', 'danger-toast');
      return;
    } else if (!this.isValidUrl(this.url)) {
      this.toastService.presentToast('Invalid URL!', 'bottom', 'danger-toast');
      return;
    }

    this.data.unshift({ url: this.url, priceHistory: [] });
    this.url = '';

    this.toastService.presentToast('URL added!', 'bottom', 'success-toast');
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

  renderCharts() {
    // Destroy existing charts if any
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
    this.chartElements.forEach((chartElem, index) => {
      if (this.data[index]?.priceHistory?.length > 0) {
        const ctx = chartElem.nativeElement.getContext('2d');
        if (ctx) {
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
          this.charts.push(chart);
        }
      }
    });
  }

  deleteItem(index: number, item: any) {}

  logout() {
    this.auth.signOut().then(async () => {
      await this.storageService.remove('user');
      await this.storageService.remove('token');

      this.router.navigate(['/login']);
    }).catch((error) => {
      // An error happened.
      console.error('Error signing out:', error);
    });
  }
}
