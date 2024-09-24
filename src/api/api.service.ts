import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ApiService {
  private readonly baseUrl = 'https://vault.unlimitpotential.com/api';

  constructor(private readonly httpService: HttpService) {}

  async getData(endpoint: string): Promise<AxiosResponse<any>> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.httpService.get(url).toPromise();
  }

  async postData(endpoint: string, data: any): Promise<AxiosResponse<any>> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.httpService.post(url, data).toPromise();
  }
}

