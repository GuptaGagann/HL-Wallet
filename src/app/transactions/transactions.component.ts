import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent {
  @Input() transactions: Array<any> = [];
  public selectedIndex: number = -1;

  public toggleRowSelection(rowIndex: number) {
    this.selectedIndex = rowIndex === this.selectedIndex ? -1 : rowIndex;
  }
}
