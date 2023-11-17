import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbDatepicker, NgbModalModule, NgbModule, NgbPaginationModule, NgbTooltipModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { OrdersComponent } from './orders/orders.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { CustomersComponent } from './customers/customers.component';
import { AsyncPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddOrderComponent } from './orders/add-order/add-order.component';
import { AddMenuComponent } from './products/add-menu/add-menu.component';
import { HttpClientModule } from '@angular/common/http';
import { PrintOrderComponent } from './orders/print-order/print-order.component';
import { AddCustomerComponent } from './customers/add-customer/add-customer.component';
import { ToastsContainer } from './_globals/app-toast/app-toast.component';

@NgModule({
  declarations: [
    AppComponent,
    OrdersComponent,
    RestaurantComponent,
    HomeComponent,
    ProductsComponent,
    CustomersComponent,
    AddCustomerComponent,
    AddOrderComponent,
    AddMenuComponent,
    PrintOrderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
		NgFor,
		DecimalPipe,
		FormsModule,
		AsyncPipe,
		NgbTypeaheadModule,
		NgbPaginationModule,
		NgIf,
    NgbModule,
    NgbModalModule,
    NgbDatepicker,
    ReactiveFormsModule,
    HttpClientModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    ToastsContainer
  ],
  providers: [
    DecimalPipe,
  ],
  bootstrap: [AppComponent],
  schemas: []
})
export class AppModule { }
