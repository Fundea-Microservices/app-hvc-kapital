import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DynamicCarouselComponent } from '../../../dashboard/components/dynamic-carousel/dynamic-carousel';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [DynamicCarouselComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent {}
