import { UntypedFormGroup } from '@angular/forms';

export function CpfCnpjValidator(controlName: string) {
	return (formGroup: UntypedFormGroup) => {
		const control = formGroup.controls[controlName];

		if (control.value && !validaCpfCnpj(control.value)) {
			control.setErrors({ validatorError: true });
		} else {
			control.setErrors(null);
		}
	}
}

function validaCpfCnpj(val: string): boolean {
	if (val.length === 11) {
		let cpf = val.trim();

		cpf = cpf.replace(/\./g, '');
		cpf = cpf.replace('-', '');
		const cpfArray = cpf.split('').map(Number);

		let v1 = 0;
		let v2 = 0;
		let aux = false;

		for (let i = 1; cpfArray.length > i; i++) {
			if (cpfArray[i - 1] !== cpfArray[i]) {
				aux = true;
			}
		}

		if (!aux) {
			return false;
		}

		for (let i = 0, p = 10; (cpfArray.length - 2) > i; i++, p--) {
			v1 += cpfArray[i] * p;
		}

		v1 = (v1 * 10) % 11;

		if (v1 === 10) {
			v1 = 0;
		}

		if (v1 !== cpfArray[9]) {
			return false;
		}

		for (let i = 0, p = 11; (cpfArray.length - 1) > i; i++, p--) {
			v2 += cpfArray[i] * p;
		}

		v2 = (v2 * 10) % 11;

		if (v2 === 10) {
			v2 = 0;
		}

		return v2 === cpfArray[10];
	} else if (val.length === 14) {
		let cnpj = val.trim();

		cnpj = cnpj.replace(/\./g, '');
		cnpj = cnpj.replace('-', '');
		cnpj = cnpj.replace('/', '');
		const cnpjArray = cnpj.split('').map(Number);

		let v1 = 0;
		let v2 = 0;
		let aux = false;

		for (let i = 1; cnpjArray.length > i; i++) {
			if (cnpjArray[i - 1] !== cnpjArray[i]) {
				aux = true;
			}
		}

		if (!aux) {
			return false;
		}

		for (let i = 0, p1 = 5, p2 = 13; (cnpjArray.length - 2) > i; i++, p1--, p2--) {
			if (p1 >= 2) {
				v1 += cnpjArray[i] * p1;
			} else {
				v1 += cnpjArray[i] * p2;
			}
		}

		v1 %= 11;

		if (v1 < 2) {
			v1 = 0;
		} else {
			v1 = 11 - v1;
		}

		if (v1 !== cnpjArray[12]) {
			return false;
		}

		for (let i = 0, p1 = 6, p2 = 14; (cnpjArray.length - 1) > i; i++, p1--, p2--) {
			if (p1 >= 2) {
				v2 += cnpjArray[i] * p1;
			} else {
				v2 += cnpjArray[i] * p2;
			}
		}

		v2 %= 11;

		if (v2 < 2) {
			v2 = 0;
		} else {
			v2 = 11 - v2;
		}

		return v2 === cnpjArray[13];
	} else {
		return false;
	}
}

