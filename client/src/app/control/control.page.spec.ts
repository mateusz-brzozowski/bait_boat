import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { ControlPage } from './control.page';

describe('ControlPage', () => {
  let component: ControlPage;
  let fixture: ComponentFixture<ControlPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ControlPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ControlPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
