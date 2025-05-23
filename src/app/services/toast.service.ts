import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  /**
   * Presents a toast notification
   * @param message The message to display
   * @param position The position of the toast
   * @param cssClass CSS class for styling the toast
   * @returns The toast instance
   */
  async presentToast(
    message: string = '', 
    position: 'top' | 'middle' | 'bottom' = 'bottom', 
    color: "danger" | "dark" | "light" | "medium" | "primary" | "secondary" | "success" | "tertiary" | "warning" | string | undefined
  ) {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      position: position,
      color: color,
    });

    await toast.present();

    return toast;
  }
}
