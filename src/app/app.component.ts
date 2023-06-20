import { Component, OnInit } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { environment } from './../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'quebecs-web-application';

  constructor(private modalService: NgbModal) {
  }

  ngOnInit() {
    // Initialize Firebase
    const app = initializeApp(environment.firebaseConfig);
    const analytics = getAnalytics(app);
  }

  public open(modal: any): void {
    this.modalService.open(modal);
  }
}
