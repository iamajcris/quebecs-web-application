import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersComponent } from './orders/orders.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { CustomersComponent } from './customers/customers.component';

const routes: Routes = [
  {
    path: 'home', component: HomeComponent
  },
  {
    path: 'orders', component: OrdersComponent
  },
  {
    path: 'quebecs', component: RestaurantComponent
  },
  {
    path: 'products', component: ProductsComponent
  },
  {
    path: 'customers', component: CustomersComponent
  },
  {
    path: '**',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
