// protected -> Access to Inside class, Child class but not outside the class

class Animal {
  protected energy = 23;

  eat(amount: number) {
    this.energy = Math.min(100, this.energy + amount);    // Add energy, but never let it go above 100
  }
}

class Dog extends Animal {
  run() {
    this.energy -= 10;
  }

  status() {
    return this.energy;
  }
}

const d = new Dog();
d.eat(10);            // energy = 23 + 10 = 33
d.run();              // energy = 33 - 10 = 23    
d.status();           // returns 23

// d.energy
