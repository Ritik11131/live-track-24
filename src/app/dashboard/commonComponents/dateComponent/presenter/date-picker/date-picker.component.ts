import { Component, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { CalendarModule } from "primeng/calendar";

import { CommonModule } from "@angular/common";
import { InputTextModule } from "primeng/inputtext";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { VehicleListService } from "src/app/service/vehicle-list.service";
import { CommonUtils } from "src/app/utils/commonUtils";

@Component({
  selector: "app-date-picker",
  standalone: true,
  imports: [
    CalendarModule,
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: "./date-picker.component.html",
  styleUrls: ["./date-picker.component.scss"],
  providers: [DatePipe],
})
export class DatePickerComponent implements OnInit {
  restrictDateRange: boolean = false;
  restrictDateComponents: boolean = false;
  allowedDateRange: number = 7;
  deviceId: number = 0;
  range: boolean = true;
  customRange: boolean = false;
  dateError1: boolean = false;
  date1!: Date;
  date2!: Date;
  date3!: Date;
  maxDate!: Date;
  selectedDateRange: string = "";

  constructor(
    private datePipe: DatePipe,
    private vehicleListRepo: VehicleListService
  ) {
    this.date1 = this.disableFutureDates(new Date());
    this.date2 = this.disableFutureDates(new Date());
    this.maxDate = this.disableFutureDates(new Date());
  }
  showResult(value: string) {
    if (value == "applyCustomRange") {
      if (this.date1 && this.date2) {
        const differenceInDays = Math.ceil(
          Math.abs(
            (this.date2.getTime() - this.date1.getTime()) / (1000 * 3600 * 24)
          )
        );

        if (
          differenceInDays > this.allowedDateRange &&
          this.restrictDateRange
        ) {
          this.dateError1 = true;
        } else if (this.date2.getTime() - this.date1.getTime() > 0) {
          const formattedDate1 = this.datePipe.transform(
            this.date1,
            "yyyy-MM-dd HH:mm:ss"
          );
          const formattedDate2 = this.datePipe.transform(
            this.date2,
            "yyyy-MM-dd HH:mm:ss"
          );
          this.selectedDateRange = `${formattedDate1}---${formattedDate2}`;
          this.vehicleListRepo.selectedDateRange = this.selectedDateRange;
          this.customRange = false;
        }
      } else {
      }
      const [part1, part2] = this.selectedDateRange.split("---");
      this.vehicleListRepo.updateSelectedDates(
        CommonUtils.addTimeZone(part1),
        CommonUtils.addTimeZone(part2)
      );
      this.closeUserLinkForm();
    } else if (value == "applyCustomDate") {
      if (this.date3) {
        this.selectedDateRange =
          this.formatDate(this.date3, "start") +
          "---" +
          this.formatDate(this.date3, "end");
        this.vehicleListRepo.selectedDateRange = this.selectedDateRange;
        this.customRange = false;
        const [part1, part2] = this.selectedDateRange.split("---");
        this.vehicleListRepo.updateSelectedDates(
          CommonUtils.addTimeZone(part1),
          CommonUtils.addTimeZone(part2)
        );
        this.closeUserLinkForm();
      }
    } else if (value == "applyDate") {
      const [part1, part2] = this.selectedDateRange.split("---");
      this.vehicleListRepo.updateSelectedDates(
        CommonUtils.addTimeZone(part1),
        CommonUtils.addTimeZone(part2)
      );

      this.closeUserLinkForm();
    } else {
      this.customRange = false;
    }
  }

  ngOnInit(): void {
    ({ restrictDateRange: this.restrictDateRange, restrictDateComponent: this.restrictDateComponents } = this.vehicleListRepo.getRestrictDateRange());

    // Initialize selectedDateRange with the value stored in the service
    this.selectedDateRange = this.vehicleListRepo.selectedDateRange;
  }

  // Function to handle changes to selectedDateRange
  handleDateRangeChange(): void {
    // Update the value in the service whenever it changes
    this.vehicleListRepo.selectedDateRange = this.selectedDateRange;
  }
  getPlaceholder(): string {
    // Check if selectedDateRange has a value
    if (this.selectedDateRange) {
      return this.selectedDateRange;
    } else {
      // If selectedDateRange is empty, return the current date as the placeholder
      return this.getCurrentDate();
    }
  }

  getCurrentDate(): string {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    return formattedDate;
  }
  showCustomRange() {
    this.customRange = true;
    this.range = false;
  }

  closeUserLinkForm() {
    this.vehicleListRepo.closeForm(false);
  }
  selectDateRange(range: string) {
    const today = new Date();
    let startDate: Date = new Date(); // Default value
    let endDate: Date = new Date(); // Default value

    switch (range) {
      case "today":
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case "yesterday":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate.setDate(today.getDate() - 1);
        break;
      case "last7days":
        // const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6); // Start of the current week
        endDate = new Date(today);
        break;
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today);
        break;
      default:
        // Handle custom range or other cases
        break;
    }

    // Format the dates as needed and assign to selectedDateRange

    this.selectedDateRange =
      this.formatDate(startDate, "start") +
      "---" +
      this.formatDate(endDate, "end");
    this.vehicleListRepo.selectedDateRange = this.selectedDateRange;
  }
  formatDate(date: Date, time: string): string {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return time === "start"
      ? `${year}-${month}-${day} 00:00:00`
      : `${year}-${month}-${day} 23:59:59`;
  }

  // Function to disable future dates for both Date 1 and Date 2
  disableFutureDates = (date: Date): Date => {
    const currentDate = new Date();
    // Disable if the provided date is in the future
    return date.getTime() > currentDate.getTime() ? currentDate : date;
  };
}
