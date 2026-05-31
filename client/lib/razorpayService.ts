import { httpClient } from '../app/lib/authService';

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentInitiationPayload {
  amount: number;
  currency?: string;
  receipt?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_id?: string;
  notes?: Record<string, any>;
}

class RazorpayService {
  private razorpayKey: string = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

  /**
   * Initialize Razorpay script
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Create a Razorpay order on the backend
   */
  async createOrder(payload: PaymentInitiationPayload): Promise<RazorpayOrder> {
    try {
      const response = await httpClient.post('/api/v1/payments/create-order/', {
        amount: Math.round(payload.amount * 100), // Convert to paise
        currency: payload.currency || 'INR',
        receipt: payload.receipt || `order_${Date.now()}`,
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        customer_phone: payload.customer_phone,
        order_id: payload.order_id,
        notes: payload.notes || {},
      });

      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to create Razorpay order');
    }
  }

  /**
   * Open Razorpay payment modal
   */
  async openPaymentModal(
    order: RazorpayOrder,
    options: {
      onSuccess: (response: RazorpayPaymentResponse) => void;
      onError: (error: any) => void;
      onDismiss?: () => void;
    }
  ): Promise<void> {
    const scriptLoaded = await this.loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay script');
    }

    const razorpay = (window as any).Razorpay;
    if (!razorpay) {
      throw new Error('Razorpay is not available');
    }

    const paymentOptions = {
      key: this.razorpayKey,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      name: 'PineSphere POS',
      description: `Order Payment`,
      image: '/logo.png',
      handler: (response: RazorpayPaymentResponse) => {
        options.onSuccess(response);
      },
      prefill: {
        name: order.notes?.customer_name || '',
        email: order.notes?.customer_email || '',
        contact: order.notes?.customer_phone || '',
      },
      notes: order.notes || {},
      theme: {
        color: '#3399cc',
      },
      modal: {
        ondismiss: () => {
          options.onDismiss?.();
        },
      },
    };

    const rzp = new razorpay(paymentOptions);
    rzp.open();
  }

  /**
   * Verify payment signature
   */
  async verifyPayment(payload: RazorpayPaymentResponse): Promise<{ verified: boolean; message: string }> {
    try {
      const response = await httpClient.post('/api/v1/payments/verify/', {
        razorpay_payment_id: payload.razorpay_payment_id,
        razorpay_order_id: payload.razorpay_order_id,
        razorpay_signature: payload.razorpay_signature,
      });

      return response.data?.data || { verified: true, message: 'Payment verified successfully' };
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Payment verification failed');
    }
  }

  /**
   * Process payment and create order
   */
  async processPayment(
    paymentResponse: RazorpayPaymentResponse,
    orderData: any
  ): Promise<{ success: boolean; order_id?: string; message: string }> {
    try {
      // Verify payment first
      await this.verifyPayment(paymentResponse);

      // Create order with payment details
      const response = await httpClient.post('/api/v1/orders/', {
        ...orderData,
        payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
      });

      return {
        success: true,
        order_id: response.data?.data?.id || response.data?.id,
        message: 'Order created successfully',
      };
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to process payment');
    }
  }
}

export const razorpayService = new RazorpayService();
