import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'deviceStatus'
})
export class DeviceStatusPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): unknown {
    const serverTime = Date.parse(args[0] as string);
    const diffInMs = serverTime - Date.parse(value.receiveTime);
    const diffInHours = diffInMs / 1000 / 60 / 60 / 24;

    if (diffInHours < 1) {
      return 'bi bi-cpu text-success font-medium-2';
    } else {
      return 'bi bi-cpu text-danger font-medium-2';
    }
  }
}
