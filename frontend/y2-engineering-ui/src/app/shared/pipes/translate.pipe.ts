import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../core/translation.service';

@Pipe({
  name: 't',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  constructor(private readonly translation: TranslationService) {}

  transform(key: string): string {
    return this.translation.t(key);
  }
}
