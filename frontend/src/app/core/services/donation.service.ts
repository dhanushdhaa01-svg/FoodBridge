import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { API_BASE_URL, DONATION_ENDPOINTS } from '../constants/api.constants';
import { Donation, DonationListResponse, CreateDonationPayload } from '../models/donation.model';

@Injectable({ providedIn: 'root' })
export class DonationService {
  private readonly http = inject(HttpClient);

  createDonation(data: CreateDonationPayload): Observable<Donation> {
    return this.http.post<{ success: boolean; message: string; data: { donation: Donation } }>(
      `${API_BASE_URL}${DONATION_ENDPOINTS.CREATE}`,
      data
    ).pipe(
      map(response => response.data.donation)
    );
  }

  listAvailableDonations(filters: { city?: string; foodType?: string; quantityUnit?: string; page?: number; limit?: number } = {}): Observable<DonationListResponse> {
    const params: Record<string, string | number> = {};

    if (filters.city) params['city'] = filters.city;
    if (filters.foodType) params['foodType'] = filters.foodType;
    if (filters.quantityUnit) params['quantityUnit'] = filters.quantityUnit;
    if (filters.page) params['page'] = filters.page;
    if (filters.limit) params['limit'] = filters.limit;

    return this.http.get<{ success: boolean; message: string; data: DonationListResponse }>(
      `${API_BASE_URL}${DONATION_ENDPOINTS.LIST}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  listMyDonations(filters: { status?: string; page?: number; limit?: number } = {}): Observable<DonationListResponse> {
    const params: Record<string, string | number> = {};

    if (filters.status) params['status'] = filters.status;
    if (filters.page) params['page'] = filters.page;
    if (filters.limit) params['limit'] = filters.limit;

    return this.http.get<{ success: boolean; message: string; data: DonationListResponse }>(
      `${API_BASE_URL}${DONATION_ENDPOINTS.MY}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  getDonationById(id: string): Observable<Donation> {
    return this.http.get<{ success: boolean; message: string; data: { donation: Donation } }>(
      `${API_BASE_URL}${DONATION_ENDPOINTS.DETAIL}/${id}`
    ).pipe(
      map(response => response.data.donation)
    );
  }

  claimDonation(id: string): Observable<Donation> {
    return this.http.post<{ success: boolean; message: string; data: { donation: Donation } }>(
      `${API_BASE_URL}${DONATION_ENDPOINTS.CLAIM}/${id}/claim`,
      {}
    ).pipe(
      map(response => response.data.donation)
    );
  }

  cancelClaim(id: string): Observable<Donation> {
    return this.http.post<{ success: boolean; message: string; data: { donation: Donation } }>(
      `${API_BASE_URL}${DONATION_ENDPOINTS.CANCEL_CLAIM}/${id}/cancel-claim`,
      {}
    ).pipe(
      map(response => response.data.donation)
    );
  }

  completeDonation(id: string): Observable<Donation> {
    return this.http.post<{ success: boolean; message: string; data: { donation: Donation } }>(
      `${API_BASE_URL}${DONATION_ENDPOINTS.COMPLETE}/${id}/complete`,
      {}
    ).pipe(
      map(response => response.data.donation)
    );
  }

  listMyClaims(filters: { status?: string; page?: number; limit?: number } = {}): Observable<DonationListResponse> {
    const params: Record<string, string | number> = {};

    if (filters.status) params['status'] = filters.status;
    if (filters.page) params['page'] = filters.page;
    if (filters.limit) params['limit'] = filters.limit;

    return this.http.get<{ success: boolean; message: string; data: DonationListResponse }>(
      `${API_BASE_URL}${DONATION_ENDPOINTS.MY_CLAIMS}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  listAllDonations(filters: { status?: string; city?: string; foodType?: string; page?: number; limit?: number } = {}): Observable<DonationListResponse> {
    const params: Record<string, string | number> = {};

    if (filters.status) params['status'] = filters.status;
    if (filters.city) params['city'] = filters.city;
    if (filters.foodType) params['foodType'] = filters.foodType;
    if (filters.page) params['page'] = filters.page;
    if (filters.limit) params['limit'] = filters.limit;

    return this.http.get<{ success: boolean; message: string; data: DonationListResponse }>(
      `${API_BASE_URL}${DONATION_ENDPOINTS.ALL}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  cancelDonation(id: string, cancellationReason?: string): Observable<Donation> {
    return this.http.post<{ success: boolean; message: string; data: { donation: Donation } }>(
      `${API_BASE_URL}${DONATION_ENDPOINTS.CANCEL}/${id}/cancel`,
      cancellationReason ? { cancellationReason } : {}
    ).pipe(
      map(response => response.data.donation)
    );
  }
}
