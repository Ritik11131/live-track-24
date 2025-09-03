import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { DeviceTypeService } from '../../domain/device-type-list.service';
import { ToastService } from 'src/app/service/toast.service';
@Component({
  selector: 'app-device-type-list',
  standalone: true,
  imports: [TableModule],
  templateUrl: './device-type-list.component.html',
  styleUrl: './device-type-list.component.scss'
})
export class DeviceTypeListComponent implements OnInit{
deviceTypes!:any;
constructor(private deviceTypeService:DeviceTypeService,private toastService:ToastService){
  
}
ngOnInit(): void {
  this.getDeviceTypeList()
}
getDeviceTypeList(){
  this.deviceTypeService.getDeviceType().subscribe((response: any) => {
    this.deviceTypes=response
    console.log(this.deviceTypes)
},(error:any)=>{this.toastService.showErrorToast("Some error occured while getting te toast list")})

}
close(){
  this.deviceTypeService.close('no')
}
}