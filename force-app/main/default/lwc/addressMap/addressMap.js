import { LightningElement, track } from 'lwc';

export default class AddressMap extends LightningElement {
    @track zoomLevel = 14;
    @track markers = [];
}