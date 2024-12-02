import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { NavigatePage } from './navigate.page';

describe('NavigatePage', () => {
  let component: NavigatePage;
  let fixture: ComponentFixture<NavigatePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavigatePage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
