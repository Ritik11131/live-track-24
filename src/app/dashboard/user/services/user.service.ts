import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, map, Observable, pipe, Subject } from "rxjs";
import { User } from "../models/user.model";
import { environment } from "../../../../environments/environment";
import { LayoutService } from "src/app/layout/service/app.layout.service";
import { AuthService } from "src/app/service/auth.service";
@Injectable({
  providedIn: "root",
})
export class UserService {
  userTypes: { label: string; value: number }[];
  private userLoginId = new BehaviorSubject<number >(0);
  currentuserLoginId = this.userLoginId.asObservable();
  constructor(private client: HttpClient, public layoutService: LayoutService,private authService:AuthService) {
    this.userTypes = this.authService.userType=="Customer"
        ? [{ label: "Customer", value: 2 }]
        : [
          { label: "Customer", value: 2 },
          { label: "Dealer", value: 1 },
        ];
  }
  changeLoginId(loginId: number) {
    this.userLoginId.next(loginId);
  }
  getUserTypeLabel(type: number): string {
    const user = this.userTypes.find((v) => v.value == type);
    return user ? user.label : "Unknown";
  }

  createUser(user: User): Observable<any> {
    return this.client.post<User>(`${environment.url}/api/User`, user).pipe(
        map((res: any) => {
          return res["data"];
        })
    );
  }

  updateUser(id: number, user: User): Observable<any> {
    return this.client.put<any>(`${environment.url}/api/User/${id}`, user).pipe(
        map((res: any) => {
          return res["data"];
        })
    );
  }

  getUsers(): Observable<User[]> {
    return this.client.get<User[]>(`${environment.url}/api/User`).pipe(
        map((res: any) => {
          return res["data"];
        })
    );
  }

  getUser(id: number): Observable<User> {
    return this.client.get<User>(`${environment.url}/api/User/${id}`).pipe(
        map((res: any) => {
          return res["data"];
        })
    );
  }

  changePassword(data: any) {
    return this.client
        .post(`${environment.url}/api/User/ChangePassword`, data)
        .pipe(
            map((res: any) => {
              return res["data"];
            })
        );
  }

  deleteUser(id: number) {
    return this.client.delete(`${environment.url}/api/User/${id}`);
  }
}
