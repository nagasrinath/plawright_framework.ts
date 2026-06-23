import { APIRequestContext } from '@playwright/test';
import type { PaymentStatus } from '../types';

interface PaymentStatusResponse {
  status: PaymentStatus;
  transactionId?: string;
  message?: string;
}

interface HealthResponse {
  status: string;
  uptime: number;
}

export class ApiHelper {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string
  ) {}

  async checkHealth(): Promise<HealthResponse> {
    const response = await this.request.get(`${this.baseUrl}/health`);
    return response.json() as Promise<HealthResponse>;
  }

  async postCheckoutProceed(): Promise<void> {
    await this.request.post(`${this.baseUrl}/checkout/proceed`);
  }

  async postCancelSubscription(): Promise<void> {
    await this.request.post(`${this.baseUrl}/subscription/cancel`);
  }

  async getPageStatus(path: string): Promise<number> {
    const response = await this.request.get(`${this.baseUrl}${path}`);
    return response.status();
  }

  async getPaymentStatus(txnId: string): Promise<PaymentStatusResponse> {
    const response = await this.request.get(`${this.baseUrl}/payment/status/${txnId}`);
    return response.json() as Promise<PaymentStatusResponse>;
  }
}
