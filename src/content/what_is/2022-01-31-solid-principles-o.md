---
title:  "SOLID Principles - O"
categories: what-is
layout: single

header:
  overlay_image: /assets/images/what-is/solid-o/dragon.jpeg
  overlay_filter: 0.6
excerpt: SOLID is an acronym for several programming principles for object-orientated programming that aim to create understandable, readable, and testable code. O is the Open-Closed principle; it explains than an object should be open for extension, but closed for modification.
---

SOLID: an acronym for a collection of object-orientated programming principles, that aim to create understandable, readable, and testable code.

* S - Single Responsibility
* **O - Open-Closed**
* L - Liskov Substitution
* I - Interface Segregation
* D - Dependency Inversion


## Open-Closed

The essential idea of this principle is that we create code that allows us to add new functionality without changing existing code. It's easy to imagine a situation in which you need to update various dependant classes because of a modification that was made to their parent. This principal aims to avoid that.

> Inheritance can side-step this issue by creating a new class that extends the parent, creating an entirely new reference. However all this really does is move the problem elsewhere, as the sub-class is tightly coupled to the parent.

As an example, let's imagine you have a dragon rental agency. When a customer makes an order for their mythical creature, we need to be able to tell them how much their order will cost. That's pretty simple right?

```typescript
type Dragon = {
  name: string;
  family: "wyvern" | "wyrm" | "dragon";
  temperament: "friendly" | "rageful" | "kind";
};

const getTotalCost = (dragons: Dragon[]) => {
  return dragons
    .map(
      (dragon) => {
        switch (dragon.family) {
          case wyvern:
            return 100;
          case wyrm:
            return 250
          case dragon:
            return 500
        }
      }
    )
    .reduce((sum, current) => sum + current, 0);
};
```

Well that's simple, isn't it? But we can immediately see that if we wanted to add a new dragon family to the set, say, a Drake, we'd need to update the `getTotalCost` method in order to handle it. If, instead, the `Dragon` type included a price, then we'd have something that looked like this:

```typescript
type Dragon = {
  name: string;
  family: "wyvern" | "wyrm" | "dragon";
  temperament: "friendly" | "rageful" | "kind";
  price: number;
};

const getTotalCost = (dragons: Dragon[]) => {
  return dragons
    .map((dragon) => dragon.price)
    .reduce((sum, current) => sum + current, 0);
};
```

Now, `getTotalCost` has no reason to change at all upon the introduction of a new dragon type!

This is a pretty basic example, but `getTotalCost` is said to be open to extension because it will support additional objects that implement the Dragon type, but what if we wanted to support unicorns too? Can we make this method generic?

```typescript
type Price = {
  price: number;
}

const getTotalCost = (items: Price[]) => {
  return items
    .map((item) => item.price)
    .reduce((sum, current) => sum + current, 0);
}
```

So now we have an function that will find the prices of _any_ collection of objects, as long as they have the required price field. We never need to implement this logic again! _This_ is the power of the Open-Closed principle; it forces us to encapsulate logic, decoupling it from implementation details and protecting us from changes in the future.

Neat.
