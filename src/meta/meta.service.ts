import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class MetaService {
  private logger = new Logger(MetaService.name); 
    constructor(private configService: ConfigService,
        private httpService: HttpService,
    ) {} 
  
    getAuthorizationUrl(redirectUri: string, state: string): string {
      const appId = this.configService.get<string>('META_APP_ID');
      const scopes = [
        'pages_show_list',
        'pages_messaging',
        'instagram_basic',
        'instagram_manage_messages'
      ].join(',');
  
      return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes}`;
    } 

    async exchangeCodeForToken(code: string, redirectUri: string): Promise<any> {
      const appId = this.configService.get<string>('META_APP_ID');
      const appSecret = this.configService.get<string>('META_APP_SECRET');
  
      const response = await firstValueFrom(this.httpService.get('https://graph.facebook.com/v22.0/oauth/access_token', {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code,
        },
      }));

      this.logger.debug("Exchange Code For Token",response.data)
      
      return response.data;
    }

    async getLongLivedToken(shortLivedToken: string): Promise<any> {
        const appId = this.configService.get<string>('META_APP_ID');
        const appSecret = this.configService.get<string>('META_APP_SECRET');
    
        const response = await firstValueFrom(this.httpService.get('https://graph.facebook.com/v22.0/oauth/access_token', {
          params: { 
            grant_type: 'fb_exchange_token',
            client_id: appId,
            client_secret: appSecret,
            fb_exchange_token: shortLivedToken,
          },
        }));
     
        this.logger.debug("Long Lived Token",response.data) 

        return response.data;   
      }

      async getPageAccessToken(userAccessToken: string, pageId: string): Promise<string> {
        const response =await firstValueFrom(this.httpService.get(`https://graph.facebook.com/v22.0/${pageId}`, {
          params: {
            fields: 'access_token',
            access_token: userAccessToken,
          },
        })); 
        
        this.logger.debug("Page Access Token",response.data)
        return response.data.access_token;
      } 
      
      async getUserPages(accessToken: string): Promise<any[]> {
        const response = await firstValueFrom(this.httpService.get('https://graph.facebook.com/v22.0/me/accounts', {
          params: {
            access_token: accessToken,
          },
        }));

        this.logger.debug("User Pages",response.data) 
        
        return response.data.data;
      }
}
 