import { Component, OnInit, Renderer2, Output, EventEmitter } from '@angular/core';

class UploadRequest {
    public b64File?: string;
    public fileName?: string;
    public paramss?: string;
}
  
@Component({
  standalone: true,
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit {
  nativeContainer: HTMLElement | null = null;
  nativeFileUpload: HTMLElement | null = null;

  @Output()
  public request = new EventEmitter<UploadRequest>();

  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    this.createUploadComponent();
  }

  createUploadComponent() {
    const _this = this;
    this.nativeContainer = this.renderer.selectRootElement('#uploadContainer');
    this.nativeContainer!.innerHTML =
      '<input type="file" id="uploadInputFile" style="display: none;" (change)="onSelectFile($event)"/>';
    this.nativeFileUpload = this.nativeContainer!.querySelector('#uploadInputFile');
    this.nativeFileUpload!.addEventListener('change', (evt: { target: any }) => {
      _this.onSelectFile(evt.target);
    });
  }

  onSelectFile(fileInput: { files: [any]}) {
    const files = fileInput.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = () => {
        const aux = reader!.result!.toString();
        const req = new UploadRequest();
        req.b64File = aux.substring(aux.indexOf(',') + 1);
        req.fileName = files[0].name;
        req.paramss = '';
        this.request.emit(req);
        this.createUploadComponent();
      };
    }
  }

  selectFile() {
    this.renderer.selectRootElement('#uploadInputFile').click();
  }
}
