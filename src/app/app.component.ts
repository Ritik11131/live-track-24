import { Component, Inject, OnInit } from "@angular/core";
import { PrimeNGConfig } from "primeng/api";
import { LayoutService, AppConfig } from "./layout/service/app.layout.service";
import { ConfigurationService } from "./service/configuration.service";
import { config } from "src/config";
import { DOCUMENT, Location } from "@angular/common";
import { Title } from "@angular/platform-browser";
import { jwtDecode } from "jwt-decode";
import { DefaultConfig } from "src/defaultConfig";
import { ConfigService } from "./service/config.service";
import { ConfigurationDetailRepositiory } from "./dashboard/user/configurationDetails/domain/configurationDetail.repositiory";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  providers:[ConfigurationDetailRepositiory]
})
export class AppComponent implements OnInit {
  selectedColor!: string;
  selectedTheme!: "dark" | "light";

  constructor(
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document,
    private primengConfig: PrimeNGConfig,
    private layoutService: LayoutService,
    private configurationService: ConfigurationService,
    private location: Location,
    private configService:ConfigService,
    private configurationDetailRepo:ConfigurationDetailRepositiory
  ) {}

  ngOnInit(): void {
    const authToken = localStorage.getItem("jwtToken");
    if (authToken) {
      this.getConfigJson(authToken);
    }
    this.setConfigValues();
    this.configurationService.selectedColor$.subscribe((color) => {
      this.selectedColor = color;
      this.updateThemeConfiguration();

      // Update the title
      this.titleService.setTitle(config.title);

      const favicon = this.document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.setAttribute("href", config.logo);
      }
    });

    this.configurationService.selectedTheme$.subscribe((theme) => {
      this.selectedTheme = theme;
      this.updateThemeConfiguration(); // Call method to update theme configuration
    });

    this.primengConfig.ripple = true;
  }

  setConfigValues() {
    const url = window.location.href;
    config.baseUrl='https://api.baliniot.in'
    if (url.includes("iot.baliniot.in")  ) {
      config.logo = "assets/logo.svg";
      config.title = "Balin";
      config.loginPage=1;
      config.layout = 1;
    } else if (url.includes("torqiot.in")    ) {
      config.logo = "assets/torq_logo.png";
      config.title = "Torq";
        config.loginPage=2;
        config.baseUrl='https://api.torqiot.in',
      config.layout = 2;
    } else if (url.includes("battery.vivitron.in") ) {
      config.logo = "assets/vivitron_dark_logo_small.png";
      config.title = " Vivitron Advanced Batteries";
      config.layout = 1;
        config.loginPage=2;
    }
   else if (url.includes("battery.exter.in")) {
    config.logo = "assets/exter-logo-1.png";
    config.title = "exter Battery Swapping - IoT ";
    config.layout = 1;
        config.loginPage=2;
    }
   else if (url.includes("iot.baliniot.in")   ) {
      config.logo = "assets/logo.svg";
      config.title = "Balin";
      config.layout = 1;
    } else if (url.includes("torqiot.in") ) {
      config.logo = "assets/torq_logo.png";
      config.title = "Torq";
      config.baseUrl = 'https://api.torqiot.in';
      config.layout = 2;
    } else if (url.includes("battery.vivitron.in")) {
      config.logo = "assets/vivitron_dark_logo_small.png";
      config.title = " Vivitron Battery";
      config.layout = 2;
    } else if (url.includes("battery.exter.in")) {
      config.logo = "assets/exter-logo-1.png";
      config.title = "Exter BSS";
      config.layout = 2;
    } else if (url.includes("trakefy.in")   ) {
      config.logo = "assets/trakefy_logo.png";
      config.title = "Trakefy";
      config.baseUrl = 'https://api.trakefy.in';
      config.subscriptionPlan = true
      config.currentMap = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      config.layout = 2;
    } else if (url.includes("grltracktech.com") ) {
      config.logo = "assets/grl_logo.png";
      config.title = "Grl Track Tech";
      config.subscriptionPlan = true;
      config.baseUrl = 'https://api.trakefy.in';
      config.currentMap = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      config.layout = 2;
    }
    else if (url.includes("suveechi.com")) {
      config.logo = "assets/suveechî.png";
      config.title = "Suveechî";
      config.baseUrl = 'https://api.trakefy.in';
      config.currentMap = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      config.layout = 2;
    } else if (url.includes("arcmos.in") || url.includes("localhost")) {
      config.logo = "assets/arcmos_logo.jpeg";
      config.title = "ARCMOS";
      config.baseUrl = 'https://api.trakefy.in';
      config.currentMap = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      config.layout = 2;
    }
  }
  private updateThemeConfiguration(): void {
    const config: AppConfig = {
      ripple: false,
      inputStyle: "outlined",
      menuMode: "slim-plus",
      colorScheme: this.selectedTheme,
      theme: this.selectedColor,
      layoutTheme: "colorScheme",
      scale: 9,
    };

    this.layoutService.config.set(config);
  }
  getConfigJson(token: string) {

    if (token == null) return;
    const decoded: any = jwtDecode(token);
    const id = decoded.user_id;
    console.log("get called", decoded, id);

    if (id) {
      this.configurationDetailRepo.getAdminConfigurationDetail().subscribe((data) => {
        console.log(data)
        if (data.attributes !== null) {
          config.configJson = JSON.parse(data.attributes);
          console.log(config.configJson);
        } else {
          (config.configJson = DefaultConfig), console.log(config.configJson);
        }
        this.configService.setConfigSubjectfn(true)
      },error=>{
        console.log(DefaultConfig)
        config.configJson=DefaultConfig,
        this.configService.setConfigSubjectfn(true)

      });
    }
  }
}
