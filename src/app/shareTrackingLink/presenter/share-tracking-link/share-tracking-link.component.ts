import {Component, OnInit, AfterViewInit, OnDestroy} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {ToastModule} from "primeng/toast";
import {TrackingLinkService} from "../../domain/tracking-link.service";
import {TrackingLinkRepository} from "../../domain/trackingLink.repository";
import {CommonModule} from "@angular/common";
import {SharingMap} from "../../domain/map";
import * as L from "leaflet";
import 'leaflet.gridlayer.googlemutant';
import "leaflet-rotatedmarker";
import {Subject, interval} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {CommonUtils} from "src/app/utils/commonUtils";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {an} from "@fullcalendar/core/internal-common";
import {update} from "@angular/fire/database";
import {config} from "../../../../config";
import {ButtonModule} from "primeng/button";

@Component({
  selector: "app-share-tracking-link",
  standalone: true,
  imports: [ToastModule, CommonModule, ProgressSpinnerModule, ButtonModule],
  templateUrl: "./share-tracking-link.component.html",
  styleUrls: ["./share-tracking-link.component.scss"],
  providers: [TrackingLinkRepository],
})
export class ShareTrackingLinkComponent
    extends SharingMap
    implements OnInit, AfterViewInit, OnDestroy {
  data: any;
  address: string = "Loading address";
  link_expire_image = "../../images/link_expire.jpg"
  marker?: L.Marker; // Use optional chaining for marker
  previousLatLng?: L.LatLng;
  destroy$: Subject<void> = new Subject<void>();
  dataLoading: boolean = true;
  linkExpired: boolean = false; // Flag to indicate if the link has expired
  id: string | undefined = undefined;
  vehicleNo: string | undefined = undefined;
  showDetails: boolean = true;
  firstLoad = true
  constructor(
      private route: ActivatedRoute,
      private trackingLinkRepository: TrackingLinkRepository,
      public trackingLinkService: TrackingLinkService
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get("id") ?? undefined;
      this.vehicleNo = params.get("vehicleNo") ?? undefined;

      this.getTrackingData();
      interval(10000)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.getTrackingData();
          });
    });
  }

  getTrackingData(): void {
    this.trackingLinkRepository.getTrackingDeviceData(this.id, this.vehicleNo).subscribe(
        (d) => {
          this.linkExpired = false
          this.updateData(d)
        },
        (error) => {
          this.linkExpired = true;

          console.error("Error fetching tracking data:", error);
        }
    );
  }

  updateData(d: any) {
    if (d && d.data) {
      this.data = d.data;
      this.address = d.address;
      console.log("Tracking data received:", this.data); // Log the received data
      this.updateMarkerData(d.data);
    } else {
    }
  }

  ngAfterViewInit(): void {

    setTimeout(() => {
      if (this.vehicleNo !== undefined && config.title == "Trakefy") {
        this.loadGoogleMapsApi().then(() => {
          this.map = L.map("sharingMap").setView([20.5937, 78.9629], 4);
          L.gridLayer.googleMutant({
            maxZoom: 20,
            type: 'roadmap', // 'roadmap', 'satellite', 'terrain', 'hybrid'
          }).addTo(this.map);
          this.getTrackingData();
        })
      }else {
        this.initMap("sharingMap");
      }
    },200)
  }

  private createMarkerOnMap(): void {
    if (!this.map) {
      console.error("Map is not initialized.");
      return;
    }
    this.dataLoading = false

    if (this.data && this.data.position) {
      this.previousLatLng = new L.LatLng(
          this.data.position.latitude,
          this.data.position.longitude
      );
      debugger;
      this.marker = this.createCarMarker(
          this.previousLatLng,
          this.data.position.heading ?? 0,
          this.data.device?.vehicleType,
          this.data.position.status.status,
          this.data.position.details.vStatus,
          this.data.device?.vehicleNo
      );
      this.map.flyTo(this.previousLatLng, 18)
      this.addMarkerOnMap(this.marker);
      console.log("Marker created and added to map:", this.marker); // Log marker creation
    } else {
      console.error("Data or data.position is undefined, marker not created");
    }
  }

  private loadGoogleMapsApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB7PM3FDtR2-UnBactce6lUx9NREPIW0Ww`; // Replace with your Google Maps API key
      script.onload = () => resolve();
      script.onerror = (error: any) => reject(error);
      document.body.appendChild(script);
    });
  }

  private extractIdFromUrl(url: string): string | null {
    const match = url.match(/\/track\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  }

  updateMarkerData(data: any): void {
    if (!this.previousLatLng) {
      this.createMarkerOnMap();
      return;
    }

    if (data.position?.latitude && data.position?.longitude) {
      const newPosition = new L.LatLng(
          data.position.latitude,
          data.position.longitude
      );

      if (!this.marker) {
        this.createMarkerOnMap();
      } else {
        const speed = 500;
        const steps = 100;
        const duration = speed;
        const latStep = (newPosition.lat - this.previousLatLng!.lat) / steps;
        const lngStep = (newPosition.lng - this.previousLatLng!.lng) / steps;
        let currentStep = 0;

        const smoothMovementIntervalId = setInterval(() => {
          if (currentStep < steps) {
            const currentLat = this.previousLatLng!.lat + latStep * currentStep;
            const currentLng = this.previousLatLng!.lng + lngStep * currentStep;
            if (this.marker) {
              this.marker.setLatLng(L.latLng(currentLat, currentLng));
            }
            currentStep++;
          } else {
            clearInterval(smoothMovementIntervalId);
          }
        }, duration / steps);

        if (this.marker) {
          this.marker.setRotationAngle(
              this.getBearing(this.previousLatLng!, newPosition)
          );
        }

        this.previousLatLng = newPosition;
      }
      if (this.firstLoad) {
        this.map.flyTo(newPosition, 18);
        this.firstLoad = false
      }else{
        this.map.panTo(newPosition)
      }
    } else {
      console.error("Data position is undefined or invalid:", data.position);
    }
  }

  convertData(nextRechargeDate: string): number {
    return parseInt(nextRechargeDate, 10);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected readonly CommonUtils = CommonUtils;
}
