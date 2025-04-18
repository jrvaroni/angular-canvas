import { UntypedFormGroup } from '@angular/forms';

export function NameValidator(controlName: string) {
	return (formGroup: UntypedFormGroup) => {
		const control = formGroup.controls[controlName];
		const namePattern = /^(?:[\u00c0-\u01ffa-zA-Z'-]){2,}(?:\s[\u00c0-\u01ffa-zA-Z'-]{2,})+$/i;


		if (!control.value.match(namePattern)) {
			control.setErrors({ validatorError: true });
		} else {
			control.setErrors(null);
		}
	}
}
