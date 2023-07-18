import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { MenuService } from 'src/services/menu.service';

@Component({
  selector: 'app-add-menu',
  templateUrl: './add-menu.component.html',
  styleUrls: ['./add-menu.component.scss']
})
export class AddMenuComponent implements OnInit {
  form: FormGroup;
  isSaving: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private dateFormatter: NgbDateParserFormatter,
    private menuService: MenuService,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    const defaultDt: NgbDateStruct = {
      day: moment().date(),
      month: moment().month()+1,
      year: moment().year(),
    };

    this.form = this.fb.group({
      scheduledDate: [defaultDt, Validators.required],
      menuItems: this.fb.array([]),
    });

    this.addMenuItem();
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

    console.log(this.form.value);
    this.menuService.createMenu({
      ...this.form.value,
      scheduledDate: moment(this.dateFormatter.format(scheduledDate)).toDate()
    }).subscribe((res) => {
      console.log(res);
      this.isSaving = false;
      this.activeModal.close('success');
    })
  }

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
