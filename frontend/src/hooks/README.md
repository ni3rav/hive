1. Import the api function from `@/api`
2. use `useMutation` or `useQuery` for _GET_ or _POST_(along with _PUT_,
   _DELETE_) respectively

## Example

### GET

```javascript
import { useQuery } from "@tanstack/react-query";
import { getUsers, getUserById } from "@/api/user";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
};

export const useUserById = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
  });
};
```

### POST, DELETE, PUT

```javascript
import { useMutation } from '@tanstack/react-query';
import { createUser } from '@/api/user';

export const useCreateUser = () => {
  return useMutation({
    mutationFn: createUser,
  });
};
```

## That's it, now these hooks in components can be consumed in components

### Example

#### GET

```javascript
import { useUsers } from '@/hooks/useUsers';

export const UsersPage = () => {
  const { data, isLoading, isError, isSuccess, error } = useUsers();

  if (isLoading) return <p>Loading users...</p>;

  if (isError) return <p>Error loading users: {error.message}</p>;

  if (isSuccess && data.length === 0)
    return <p>No users found in the system.</p>;

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {data?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

#### PUT

```javascript
import { useState } from "react";
import { useCreateUser } from "@/hooks/useCreateUser";

export const CreateUserPage = () => {
  const [name, setName] = useState("");
  const { mutate, isLoading, isError, isSuccess, error } = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ name });
  };

  return (
    <div>
      <h2>Create New User</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create"}
        </button>
      </form>

      {isError && <p className="text-red-400">Error: {error.message}</p>}
      {isSuccess && (
        <p className="text-green-400">User created successfully </p>
      )}
    </div>
  );
};
```
