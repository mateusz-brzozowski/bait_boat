import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'connect',
        loadChildren: () => import('../connect/connect.module').then(m => m.ConnectPageModule)
      },
      {
        path: 'control',
        loadChildren: () => import('../control/control.module').then(m => m.ControlPageModule)
      },
      {
        path: 'navigate',
        loadChildren: () => import('../navigate/navigate.module').then(m => m.NavigatePageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/connect',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/connect',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
