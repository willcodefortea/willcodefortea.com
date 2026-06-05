---
title:  "SOLID Principles - D"
categories: what-is
layout: single

header:
  overlay_image: /assets/images/what-is/solid-d/injection.jpeg
  overlay_filter: 0.6
excerpt: SOLID is an acronym for several programming principles for object-orientated programming that aim to create understandable, readable, and testable code. I is the Dependency Inversion principle, which states that code should depend on abstractions, not concrete implementations; that a high-level module must not depend on a low-level module.
---

SOLID: an acronym for a collection of object-orientated programming principles, that aim to create understandable, readable, and testable code.

* S - Single Responsibility
* O - Open-Closed
* L - Liskov Substitution
* I - Interface Segregation
* **D - Dependency Inversion**

## Dependency Inversion

This principle is all about decoupling. If you've read a previous "what-is" on [hexagonal architecture](/what-is/hexagonal-architecture/), then you would have seen this in action already. In all likelihood, this is the most common and widely applied of the SOLID principles, thanks in part to automated testing. (It's much easier to mock functionality when they are dependencies.)

So let's go back our mythical creature rental company. After you've had your event with your mythical creature, it sure would be nice to be able to leave a review.

```typescript
interface Review {
  id?: string;
  text: string;
  helpfulCount: number;
  imageURLs: string[];
};

class Dragon {
  name: string;
  reviews: Review[];

  constructor (name: string, reviews: Review[]) {
    this.name = name;
    this.reviews = reviews;
  }

  addReview(review: Review) {
    this.reviews.push(review);
  }
}

class MySqlDragonRepository {
  constructor() {
    // handle client creation etc
  }

  async saveDragon(dragon: Dragon): Promise<void> {
    // serialize and write to tables
  }
}

const reviewDragon = async (
  dragon: Dragon,
  userReview: string,
  imageURLs: string[],
  repo: MySqlDragonRepository
): Promise<void> => {
  const review = {
    text: userReview,
    imageURLs,
    helpfulCount: 0,
  };
  dragon.addReview(review);
  await repo.saveDragon(dragon);
};
```

Great, we're able to take a user's textual review and any images and store them against our dragon instance. But what if we needed to change from MySQL to Aurora? Or Redis? How would we go about testing this without needed to do a full integration test with MySQL every time?

To take a line from Raymond Hettinger - an incredible python trainer / speaker - there must be a better way!

What if we followed this dependency inversion rule? What would that look like?

```typescript
interface DragonRepository {
  saveDragon: async (dragon: Dragon) => Promise<void>;
}

class MySqlDragonRepository extends DragonRepository {
  constructor() {
    // handle client creation etc
  }

  async saveDragon(dragon: Dragon): Promise<void> {
    // serialize and write to tables
  }
}

const reviewDragon = async (
  dragon: Dragon,
  userReview: string,
  imageURLs: string[],
  repo: DragonRepository  // Changed to depend on the repository abstraction
): Promise<void> => {
  const review = {
    text: userReview,
    imageURLs,
    helpfulCount: 0,
  };
  dragon.addReview(review);
  await repo.saveDragon(dragon);
};
```

Wonderful. Now our higher level code has no idea about the implementation detail of the lower level repository. It just is aware of the _interface_, which means we can very easily mock and spy on the behaviour in tests.

Well.. that was easy. 🎉
