export interface Customer {
  id?: string;
  customerId?: string;
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;
  preferredDeliveryTime: string;
}

export class CustomerSearch implements Customer {
  id: string | undefined;
  customerId: string | undefined;
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;
  preferredDeliveryTime: string;

  constructor(customer: Customer) {
    this.id = customer.id;
    this.customerId = customer.customerId;
    this.firstName = customer.firstName;
    this.lastName = customer.lastName;
    this.address = customer.address;
    this.mobileNumber = customer.mobileNumber;
    this.preferredDeliveryTime = customer.preferredDeliveryTime;
  }

  get fullname() {
    return `${this.firstName} ${this.lastName}` 
  }

  get fullCustomerDetail() {
    return `${this.fullname} - ${this.address} - ${this.mobileNumber}`;
  }
}