import { Pipe, PipeTransform } from '@angular/core';
import jobClassJson from '../../../assets/json/class.json';

@Pipe({
  name: 'jobName',
  standalone: true
})
export class jobNamePipe implements PipeTransform {
    jobClass = jobClassJson as { [key: number]: string };

    transform(value: number): string {
        return this.jobClass[value] || 'ID não encontrado';
    }
}
