import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:5000/employees';

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<any> {  // Ensure this returns an Observable
    return this.http.get<any>(this.apiUrl);
  }

  addEmployee(employee: any): Observable<any> {  // Ensure this returns an Observable
    return this.http.post<any>(this.apiUrl, employee);
  }

  updateEmployee(id: string, employee: any): Observable<any> {  // Ensure this returns an Observable
    return this.http.put<any>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: string): Observable<any> {  // Ensure this returns an Observable
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
