import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'etb' })
export class EtbPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '—';
    }
    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} ETB`;
  }
}
