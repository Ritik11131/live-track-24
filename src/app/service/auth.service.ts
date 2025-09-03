import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { jwtDecode } from "jwt-decode";
import { environment } from "../../environments/environment";
import { Router } from "@angular/router";
import { config } from "src/config";

import { LayoutService } from '../layout/service/app.layout.service';
import { FirebaseService } from "src/app/firebase_service/firebase.service";
import { ConfigService } from "src/app/service/config.service";
import { DefaultConfig } from "../../defaultConfig";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public currentToken: string = "";
    public isLoginInAsChild: boolean = false;
    public username: string = "";
    public userType: string = "";

    constructor(
        private httpClient: HttpClient,
        private firebaseService: FirebaseService,
        private configService: ConfigService,
        private router: Router,
        private layoutService: LayoutService
    ) {
        this.resetToken();
    }

    private decodeToken(token: string): any {
        return jwtDecode(token);
    }

    private setUserDetails(decodedToken: any): void {
        this.username = decodedToken.unique_name || "";
        this.userType = decodedToken.role === "2" ? "Customer" : "Admin";
    }

    resetToken(): void {
        this.isLoginInAsChild = false;
        this.currentToken = localStorage.getItem('jwtToken') || '';
        this.username = localStorage.getItem("userName") || "";

        if (this.currentToken) {
            const decoded = this.decodeToken(this.currentToken);
            this.setUserDetails(decoded);
        }
    }

    loadChildToken(token: string): void {
        this.currentToken = token;
        this.getConfigJson(this.currentToken);
        const decoded = this.decodeToken(token);
        this.setUserDetails(decoded);
        this.isLoginInAsChild = true;
    }

    setupUserData(token: string): void {
        const decoded = this.decodeToken(token);
        localStorage.setItem('userName', decoded.unique_name || "");
        this.setUserDetails(decoded);
        this.currentToken = token;
    }

    getUserName(): string {
        return this.username;
    }

    logout(): void {
        console.log("logout from app service");
this.resetToken()
        localStorage.clear();
        this.getConfigJson('');
        this.router.navigate(['/auth/login']);
    }

    childLogin(request: any): Observable<string> {
        return this.httpClient.post<string>(`${environment.url}/api/token`, request)
            .pipe(map((res: any) => {
                this.loadChildToken(res.data);
                this.router.navigate(['/']);
                return res.data;
            }));
    }

    childLogout(): void {
        this.resetToken();
        this.router.navigate(['/user']);
    }

    login(request: any): Observable<string> {
        return this.httpClient.post<string>(`${environment.url}/api/token`, request)
            .pipe(map((res: any) => {
                this.setupUserData(res.data);
                return res.data;
            }));
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('jwtToken');
    }

    private getConfigJson(token: string): void {
        if (!token) return;

        const decoded = this.decodeToken(token);
        const userId = decoded.user_id;

        if (userId) {
            this.firebaseService.getUserConfig(userId).subscribe(
                (data) => {
                    config.configJson = data;
                    this.configService.setConfigSubjectfn(true);
                },
                (error) => {
                    console.error(error);
                    config.configJson = DefaultConfig;
                    this.configService.setConfigSubjectfn(true);
                }
            );
        } else {
            this.firebaseService.getAllUserConfigs().subscribe(
                (data) => console.log(data)
            );
        }
    }
}
