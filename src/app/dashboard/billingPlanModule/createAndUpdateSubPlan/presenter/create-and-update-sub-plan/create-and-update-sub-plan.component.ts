import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateAndUpdateSubPlanService } from '../../domain/create-and-update-sub-plan.service';
import { CommonUtils } from 'src/app/utils/commonUtils';
import { createAndUpdateSubPlanRepository } from '../../domain/create-and-update-sub-plan.repository';
@Component({
  selector: 'app-create-and-update-sub-plan',
  standalone: true,
  imports: [InputTextModule,ButtonModule,FormsModule,CommonModule],
  templateUrl: './create-and-update-sub-plan.component.html',
  styleUrl: './create-and-update-sub-plan.component.scss',
  providers:[createAndUpdateSubPlanRepository]

})
export class CreateAndUpdateSubPlanComponent {
  id!:number;
  planId!:number;
  title!:string;
  name!:string;
  duration!:number;
  amount!:number;
  tax!:number;
  platformFee!:number;
  constructor( private createAndUpdateSubPlanService:CreateAndUpdateSubPlanService,
    private createAndUpdateSubPlanRepo:createAndUpdateSubPlanRepository) { }
  onConfirm() {
    if(this.id===0){
      const payload={
        planId:this.planId,
        name: this.name,
        duration:this.duration,
        DurationUnit:"days",
        amount:this.amount,
        tax:this.tax,
        platformFee:this.platformFee
      }
      this.createAndUpdateSubPlanRepo.createCustomerSubPlan(payload).subscribe((data)=>{
        console.log(data);
        this.createAndUpdateSubPlanService.close('yes');
  
      })
    }else{
      const payload={
        id: this.id,
        planId:this.planId,
        name: this.name,
        duration:parseInt((this.duration).toString()),
        DurationUnit:"days",
        amount:parseInt((this.amount).toString()),
        tax:parseInt((this.tax).toString()),
        platformFee:parseInt((this.platformFee).toString()),
 
        creationTime:CommonUtils.addTimeZone((new Date()).toString()),
              lastUpdateTime:CommonUtils.addTimeZone((new Date()).toString()),
      }
      this.createAndUpdateSubPlanRepo.updateCustomerSubPlan(payload).subscribe((data)=>{
        console.log(data);
        this.createAndUpdateSubPlanService.close('yes');
  
      })
    }

  }

  onCancel() {
    this.createAndUpdateSubPlanService.close('no');
  }
}

