import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateParserFormatter, NgbDateStruct, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, OperatorFunction, Subject, combineLatest, debounceTime, distinctUntilChanged, empty, filter, firstValueFrom, map, merge, startWith, take } from 'rxjs';
import * as _ from 'lodash';
import settings from '../../../../app.config.json';
import { Menu, MenuService } from 'src/services/menu.service';
import { OrderService } from 'src/services/order.service';
import { convertToDateStruct } from 'src/helpers/util';
import { Customer, CustomerSearch } from 'src/models/customer';
import { CustomerService } from 'src/services/customer.service';
import { ORDER_TYPES } from '../../contants/order-type.constant';
import { TemplateService } from 'src/services/template.service';
import { ToastService } from 'src/services/toast.service';
import { ReceiptService } from 'src/services/receipt.service';
import { Location } from '@angular/common';

const options = [
  {
    text: 'Mass Delivery',
    value: 50
  },
  {
    text: 'Lalamove',
    value: 70
  },
  {
    text: 'Delivery',
    value: 70
  }
];

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.scss']
})
export class AddOrderComponent implements OnInit {
  @Input() public order: any;
  @Input() public orderType: string;

  filters: any = [];
  menu: any;

  private _filter = new BehaviorSubject<any[]>([]);
  public filter$ = this._filter.asObservable();

  private _filteredMenu = new BehaviorSubject<any[]>([]);
  public filteredMenu$ = this._filteredMenu.asObservable();

  menuItems: any;

  private _orderItems = new BehaviorSubject<any[]>([]);
  public orderItems$ = this._orderItems.asObservable();

  orderForm: FormGroup;
  activeFilter: any = [];
  editItems = false;
  isSaving: boolean = false;
  model: NgbDateStruct;
  meridianTimeList: any = [];
  addCustomItem: boolean = false;
  groupOrdering: boolean = false;
  printReceipt: boolean = true;

  @ViewChild('instance', { static: true }) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  @ViewChild('subItemInstance', { static: true }) subItemInstance: NgbTypeahead;
  @ViewChild('customerSearchInstance', { static: true }) customerSearchInstance: NgbTypeahead;

  customerList: CustomerSearch[]

  priceType = [
    'Regular',
    'Half',
    'S',
    'M',
    'L',
    'XL'
  ];

  customItem = {
    size: this.priceType[0],
    quantity: 1,
    name: '',
    price: ''
  };

  groupItem = {
    text: '',
    price: 0,
  }

  customSubItem = {
    text: '',
    value: 0,
  }

  paymentOptions: string[] = [
    'Cash',
    'COD',
    'GCash',
    'Maya'
  ];

  customItemList: any = [];

  selectedCustomerId: any = null;
  groupedItems: any = [];

  constructor(
    public activeModal: NgbActiveModal,
    private menuService: MenuService,
    private orderService: OrderService,
    private customerService: CustomerService,
    private templateService: TemplateService,
    private receiptService: ReceiptService,
    private fb: FormBuilder,
    private dateFormatter: NgbDateParserFormatter,
    private location: Location) {
  }

  ngOnInit(): void {
    this.initializeForm();
    // this.menuService.getMenus().subscribe((res) => {
    //   if (!_.isEmpty(res)) {
    //     const menu = this.menuService.getLatestMenu(res, this.orderType);

    //     if (menu) {
    //       this.setupMenu(menu);

    //       if (!this.order) {
    //         const scheduleDt = new Date(menu.scheduleDate);
    //         this.orderForm.patchValue({orderDateStruct: convertToDateStruct(scheduleDt)});
    //       }
    //     }
    //   }
    // });

    this.menuService.getMenuList().subscribe((menus) => {
      const menu = _.find(menus, (m) => m.store === this.orderType);
      if (menu) {
        this.setupMenu(menu);

        if (!this.order) {
          const scheduleDt = new Date(menu.scheduleDate);
          this.orderForm.patchValue({ orderDateStruct: convertToDateStruct(scheduleDt) });
        }
      }
    });

    this.meridianTimeList = this.createMeridianTimeArrayWithAMPMFrom6AMTo6PM();

    this.customerService.getCustomerList()
      .subscribe((res) => {
        if (!_.isEmpty(res)) {
          this.customerList = res.map((c) => {
            return new CustomerSearch(c);
          });
        }
      });
  }

  setupMenu(mn: Menu) {
    const menuItems = mn.menuItems.map((m) => {
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

  filterMenu(type: any) {
    this.activeFilter.push(type.value);
    this._filteredMenu.next(_.pick(this.menu, [type.key]) as any);
  }

  removeFilter() {
    this.activeFilter = [];
    this._filteredMenu.next(this.menu);
  }

  patchOrder(order: any) {
    order.items = _.map(order.items, (item) => {
      if (!_.isEmpty(item.notes)) {
        _.assign(item, { enableNotes: true });
      }
      return item
    });

    this.selectedCustomerId = _.get(order, 'customer.customerId', null);

    // prepare the array form groups before patching the whole order form
    _.forEach(order.items, () => this.items.push(this.onCreateOrderItem()));
    _.forEach(order.subItems, () => this.subItems.push(this.onCreateSubItem()));
    _.forEach(order.customers, () => this.customers.push(this.onCreateCustomerFormGroup()));

    _.assign(order, { orderDateStruct: convertToDateStruct(order.orderDate)});

    const customer = new CustomerSearch(order.customer)
    this.orderForm.get('customer')?.patchValue({ ...customer, saveCustomer: false });

    // set order form for manual input only during edit/update
    this.orderForm.get('customer')?.get('saveCustomer')?.disable();
    this.orderForm.get('customerSearch')?.disable();
    this.orderForm.get('isManualEntry')?.disable();

    this.orderForm.patchValue(order);
  }

  initializeForm() {
    this.orderForm = this.fb.group({
      customer: this.onCreateCustomerFormGroup(),
      customers: this.fb.array([]),
      customerSearch: [''],
      isManualEntry: [false],
      isMultipleEntry: [false],
      items: this.fb.array([]),
      subTotal: [0],
      subItems: this.fb.array([]),
      total: [0],
      orderDate: [],
      orderDateStruct: [],
      orderTime: [],
      modeOfPayment: [this.paymentOptions[0]],
      paymentAmount: [0],
      paymentChange: [0]
    });
    
    this.runCalculationObservables();
    this.setupCustomerObservables();
    this.setupItemObservables();

    if (this.order) {
      console.log(this.order);
      this.patchOrder(this.order);
    }
  }

  runCalculationObservables() {
    combineLatest([
      this.orderForm.controls['items'].valueChanges,
      this.orderForm.controls['subItems'].valueChanges.pipe(startWith(null)),
      this.orderForm.controls['paymentAmount'].valueChanges.pipe(startWith(null)),
    ]).subscribe(([items, subItems, paymentAmount]) => {
      let subTotal = 0;
      let subItemsTotal = 0;
      let total = 0;

      if (items) {
        subTotal = _.sum(_.map(items, (item) => item.price));
      }

      if (subItems) {
        console.log(subItems);

        subItemsTotal = _.sum(_.map(subItems, (item) => item.price));
      }

      total = subTotal + subItemsTotal;

      let paymentChange = 0;
      if (paymentAmount) {
        paymentChange = paymentAmount - total;
      }

      this.orderForm.patchValue({
        total,
        subTotal,
        paymentChange,
      });
    });

    this.orderForm.get('modeOfPayment')?.valueChanges.subscribe((val) => {
      const {
        total,
      } = this.orderForm.value;

      let paymentAmount = 0;
      if (val !== 'Cash') {
        paymentAmount = total;
      }

      this.orderForm.get('paymentAmount')?.patchValue(paymentAmount);
    });
  }

  setupCustomerObservables() {
    this.orderForm.get('customerSearch')?.valueChanges.subscribe((data) => {
      console.log('customerSearch', data);
      if (data instanceof(CustomerSearch)) {
        this.addSelectedCustomer(data);
        
        if (!_.isEmpty(data.preferredDeliveryTime)) {
          this.orderForm.get('orderTime')?.patchValue(data.preferredDeliveryTime);
        }

        if (this.orderForm.value.isMultipleEntry) {
          this.orderForm.get('customerSearch')?.reset(null, { emitEvent: false });
          console.log('customers', this.customers.value);
        }
      }
    });

    this.orderForm.get('isManualEntry')?.valueChanges.subscribe((checked) => {
      if (checked) {
        this.resetCustomerForms();
      }
    });
  }

  setupItemObservables() {
    this.items.valueChanges.subscribe((items: any) => {
      this.groupedItems = this.orderService.mapGroupedItemsByCustomer(this.orderForm.value);
      
      console.log('groupedItems', this.groupedItems);
    });
  }

  addOrder(name: any, price: any, size: any, quantity: number = 1) {
    const id = _.kebabCase(`${name} ${size}`);

    const itemIndex = this.items.value.findIndex((i: any) => i.id === id && i.customerId === this.selectedCustomerId);
    
    // if item does not exist
    if (itemIndex < 0) {
      const item = {
        id: id,
        quantity,
        name: name,
        size: size,
        price: price * quantity,
        menuPrice: price,
        customerId: this.selectedCustomerId
      };

      const formGroup = this.onCreateOrderItem();
      formGroup.patchValue(item);

      this.items.push(formGroup);
    } else {
      this.updateQuantity(itemIndex, +1);
    }

    console.log('customers', this.orderForm.value.customers)
    console.log('this.items', this.items.value);
  }

  reduceOrder(name: string, size: string) {
    const id = _.kebabCase(`${name} ${size}`);
    const { value: items } = this.items;
  
    const existingItemIndex = items.findIndex(
      (item: any) => item.id === id && item.customerId === this.selectedCustomerId
    );
  
    if (existingItemIndex !== -1) {
      const existingItem = items[existingItemIndex];
  
      if (existingItem.quantity > 1) {
        this.updateQuantity(existingItemIndex, -1);
      } else {
        this.deleteItem(existingItemIndex);
      }
    }
  }

  onCreateOrderItem() {
    return this.fb.group({
      id: [''],
      quantity: [0],
      name: [''],
      size: [''],
      price: [0],
      menuPrice: [0],
      enableNotes: [false],
      customerId: [''],
      notes: [''],
      total: [0]
    });
  }

  addSubItem(event: any = null) {
    console.log(event);
    const text = (event.target[0] as HTMLInputElement).value;
    const val = (event.target[1] as HTMLInputElement).value;

    const item = this.onCreateSubItem();
    item.patchValue({
      text,
      price: parseInt(val),
    });

    this.subItems.push(item);
    (event.target as HTMLFormElement).reset();
  }

  onCreateSubItem() {
    return this.fb.group({
      text: [''],
      price: [0],
    });
  };

  deleteItem(index: any) {
    this.items.removeAt(index);
  }

  deleteSubItem(index: any) {
    this.subItems.removeAt(index);
  }

  updateQuantity(index: any, qty: number) {
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
      const calculatedQty = Math.abs(quantity + qty);

      if (pricing) {
        item.patchValue({
          price: pricing.price * calculatedQty,
          quantity: calculatedQty
        });
      }
    }
  }

  save() {
    this.isSaving = true;

    let order = this.orderForm.value;

    const {
      customer
    } = order;

    if (order.isManualEntry && customer.saveCustomer) {
      const customerData: Customer = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        address: customer.address,
        mobileNumber: customer.mobileNumber,
        preferredDeliveryTime: order.orderTime,
      }
      this.customerService.saveCustomer(customerData).subscribe((res) => {
        // sync customer list from session storage
        this.customerService.getCustomerList(false).subscribe(() => { });
      });
    }

    if (_.isNil(customer.preferredDeliveryTime) || customer.preferredDeliveryTime !== order.orderTime) {
      if (order.orderTime !== '') {
        const data = {
          preferredDeliveryTime: order.orderTime
        };

        this.customerService.updateCustomer(customer.id, data).subscribe((res) => {
          // sync customer list from session storage
          this.customerService.getCustomerList(false).subscribe(() => { });
        });
      }
    }

    // object properties to be omitted from order model
    order = _.omit(order, ['customerSearch', 'isManualEntry', 'customer.saveCustomer']);
    order.items = _.map(order.items, (item: any) => {
      return _.omit(item, ['enableNotes']);
    });

    const formattedDate = this.dateFormatter.format(order.orderDateStruct);
    order.orderDate = new Date(formattedDate.concat(' ', order.orderTime || "00:00"));

    order.subItems = _.filter((order.subItems), (sub) => !_.isNil(sub.price) && !_.isEmpty(sub.text))

    order.orderType = this.orderType;

    order.statusType = "created";

    console.log(order);

    this.orderService.saveOrUpdateOrder(order, _.get(this.order, 'id', null))
      .subscribe((res) => {
        this.isSaving = false;

        if (!_.isEmpty(res)) {
          _.assign(order, res);
        }

        this.initiateCopyPrintProcess(order).then(() => {
          this.activeModal.close('success')
        });
      });

  }

  addSelectedCustomer(data: CustomerSearch) {
    const { isMultipleEntry, customer } = this.orderForm.value;

    const customerData = {
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      mobileNumber: data.mobileNumber,
      customerId: data.customerId,
      preferredDeliveryTime: data.preferredDeliveryTime,
      id: data.id,
    };

    this.selectedCustomerId = customerData.customerId;

    if (isMultipleEntry) {
      if (_.isEmpty(customer.id)) {
        this.orderForm.get('customer')?.patchValue(customerData, { emitEvent: false });
      }

      const isCustomerExist = !!_.find(this.customers.value, { customerId: customerData.customerId });
      if (isCustomerExist) return;

      const formGroup = this.onCreateCustomerFormGroup();
      formGroup.patchValue({ ...customerData, saveCustomer: false});

      this.customers.push(formGroup);
    } else {
      this.orderForm.get('customer')?.patchValue(customerData, { emitEvent: false });
    }
  }

  toggleMultipleEntry(event: any) {
    this.orderForm.get('isMultipleEntry')?.patchValue(event.target.checked);
    this.resetCustomerForms();
    this.resetItems();
    this.groupedItems = [];
  }

  resetCustomerForms() {
    this.orderForm.get('customerSearch')?.reset(null, { emitEvent: false });
    this.orderForm.get('customer')?.reset({
      firstName: '',
      lastName: '',
      address: '',
      mobileNumber: '',
      customerId: '',
      saveCustomer: true,
    }, { emitEvent: false });

    this.customers.clear();
    this.selectedCustomerId = null;
  }

  resetItems() {
    this.items.clear([]);
  }

  setSelectedCustomer(customerId: any) {
    this.selectedCustomerId = customerId;
  }

  removeCustomer(index: number) {
    const customer = this.customers.at(index).value;

    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items.at(i).get('customerId').value === customer.customerId) {
        this.items.removeAt(i);
      }
    }

    this.customers.removeAt(index);

    if (this.customers.length) {
      const customer = this.customers.at(0).value;

      this.orderForm.get('customer')?.patchValue(customer);
    }
  }

  async initiateCopyPrintProcess(order: any) {
    this.templateService.copyOrderForm(order);

    if (this.printReceipt) {
      let orderData = _.cloneDeep(order);
      if (this.order) {
        _.assign(orderData, { orderId: this.order.orderId });
      } else {
        // this block means its from the create order process
        const res = await firstValueFrom(this.orderService.getOrder(order.id).pipe(take(1)));
        orderData = res;
      }
      console.log('orderData', orderData);
      this.receiptService.openPrintWindow(orderData);
    }
  }

  searchCustomer: OperatorFunction<string, readonly Customer[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map((term) =>
        term === ''
          ? []
          : this.customerList.filter((v) => v.fullname.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );

  formatter = (x: CustomerSearch) => x.fullCustomerDetail;

  activateNotes(index: any) {
    const item = this.items.controls[index] as FormGroup;

    item.patchValue({
      enableNotes: !item.value.enableNotes
    });
  }

  toggleEditItems() {
    this.editItems = !this.editItems;
  }

  searchSubItem: OperatorFunction<string, readonly any[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.subItemInstance?.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        (term === '' ? options : options.filter((v) => v.text.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10),
      ),
    );
  };

  subItemFormatter = (x: any) => `${x.text} - ${x.value}`;

  subItemInputFormatter = (x: any) => `${x.text}`;

  subItemSelected(value: any) {
    const item = value.item;
    if (item && item.text && item.value) {
      _.assign(this.customSubItem, item);
      console.log(this.customSubItem);
    }
  }


  itemChangeSze(categoryIndex: any, product: any, size: any, price: any) {
    const menuCategoryList = this.menu[categoryIndex];

    const ind = _.findIndex(menuCategoryList, { name: product.name });
    if (ind >= 0) {
      _.assign(this.menu[categoryIndex][ind], { size, price });
    }
  }

  createMeridianTimeArrayWithAMPMFrom6AMTo6PM() {
    // Create an empty array to store the meridian time
    const meridianTimeArrayWithAMPM = [];

    // Loop through all hours from 6 to 18
    for (let hour = 6; hour < 19; hour++) {
      // Loop through all minutes, incrementing by 30 each time
      for (let minute = 0; minute < 60; minute += 30) {
        // Get the 12-hour hour
        let twelveHourHour = hour % 12;

        // Determine the AM or PM
        let ampm = "AM";
        if (twelveHourHour === 0) {
          twelveHourHour = 12;
        }
        if (hour >= 12) {
          ampm = "PM";
        }

        // Add the meridian time to the array
        meridianTimeArrayWithAMPM.push(`${twelveHourHour}:${minute === 0 ? '00' : minute} ${ampm}`);
      }
    }

    // Return the array of meridian time
    return meridianTimeArrayWithAMPM;
  }

  get subItems() {
    return this.orderForm.controls['subItems'] as any;
  }

  get items() {
    return this.orderForm.controls['items'] as any;
  }

  get itemsCount() {
    return (this.orderForm.get('items') as FormArray).length;
  }

  get customers() {
    return this.orderForm.get('customers') as FormArray;
  }

  itemQuantity(name: string) {
    let totalQuantity = 0;

    const items = this.items.value.filter((i: any) => i.name === name);
    if (!_.isEmpty(items)) {
      _.forEach(items, (i) => {
        totalQuantity += i.quantity;
      })
    }
    return totalQuantity;
  }

  groupedItemQuantity(name: string) {
    let totalQuantity = 0;

    const customerItems = this.groupedItems.find((item: any) => item.customerId === this.selectedCustomerId);

    const items = customerItems?.items.filter((i: any) => i.name === name);
    if (!_.isEmpty(items)) {
      _.forEach(items, (i) => {
        totalQuantity += i.quantity;
      })
    }
    return totalQuantity;
  }

  toggleCheckbox(evt: any) {
    this.addCustomItem = evt.target.checked;
  }

  toggleGroupOrdering(evt: any) {
    this.groupOrdering = evt.target.checked;
  }

  updateCustomItemList() {
    this.customItemList.push(this.customItem);

    this.customItem = {
      size: this.priceType[0],
      quantity: 1,
      name: '',
      price: ''
    };
  }

  onCreateCustomerFormGroup() {
    return this.fb.group({
      id: [''],
      customerId: [''],
      lastName: [''],
      firstName: [''],
      address: [''],
      mobileNumber: [''],
      preferredDeliveryTime: [''],
      saveCustomer: [true],
    });
  }
}
