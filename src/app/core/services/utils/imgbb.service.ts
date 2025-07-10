// src/app/services/imgbb.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImgbbService {
  private apiKey = 'a71567e8bd500ab57dffa5bf312cda19'; // 🔁 Pon aquí tu API key
  private apiUrl = 'https://api.imgbb.com/1/upload';

  constructor(private http: HttpClient) {}

  async subirImagen(file: File): Promise<string> {
    const base64 = await this.convertirABase64(file);

    const body = new HttpParams()
      .set('key', this.apiKey)
      .set('image', base64.split(',')[1]); // Solo la parte base64, sin 'data:image/...,'

    const response: any = await lastValueFrom(this.http.post(this.apiUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }));

    return response.data.url; // 🔗 URL pública
  }

  private convertirABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}
