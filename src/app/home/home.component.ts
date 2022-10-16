import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { WalletService } from '../wallet.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public showAddTransaction: boolean = false;
  public addForm: any;
  public transactionStatus: boolean = false;
  public transactionStatusMessage: string = '';
  public showTransactions: boolean = false;
  public transactions: Array<any> = [];
  public noTransactionsMessage: string = '';
  @Input() public isWalletSetup: boolean = false;
  @Output() public refreshBalance = new EventEmitter();

  constructor(public walletService: WalletService, private fb: FormBuilder) {}

  public ngOnInit() {
    console.log('setup status', this.isWalletSetup);
  }

  public toggleTransactionsView() {
    this.showTransactions = !this.showTransactions;
    if (this.showTransactions) {
      this.getTransactions();
    }
  }

  public getTransactions() {
    if (localStorage.getItem('walletId')) {
      this.walletService
        .getTransactionsByWalletId(Number(localStorage.getItem('walletId')))
        .subscribe({
          next: (value) => {
            console.log(value);
            this.transactions = value.data.transactions;
            if (this.transactions.length > 0) {
              this.showTransactions = true;
            }
            this.noTransactionsMessage = '';
          },
          error: (err) => {
            console.log(err);
            this.transactions = [];
            this.noTransactionsMessage = err.error.data.message;
          },
        });
    } else {
      this.walletService.getTransactions().subscribe({
        next: (value) => {
          console.log(value);
          this.transactions = value.data.transactions;
          if (this.transactions.length > 0) {
            this.showTransactions = true;
          }
          this.noTransactionsMessage = '';
        },
        error: (err) => {
          console.log(err);
          this.noTransactionsMessage = err.error.data.message;
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
    this.addForm.value.amount =
      this.addForm.value.type === 'CREDIT'
        ? this.addForm.value.amount
        : -1 * this.addForm.value.amount;
    console.log(this.addForm.value);
    if (localStorage.getItem('walletId')) {
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
            }, 4000);
          },
          error: (err) => {
            console.log(err);
            this.transactions = [];
            this.transactionStatus = false;
            this.transactionStatusMessage = err.error.data.error.message;
            this.getTransactions();
            this.refreshBalance.emit();
          },
        });
    } else {
      this.transactionStatusMessage =
        'Please setup a wallet before start transacting!';
    }
  }
}
