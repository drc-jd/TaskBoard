import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../Class/Common/ApiResponse';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class DatewiseTasksReportService {

    constructor(private http: HttpClient) { }

    async Data(paramList: object): Promise<ApiResponse> {
        return await this.http.post(environment.apiBaseUrl + "DatewiseTasksReport/Data", paramList)
            .toPromise() as ApiResponse;
    }
}