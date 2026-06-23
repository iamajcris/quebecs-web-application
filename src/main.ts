import { provideZoneChangeDetection } from "@angular/core";

import { DecimalPipe } from "@angular/common";
import { provideHttpClient, withXhr, withInterceptorsFromDi } from "@angular/common/http";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { routes } from "./app/app-routing.module";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection(),
        provideRouter(routes),
        DecimalPipe,
        provideHttpClient(withXhr(), withInterceptorsFromDi())
    ]
})
  .catch(err => console.error(err));
