import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../Class/Common/ApiResponse';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class TaskService {

    constructor(private http: HttpClient) { }

    async Data(paramList: object): Promise<ApiResponse> {
        return await this.http.post(environment.apiBaseUrl + "Task/Data", paramList)
            .toPromise() as ApiResponse;
    }
    async uploadFile(files: any, taskId: string, Role: string, CSrNo: number = 0): Promise<ApiResponse> {
        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));
        // formData.append('taskId', taskId)
        return await this.http.post(environment.apiBaseUrl + "Task/Upload/" + taskId + "/" + Role + "/" + CSrNo, formData)
            .toPromise() as ApiResponse;
    }
    async Download(fileName: string): Promise<any> {
        // let parmas = new HttpParams().set('FileName', fileName)
        window.location.href = environment.apiBaseUrl + "Task/Download/" + fileName;
        // return await this.http.get(environment.apiBaseUrl + "Task/Download/", { params: parmas })
        //     .toPromise() as any;
    }
}