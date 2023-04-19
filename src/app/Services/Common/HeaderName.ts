import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class HeaderNameService {

    //#region Declaration
    public HeaderName = new Subject<string>();
    //#endregion

    constructor() { }

    public NewHeaderName(newName: string) {
        this.HeaderName.next(newName);
    }

}