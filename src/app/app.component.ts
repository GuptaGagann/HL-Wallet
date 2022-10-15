import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { WalletService } from './wallet.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'HL-Wallet-UI';
  public setupForm: any;
  public setupStatus: boolean = false;
  public setupMessage: string = '';
  public walletDetails: any;
  public noWalletsMessage: string = '';

  constructor(public walletService: WalletService, private fb: FormBuilder) {}

  public ngOnInit() {
    if (localStorage.getItem('walletId')) {
      this.setupStatus = true;
    }
    this.resetSetupForm();
    this.getWalletDetails();
  }

  public resetSetupForm() {
    this.setupForm = this.fb.group({
      name: ['', [Validators.required]],
      balance: [null, [Validators.required, Validators.pattern('[0-9]*')]],
    });
    this.setupMessage = '';
  }

  public setup() {
    this.walletService.initialSetup(this.setupForm.value).subscribe({
      next: (value) => {
        console.log(value);
        localStorage.setItem('walletId', value.data.walletSetup.id.toString());
        this.getWalletDetails();
        this.setupStatus = true;
        this.setupMessage =
          'Setup successful for Wallet ID: ' + value.data.walletSetup.id;
      },
      error: (err) => {
        console.log(err);
        this.setupMessage = err.error.message.message;
      },
    });
  }

  public getWalletDetails() {
    if (localStorage.getItem('walletId')) {
      this.walletService
        .getWalletDetails(Number(localStorage.getItem('walletId')))
        .subscribe({
          next: (value) => {
            console.log(value);
            this.walletDetails = value.data.walletEntry;
            this.noWalletsMessage = '';
          },
          error: (err) => {
            console.log(err);
            this.noWalletsMessage = err;
          },
        });
    }
  }
}
