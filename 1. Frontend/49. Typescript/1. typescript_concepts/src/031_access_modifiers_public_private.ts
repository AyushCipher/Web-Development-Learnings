// ENCAPSULATION CONCEPTS:

class BankAccount {
  public owner: string; 

  private balance = 0;  // private, only accessible inside the class, not even in subclasses

  #otp = 123456;        // super private, only accessible inside the class, not even in subclasses

  constructor(owner: string) {
    this.owner = owner;
  }

  deposit(amt: number) {
    if (amt <= 0) throw new Error("Amount must be positive");
    this.balance += amt;
  }

  getBalance() {
    return this.balance;
  }

  verifyOtp(code: number) {
    return this.#otp === code; // only accessible inside the class
  }
}

const acc = new BankAccount("Ayush");
acc.deposit(5000);
console.log(acc.getBalance());  // 5000
acc.verifyOtp(123456)           // true

// acc.balance    ❌ private
// acc.#otp       ❌ completely hidden
