import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';
import { Menu, MenuService } from 'src/services/menu.service';

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.scss']
})
export class AddOrderComponent implements OnInit {
  filter: any = [];
  
  private _menuItems = new BehaviorSubject<any[]>([]);
  public menuItems$ = this._menuItems.asObservable();

  private _orderItems = new BehaviorSubject<any[]>([]);
  public orderItems$ = this._orderItems.asObservable();

  orderForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private menuService: MenuService,
    private fb: FormBuilder) {

  }

  ngOnInit(): void {
    this.filter = [ 'Pork', 'Beef' ];

    // this.menuService.getMenus().subscribe((res) => {
    //   this.menuList = res;
    // });
    
    this.menuService.getMenu('kLCk8Lfn1XefwPTa4kPX').subscribe((res) => {
      if (!_.isEmpty(res.menuItems)) {
        const menus = res.menuItems.map((m) => {
          const defaultPrice = _.head(m.pricing);

          if (defaultPrice) {
            m.price = defaultPrice.price;
            m.size = defaultPrice.size;
          }

          return m;
        });

        this._menuItems.next(menus);
      }
    });
    this.initializeForm();
  }

  initializeForm() {
    this.orderForm = this.fb.group({
      customerName: ['', Validators.required],
      address: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      items: this.fb.array([]),
      totalPrice: [0],
    });
  }

  addOrder(name: any, price: any, size: any) {
    const id = _.kebabCase(`${size} ${name}`);

    console.log(this.items.value);

    const item = this.fb.group({
      id: [id],
      quantity: [1],
      name: [name],
      price: [price]
    });

    this.items.push(item);
  }

  get items() {
    return this.orderForm.controls['items'] as any;
  }
}
