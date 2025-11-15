# POST `/auth/signup`

## Request

### Request Headers

`Content-Type`: `application/json`

### Request Body

```json
{
    "email": "string",
    "password": "string",
    "first_name": "string",
    "last_name": "string",
    "city": "string",
    "state": "string",
    "desired_job_tiles": ["string"]
}
```

## Response

### 200 OK

#### Response Headers

`Set-Cookie`: `authToken={token}; Expires={expiration}; HttpOnly; Secure`

### 409 Conflict (Account already exists) 

#### Response Headers

No headers

### 400 Bad Request

#### Response Headers

No headers