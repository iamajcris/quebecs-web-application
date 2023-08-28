import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, OperatorFunction, Subject, combineLatest, debounceTime, distinctUntilChanged, filter, map, merge, startWith } from 'rxjs';
import * as _ from 'lodash';
import settings from '../../../../app.config.json';
import { Menu, MenuService } from 'src/services/menu.service';

const options = [
  'Discount',
  'Delivery fee',
];

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.scss']
})
export class AddOrderComponent implements OnInit {
  filters: any = [];
  menu: any;

  private _filter = new BehaviorSubject<any[]>([]);
  public filter$ = this._filter.asObservable();

  // private _menu = new BehaviorSubject<any[]>([]);
  // public menu$ = this._menu.asObservable();

  private _filteredMenu = new BehaviorSubject<any[]>([]);
  public filteredMenu$ = this._filteredMenu.asObservable();

  // private _menuItems = new BehaviorSubject<any[]>([]);
  // public menuItems$ = this._menuItems.asObservable();

  menuItems: any;

  private _orderItems = new BehaviorSubject<any[]>([]);
  public orderItems$ = this._orderItems.asObservable();

  orderForm: FormGroup;
  activeFilter: any = [];
  editItems = false;
  isSaving: boolean = false;

  @ViewChild('instance', { static: true }) instance: NgbTypeahead;
  focus$ = new Subject<string>();
	click$ = new Subject<string>();

  constructor(
    public activeModal: NgbActiveModal,
    private menuService: MenuService,
    private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.menuService.getMenu('kLCk8Lfn1XefwPTa4kPX').subscribe((res) => {
      if (!_.isEmpty(res.menuItems)) {
        const menuItems = res.menuItems.map((m) => {
          const defaultPrice = _.head(m.pricing);

          if (defaultPrice) {
            m.price = defaultPrice.price;
            m.size = defaultPrice.size;
          }

          return m;
        });

        this.menuItems = menuItems;

        const menu: any = _.chain(menuItems)
          .map((m) => {
            if (_.isEmpty(m.category)) {
              m.category = 'Misc';
            }
            m.sort = settings.categoryList.indexOf(m.category);
            return m;
          })
          .orderBy('sort')
          .groupBy('sort')
          .value();
        
        this.menu = menu;
        this._filteredMenu.next(menu);

        this.filters = _.chain(menu)
          .values()
          .map((m: any) => {
            const obj = Object.keys(m);
              console.log(obj);
            return m[0].category;
          })
          .value();

        console.log(menu);
        
        this.filters = _.transform(menu, (r: any, v: any, k: any) => {
          r[k] = v[0].category; 
        });
        console.log(this.filters)
      }
    });
    this.initializeForm();
  }

  filterMenu(type: any) {
    this.activeFilter.push(type.value);
    this._filteredMenu.next(_.pick(this.menu, [type.key]) as any);
  }

  removeFilter() {
    this.activeFilter = [];
    this._filteredMenu.next(this.menu);
  }

  initializeForm() {
    this.orderForm = this.fb.group({
      customerName: [''],
      address: [''],
      mobileNumber: [''],
      items: this.fb.array([]),
      subTotal: [0],
      subItems: this.fb.array([]),
      total: [0],
    });

    combineLatest([
      this.orderForm.controls['items'].valueChanges,
      this.orderForm.controls['subItems'].valueChanges.pipe(startWith(null))
    ]).subscribe(([items, subItems]) => {
      let subTotal = 0;
      let subItemsTotal = 0;
      let total = 0;

      if (items) {
        // this.orderForm.controls['subTotal'].patchValue(_.sum(_.map(items, (item) => item.price)));

        subTotal = _.sum(_.map(items, (item) => item.price));
      }

      if (subItems) {
        console.log(subItems);

        subItemsTotal = _.sum(_.map(subItems, (item) => item.price));
      }

      total = subTotal + subItemsTotal;

      this.orderForm.patchValue({
        total,
        subTotal
      })

    })
  }

  addOrder(name: any, price: any, size: any) {
    const id = _.kebabCase(`${_.toLower(size === 'Regular' ? '' : size)} ${name}`);

    const item = this.fb.group({
      id: [id],
      quantity: [1],
      name: [name],
      size: [size],
      price: [price],
      enableNotes: [false],
      notes: ['']
    });

    this.items.push(item);
  }

  addSubItem() {
    const item = this.fb.group({
      text: [''],
      price: [0],
    });

    this.subItems.push(item);
  }

  deleteItem(index: any) {
    this.items.removeAt(index);
  }

  addQuantity(index: any) {
    const item = this.items.controls[index] as FormGroup;

    const {
      name,
      size,
      price,
      quantity
    } = item.value;

    const menu = this.menuItems.find((m: any) => m.name === name);
    if (menu) {
      const pricing = menu.pricing.find((p: any) => p.size === size);

      if (pricing) {
        item.patchValue({
          price: price + pricing.price,
          quantity: quantity + 1
        });
      }
    }
  }

  save() {
    console.log(this.orderForm.value);
  }

  activateNotes(index: any) {
    const item = this.items.controls[index] as FormGroup;

    item.patchValue({
      enableNotes: !item.value.enableNotes
    });
  }

  toggleEditItems() {
    this.editItems = !this.editItems;
  }

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
		const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
		const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
		const inputFocus$ = this.focus$;

		return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
			map((term) =>
				(term === '' ? options : options.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10),
			),
		);
	};

  itemChangeSze(categoryIndex: any, product: any, size: any, price: any) {
    const menuCategoryList = this.menu[categoryIndex];
    
    const ind = _.findIndex(menuCategoryList, { name: product.name });
    if (ind >= 0) {
      _.assign(this.menu[categoryIndex][ind], { size, price });
    }
  }

  get subItems() {
    return this.orderForm.controls['subItems'] as any;
  }

  get items() {
    return this.orderForm.controls['items'] as any;
  }
}
