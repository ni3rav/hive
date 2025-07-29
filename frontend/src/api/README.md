1. import wrappers based on the request type
2. import types from `@/types`
3. use types with the wrapper and the endpoint url (don't write while url just the endpoint)

#### Example

```javascript
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import {User} from "@/types/user"

// GET all users
export const getUsers = () => apiGet<User[]>("/users");

// GET user by ID
export const getUserById = (id: string) => apiGet<User>(`/users/${id}`);

// POST create user
export const createUser = (user: Omit<User, "id">) =>
  apiPost<User, Omit<User, "id">>("/users", user);

// PUT update user
export const updateUser = (user: User) =>
  apiPut<User, User>(`/users/${user.id}`, user);

// DELETE user
export const deleteUser = (id: string) => apiDelete(`/users/${id}`);
```
