import { AfterViewInit, Component, OnInit } from "@angular/core";
import { InputTextModule } from "primeng/inputtext";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { MultiSelectModule } from "primeng/multiselect";
import { Device } from "src/app/models/device";
import { ToastService } from "src/app/service/toast.service";
import { GeofenceLinkRepository } from "../../domain/linkGeofence.repository";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
} from "@angular/forms";
import { GeofenceLinkService } from "../../domain/linkGeofence.service";
import { ReactiveFormsModule } from "@angular/forms";
import { User } from "src/app/dashboard/user/models/user.model";
@Component({
  selector: 'app-link-geofence',
  standalone: true,
  imports: [
    InputTextModule,
    FormsModule,
    RippleModule,
    ButtonModule,
    ReactiveFormsModule,
    MultiSelectModule  ],  templateUrl: './link-geofence.component.html',
  styleUrl: './link-geofence.component.scss',
  providers: [GeofenceLinkRepository],

})
export class LinkGeofenceComponent {
  devices!: Device[];
  geofenceLinkForm!: FormGroup;
  geofenceId!: number ;
  geofenceName!: string ;


  constructor(
    private fb: FormBuilder,
private toastService:ToastService,
    private geofenceLinkRepository: GeofenceLinkRepository,
    private geofenceLinkService: GeofenceLinkService
  ) {
    this.geofenceLinkForm = this.fb.group({
   
      geofenceName: new FormControl("", [
        Validators.required,
      ]),
      devices:[[]],
      selectedDevices: new FormControl(),

    });
  }    ngOnInit(): void {
    this.getDeviceList();
this.patchValues(this.geofenceName) 
  }
patchValues(geofenceName:string){
  this.geofenceLinkForm.patchValue({ geofenceName: geofenceName });

}
  getDeviceList(): void {
    this.devices = [];
    this.geofenceLinkRepository.getDeviceData().subscribe(
      (d) => {
        this.devices = d;

      }
    );
  }
  onConfirm(
    
  ){    const values=this.geofenceLinkForm.get("selectedDevices")?.value;
  const deviceIds = values.map((x:any) => x.id);
  this.geofenceLinkRepository.linkGeofence(this.geofenceId,deviceIds).subscribe((data)=>{
this.geofenceLinkService.close("yes");

  },this.toastService.errorToast)

}  

  onCancel() {
    this.geofenceLinkService.close("no");
  }}

