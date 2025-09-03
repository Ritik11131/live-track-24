import { Component, ViewChild } from "@angular/core";
import { VehicleListService } from "src/app/service/vehicle-list.service";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import * as moment from "moment";
import { FileUploadService } from "../../domain/file-upload.service";
import { CommonModule } from "@angular/common";
import * as XLSX from "xlsx";
import { Table, TableModule } from "primeng/table";
import { Router, ActivatedRoute } from "@angular/router";
import { DeviceService } from "src/app/service/device.service";
interface FileContent {
  headers: string[];
  rows: any[][];
}

@Component({
  selector: "app-file-upload",
  standalone: true,
  imports: [ButtonModule, CommonModule, InputTextModule, TableModule],
  templateUrl: "./file-upload.component.html",
  styleUrl: "./file-upload.component.scss",
})
export class FileUploadComponent {
  file: File | null = null;
  uploading = false;
  progress = 0;
  tableRowsData: any = [];
  userId!: number;
  @ViewChild("dataTable") dataTable!: Table;

  showModal: boolean = false;
  fileContent: FileContent = { headers: [], rows: [] };
  excelData!: any[][];
  headers = [
    "deviceId",
    "deviceImei",
    "fkDeviceType",
    "fkSimOperator",
    "simPhoneNumber",
    "fkSecSimOperator",
    "secSimPhoneNumber",
    "vehicleNo",
    "fkVehicleType",
    "description",
  ];

  fileHeaders = [
    "Unique Id",
    "Device IMEI",
    "Device Type",
    "Primary Sim Operator",
    "Primary Sim Number",
    "Secondary Sim OPerator",
    "Secondar Sim Number",
    "Vehicle Number",
    "Vehcile Type",
    "Description",
  ];
  constructor(
    private vehicleListRepo: VehicleListService,
    private router: Router,
    private route: ActivatedRoute,
    private deviceService: DeviceService,
    private fileUploadService: FileUploadService
  ) {}

  closeFileUploadForm() {}

  onFileChange(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.file = fileList[0];
    }
    this.previewFile();
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.file = files[0];
    }
  }

  selectFile(): void {
    // Get the file input element by its ID
    const fileInput = document.getElementById("files") as HTMLInputElement;
    // Trigger the click event
    fileInput.click();
  }

  downloadHeaderAsExcel() {
    const wsData: any[][] = [this.fileHeaders]; // Wrap headers in another array to create a 2D array

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData); // Convert data to worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${name}_header.xlsx`); // Save the file with the report name and '_header' suffix
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  uploadFile() {
    if (
      this.dataTable &&
      this.dataTable.value &&
      this.dataTable.value.length > 0
    ) {
      this.dataTable.value.forEach((rowArray) => {
        const rowData: any = {};
        // Loop through each value in the row array and map it to corresponding header
        rowArray.forEach((value: any, index: any) => {
          rowData[this.headers[index]] = value;
        });
        rowData["deviceImei"] = String(rowData["deviceImei"]);
        rowData["simPhoneNumber"] = String(rowData["simPhoneNumber"]);
        rowData["secSimPhoneNumber"] = String(rowData["secSimPhoneNumber"]);
        rowData["deviceId"] = String(rowData["deviceId"]);
        rowData["id"] = 0;
        rowData["deviceUid"] = null;
        // rowData['fkCustomerId'] = 0;
        rowData["fkDeviceType"] =
          this.deviceService.deviceType.find(
            (type) => type.name === rowData["fkDeviceType"]
          )?.id || null;

        rowData["fkVehicleType"] =
          this.deviceService.vehicleType.find(
            (type) => type.name === rowData["fkVehicleType"]
          )?.id || null;

        rowData["fkSecSimOperator"] =
          this.deviceService.operatorType.find(
            (type) => type.name === rowData["fkSecSimOperator"]
          )?.id || null;

        rowData["fkSimOperator"] =
          this.deviceService.operatorType.find(
            (type) => type.name === rowData["fkSimOperator"]
          )?.id || null;
        rowData["installationOn"] = moment().format("YYYY-MM-DD");
        rowData["lastUpdateOn"] = moment().format(
          "YYYY-MM-DDTHH:mm:ss.SSSSSSS[Z]"
        );
        rowData["creationTime"] = moment().format(
          "YYYY-MM-DDTHH:mm:ss.SSSSSSS[Z]"
        );

        // Push the rowData object to tableRowsData
        this.tableRowsData.push(rowData);
      });
    }
    this.deviceService.createBulkDevice(this.tableRowsData,this.userId).subscribe(
      (response) => {
this.fileUploadService.close("done")
      },
      (error:any) => {
        this.fileUploadService.close(error)
      }
  );  }

  resetUpload() {
this.fileUploadService.close('')
    this.file = null;
    this.progress = 0;
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      this.excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    };
    reader.readAsArrayBuffer(file);
  }

  previewFile() {
    if (this.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          const fileData = e.target.result as ArrayBuffer;
          const data = new Uint8Array(fileData);
          const workbook = XLSX.read(data, { type: "array", cellStyles: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const range = worksheet["!ref"];
          if (!range) {
            console.error("Worksheet range is not defined.");
            return;
          }

          const decodedRange = XLSX.utils.decode_range(range);
          const headers = [];

          for (
            let colNum = decodedRange.s.c;
            colNum <= decodedRange.e.c;
            colNum++
          ) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colNum });
            const cellValue =
              (worksheet[cellAddress] && worksheet[cellAddress].v) || "";
            headers.push(cellValue);
          }

          const rows = [];

          for (
            let rowNum = decodedRange.s.r + 1;
            rowNum <= decodedRange.e.r;
            rowNum++
          ) {
            const row = [];

            for (
              let colNum = decodedRange.s.c;
              colNum <= decodedRange.e.c;
              colNum++
            ) {
              const cellAddress = XLSX.utils.encode_cell({
                r: rowNum,
                c: colNum,
              });
              const cellValue =
                (worksheet[cellAddress] && worksheet[cellAddress].v) || "";
              row.push(cellValue);
            }

            rows.push(row);
          }

          this.fileContent = { headers, rows };
          this.showModal = true;
        } else {
          console.error("Event target is null.");
        }
      };
      reader.readAsArrayBuffer(this.file);
    }
  }

  closeModal() {
    this.showModal = false;
  }
}
