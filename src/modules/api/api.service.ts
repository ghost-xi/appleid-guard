import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { TaskConfig, ApiResponse } from '../../common/types';

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);
  private readonly httpClient: AxiosInstance;

  constructor(
    private readonly apiUrl: string,
    private readonly apiKey: string,
  ) {
    this.httpClient = axios.create({
      baseURL: this.apiUrl,
      headers: { key: this.apiKey },
      timeout: 30000,
    });
  }

  async getTaskConfig(taskId: string): Promise<TaskConfig | null> {
    try {
      const response = await this.httpClient.post<ApiResponse<TaskConfig>>('/api/get_task_info', {
        id: taskId,
      });

      if (response.data.code === 200 && response.data.data) {
        return response.data.data;
      }

      this.logger.error(`Failed to get task config: ${response.data.msg}`);
      return null;
    } catch (error) {
      this.logger.error('Error retrieving config', error.message);
      return null;
    }
  }

  async updateAccount(
    username: string,
    password: string,
    status: boolean,
    message: string,
  ): Promise<boolean> {
    try {
      const response = await this.httpClient.post<ApiResponse>('/api/update_account', {
        username,
        password,
        status,
        message,
      });

      if (response.data.status) {
        return true;
      }

      this.logger.error(`Failed to update account: ${response.data.msg}`);
      return false;
    } catch (error) {
      this.logger.error('Error updating account', error.message);
      return false;
    }
  }

  async updateMessage(username: string, message: string): Promise<boolean> {
    return this.updateAccount(username, '', false, message);
  }

  async getPassword(username: string): Promise<string> {
    try {
      const response = await this.httpClient.post<ApiResponse<{ password: string }>>(
        '/api/get_password',
        { username },
      );

      if (response.data.status && response.data.data) {
        return response.data.data.password;
      }

      this.logger.error(`Failed to get password: ${response.data.msg}`);
      return '';
    } catch (error) {
      this.logger.error('Error retrieving password', error.message);
      return '';
    }
  }

  async reportProxyError(proxyId: number): Promise<boolean> {
    try {
      const response = await this.httpClient.post<ApiResponse>('/api/report_proxy_error', {
        id: proxyId,
      });

      if (!response.data.status) {
        this.logger.error(`Failed to report proxy error: ${response.data.msg}`);
      }

      return response.data.status;
    } catch (error) {
      this.logger.error('Error reporting proxy error', error.message);
      return false;
    }
  }

  async disableAccount(username: string): Promise<boolean> {
    try {
      await this.httpClient.post<ApiResponse>('/api/disable_account', {
        username,
      });
      return true;
    } catch (error) {
      this.logger.error('Error disabling account', error.message);
      return false;
    }
  }
}
