export interface Customer {
  id?: number;
  customerId?: number;
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;
}

export class CustomerSearch implements Customer {
  id: number | undefined;
  customerId: number | undefined;
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;

  constructor(customer: Customer) {
    this.id = customer.id;
    this.customerId = customer.customerId;
    this.firstName = customer.firstName;
    this.lastName = customer.lastName;
    this.address = customer.address;
    this.mobileNumber = customer.mobileNumber;
  }

  get fullname() {
    return `${this.firstName} ${this.lastName}` 
  }

  get fullCustomerDetail() {
    return `${this.fullname} - ${this.address} - ${this.mobileNumber}`;
  }
}