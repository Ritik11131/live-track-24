import {Component, Inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {FormsModule} from "@angular/forms";
import {DeviceTrackingRepository} from "../../domain/deviceTracking.repository";
import {ToastService} from "src/app/service/toast.service";
import {DevicetrackingService} from "../../domain/devicetracking.service";
import {DatePipe} from "@angular/common";
import {InputTextModule} from "primeng/inputtext";
import {TooltipModule} from "primeng/tooltip";
import {environment} from "src/environments/environment";
import {CommonUtils} from "src/app/utils/commonUtils";
import {DOCUMENT} from '@angular/common';

@Component({
    selector: "app-device-tracking-link",
    standalone: true,
    imports: [CommonModule, InputTextModule, CalendarModule, TooltipModule, FormsModule],
    templateUrl: "./device-tracking-link.component.html",
    styleUrl: "./device-tracking-link.component.scss",
    providers: [DeviceTrackingRepository],
})
export class DeviceTrackingLinkComponent implements OnInit {
    date: Date = new Date();
    deviceTrackingLink: string = "";
    deviceId!: number;
    minDate: Date = new Date();
    baseUrl: string = '';
    fullUrl:string='';
    constructor(
        private deviceTrackingRepository: DeviceTrackingRepository,
        private devicetrackingService: DevicetrackingService,
        private toastService: ToastService,
        private datepipe: DatePipe,
        @Inject(DOCUMENT) private document: Document
    ) {
    }

    ngOnInit(): void {
        const {protocol, hostname, port} = this.document.location;
        this.baseUrl = `${protocol}//${hostname}/#`;
    }

    submit() {
        const transformedDate = this.datepipe.transform(this.date, 'yyyy-MM-dd HH:mm:ss');
        const payload = {
            DeviceId: this.deviceId,
            validTill: transformedDate ? CommonUtils.addTimeZone(transformedDate).toString() : ''
        };
        this.deviceTrackingRepository.generateTrackingLink(payload).subscribe(
            (response) => {
                const id = this.extractIdFromResponse(response);
                this.fullUrl = this.baseUrl + "/track" + "/" + id;
                this.deviceTrackingLink = this.fullUrl;
            },
            (e) => {
                this.toastService.toastMessage("error","Message", e.error.data);
            }
        );
    }

    closeDialogBox() {
        this.devicetrackingService.close("cancel");
    }

    extractIdFromResponse(response: any): string {
        // Extract the id from the response string
        const match = response.match(/\?id=([^&]*)/);
        return match ? match[1] : '';
    }

    copyToClipboard() {
        if (this.deviceTrackingLink) {
            navigator.clipboard.writeText(this.deviceTrackingLink).then(() => {
                // Optionally, show a notification or toast message
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        }
    }
    openLink(){
        window.open(this.fullUrl, '_blank');
    }
}
