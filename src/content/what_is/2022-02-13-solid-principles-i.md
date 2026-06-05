---
title:  "SOLID Principles - I"
categories: what-is
layout: single

header:
  overlay_image: /assets/images/what-is/solid-i/separation.png
  overlay_filter: 0.6
excerpt: SOLID is an acronym for several programming principles for object-orientated programming that aim to create understandable, readable, and testable code. I is the Interface Segregation principle, which argues that having multiple focused interfaces is better than one large one.
---

SOLID: an acronym for a collection of object-orientated programming principles, that aim to create understandable, readable, and testable code.

* S - Single Responsibility
* O - Open-Closed
* L - Liskov Substitution
* **I - Interface Segregation**
* D - Dependency Inversion

## Interface Segregation

Interface segregation is based around the notion that several smaller interfaces are better than one large all encompassing one. Or put another way, code should not be required to depend on interfaces it does not use.

Following on from our mythical creature hiring examples, we'd like to display a list of creatures that are available for hire on a given day. To do so, we need to speak to our API.

```typescript
class HttpClient {
  async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
    } catch (e) {
      // TODO: add better error handling.
      console.error("Something went wrong!");
      throw e;
    }
    return response.json();
  }

  async post(url: string, data: string): Promise<void> {
    // TODO implement me.
  }

  async delete(url: string): Promise<void> {
    // TODO implement me.
  }

  async patch(url: string, data: string): Promise<void> {
    // TODO implement me.
  }
}

interface Creature {
  name: string;
  type: "dragon" | "mermaid" | "unicorn";
}

class CreatureApiClient extends HttpClient {
  async getCreatures(): Promise<Creature[]> {
    return this.get<Creature[]>("/api/creatures/");
  }
}
```

Lovely! Our `CreatureApiClient` inherits the common behaviour from `HttpClient`, which might be used for some other APIs and exposes a simple interface to the calling code. Then we can imagine some component that instantiates this API client and renders the creatures:

```tsx
const CreatureList: React.FC = () => {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [fetching, setFetching] = useState(true);

  const useEffect(() => {
    const fetchCreatures = async () => {
      const api = new CreatureApiClient();
      const creatures = await api.getCreatures();

      setCreatures(creatures);
      setFetching(false);
    };

    fetchCreatures();
  }, [setFetching, setCreatures]);

  if (fetching) return <span>Loading...</span>;
  return (
    <ul>
      {creatures.map((creature) => (
        <li key={creature.name}>{creature.name} ({creature.type})</li>
      ))}
    </ul>
  );
}
```

Nice! This will fetch the creatures, and show a beautifully (un)styled list for our users to peruse. Done.

But wait a minute, aren't we supposed to be seeing some kind of Interface segregation in action? Good catch dear reader. The problem with the above example is that the `CreatureApiClient` exposes additional methods from the underlying `HttpClient` that it does not need to. This object would be much better formed using composition, rather than inheritance. i.e.

```typescript
class CreatureApiClient {
  private api: HttpClient;

  constructor() {
    this.api = new HttpClient();
  }

  async getCreatures(): Promise<Creature[]> {
    return this.api.get("/api/creatures/");
  }
}
```

Well, that was simple, and arguably pointless... what have we achieved? Well, the interface that is exposed by the `CreatureApiClient` is now much simpler, and better reflects its intent. There's no opportunity for code that uses this API to make any additional GET requests, and in accordance with this rule there's no code that is exposed that isn't used.

```typescript
// BEFORE
interface CreatureApiClient {
  get: async <T>(url: string) => Promise<T>;
  post: async (url: string, data: string) => Promise<void>;
  delete: async (url: string, data: string) => Promise<void>;
  patch: async (url: string, data: string) => Promise<void>;
  getCreatures: async () => Promise<Creature[]>;
}

// AFTER
interface CreatureApiClient {
  getCreatures: async () => Promise<Creature[]>;
}
```

ahh... _much_ nicer.
