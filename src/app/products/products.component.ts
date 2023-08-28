import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddMenuComponent } from './add-menu/add-menu.component';
import { Menu, MenuService } from 'src/services/menu.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  menuList: Menu[];

  constructor(
		private modalService: NgbModal,
    private menuService: MenuService,
	) { }

  ngOnInit(): void {
    this.menuService.getMenus()
      .subscribe((res) => {
        this.menuList = res
        console.log(res)
      });
  }

  openMenu(menu: any = null) {
    const modalRef = this.modalService.open(AddMenuComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.menu = menu;
  }
}
