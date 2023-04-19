import { Injectable } from "@angular/core";
import * as _ from 'underscore';
import { DatePipe } from "@angular/common";

@Injectable()
export class Helper {
    constructor() { }
    public IntToLetters(value: number): string {
        const code = 'A'.charCodeAt(0) - 1;
        return String.fromCharCode(code + value);
    }
    public bindDropdownOfStringArray(str: string[], optionalValue: string = "ALL"): string[] {
        let strArry: string[] = [optionalValue];
        str.forEach(element => {
            strArry.push(element)
        });
        return strArry;
    }
    public getString(value: any): string {
        if (!value) {
            value = "-";
        }
        return value.toString();
    }
    public getStringOrEmpty(str): string {
        if (str == undefined || str == null)
            return ""
        else
            return str
    }
    public getInt(value: any): number {
        if (!value || value == null) {
            value = 0;
        }
        if (isNaN(parseInt(value)))
            value = 0;
        return parseInt(value);
    }
    public getDecimal(value: any): number {
        if (!value || value == null) {
            value = 0;
        }
        if (isNaN(parseFloat(value)))
            value = 0;
        return parseFloat(value);
    }
    public IsNumeric(value: any): boolean {
        if (isNaN(parseFloat(value)))
            return false;
        else
            return true;
    }
    public arrayKeysUppercase(obj: object[]) {
        obj = obj.map(function (item) {
            for (var key in item) {
                var upper = key.toUpperCase();
                // check if it already wasn't uppercase
                if (upper !== key) {
                    item[upper] = item[key];
                    delete item[key];
                }
            }
            return item;
        });
    }
    public stringToDate(_date, _format, _delimiter) {
        var formatLowerCase = _format.toLowerCase();
        var formatItems = formatLowerCase.split(_delimiter);
        var dateItems = _date.split(_delimiter);
        var monthIndex = formatItems.indexOf("mm");
        var dayIndex = formatItems.indexOf("dd");
        var yearIndex = formatItems.indexOf("yyyy");
        var month = parseInt(dateItems[monthIndex]);
        month -= 1;
        var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
        return formatedDate;
    }
    public TitleCase(str) {
        return str.replace(/\p{L}+('\p{L}+)?/gu, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.slice(1)
        })
    }
}
export enum MessageType {
    login = 0,
    success = 1,
    error = 2
}
export enum RoleType {
    ApprovalAuthority = 0,
    TaskIncharge = 1,
    Developer = 2
}
export const DefaultImage = {
    UserProfile: "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"
}