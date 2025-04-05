import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
    private _storage: Storage | null = null;
    private _initialized = false;

    constructor(private storage: Storage) {
      this.init();
    }

    async init() {
      // Only initialize once
      if (this._initialized) {
        return;
      }
      
      // Create storage with default settings
      const storage = await this.storage.create();
      this._storage = storage;
      this._initialized = true;
    }

    // Ensure storage is initialized before any operation
    private async ensureInitialized() {
      if (!this._initialized) {
        await this.init();
      }
      return this._storage;
    }

    // Set data with proper async handling
    public async set(key: string, value: any): Promise<any> {
      const storage = await this.ensureInitialized();
      return storage?.set(key, value);
    }

    // Get data with proper async handling
    public async get(key: string): Promise<any> {
      const storage = await this.ensureInitialized();
      return storage?.get(key);
    }
    
    // Remove a single item
    public async remove(key: string): Promise<any> {
      const storage = await this.ensureInitialized();
      return storage?.remove(key);
    }
}