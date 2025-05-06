import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Layer } from '../../../models/layer.model';
import { CanvasService } from '../../../services/canvas.service';
import { LayerService } from '../../../services/layer.service';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="text-editor-container"
      [style.left.px]="position.x"
      [style.top.px]="position.y"
      [style.width.px]="width"
      [style.height.px]="height"
    >
      <textarea
        #editor
        [ngModel]="text"
        (ngModelChange)="onTextChange($event)"
        [style.font-size.px]="fontSize"
        [style.font-family]="fontFamily"
        [style.color]="color"
        [style.text-align]="align"
        (blur)="onBlur()"
        (keydown.enter)="$any($event).ctrlKey ? onBlur() : null"
        (keydown.escape)="onCancel()"
        [style.width.px]="width"
        [style.height.px]="height"
      ></textarea>
    </div>
  `,
  styles: [
    `
      .text-editor-container {
        position: absolute;
        z-index: 1000;
      }

      textarea {
        border: 1px dashed #1e90ff;
        background-color: rgba(255, 255, 255, 0.9);
        padding: 4px;
        resize: both;
        min-width: 100px;
        min-height: 24px;
        overflow: hidden;
      }

      textarea:focus {
        outline: none;
      }
    `,
  ],
})
export class TextEditorComponent implements OnInit {
  @ViewChild('editor') editorElement!: ElementRef<HTMLTextAreaElement>;

  @Input() layerId: string = '';
  @Input() position = { x: 0, y: 0 };
  @Input() width: number = 200;
  @Input() height: number = 100;
  @Input() text: string = '';
  @Input() fontSize: number = 16;
  @Input() fontFamily: string = 'Arial';
  @Input() color: string = '#000000';
  @Input() align: string = 'left';

  @Output() close = new EventEmitter<boolean>();

  private canvasService = inject(CanvasService);
  private layerService = inject(LayerService);
  private originalText: string = '';
  private layer: Layer | null = null;

  ngOnInit(): void {
    this.originalText = this.text;
    this.layer = this.layerService.getLayerById(this.layerId)!;

    // Calculate transformed position based on canvas transform
    if (this.layer) {
      const transform = this.canvasService.canvasTransform();
      const screenPosition = this.canvasService.canvasToScreenCoordinates(this.layer.bounds.x, this.layer.bounds.y);

      this.position = screenPosition;

      // Apply zoom to dimensions
      this.width = this.layer.bounds.width * transform.scale;
      this.height = this.layer.bounds.height * transform.scale;
    }
  }

  ngAfterViewInit(): void {
    // Focus the textarea and place cursor at the end
    if (this.editorElement) {
      const textArea = this.editorElement.nativeElement;
      textArea.focus();
      textArea.setSelectionRange(this.text.length, this.text.length);
    }
  }

  onTextChange(newText: string): void {
    this.text = newText;

    // Update the layer data with new text
    if (this.layer && this.layerId) {
      this.layerService.updateLayer(this.layerId, {
        data: {
          ...this.layer.data,
          text: newText,
        },
      });

      // Recalculate height based on content
      this.autoResizeTextarea();
    }
  }

  autoResizeTextarea(): void {
    if (!this.editorElement) return;

    const textArea = this.editorElement.nativeElement;

    // Reset height to calculate scroll height
    textArea.style.height = 'auto';

    // Calculate new height based on scroll height (plus a little extra)
    const newHeight = Math.max(textArea.scrollHeight + 10, this.height);
    textArea.style.height = `${newHeight}px`;

    // Update model
    this.height = newHeight;

    // Update layer bounds if necessary
    if (this.layer && this.layerId) {
      const transform = this.canvasService.canvasTransform();
      const canvasHeight = this.height / transform.scale;

      this.layerService.updateLayer(this.layerId, {
        bounds: {
          ...this.layer.bounds,
          height: canvasHeight,
        },
      });
    }
  }

  onBlur(): void {
    // Finalize the edit
    this.close.emit(true);
  }

  onCancel(): void {
    // Revert to original text
    if (this.layer && this.layerId) {
      this.layerService.updateLayer(this.layerId, {
        data: {
          ...this.layer.data,
          text: this.originalText,
        },
      });
    }

    // Close the editor
    this.close.emit(false);
  }

  @HostListener('window:keydown.escape')
  handleEscapeKey(): void {
    this.onCancel();
  }
}
