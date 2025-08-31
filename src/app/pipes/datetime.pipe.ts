import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datetime',
  standalone: true
})
export class DatetimePipe implements PipeTransform {

  transform(
    value: string | number | Date,
    format: 'date' | 'time' | 'full' = 'full'

  ): string {

    if (!value) {
      return '';

    }
    const date = new Date(value);

    const day = date.getDate();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];

    const year = date.getFullYear();

    // 12-hour format
    let hours = date.getHours();
    const half = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const minutes = date.getMinutes().toString().padStart(2, '0');

    const formattedDate = `${day} ${month} ${year}`;
    const formattedTime = `${hours} : ${minutes} ${half}`;

    switch (format) {
      case 'date':
        return formattedDate;
      case 'time':
        return formattedTime;
      case 'full':
      default:
        return `${formattedDate}, ${formattedTime}`;

    return `${day} ${month} ${year}, ${hours} : ${minutes} ${half}`;
    }
  }

}
