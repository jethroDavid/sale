import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { FirebaseAuthenticationService } from './core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private readonly firebaseAuthenticationService: FirebaseAuthenticationService,
    private storage: Storage
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
    // If using a custom driver:
    // await this.storage.defineDriver(MyCustomDriver)
    await this.storage.create();
  }

  private async initializeApp(): Promise<void> {
    await this.firebaseAuthenticationService.initialize();
  }
}
