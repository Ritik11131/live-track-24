import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationSettingComponent } from './configuration-setting.component';

describe('ConfigurationSettingComponent', () => {
  let component: ConfigurationSettingComponent;
  let fixture: ComponentFixture<ConfigurationSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationSettingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigurationSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
