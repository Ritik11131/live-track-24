import * as L from 'leaflet';
import 'leaflet-rotatedmarker';

export interface PlaybackOptions {
  map: L.Map;
  route: L.LatLng[];
  iconUrl?: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
  animationDuration?: number; // in milliseconds, default is 2000ms
  speedMultiplier?: number; // default is 1
  positionCallback?: (index: number) => void; // callback function for position index
}

export class PlaybackController {
  private map: L.Map;
  private route: L.LatLng[];
  private polyline!: L.Polyline;
  private marker!: L.Marker;
  private isPlaying: boolean = false;
  private animationDuration: number; // Base duration (1x speed)
  private speedMultiplier: number;
  private currentTargetIndex: number = 0;
  private startTime!: number;
  private currentLatLng!: L.LatLng;
  private targetLatLng!: L.LatLng;
  private playRequestId!: number;
  private positionCallback?: (index: number) => void;

  constructor(options: PlaybackOptions) {
    this.map = options.map;
    this.route = options.route;
    this.animationDuration = options.animationDuration || 2000;
    this.speedMultiplier = options.speedMultiplier || 1;
    this.positionCallback = options.positionCallback;

    this.initMarker(
      options.iconUrl || 'default-icon-path.png',
      options.iconSize || [25, 41],
      options.iconAnchor || [12, 41]
    );
    this.drawPolyline();
  }

  private initMarker(iconUrl: string, iconSize: [number, number], iconAnchor: [number, number]): void {
    const customIcon = L.icon({
      iconUrl,
      iconSize,
      iconAnchor
    });

    (L.Marker as any).include({
      setRotationAngle: function (angle: number) {
        this.options.rotationAngle = angle;
        this.update();
      }
    });

    this.marker = (L.marker(this.route[0], {
      icon: customIcon,
      rotationAngle: 0
    }) as any).addTo(this.map);
    this.currentLatLng = this.route[0];
    this.targetLatLng = this.route[1];
    this.positionCallback?.(0); // Initialize with the starting position index
  }

  public play(): void {
    if (!this.isPlaying && this.route.length > 1) {
      this.isPlaying = true;
      this.startTime = performance.now();
      this.playRequestId = requestAnimationFrame(this.moveMarker.bind(this));
    }
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.playRequestId) {
      cancelAnimationFrame(this.playRequestId);
    }
  }

  public endPlayback(): void {
    this.stop();
    this.currentTargetIndex = 0;
    this.currentLatLng = this.route[0];
    this.targetLatLng = this.route[1];
    this.marker.setLatLng(this.currentLatLng);
    this.positionCallback?.(0); // Callback with the reset position index
  }

  public setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  public seek(position: number): void {
    if (position < 0 || position > 1) return;
    this.stop();
    const totalPoints = this.route.length;
    const targetIndex = Math.floor(position * (totalPoints - 1));

    this.currentTargetIndex = targetIndex;
    this.targetLatLng = this.route[targetIndex];
    this.currentLatLng = this.route[targetIndex];
    this.marker.setLatLng(this.currentLatLng);
    this.positionCallback?.(this.currentTargetIndex); // Callback with the new position index
  }

  private drawPolyline(): void {
    if (this.route.length > 1) {
      this.polyline = L.polyline(this.route, { color: 'blue' }).addTo(this.map);
    }
  }

  private moveMarker(currentTime: number): void {
    if (!this.isPlaying) return;

    const elapsedTime = currentTime - this.startTime;
    const progress = Math.min(elapsedTime / (this.animationDuration / this.speedMultiplier), 1);

    const lat = this.currentLatLng.lat + (this.targetLatLng.lat - this.currentLatLng.lat) * progress;
    const lng = this.currentLatLng.lng + (this.targetLatLng.lng - this.currentLatLng.lng) * progress;
    const intermediatePosition = new L.LatLng(lat, lng);
    const angle = calculateBearing(this.currentLatLng.lat, this.currentLatLng.lng, this.targetLatLng.lat, this.targetLatLng.lng);
    this.marker.setLatLng(intermediatePosition);
    (this.marker as any).setRotationAngle(angle);

    if (progress < 1) {
      this.playRequestId = requestAnimationFrame(this.moveMarker.bind(this));
    } else {
      this.currentLatLng = this.targetLatLng;
      this.currentTargetIndex = (this.currentTargetIndex + 1) % this.route.length;
      this.positionCallback?.(this.currentTargetIndex); // Callback with the current position index

      if (this.currentTargetIndex !== 0) {
        this.targetLatLng = this.route[this.currentTargetIndex];
        this.startTime = performance.now();
        this.playRequestId = requestAnimationFrame(this.moveMarker.bind(this));
      } else {
        this.endPlayback();
      }
    }
  }

  public clear(): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    if (this.polyline) {
      this.map.removeLayer(this.polyline);
    }
  }
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

function toDegrees(radians: number): number {
  return radians * 180 / Math.PI;
}

function calculateBearing(startLat: number, startLng: number, destLat: number, destLng: number): number {
  const startLatRad = toRadians(startLat);
  const startLngRad = toRadians(startLng);
  const destLatRad = toRadians(destLat);
  const destLngRad = toRadians(destLng);

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);

  let brng = Math.atan2(y, x);
  brng = toDegrees(brng);
  return (brng + 360) % 360;
}
