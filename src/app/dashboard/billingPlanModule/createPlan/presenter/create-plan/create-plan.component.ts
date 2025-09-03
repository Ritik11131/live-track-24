import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreatePlanRepository } from '../../domain/create-plan.repository';
import { CreatePlanService } from '../../domain/create-plan.service';
import { CommonUtils } from 'src/app/utils/commonUtils';
@Component({
  selector: 'app-create-plan',
  standalone: true,
  imports: [InputTextModule,ButtonModule,FormsModule,CommonModule],
  templateUrl: './create-plan.component.html',
  styleUrl: './create-plan.component.scss',
  providers:[CreatePlanRepository]
})
export class CreatePlanComponent {
  inputValue: string = '';
  title:string='';
id!:number;
userId!:number;
  constructor( private createPlanService:CreatePlanService,
    private createPlanRepo:CreatePlanRepository) { }


  onConfirm() {
    if(this.id===0 && this.userId===0){
      const payload={
        PlanName:this.inputValue
      }
      this.createPlanRepo.createCustomerPlan(payload).subscribe((data)=>{
        console.log(data);
        this.createPlanService.close('yes');
  
      })
    }else{
      const payload={
        id:this.id,
        userId:this.userId,
        planName:this.inputValue,
        creationTime:CommonUtils.addTimeZone((new Date()).toString()),
              lastUpdateTime:CommonUtils.addTimeZone((new Date()).toString()),
      }
      this.createPlanRepo.updateCustomerPlan(payload).subscribe((data)=>{
        console.log(data);
        this.createPlanService.close('yes');
  
      })
    }

  }

  onCancel() {
    this.createPlanService.close('no');
  }
}
