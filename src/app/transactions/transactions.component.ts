import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent implements OnChanges {
  @Input() transactions: Array<any> = [];
  @Input() selectedTabIndex: number = 0;
  public selectedIndex: number = -1;

  public ngOnChanges() {
    this.selectedIndex = -1;
  }

  public toggleRowSelection(rowIndex: number) {
    this.selectedIndex = rowIndex === this.selectedIndex ? -1 : rowIndex;
  }
}
