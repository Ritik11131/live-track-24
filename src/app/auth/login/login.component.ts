import { Component, OnInit } from "@angular/core";
import { LayoutService } from "src/app/layout/service/app.layout.service";
import { AuthService } from "../../service/auth.service";
import { Router } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { config } from "src/config";
import { jwtDecode } from "jwt-decode";
import { DefaultConfig } from "src/defaultConfig";
import { ToastService } from "src/app/service/toast.service";
import { ConfigService } from "src/app/service/config.service";
import { ConfigurationDetailRepositiory } from "src/app/dashboard/user/configurationDetails/domain/configurationDetail.repositiory";
@Component({
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  providers: [ConfigurationDetailRepositiory],
})
export class LoginComponent {
  companyName: string = config.title;
  logo: string = config.logo;
  loginForm: FormGroup;
  showPassword: boolean = false;
  isSubmitted: boolean = false;
  layout = config.layout;
  constructor(
    private layoutService: LayoutService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private configurationDetailRepo: ConfigurationDetailRepositiory,
    private configService: ConfigService
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(["/"]).then();
    }
    this.loginForm = new FormGroup({
      loginId: new FormControl("", [
        Validators.required,
        Validators.minLength(4),
      ]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(4),
      ]),
      loginDevice: new FormControl("web"),
    });
  }

  get filledInput(): boolean {
    return this.layoutService.config().inputStyle === "filled";
  }

  login() {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      // Implement your login logic here
      this.authService.login(this.loginForm.value).subscribe(
        (token) => {
          localStorage.setItem("jwtToken", token);
          this.getConfigJson(token);
          this.layoutService.checkCustomerRole();
          this.router.navigate(["/"]).then((d) => {});
        },
        (error) => {
          if (error instanceof ErrorEvent) {
            this.toastService.toastMessage(
              "error",
              "Message",
              error.error.data
            );
          } else {
            this.toastService.toastMessage(
              "error",
              "Message",
              error.error.data
            );
          }
        },
        () => {}
      );
    } else {
      console.log("Form is not valid");
    }
  }
  getConfigJson(token: string) {
    if (token == null) return;
    const decoded: any = jwtDecode(token);
    const id = decoded.user_id;
    console.log("get called", decoded, id);

    if (id) {

      this.configurationDetailRepo.getAdminConfigurationDetail().subscribe(
        (data) => {
          console.log(data);
          if (data.attributes !== null) {
            config.configJson = JSON.parse(data.attributes);
            console.log(config.configJson);
          } else {
            (config.configJson = DefaultConfig), console.log(config.configJson);
          }
          this.configService.setConfigSubjectfn(true);
        },
        (error) => {
          console.error(error);
          console.log(DefaultConfig);
          (config.configJson = DefaultConfig),
            this.configService.setConfigSubjectfn(true);
        }
      );
    }
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  protected readonly config = config;
}
