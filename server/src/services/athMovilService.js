/**
 * ATH Móvil Business API Service
 * Documentation: https://developers.athmovil.com/
 * 
 * This service handles ATH Móvil payment processing for:
 * - Subscription payments from artists
 * - Payout disbursements to artists' ATH Móvil accounts
 * 
 * Configuration via environment variables:
 * - ATH_MOVIL_PUBLIC_TOKEN: Public API token from ATH Móvil Business portal
 * - ATH_MOVIL_PRIVATE_TOKEN: Private API token for server-side operations  
 * - ATH_MOVIL_ENVIRONMENT: 'sandbox' or 'production'
 * - ATH_MOVIL_TIMEOUT: Request timeout in ms (default: 15000)
 */

const ATH_MOVIL_URLS = {
  sandbox: 'https://rapi.popular.com/dexconnect/ath-movil',
  production: 'https://rapi.popular.com/dexconnect/ath-movil',
};

class ATHMovilService {
  constructor() {
    this.publicToken = process.env.ATH_MOVIL_PUBLIC_TOKEN || '';
    this.privateToken = process.env.ATH_MOVIL_PRIVATE_TOKEN || '';
    this.environment = process.env.ATH_MOVIL_ENVIRONMENT || 'sandbox';
    this.baseUrl = ATH_MOVIL_URLS[this.environment] || ATH_MOVIL_URLS.sandbox;
    this.timeout = parseInt(process.env.ATH_MOVIL_TIMEOUT) || 15000;
  }

  isConfigured() {
    return !!(this.publicToken && this.privateToken);
  }

  /**
   * Create a payment request for ATH Móvil
   * Used for subscription payments
   */
  async createPayment({ amount, description, referenceId, metadata = {} }) {
    if (!this.isConfigured()) {
      throw new Error('ATH Móvil is not configured. Set ATH_MOVIL_PUBLIC_TOKEN and ATH_MOVIL_PRIVATE_TOKEN.');
    }

    const payload = {
      publicToken: this.publicToken,
      timeout: 600, // 10 minutes for user to complete
      total: amount,
      subtotal: amount,
      tax: 0,
      metadata1: description || '',
      metadata2: referenceId || '',
      items: [
        {
          name: description || 'EAJMUSIC Payment',
          description: `Payment for ${description}`,
          quantity: 1,
          price: amount,
        },
      ],
    };

    try {
      const response = await fetch(`${this.baseUrl}/v2/business/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ATH Móvil API error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[ATH_MOVIL] Payment creation failed:', error.message);
      throw error;
    }
  }

  /**
   * Verify a completed payment by its reference number
   */
  async verifyPayment(paymentId) {
    if (!this.isConfigured()) {
      throw new Error('ATH Móvil is not configured.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/v2/business/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.privateToken}`,
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ATH Móvil verification error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[ATH_MOVIL] Payment verification failed:', error.message);
      throw error;
    }
  }

  /**
   * Process webhook callback from ATH Móvil
   * Validates and extracts payment data from the webhook payload
   */
  processWebhook(payload) {
    const { status, referenceNumber, dailyTransactionID, name, phoneNumber, email, total, metadata1, metadata2 } = payload;

    return {
      success: status === 'COMPLETED',
      status: status || 'UNKNOWN',
      referenceNumber,
      transactionId: dailyTransactionID,
      customerName: name,
      customerPhone: phoneNumber,
      customerEmail: email,
      amount: parseFloat(total) || 0,
      description: metadata1,
      internalReferenceId: metadata2,
    };
  }

  /**
   * Create a mock/sandbox payment for testing
   * Used when ATH Móvil is not configured
   */
  createMockPayment({ amount, description, referenceId }) {
    const mockId = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      success: true,
      paymentId: mockId,
      status: 'PENDING',
      amount,
      description,
      referenceId,
      message: 'Mock payment created. Configure ATH Móvil credentials for real payments.',
      checkoutUrl: null,
    };
  }
}

export default new ATHMovilService();
