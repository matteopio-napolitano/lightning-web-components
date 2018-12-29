import { LightningElement, track } from 'lwc';

export default class HelloWorld extends LightningElement {
    @track firstName = 'User';

    changeFirstnameHandler(event) {
        this.firstName = event.target.value;
    }
}