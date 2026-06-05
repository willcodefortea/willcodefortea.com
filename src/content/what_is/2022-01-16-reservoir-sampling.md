---
title:  "Reservoir Sampling"
categories: what-is
layout: single

header:
  overlay_image: /assets/images/what-is/reservoir/reservoir.jpeg
  overlay_filter: 0.6
excerpt: Taking a random sample from N items is reasonably simple, but what if we don't know the upper limit? How can we ensure each item is equally likely to be selected?
---

Taking a random sample of size _k_ from a set of known size _n_, is very easy to do. All we need to do is take elements from _k_ indices with equal probability and no duplication. As code, that might look something like this:

```typescript
function takeKnownSample<T>(items: T[], k: number): T[] {
  if (items.length <= k) {
    // fewer items than we want to sample, so return them all
    return [...items];
  }

  const seen = set<number>();
  const sample: T[] = [];

  while (items.length < k) {
    const index = Math.floor(random() * items.length);
    if (seen.has(index)) {
      continue;
    }

    sample.push(items[index]);
    seen.add(index);
  }

  return sample;
}
```

But what happens if we have a stream of data of unknown length? How can we ensure that we take a sample of each?

Imagine a conveyor belt or baggage carousel passing you by. Items appear through a hole in the wall, are accessible, and then disappear, never to be seen again. Your task is to take `n` items from the belt, with a random distribution. (As a programmer, this may be a stream of data being supplied over a network that is too large to hold in memory or persist locally.)

The first step is to build our "reservoir", which is to say the sample we'll be collecting. We have no idea how many items we'll see, so first we collect the first `n` items and put them to one side. But what about all the others?

## Enter Algorithm R

The simplest approach is to do the following. If the current item number is `i` then:

1. Create a random integer between zero and `i-1`
2. If that integer matches an index in our reservoir, then replace the item at that index
3. Continue until stream is exhausted.

Well that was simple. What's actually happening here? How do we end up with a random sample?

Mathematicians have a tendency of being rather clever, and there are a few things about the above algorithm which explain how it works. First thing to notice is that the likelihood of an item `i` replacing an item in the reservoir decreases with its index. For each item, the probability of it entering the reservoir is:

$$P_{i} = {n \over i}$$


What about items in the reservoir? What's the probability that they are replaced? This is given by combining the probability of our selection entering the reservoir, $P_{n}$, with the likelihood of the replacement having ocurred at all, $P_{i}$:

$$P_{n} \times P_{i}$$

or

$${1 \over n} \times {n \over i} = {1 \over i}$$

So over the course of the algorithm's execution, for each element in the reservoir `j`, we have:

$${n \over j} \times (1 - {1 \over {j + 1}}) \times (1 - {1 \over {j + 2}}) \; \times \; ... \;\times \; (1 - {1 \over {N}}) $$

Which becomes

$${n \over j} \prod_{i=j+1}^{N}(1 - {1 \over i}) = {n \over N} $$

Where `N` is the total number of elements seen.

> For the record, I am not a mathemitican. These probabilities and equations are taken straight from a [Wikipedia article](https://en.wikipedia.org/wiki/Reservoir_sampling) on the same subject. I just wanted to show the maths here as it's pretty interesting (and to play around with [mathjax](http://docs.mathjax.org/en/latest/index.html)).

As code, this looks something like the following:

```typescript
function takeSample<T>(items: Iterable<T>, n: number): T[] {
  // Algorithm R implementation
  const reservoir = [];
  let index = 0;

  for (const item of items) {
    if (reservoir.length < n) {
      reservoir.push(item);
    } else {
      const itemIndex = Math.floor(random() * index);
      if (itemIndex < n) {
        reservoir[itemIndex] = item;
      }
    }

    index++;
  }
  return reservoir;
}
```

Nice! For many use cases this algorithm is fine, but one may note that this is $O(n)$ in complexity as we have to generate a random number for each item in the stream above the reservoir size. This can be improved to $O(n(1 + log({N \over n}))$ using a more sophisticated method called Algorithm L, which I may cover here in future!


<script type="text/x-mathjax-config">
MathJax.Hub.Config({
  tex2jax: {
    inlineMath: [['$','$'], ['\\(','\\)']],
    processEscapes: true
  }
});
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
