import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Menu, MenuService } from 'src/services/menu.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-add-menu',
  templateUrl: './add-menu.component.html',
  styleUrls: ['./add-menu.component.scss']
})
export class AddMenuComponent implements OnInit {
  form: FormGroup;
  isSaving: boolean = false;
  @Input() public menu: Menu;

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
    } else {
      this.addMenuItem();
    }
  }

  initializeForm() {
    const defaultDt = this.convertToDateStruct(Date.now());

    this.form = this.fb.group({
      scheduledDate: [defaultDt, Validators.required],
      menuItems: this.fb.array([]),
    });
  }

  onCreateMenuItem() {
    return this.fb.group({
      name: ['', Validators.required],
      regularPrice: ['', [Validators.required, Validators.min(1)]],
      halfPrice: ['', [Validators.required, Validators.min(1)]],
    });
  }

  saveMenu() {
    this.isSaving = true;

    const {
      scheduledDate
    } = this.form.value;

    this.menuService.createMenu({
      ...this.form.value,
      scheduledDate: moment.tz(this.dateFormatter.format(scheduledDate)).toDate()
    }).subscribe((res) => {
      this.isSaving = false;
      this.activeModal.close('success');
    })
  }

  patchMenu(menu: Menu) {
    const {
      scheduledDate
    } = this.form.controls;

    scheduledDate.patchValue(this.convertToDateStruct(menu.scheduledDate));
    
    if (menu.menuItems.length) {
      menu.menuItems.forEach((x) => {
        const item = this.onCreateMenuItem();
        item.patchValue(x as any);
        this.menuItems.push(item);
      });
    }
  }

  convertToDateStruct(date: any) {
    const dt = new Date(date);

    const defaultDt: NgbDateStruct = {
      day: dt.getDate(),
      month: dt.getMonth()+1,
      year: dt.getFullYear(),
    };

    return defaultDt;
  };

  addMenuItem() {
    this.menuItems.push(this.onCreateMenuItem());
  }

  deleteItem(index: number) {
    this.menuItems.removeAt(index);
  }

  get menuItems() {
    return this.form.controls['menuItems'] as any;
  }

  get formControl() {
    return this.form.controls;
  }
}
