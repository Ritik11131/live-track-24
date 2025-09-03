import {DatePipe} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {GeocodingService} from '../service/geocoding.service';
import * as moment from 'moment-timezone';
import {MessageService} from "primeng/api";

export class CommonUtils {

    static messageService: MessageService; // Declare messageService as a static property

    constructor(private messageService: MessageService
    ) {
    }

    static datePipe = new DatePipe('en-US');
    static httpClient: HttpClient; // Declare httpClient as a static property

    // Constructor to initialize httpClient
    static init(httpClient: HttpClient, messageService: MessageService) {
        this.httpClient = httpClient;
        this.geoCoder = new GeocodingService(httpClient);
        this.messageService = messageService;

    }

    static geoCoder: GeocodingService; // Declare geoCoder as a static property

    static calculateDuration(startTime: Date, endTime: Date): string {
        if (
            startTime.toISOString().includes('0001') ||
            startTime.toISOString().includes('1970') ||
            endTime.toISOString().includes('0001') ||
            endTime.toISOString().includes('1970')
        ) {
            return '00:00';
        }

        const durationInMilliseconds = endTime.getTime() - startTime.getTime();
        const durationInSeconds = durationInMilliseconds / 1000;

        // Calculate hours, minutes, and seconds
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = Math.floor(durationInSeconds % 60);

        // Format the duration string
        let durationString = '';

        if (hours > 0) {
            durationString += `${hours} hour `;
        }

        if (minutes > 0) {
            durationString += `${minutes} min `;
        }

        if (seconds > 0 || (hours === 0 && minutes === 0)) {
            durationString += `${seconds} sec`;
        }

        return durationString.trim();
    }

    static addTimeZone(dateTime: string) {
        const userTimeZone = moment.tz.guess();
        return moment(dateTime).tz(userTimeZone).format("yyyy-MM-DDTHH:mm:ssZ");
    }

    static convertTimeDuration(input: string | undefined): string | undefined {
        const regex = /(\d{2}):(\d{2}):(\d{2})/;
        const match = input?.match(regex);

        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);

            let result = '';

            if (hours > 0) {
                result += `${hours} hour `;
            }

            if (minutes > 0) {
                result += `${minutes} min `;
            }

            if (seconds > 0) {
                result += `${seconds} sec `;
            }

            if (result === '') {
                result = 'less than a minute';
            }

            const status = input?.split(' ')[0];

            return `${status} since (${result})`;
        }

        return input;
    }

    static convertUTCToIST(utcDate: string): string {
        //it will handle the case if the utcDate is null
        if (!utcDate) {
            const currentDate = new Date();
            const formattedDate = this.datePipe.transform(currentDate, 'yyyy-MM-dd HH:mm:ss', '+0530');
            if (formattedDate) {
                return formattedDate;
            } else {
                return ''; // Handle the case where formatting fails
            }
        }
        const date = new Date(utcDate);

        const istDate = this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss', '+0530');

        if (istDate === null) {
            return '';
        }

        return istDate;
    }

    static checkUndefined(value: any, defaultValue: any) {
        if (value === undefined || value === null) return defaultValue;
        return value
    }

    static doesValueExist(value: any): boolean {
        return value !== undefined && value !== null;
    }

    static toastMessage(severity: string, summary: string, detail: string) {
        this.messageService.add({
            severity: severity,
            summary: summary,
            detail: detail == undefined ? "Something went wrong" : detail,
        });
    }




    static formatDateTime(dateTimeStr: string) {
        // Create a new Date object from the input string
        const date = new Date(dateTimeStr);
    
        // Define an array of day names and month names
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
        // Adjust for the 5:30 time difference
        date.setUTCMinutes(date.getUTCMinutes() + 330); // 5 hours and 30 minutes is 330 minutes
    
        // Get individual date and time components
        const dayName = days[date.getUTCDay()];
        const monthName = months[date.getUTCMonth()];
        const day = date.getUTCDate();
        const year = date.getUTCFullYear();
        let hours = date.getUTCHours();
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
        // Determine AM/PM
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const hoursStr = String(hours).padStart(2, '0');
    
        // Format the date and time
        const formattedDateTime = `${dayName}, ${monthName} ${day} ${year} ${hoursStr}:${minutes}:${seconds}${ampm}`;
    
        return formattedDateTime;
    }
    
    

}
