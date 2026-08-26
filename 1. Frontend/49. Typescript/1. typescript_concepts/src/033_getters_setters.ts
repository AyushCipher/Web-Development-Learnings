// get - Used to read a value
// set - Used to update a value safely

// Store temperature internally in Celsius, but allow user to read/write in both Celsius and Fahrenheit
class Temperature {
  #c = 0;

  constructor(celsius: number) {
    this.celsius = celsius;
  }

  get celsius(): number {
    return this.#c;
  }

  set celsius(value: number) {
    if (Number.isNaN(value))
      throw new Error("not a number! please check input");
    this.#c = value;
  }

  // Converts Celsius → Fahrenheit
  get fahrenheit(): number {
    return (this.#c * 9) / 5 + 32;
  }

  // Converts Fahrenheit → Celsius
  set fahrenheit(f: number) {
    this.celsius = ((f - 32) * 5) / 9;
  }
}

const t1 = new Temperature(10);

console.log(t1.celsius);     // 10
console.log(t1.fahrenheit);  // 50

t1.celsius = 20;
console.log(t1.celsius);     // 20
console.log(t1.fahrenheit);  // 68
