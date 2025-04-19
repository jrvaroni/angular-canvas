import { Pipe, PipeTransform } from '@angular/core';
import { DEFAULT_TOOLS, Tool } from '../../models/tool.model';

@Pipe({
  name: 'toolName',
  standalone: true
})
export class ToolNamePipe implements PipeTransform {
  transform(toolId: Tool): string {
    const tool = DEFAULT_TOOLS.find(t => t.id === toolId);
    return tool ? tool.name : 'Ferramenta Desconhecida';
  }
}