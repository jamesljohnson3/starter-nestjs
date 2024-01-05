import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { HttpService } from '@nestjs/axios';

@Controller('token')
export class TokenController {
  private activatedTokens: string[] = [];

  constructor(private readonly httpService: HttpService) {}
  @Post('create')
  async createToken(@Body() body: { userId: string }): Promise<string> {
    // Generate a TOTP token using speakeasy
    const secret = speakeasy.generateSecret().base32;
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
    });

    try {
      // Make Xata API call to record activated token
      await this.httpService
        .post(
          'https://unlimit-potential-lho3ne.us-east-1.xata.sh/db/now2:main/tables/VerificationToken/data?columns=id',
          {
            api_key: token, // Use the generated token as the API key
            domain_id: body.userId, // Use the provided userId as the domain_id
          },
          {
            headers: {
              Authorization: 'Bearer xau_AQ7SbTkHra2xDHXi0VXltyTsdneNyDhR',
              'Content-Type': 'application/json',
            },
          },
        )
        .toPromise();

      // Return the generated token to the client
      return token;
    } catch (error) {
      // Handle errors here (log, throw, etc.)
      console.error('Error recording token:', error.message);
      throw new Error('Failed to record token');
    }
  }

  @Get('check/:token')
  async checkTokenExistence(@Param('token') token: string): Promise<string> {
    // Check if the token exists in-memory
    const tokenExists = this.activatedTokens.includes(token);

    if (tokenExists) {
      return 'Token exists';
    } else {
      // Make Xata API call to check token existence
      const response = await this.httpService
        .post(
          'https://unlimit-potential-lho3ne.us-east-1.xata.sh/db/now2:main/tables/VerificationToken/query',
          {
            filter: {
              id: {
                $contains: token,
              },
            },
          },
          {
            headers: {
              Authorization: 'Bearer xau_AQ7SbTkHra2xDHXi0VXltyTsdneNyDhR',
              'Content-Type': 'application/json',
            },
          },
        )
        .toPromise();

      // Check Xata API response and return appropriate message
      if (response.data && response.data.length > 0) {
        return 'Token exists';
      } else {
        return 'Token does not exist';
      }
    }
  }

  @Post('record')
  async recordActivatedToken(@Body() body: { token: string }): Promise<string> {
    // Record the activated token in-memory
    this.activatedTokens.push(body.token);

    // Make Xata API call to record activated token
    await this.httpService
      .post(
        'https://unlimit-potential-lho3ne.us-east-1.xata.sh/db/now2:main/tables/ActivateToken/data?columns=id',
        {
          token: body.token,
        },
        {
          headers: {
            Authorization: 'Bearer xau_AQ7SbTkHra2xDHXi0VXltyTsdneNyDhR',
            'Content-Type': 'application/json',
          },
        },
      )
      .toPromise();

    // Return a response indicating that the token was recorded
    return 'Token recorded';
  }
}
