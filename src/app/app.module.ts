import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DecimalPipe } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ToastsContainer } from './_globals/app-toast/app-toast.component';

@NgModule({
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    imports: [BrowserModule, AppRoutingModule, ToastsContainer],
    providers: [
        DecimalPipe,
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
export class AppModule { }
