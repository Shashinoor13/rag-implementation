# RAG Backend API

## Authentication

- `POST /api/auth/register`  
  Register a new user. Requires `username`, `email`, and `password` in JSON body.

- `POST /api/auth/login`  
  Login with username and password. Sets a JWT in an HTTP-only cookie.

- `POST /api/auth/logout`  
  Logout the current user. Unsets the JWT cookie.


---

## Document Upload

- `POST /api/upload/document`  
  Upload a `.txt` file (multipart/form-data, field name: `file`). Stores the content and its embedding in the database.

---

## Query

- `POST /api/query/`  
  (Assumed) Query the system (details depend on your implementation).

---

## Other Endpoints

- `/api/history/`, `/api/revalidate/`, `/api/feedback/`  
  (See code for details.)

---

## Notes
- All endpoints return JSON responses.
- Authentication uses JWT in HTTP-only cookies.
- Embeddings are generated using sentence-transformers at upload time. 
- I have used Gemini API which might be rate limited after some usage.

---

## How to run
```

docker compose build
docker compose up

```
the api will be abaliable in port 8000

### Postman documentation is avaliable in while some might be missing.
https://identity.getpostman.com/handover/multifactor?user=27360011&handover_token=5e049957-15ea-4253-a58e-e5933309a3fc