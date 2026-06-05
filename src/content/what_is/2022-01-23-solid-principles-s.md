---
title:  "SOLID Principles - S"
categories: what-is
layout: single

header:
  overlay_image: /assets/images/what-is/solid-s/carbon.png
  overlay_filter: 0.6
excerpt: SOLID is an acronym for several programming principles for object-orientated programming that aim to create understandable, readable, and testable code. S is the Single Responsibility principle; it explains how a class, function, or entire program should be responsible for _one_ thing. Or put a different way, a piece of code should only ever have one reason to change.
---

SOLID: an acronym for a collection of object-orientated programming principles, that aim to create understandable, readable, and testable code.

* **S - Single Responsibility**
* O - Open-closed
* L - Liskov substitution
* I - Interface segregation
* D - Dependency inversion


## Single Responsibility

The single responsibility principle simply states that a class, function, or entire program should be responsible for one thing, and one thing only. We describe a piece of code as having _low cohesion_ when it appears to be doing much more than it should (the pieces within it are not closely related), which usually leads to a poorer developer experience.

This can be argued from cognitive load alone; the amount of thinking required to understand a given block of code. If it's doing more, then there's more to think about! All programming is an art of abstraction, and too often we forget to consider the abstraction that we're implementing when we're focussing on a task. We want to get the job done, and by all means there's certainly a time and place for that (as an Engineering Manager I bear some of the responsibility here), but it is a useful exercise to remind ourselves _what_ those abstractions are.

> As an aside, this is one thing I enjoy about creating and maintaining documentation. It forces you to consider what it is that you're implementing and why. Often resulting in avoiding Single Responsibility violations without you noticing!

## A React Example

As an example then, let's fetch a list of users from an API and render them in a list.

```tsx
interface User = {
  name: string;
};

const UserList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // useEffect can't be an async function, but it can call one!
    const fetchUsers = async () => {
      const results = await fetch("/api/users/");
      setUsers(results.json());
      setLoading(false)
    }
    fetchUsers();
  }, []);

  if (loading) {
    return <span>Loading data...</span>
  }

  return (
    <ul>
      {
        users
          .map((user) => (
            <li key={`user-${user.name}`}>{user.name}</li>
          )
      }
    </ul>
  )
};
```

Excellent! The above is a very common situation that you'll find in many React components: Grab some data, put it on the screen. But what responsibilities does this component have?

1. it knows how / where to fetch the data
2. it displays the list of users

Now there are a couple of techniques we could use to fix this. One might be to implement [presentational and container components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) but as Dan Abramov himself states, there are slightly nicer methods for this using _hooks_.

> Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class. - [React docs](https://reactjs.org/docs/hooks-intro.html)

So, what might our hook look like?

```tsx
const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const results = await fetch("/api/users/");
      setUsers(results.json());
      setLoading(false)
    }
    fetchUsers();
  }, []);

  return {
    users, loading
  }
};

const UserList: React.FC = () => {
  const { users, loading } = useUsers();

  if (loading) {
    return <span>Loading data...</span>
  }

  return (
    <ul>
      {
        users
          .map((user) => (
            <li key={`user-${user.name}`}>{user.name}</li>
          )
      }
    </ul>
  )
};
```

Well that's simplified our `UserList` component considerably. Now all it needs to worry about is _what_ to display! Great!

But what about our hook? Is it doing too much? In this case, it's probably fine. Sure, it knows where to get the data from and how to get it. It might also be responsible for handling errors gracefully (if we were to introduce that) but as we have a single data set it feels perfectly fine to encapsulate this behaviour in one place.

If however, we were to introduce _another_ resource say, a user's posts, then it might be worthwhile extracting and abstracting the behaviour from the resource; the _what_ from the _how_.

```typescript
const useFetchJson = <T>(endpoint: string, initialData: T) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T>(initialData);

  useEffect(() => {
    const fetchData = async () => {
      const results = await fetch(endpoint);
      setData(results.json());
      setLoading(false);
    };
    fetchData();
  }, []);

  return { loading, data };
};

const useUsers = () => (
  useFetchJson<User[]>("/api/users/", [])
);

const useUserPosts = (userId: string) => (
  useFetchJson<Post[]>(`/api/user/${userId}/posts`, [])
);
```

Now we have three hooks, all of which are focused on a single thing. If we need to change the endpoint from which we gather users, we modify the hook that's responsible for that, and nothing else. If we need to introduce an error state, we need only modify `useFetchJson` (and of course, anything that wishes to respond to this new data).

Single Responsibility violations are often missed at code-review time, but being vigilant against them can help with the creation of maintainable code, and in turn, developer sanity.
