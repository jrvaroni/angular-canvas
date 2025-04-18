import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe, formatCurrency } from '@angular/common';

@Pipe({
  name: 'currencyBr',
  pure: true,
  standalone: true,
})
export class CurrencyBrPipe implements PipeTransform {
    transform(value: any): string | null {
        return formatCurrency(value, 'pt-BR', 'R$', 'pt-BR', '1.2-2');
    }
}
