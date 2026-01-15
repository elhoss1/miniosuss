import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable , throwError , of} from 'rxjs';
import { catchError } from 'rxjs/operators';


export interface Product {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  images: Array<{ src: string; alt: string }> | undefined;
  categories: Array<{ id: number; name: string; slug: string }>;
  stock_status: string;
  stock_quantity: number | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: { src: string };
}


// أضف هذه الواجهات مع الواجهات الموجودة
export interface Review {
  id: number;
  date_created: string;
  review: string; // نص التقييم
  rating: number; // التقييم من 1 إلى 5
  name: string;   // اسم المقيّم
  email: string;
  reviewer: string;
  product_id: number;
  status: 'approved' | 'hold'; // حالة التقييم
}

export interface CreateReview {
  product_id: number;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class WoocommerceService {
  private apiUrl = 'https://osus-alhalwa.com/backend/wp-json/wc/v3';

  // *** هام: يجب استبدال هذا الرابط برابط API الخاص بك لاستقبال طلبات التوظيف ***
  private jobApplicationUrl = 'https://osus-alhalwa.com/backend/wp-json/jobs/v1/apply';

  // مفاتيح WooCommerce API
  private consumerKey = 'ck_1a2a7e1c3401902ed5216a743170e150e4b85ef7';
  private consumerSecret = 'cs_0077910305f833dd9abc9ec1334e44407b9ef853';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);
    return new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    });
  }


  private handleError(operation = 'operation', result?: any) {
    return (error: any): Observable<any> => {
      console.error(`${operation} failed: ${error.message}`, error);
      if (result) {
        return of(result);
      }
      return throwError(() => new Error(`${operation} failed.`));
    };
  }

  // دالة خاصة لإرسال البيانات والملفات (FormData)
  // لا نستخدم Content-Type: application/json هنا، بل نترك HttpClient يحددها كـ multipart/form-data
  private getFileAuthHeaders(): HttpHeaders {
    const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);
    return new HttpHeaders({
      'Authorization': `Basic ${auth}`
      // لا تضع Content-Type هنا، سيتم تعيينها تلقائياً كـ multipart/form-data
    });
  }

  /** 💼 التوظيف **/
    submitJobApplication(formData: FormData): Observable<any> {
    return this.http.post(this.jobApplicationUrl, formData);
  }



  /** 🛍️ المنتجات **/
  getProducts(params?: any): Observable<Product[]> {
    const queryParams = new URLSearchParams(params || {}).toString();
    return this.http.get<Product[]>(`${this.apiUrl}/products?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`, {
      headers: this.getAuthHeaders()
    });
  }


  updateOrderStatus(orderId: string, status: string): Observable<any> {
  // 1. استخدام المسار الصحيح لووكومرس
  const endpoint = `${this.apiUrl}/orders/${orderId}`;
  const body = { status: status };

  console.log(`Sending PUT request to: ${endpoint}`); // للتأكد من المسار

  // 2. استخدام Basic Auth في الهيدر (الطريقة الصحيحة لطلبات PUT)
  return this.http.put(endpoint, body, {
    headers: this.getAuthHeaders( ) // <-- استخدام الدالة المساعدة للمصادقة
  }).pipe(
    // يمكنك إضافة معالجة أخطاء مخصصة هنا إذا أردت
    catchError(this.handleError(`updateOrderStatus id=${orderId}`))
  );
}



  getProductsByCategory(categoryId: number, params?: any): Observable<Product[]> {
    const queryParams = new URLSearchParams({
      ...params,
      category: categoryId.toString()
    }).toString();
    return this.http.get<Product[]>(`${this.apiUrl}/products?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
  }

  /** 📂 الفئات **/
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/products/categories`, {
      headers: this.getAuthHeaders()
    });
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/products/categories/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /** 💳 طرق الدفع **/
  getPaymentGateways(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/payment_gateways`, {
      headers: this.getAuthHeaders()
    });
  }

  /** 🧾 الطلبات **/
  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  getOrder(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/orders/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getOrders(params?: any): Observable<any[]> {
    const queryParams = new URLSearchParams(params || {}).toString();
    return this.http.get<any[]>(`${this.apiUrl}/orders?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCustomerByEmail(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customers?email=${email}`, {
      headers: this.getAuthHeaders()
    });
  }

  validateCoupon(code: string) {
  return this.http.get<any[]>(
    `${this.apiUrl}/coupons?code=${code}`,
    { headers: this.getAuthHeaders() }
  );
}


getProductReviews(params?: any): Observable<Review[]> {
    const queryParams = new URLSearchParams(params || {}).toString();
    // ملاحظة: نقطة النهاية هي /products/reviews وليس /reviews
    return this.http.get<Review[]>(`${this.apiUrl}/products/reviews?${queryParams}`, {
      headers: this.getAuthHeaders( )
    });
  }

createProductReview(reviewData: CreateReview): Observable<Review> {
  // أضفنا الـ headers التي تحتوي على معلومات المصادقة
  return this.http.post<Review>(`${this.apiUrl}/products/reviews`, reviewData, {
    headers: this.getAuthHeaders( )
  });
}

}
