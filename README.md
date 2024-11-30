# Notification Management Service (Itamar Carmel)

## **Setup**
```bash
npm install
```

### **Run Locally**
```bash
npm run build
npm run start
```

### **Run on Docker**
```bash
docker-compose up --build
```

## **Test (unit test)**
```bash
npm run test
```

## **CURL examples**

### Create user preferences
**Request:**
```bash
curl 'http://localhost:8080/userPreferences' \
-H 'Content-Type: application/json' \
--data-raw '{
    "email": "ita@gmail.com",
    "phone": "+1234567890",
    "preferences": {
        "sms": true,
        "email": true
    }
}'
```

**Response:**
```json
{
    "userId": "9e27d09a-62fb-475f-8b1f-fc97a7ddf836"
}
```

### Get user preferences by ID
**Request:**
```bash
curl 'http://localhost:8080/userPreferences/{userId}'
```

**Response:**
```json
{
    "userId": "9e27d09a-62fb-475f-8b1f-fc97a7ddf836",
    "email": "ita@gmail.com",
    "phone": "+1234567890",
    "preferences": {
        "sms": true,
        "email": true
    }
}
```

### Get user preferences page
**Request:**
```bash
curl 'http://localhost:8080/userPreferences?offset=0&limit=100'
```

**Response:**
```json
{
    "_metadata": {
        "total": 1,
        "offset": 0,
        "limit": 100
    },
    "userPreferences": [
        {
            "userId": "9e27d09a-62fb-475f-8b1f-fc97a7ddf836",
            "email": "ita@gmail.com",
            "phone": "+1234567890",
            "preferences": {
                "sms": true,
                "email": true
            }
        }
    ]
}
```

### Update user preferences by ID
**Request:**
```bash
curl -X PUT 'http://localhost:8080/userPreferences/{userId}' \
-H 'Content-Type: application/json' \
--data-raw '{
    "email": "pita@gmail.com"
}'
```

**Response:**
```json
OK
```

### Send notification to user by ID
**Request:**
```bash
curl 'http://localhost:8080/notifications' \
-H 'Content-Type: application/json' \
-d '{
    "userId": {userId},
    "message": "hi there!!"
}'
```

**Response:**
```json
{
    "notificationId": "5d569f00-6422-438c-a525-4e240f81f791",
    "pending": {
        "email": 0,
        "sms": 0
    }
}
```

### Get notification status
**Request:**
```bash
curl 'http://localhost:8080/notifications/{notificationId}'
```

**Response:**
```json
{
    "notificationId": "5d569f00-6422-438c-a525-4e240f81f791",
    "status": {
        "email": "sent",
        "sms": "sent"
    }
}
```
