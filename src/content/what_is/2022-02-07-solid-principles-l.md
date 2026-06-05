---
title:  "SOLID Principles - L"
categories: what-is
layout: single

header:
  overlay_image: /assets/images/what-is/solid-l/Substitute_Teacher_70509.jpeg
  overlay_filter: 0.6
excerpt: SOLID is an acronym for several programming principles for object-orientated programming that aim to create understandable, readable, and testable code. L is the Liskov Substitution principle, which states that any child of a parent class should be able to replace it without breaking the program.
---

SOLID: an acronym for a collection of object-orientated programming principles, that aim to create understandable, readable, and testable code.

* S - Single Responsibility
* O - Open-Closed
* L - **Liskov Substitution**
* I - Interface Segregation
* D - Dependency Inversion

## Liskov Substitution

So this is a pretty simple principle. If we have one class that inherits another, then any interaction with a parent class should be exchangeable with the child without disrupting the program.


Let's imagine that our mythical creature rental business (a common example in these little posts) has grown and now has many employees! We've created a simple HR platform to keep track of and report on our team. Neat.

```typescript
type Allergy = "dragons" | "unicorns" | "mermaids";

class Employee {
  private id: string;
  private allergies: Allergy[];

  constructor(employeeId: string, allergies: Allergy[]) {
    this.id = employeeId;
    this.allergies = allergies;
  }

  /**
    Talk to the salary service and fetch the employee's salary.
  */
  async getSalary(): Promise<number> {
    return someSalaryService.getEmployeeSalary(this.id);
  }

  // You get the idea, there could be a lot more here...
}
```

Then in order to report on their salaries, we need some method to gather them:

```typescript
const getMonthlyCost = async (employees: Employee[]): Promise<number[]> => {
  const promises = employees.map((employee) => employee.getSalary() / 12);
  const salaries = await Promise.all(promises);
  return salaries;
}
```

Great! But we're growing really quickly and now need to take on some contractors. Their behaviour is a little different, as they are paid a daily rate.

```typescript
class Contractor extends Employee {
  async getSalary(): Promise<number> {
    throw new Error("Contractors do not get paid a salary");
  }

  async getDayRate(): Promise<number> {
    return someDayRateService.getContractorDayRate(this.id);
  }
}
```

But now if we pass a `Contractor` instance to our `getMonthlyCost` function, it will error! We've implemented a class that if we were to use in replacement for a parent, will no longer work. So how do we fix it? There are a few ways, but the simplest (and therefore arguably the best) is to tackle this problem by altering the interface to `Employee`.

```typescript
class Employee {
  constructor(private id: string, private allergies: Allergy[]) {
    this.id = id;
    this.allergies = allergies;
  }

  /**
    Talk to the salary service and fetch the employees salary.
  */
  async getMonthlyCost(): Promise<number> {
    return someSalaryService.getEmployeeSalary(this.id) / 12;
  }
}

class Contractor extends Employee {
  constructor(id: string, allergies: Allergy[], private daysWorked: number) {
    super(id, allergies);

    this.daysWorked = daysWorked;
  }

  async getMonthlyCost(): Promise<number> {
    const rate = await someContractorService.getContractorRate(this.id);
    return rate * this.daysWorked;
  }
}
```

Then our `getMonthlyCost` becomes:

```typescript
const getMonthlyCost = async (employees: Employee[]): Promise<number[]> => {
  const promises = employees.map((employee) => employee.getMonthlyCost());
  const salaries = await Promise.all(promises);
  return salaries;
}
```

Now if we were to introduce a new type of `Employee`, maybe one who doesn't work every other month, then we could implement the same interface and none of our downstream code would need to change! Huzzah!
