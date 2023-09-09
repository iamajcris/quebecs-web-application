import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-print-order',
  templateUrl: './print-order.component.html',
  styleUrls: ['./print-order.component.scss']
})
export class PrintOrderComponent implements OnInit {
  constructor(
    public activeModal: NgbActiveModal,
    private routeParams: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.routeParams.params.subscribe(params => {
      console.log(params)
    });
  }

  ngAfterViewInit() {
    // setTimeout(()=>{
    //   window.print();
    // }, 300);

    // setTimeout(()=>{
    //   this.activeModal.close(); 
                
    // }, 400);
  }
}
