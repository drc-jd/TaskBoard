import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})

export class ErrorDialogueService {

    constructor(private toastr: ToastrService) { }

    public error(err: any) {
        let message = "";
        if (err) {
            if (typeof err == "string")
                message = err;
            else if (typeof err.error == "string")
                message = err.error;
            else if (err["stack"])
                message = err["message"];
            else
                message = err.statusText;
        }
        this.toastr.error(message);
    }
    public warning(err: any) {
        let message = "";
        if (err) {
            if (typeof err == "string")
                message = err;
            else if (typeof err.error == "string")
                message = err.error;
            else if (err["stack"])
                message = err["message"];
            else
                message = err.statusText;
        }
        this.toastr.warning(message);
    }
}