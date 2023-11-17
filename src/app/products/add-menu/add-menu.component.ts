import { Component, OnInit, Input } from '@angular/core';
import { Form, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Menu, MenuService } from 'src/services/menu.service';
import * as _ from 'lodash';
import settings from '../../../../app.config.json';
import { convertToDateStruct } from 'src/helpers/util';

@Component({
  selector: 'app-add-menu',
  templateUrl: './add-menu.component.html',
  styleUrls: ['./add-menu.component.scss']
})
export class AddMenuComponent implements OnInit {
  form: FormGroup;
  isSaving: boolean = false;
  @Input() public menu: Menu;
  categoryList = settings.categoryList;

  priceType = [
    'Regular',
    'Half',
    'S',
    'M',
    'L',
    'XL'
  ];

  storeTypes = [
    'Turo-turo',
    'Quebecs',
  ];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private dateFormatter: NgbDateParserFormatter,
    private menuService: MenuService,
  ) { }

  ngOnInit(): void {
    this.initializeForm();

    if (this.menu) {
      this.patchMenu(this.menu);
      console.log(this.menu);
    } else {
      this.addMenuItem();
    }
    console.log(this.menuItems)
  }

  initializeForm() {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    this.form = this.fb.group({
      store: [this.storeTypes[0]],
      scheduleDate: [convertToDateStruct(date)],
      // isActive: [true],
      menuItems: this.fb.array([]),
    });
  }

  onCreateMenuItem() {
    return this.fb.group({
      name: ['', Validators.required],
      category: [''],
      pricing: this.fb.array([]),
    });
  }

  saveMenu() {
    this.isSaving = true;

    const menu = this.form.value;

    const formattedDate = this.dateFormatter.format(menu.scheduleDate);
    menu.scheduleDate = new Date(formattedDate);

    console.log(menu);

    if (this.menu) {
      this.menuService.updateMenu(this.menu.id, menu)
        .subscribe((res) => {
          this.isSaving = false;
          this.activeModal.close('success');
        });
    } else {
      this.menuService.createMenu(menu)
        .subscribe((res) => {
          this.isSaving = false;
          this.activeModal.close('success');
        })
    }
  }

  patchMenu(menu: Menu) {
    const {
      store,
    } = menu;

    const dt = new Date(menu.scheduleDate);
    const scheduleDate = convertToDateStruct(dt);
    this.form.patchValue({
      store,
      scheduleDate
    });

    if (menu.menuItems.length) {
      menu.menuItems.forEach((x: any) => {
        const item = this.onCreateMenuItem();

        if (!_.isUndefined(x.pricing)) {
          x.pricing.forEach((p: any) => (item.controls.pricing as FormArray).push(this.createPricing()))
        }

        item.patchValue(x as any);
        this.menuItems.push(item);
      });
    }
  }

  addMenuItem() {
    const item = this.onCreateMenuItem();
    // (item.get('pricing') as FormArray).push(this.createPricing());

    this.menuItems.push(item);
  }

  createPricing() {
    return this.fb.group({
      size: [this.priceType[0]],
      price: [''],
    });
  }

  deleteItem(index: number) {
    this.menuItems.removeAt(index);
  }

  patchValue(value: any, control: any) {
    control.patchValue(value);
  }

  onSelectChanged(event: any, formControl: FormControl) {
    const {
      value,
     } = event.target;

     formControl.patchValue(value);
  }

  addPricing(itemPricingIndex: any) {
    this.itemPricing(itemPricingIndex).push(this.createPricing());
  }

  deletePricing(itemPricingIndex: any, pricingIndex: any) {
    this.itemPricing(itemPricingIndex).removeAt(pricingIndex);
  }

  itemPricing(index: number) : any {
    return this.menuItems.at(index).get("pricing") as FormArray
  }

  get menuItems() {
    return this.form.controls['menuItems'] as any;
  }

  get formControl() {
    return this.form.controls;
  }
}
