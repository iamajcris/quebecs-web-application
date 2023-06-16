import { Component, OnInit } from '@angular/core';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0Kbahoo5eam5AjMznev_v0d_QYT8S9bg",
  authDomain: "quebecs-system.firebaseapp.com",
  projectId: "quebecs-system",
  storageBucket: "quebecs-system.appspot.com",
  messagingSenderId: "971975771640",
  appId: "1:971975771640:web:55ff644b4033d7e7b6820d",
  measurementId: "G-G139SSH94D"
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'quebecs-web-application';

  ngOnInit() {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
  }
}
