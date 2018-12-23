import { LightningElement, track } from 'lwc';

export default class HelloWorld extends LightningElement {
    @track firstName = 'User';
    @track lastName = 'Connected';

    changeFirstnameHandler(event) {
        this.firstName = event.target.value;
    }

    changeLastnameHandler(event) {
        this.lastName = event.target.value;
    }
}