import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { ConnectPage } from './connect.page';

describe('ConnectPage', () => {
  let component: ConnectPage;
  let fixture: ComponentFixture<ConnectPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConnectPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
