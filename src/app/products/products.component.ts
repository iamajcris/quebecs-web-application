import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddMenuComponent } from './add-menu/add-menu.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {
  constructor(
		private modalService: NgbModal,
	) { }

  openMenu() {
    const modalRef = this.modalService.open(AddMenuComponent, { size: 'lg', backdrop: 'static' });
    modalRef.result.then((result) => {
      if (result === 'success') {
        //refresh data
      }
    }).catch((e) => console.log(e));
  }
}
