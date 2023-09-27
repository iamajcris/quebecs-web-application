import { AfterViewInit, Component, OnInit } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { environment } from './../environments/environment';
import { LoaderService } from 'src/services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'quebecs-web-application';

  constructor(
    private loaderService: LoaderService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    // Initialize Firebase
    const app = initializeApp(environment.firebaseConfig);
    const analytics = getAnalytics(app);
  }

  ngAfterViewInit() {
    this.loaderService.httpProgress().subscribe((status: boolean) => {
      if (status) {
        console.log('loading...');
      } else {
        console.log('no loading...');
      }
    });
  }

  public open(modal: any): void {
    this.modalService.open(modal);
  }

  toggleNavbar() {
    (document.querySelector('.offcanvas-collapse') as HTMLElement).classList.toggle('open');
  }
}
