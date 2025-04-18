import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gender',
  standalone: true
})
export class GenderPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
        case "M":
            return "Masculino"
        case "F":
            return "Feminino"
        default:
            return "Indefinido";
    }
  }
}