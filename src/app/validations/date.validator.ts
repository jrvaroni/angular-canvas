import { UntypedFormGroup } from '@angular/forms';

export function DateValidator(controlName: string) {
	return (formGroup: UntypedFormGroup) => {
		const control = formGroup.controls[controlName];
		const regexParttener = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;

		if (!control.value.day) {
			control.setErrors({ validatorError: true });
		} else {
			const date = `${control.value.day}/${control.value.month}/${control.value.year}`;
			if (!date.match(regexParttener)) {
				control.setErrors({ validatorError: true });
			} else {
				control.setErrors(null);
			}
		}
	}
}
