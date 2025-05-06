import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import {
  HlmCaptionComponent,
  HlmTableComponent,
  HlmTdComponent,
  HlmThComponent,
  HlmTrowComponent,
} from '@spartan-ng/ui-table-helm';
import {
  HlmTabsComponent,
  HlmTabsContentDirective,
  HlmTabsListComponent,
  HlmTabsTriggerDirective,
} from '@spartan-ng/ui-tabs-helm';
import { HlmTooltipComponent, HlmTooltipTriggerDirective } from '@spartan-ng/ui-tooltip-helm';

import { provideIcons } from '@ng-icons/core';
import {
  lucideCircleAlert,
  lucideCircleCheck,
  lucideCirclePlus,
  lucideListMusic,
  lucidePencil,
  lucidePodcast,
  lucideTrash,
} from '@ng-icons/lucide';

import { BrnTooltipContentDirective } from '@spartan-ng/brain/tooltip';

export const globalModules = [CommonModule, RouterModule];

export const globalComponents = [
  HlmTabsComponent,
  HlmTabsListComponent,
  HlmTabsTriggerDirective,
  HlmTabsContentDirective,
  HlmButtonDirective,
  HlmIconComponent,
  HlmSeparatorDirective,
  HlmCardDirective,
  HlmCaptionComponent,
  HlmTableComponent,
  HlmTdComponent,
  HlmThComponent,
  HlmTrowComponent,
  HlmTooltipComponent,
  HlmTooltipTriggerDirective,
  BrnTooltipContentDirective,
];

export const globalProviders = [
  provideIcons({
    lucideCirclePlus,
    lucideListMusic,
    lucidePodcast,
    lucidePencil,
    lucideTrash,
    lucideCircleCheck,
    lucideCircleAlert,
  }),
];
