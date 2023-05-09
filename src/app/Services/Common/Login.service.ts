import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse } from '../../Class/Common/ApiResponse';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class LoginService {

    constructor(private http: HttpClient) { }

    async Data(paramList: object): Promise<ApiResponse> {
        return await this.http.post(environment.apiBaseUrl + "Login/Data", paramList)
            .toPromise() as ApiResponse;
    }
    async getToken(UserName: string, Password: string, GuId: string): Promise<any> {
        var data = "UserName=" + UserName + "&Password=" + Password + "&Id=" + GuId + "&client_id=ngAuthApp";
        var reqHeader = new HttpHeaders({ "Content-Type": "application/x-www-form-urlencoded" });
        return await this.http.post(environment.apiBaseUrl + "token", data, { headers: reqHeader })
            .toPromise() as any;
    }
}