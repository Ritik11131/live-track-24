import {  Component } from '@angular/core';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfigurationService } from 'src/app/service/configuration.service';
import {   OnInit } from '@angular/core';

type Theme = 'dark' | 'light';
@Component({
  
  selector: 'app-configuration-setting',
  standalone: true,
  imports: [RadioButtonModule,ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './configuration-setting.component.html',
  styleUrls:[ './configuration-setting.component.scss']
})
export class ConfigurationSettingComponent  {


  selectedTheme: Theme = 'light'; // variable to store the selected theme
  selectedColor: string = 'indigo'; // variable to store the selected color

constructor(private configurationService:ConfigurationService){}

  changeTheme() {
    this.configurationService.setSelectedTheme(this.selectedTheme);

    // Call your service passing the selected theme
    // yourServiceFunction(this.selectedTheme);
  }

  // Method to handle color selection
  selectColor(color: string) {
    this.selectedColor = color;
    this.configurationService.setSelectedColor(color);

    // Call your function passing the selected color
    // yourFunction(this.selectedColor);
  }
}
