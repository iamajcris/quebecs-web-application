import { Component, OnInit, Input } from '@angular/core';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Customer } from 'src/models/customer';
import { CustomerService } from 'src/services/customer.service';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss']
})
export class AddCustomerComponent implements OnInit {
  isSaving: boolean = false;
  form: FormGroup;
  @Input() public customer: Customer;

  constructor(
    public activeModal: NgbActiveModal,
    public formBuilder: FormBuilder,
    private customerService: CustomerService,
  ) { }

  ngOnInit(): void {
    this.form = this.intializeForm();

    if (this.customer) {
      this.form.patchValue(this.customer);
    }
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

    if (this.customer) {
      this.customerService.updateCustomer(this.customer.id, this.form.value).subscribe((res) => {
        this.isSaving = false;
        this.activeModal.close('success');
      });
    } else {
      this.customerService.saveCustomer(this.form.value).subscribe((res) => {
        this.isSaving = false;
        this.activeModal.close('success');
      });
    }
  }

  delete(id: any) {
    this.customerService.deleteCustomer(id).subscribe((res) => {
      this.activeModal.close('success');
    });
  }
}
