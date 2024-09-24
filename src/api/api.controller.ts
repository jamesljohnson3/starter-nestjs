import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get(':endpoint') // Use a dynamic endpoint
  async getData(@Param('endpoint') endpoint: string) {
    const response = await this.apiService.getData(endpoint);
    return response.data; // Return the data from the API
  }

  @Post(':endpoint') // Use a dynamic endpoint
  async postData(@Param('endpoint') endpoint: string, @Body() data: any) {
    const response = await this.apiService.postData(endpoint, data);
    return response.data; // Return the data from the API
  }
}
