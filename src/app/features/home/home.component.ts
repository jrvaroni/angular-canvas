import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { provideIcons } from '@ng-icons/core';
import { lucideCirclePlus, lucideListMusic, lucidePodcast } from '@ng-icons/lucide';

import { CommonModule } from '@angular/common';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';

import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import {
	HlmTabsComponent,
	HlmTabsContentDirective,
	HlmTabsListComponent,
	HlmTabsTriggerDirective,
} from '@spartan-ng/ui-tabs-helm';
import {
	HlmCaptionComponent,
	HlmTableComponent,
	HlmTdComponent,
	HlmThComponent,
	HlmTrowComponent,
  } from '@spartan-ng/ui-table-helm';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';
import { TokenStorageService } from '../../services/token-storage.service';
import { IUser } from '../../models/user';
import { GenderPipe } from '../../shared/pipes/gender.pipe';
import { jobNamePipe } from '../../shared/pipes/class.pipe';
import { StatusPipe } from '../../shared/pipes/status.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  host: {
    class: 'block',
},
  imports: [
    RouterModule,
    HlmTabsComponent,
    HlmTabsListComponent,
    HlmTabsTriggerDirective,
    HlmTabsContentDirective,
    HlmButtonDirective,
    HlmIconComponent,
    HlmSeparatorDirective,
    HlmCardDirective,
    CommonModule,
    HlmCaptionComponent,
    HlmTableComponent,
    HlmTdComponent,
    HlmThComponent,
    HlmTrowComponent,
    HlmBadgeDirective,
    GenderPipe,
    jobNamePipe,
    StatusPipe
],
  providers: [provideIcons({ lucideCirclePlus, lucideListMusic, lucidePodcast })],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {


	public sectionData = {
		listenNow: [
			{
				img: 'https://images.pexels.com/photos/16580466/pexels-photo-16580466/free-photo-of-festa-comemoracao-musica-diversao.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
				title: 'Angular Rendezvous',
				subtitle: 'Ethan Byte',
			},
			{
				img: 'https://images.pexels.com/photos/20548730/pexels-photo-20548730/free-photo-of-cidade-meio-urbano-homem-ponto-de-referencia.jpeg?auto=compress&cs=tinysrgb&w=600',
				title: 'Async Awakenings',
				subtitle: 'Nina Netcode',
			},
			{
				img: 'https://images.pexels.com/photos/20555179/pexels-photo-20555179/free-photo-of-homem-sentado-jogando-musica.jpeg?auto=compress&cs=tinysrgb&w=600',
				title: 'The Art of Reusability',
				subtitle: 'Lena Logic',
			},
			{
				img: 'https://images.pexels.com/photos/7365313/pexels-photo-7365313.jpeg?auto=compress&cs=tinysrgb&w=600',
				title: 'Stateful Symphony',
				subtitle: 'Beth Binary',
			},
		],
		madeForYou: [
			{
				img: 'https://images.pexels.com/photos/20516167/pexels-photo-20516167/free-photo-of-preto-e-branco-p-b-mulher-relaxamento.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
				title: 'Thinking Components',
				subtitle: 'Lena Logic',
			},
			{
				img: 'https://images.pexels.com/photos/4038323/pexels-photo-4038323.jpeg?auto=compress&cs=tinysrgb&w=600',
				title: 'Functional Fury',
				subtitle: 'Beth Binary',
			},
			{
				img: 'https://images.pexels.com/photos/16580466/pexels-photo-16580466/free-photo-of-festa-comemoracao-musica-diversao.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
				title: 'Angular Rendezvous',
				subtitle: 'Ethan Byte',
			},
			{
				img: 'https://images.pexels.com/photos/7365313/pexels-photo-7365313.jpeg?auto=compress&cs=tinysrgb&w=600',
				title: 'Stateful Symphony',
				subtitle: 'Beth Binary',
			},
			{
				img: 'https://images.pexels.com/photos/20548730/pexels-photo-20548730/free-photo-of-cidade-meio-urbano-homem-ponto-de-referencia.jpeg?auto=compress&cs=tinysrgb&w=600',
				title: 'Async Awakenings',
				subtitle: 'Nina Netcode',
			},
			{
				img: 'https://images.pexels.com/photos/20555179/pexels-photo-20555179/free-photo-of-homem-sentado-jogando-musica.jpeg?auto=compress&cs=tinysrgb&w=600',
				title: 'The Art of Reusability',
				subtitle: 'Lena Logic',
			},
		],
	};

	user: IUser;
	chars: any[] = [];

	constructor(private _tokenStorage: TokenStorageService) {
		this.user = this._tokenStorage.getUser();
	}

	ngOnInit(): void {
		// this._charService.getCharById(this.user.account_id).subscribe({
		// 	next: (response) => {
		// 		this.chars = response;
		// 		console.log(this.chars)
		// 	},
		// 	error: () => {

		// 	}
		// })
	}


}