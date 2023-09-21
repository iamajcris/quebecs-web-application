import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Customer } from 'src/models/customer';
import { CustomerService } from 'src/services/customer.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  isSaving: boolean = false;
  form: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    public formBuilder: FormBuilder,
    private customerService: CustomerService,
    ) {

  }

  ngOnInit(): void {
    this.form = this.intializeForm();
  }

  intializeForm() {
    return this.formBuilder.group({
      lastName: [''],
      firstName: [''],
      address: [''],
      mobileNumber: ['']
    });
  }

  save() {
    this.isSaving = true;

    this.customerService.saveCustomer(this.form.value).subscribe((res) => {
      this.isSaving = false;
      this.activeModal.close('success');
    });
  }
}
