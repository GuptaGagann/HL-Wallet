import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public initialSetup(walletSetupDetails: any): Observable<any> {
    console.log(walletSetupDetails);
    return this.http.post<any>(this.baseUrl + `setup`, walletSetupDetails);
  }

  public getWalletDetails(walletId: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `walletDetails/${walletId}`);
  }

  public addTransaction(walletId: number, transaction: any): Observable<any> {
    return this.http.put<any>(
      this.baseUrl + `/transact/${walletId}`,
      transaction
    );
  }

  public getTransactions(skip: number = 0, limit: number = 10): Observable<any> {
    return this.http.get<any>(this.baseUrl + `transactions?skip=${skip}&limit=${limit}`);
  }

  public getTransactionsByWalletId(walletId: number, skip: number = 0, limit: number = 10): Observable<any> {
    return this.http.get<any>(
      this.baseUrl + `transactions?walletId=${walletId}&skip=${skip}&limit=${limit}`
    );
  }
}
