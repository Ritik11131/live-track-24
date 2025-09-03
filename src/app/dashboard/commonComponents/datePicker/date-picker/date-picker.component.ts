import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CalendarModule } from "primeng/calendar";
import { InputTextModule } from "primeng/inputtext";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CommonUtils } from "src/app/utils/commonUtils";
import { DatePickerViewModel } from "src/app/viewModels/datePicker.viewModel";
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
  styleUrl: "./date-picker.component.scss",
})
export class DatePickerComponent {
  restrictDateRange: boolean = false;
  allowedDateRange: number = 7;
  range: boolean = true;
  customRange: boolean = false;
  dateError1: boolean = false;
  maxDate: Date=new Date();
  showCustomRange:boolean=false;
  selectedDateRange: string = "";
  startDate!: Date;
  endDate!: Date;
  customStartDate: Date=new Date();
  customEndDate: Date=new Date();
  formattedStartDate: string='';
  formattedEndDate: string='';
  closeUserLinkForm() {
    this.datePickerViewModel.close('no')
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
  }  handleDateRangeChange() {}
  constructor(private datePickerViewModel:DatePickerViewModel){}
  showResult() {
    console.log(this.startDate, this.endDate);
    
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > this.allowedDateRange) {
        this.dateError1 = true;
    } else {
this.datePickerViewModel.close(this.selectedDateRange)  }

    console.log('Date Range:', diffDays, 'days');
    console.log('Date Error:', this.dateError1);
}


  onSelectRange(range: string) {
    const today = new Date();
    switch (range) {
      case "today":
        this.showCustomRange=false;
        this.startDate = new Date(today)
        this.endDate = new Date(today)
        break;
      case "yesterday":
        this.showCustomRange=false;
        this.startDate = new Date(today);
        this.startDate.setDate(today.getDate() - 1);
        this.endDate.setDate(today.getDate() - 1);
        break;
      case "thisWeek":
        this.showCustomRange=false;
        this.startDate = new Date(today);
        this.startDate.setDate(today.getDate() - 6); // Start of the current week
        this.endDate = new Date(today);
        break;
      case "thisMonth":
        this.showCustomRange=false;
        this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.endDate = new Date(today);
        break;
      case "custom":
        this.showCustomRange=true;
        if (this.customStartDate && this.customEndDate) {
          this.startDate = this.customStartDate;
          this.endDate = this.customEndDate;
        }
        break;
    }

     this.formattedStartDate = this.formatDateUTC(this.startDate,"start");
     this.formattedEndDate = this.formatDateUTC(this.endDate,"end");
    this.selectedDateRange=CommonUtils.addTimeZone(this.formattedStartDate) + '---' + CommonUtils.addTimeZone(this.formattedEndDate);
    console.log(this.selectedDateRange)
  }

  formatDateUTC(date: Date, time: string): string {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return time === "start"
      ? `${year}-${month}-${day} 00:00:00`
      : `${year}-${month}-${day} 23:59:59`;
  }
}
