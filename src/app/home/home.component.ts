import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { WalletService } from '../wallet.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnChanges {
  public showAddTransaction: boolean = false;
  public addForm: any;
  public transactionStatus: boolean = false;
  public nextTransactionEnabled: boolean = true;
  public transactionStatusMessage: string = '';
  public showTransactions: boolean = false;
  public transactions: Array<any> = [];
  public noTransactionsMessage: string = '';
  public tabs: Array<number> = [];
  public selectedTabIndex: number = 0;
  @Input() public isWalletSetup: boolean = false;
  @Output() public refreshBalance = new EventEmitter();

  constructor(public walletService: WalletService, private fb: FormBuilder) {}

  public ngOnInit() {
    console.log('setup status', this.isWalletSetup);
    this.tabs = _.range(1, 11);
  }

  public ngOnChanges() {
    console.log('setup status', this.isWalletSetup);
    this.getTransactions();
  }

  public toggleTransactionsView() {
    this.showTransactions = !this.showTransactions;
    this.selectedTabIndex = 0;
    if (this.showTransactions) {
      this.getTransactions();
    }
  }

  public getTransactions(tabIndex: number = 0) {
    let skipCount = tabIndex * 10;
    let limitCount = 10;
    if (localStorage.getItem('walletId')) {
      this.walletService
        .getTransactionsByWalletId(
          Number(localStorage.getItem('walletId')),
          skipCount,
          limitCount
        )
        .subscribe({
          next: (value) => {
            console.log(value);
            this.transactions = value.data.transactions;
            if (this.transactions.length > 0) {
              this.showTransactions = true;
              this.noTransactionsMessage = '';
            }
          },
          error: (err) => {
            console.log(err);
            this.transactions = [];
            this.noTransactionsMessage = err.error.message;
          },
        });
    } else {
      this.walletService.getTransactions(skipCount, limitCount).subscribe({
        next: (value) => {
          console.log(value);
          this.transactions = value.data.transactions;
          if (this.transactions.length > 0) {
            this.showTransactions = true;
            this.noTransactionsMessage = '';
          }
        },
        error: (err) => {
          console.log(err);
          this.transactions = [];
          this.noTransactionsMessage = err.error.message;
        },
      });
    }
  }

  public toggleAddTransactionView() {
    this.showAddTransaction = !this.showAddTransaction;
    this.resetAddForm();
  }

  public resetAddForm() {
    this.addForm = this.fb.group({
      amount: [null, [Validators.required, Validators.pattern('[0-9]*')]],
      type: ['CREDIT', [Validators.required]],
      description: [''],
    });
  }

  public addTransaction() {
    if (localStorage.getItem('walletId')) {
      this.nextTransactionEnabled = false;
      this.addForm.value.amount =
        this.addForm.value.type === 'CREDIT'
          ? this.addForm.value.amount
          : -1 * this.addForm.value.amount;

      console.log(this.addForm.value);
      if (Number(localStorage.getItem('walletBalance')) + this.addForm.value.amount < 0) {
        this.resetAddForm();
        this.transactionStatus = false;
        this.transactionStatusMessage =
          "Oops! Wallet doesn't have sufficient funds for this transaction.";
        setTimeout(() => {
          this.transactionStatusMessage = '';
          this.nextTransactionEnabled = true;
        }, 1500);
      } else {
        this.walletService
          .addTransaction(
            Number(localStorage.getItem('walletId')),
            this.addForm.value
          )
          .subscribe({
            next: (value) => {
              console.log(value);
              this.transactionStatus = true;
              this.transactionStatusMessage = `${
                this.addForm.value.type == 'CREDIT'
                  ? ' credited to'
                  : ' debited from'
              } Wallet ID: ${Number(localStorage.getItem('walletId'))}`;
              this.getTransactions();
              this.refreshBalance.emit();
              setTimeout(() => {
                this.transactionStatusMessage = '';
                this.resetAddForm();
                this.nextTransactionEnabled = true;
              }, 1500);
            },
            error: (err) => {
              console.log(err);
              this.transactions = [];
              this.transactionStatus = false;
              this.transactionStatusMessage = err.error.message;
              this.getTransactions();
              this.refreshBalance.emit();
            },
          });
      }
    } else {
      this.transactionStatusMessage =
        'Please setup a wallet before start transacting!';
    }
  }

  public updateTabIndex(tabIndex: number) {
    if (tabIndex == this.tabs.length - 1) {
      this.tabs = _.range(1, this.tabs.length + 6);
    } else if (tabIndex <= this.tabs.length - 7 && this.tabs.length > 10) {
      this.tabs = _.range(1, this.tabs.length - 4);
    }
    this.selectedTabIndex = tabIndex;
    this.getTransactions(tabIndex);
  }
}
