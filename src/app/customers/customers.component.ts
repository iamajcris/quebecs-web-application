import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Customer } from 'src/models/customer';
import { CustomerService } from 'src/services/customer.service';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  isLoading: boolean = false;
  customers: Customer[];
  filteredCustomers: Customer[];
  form: FormGroup;

  constructor(
    public fb: FormBuilder,
    private modalService: NgbModal,
		private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      search: ['']
    });

    this.form.controls['search'].valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe((val) => {
        console.log(val)
        this.filteredCustomers = this.customers.filter((c) => {
          const fullName = c.firstName.concat(" ", c.lastName).toLowerCase();
          return fullName.includes(val);
        });

        console.log(this.filteredCustomers);
      });

    this.loadCustomerList();
  }

  loadCustomerList() {
    this.isLoading = true;
    this.customerService.getCustomers({ ps: 100 })
      .subscribe((res) => {
        this.customers = res;
        this.filteredCustomers = res;
        this.isLoading = false;
        console.log(res);
      });
  }

  openCustomerModal(customer?: Customer) {
    const modalRef = this.modalService.open(AddCustomerComponent, {scrollable: true });
    modalRef.componentInstance.customer = customer;
		modalRef.closed.subscribe((res) => {
			if (res === 'success') {
				this.loadCustomerList();
			}
		});
  }
}
