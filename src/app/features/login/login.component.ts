
import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideGithub, lucideLoaderCircle } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmSpinnerComponent } from '@spartan-ng/ui-spinner-helm';
import { TokenStorageService } from '../../services/token-storage.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
	selector: 'spartan-authentication',
	standalone: true,
	imports: [
        HlmButtonDirective,
        FormsModule,
        ReactiveFormsModule,
        HlmIconComponent,
        HlmCardDirective,
        HlmInputDirective,
        HlmLabelDirective,
        HlmSpinnerComponent
    ],
	host: {
		class: 'block',
	},
    providers: [provideIcons({ lucideGithub, lucideLoaderCircle })],
	templateUrl: './login.component.html',
})
export class LoginComponent {

    formUser: FormGroup;
    isLoading = signal(false);
	isError = signal(false);

    constructor(
        private formBuilder: FormBuilder,
		private router: Router,
		private _tokenStorage: TokenStorageService,
		private _userService: UserService,
	) {
        this.formUser = this.formBuilder.group({
			email: new FormControl('', [Validators.required]),
			password: new FormControl('', [Validators.required]),
		})

		this._tokenStorage.signOut();
     }

	onSubmit() {
		this.isError.set(false);
		this.isLoading.set(true);
        const form = this.formUser.value
        this._userService.login(form).subscribe({
			next: (response) => {
				this._tokenStorage.saveToken(response.token);
				this._tokenStorage.saveUser(response.user);
				this.router.navigateByUrl("/");
			},
			error: () => {
				this.isError.set(true);
			}
		});
		this.isLoading.set(false);
	}
}