import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency',
  standalone: true
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(value: number, currencyCode: string = 'USD', display: string = 'symbol', digits?: string): string {
    if (value == null || isNaN(value)) return '';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatter.format(value);
  }
}
