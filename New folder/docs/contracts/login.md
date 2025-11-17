# POST `/auth/login`

## Request

### Request Headers

`Content-Type`: `application/json`

### Request Body

```json
{
    "email": "string",
    "password": "string"
}
```

## Response

### 200 OK

#### Response Headers

`Set-Cookie`: `authToken={token}; Expires={expiration}; HttpOnly; Secure`

### 401 Unauthorized 

#### Response Headers

No headers

### 400 Bad Request

#### Response Headers

No headers