



```markdown
# Hacker News Real-time Feed

A real-time web application that scrapes and displays Hacker News stories using WebSocket for live updates and MySQL for persistence.

## Quick Start

1. **Clone and Install**
```bash
$ git clone https://github.com/vink08/Hacker-News-Scrap
$ cd frontpage
$ npm install
```

2. **Database Setup**
```bash
# Login to MySQL
mysql -u root -p

# Copy and paste the contents of init.sql
CREATE DATABASE IF NOT EXISTS hacker_news;
USE hacker_news;
CREATE TABLE IF NOT EXISTS stories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    url VARCHAR(255) NOT NULL,
    points INT,
    posted_at DATETIME NOT NULL
);
```

3. **Configure Database**
```javascript
// Update config/db.js with your credentials
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'hacker_news',
    connectionLimit: 10
});
```

4. **Start the Server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Usage Guide

### REST API

1. **Server Check**
```bash
# Check if the server is running
curl http://localhost:8080/
```

2. **Fetch All Stories**
```bash
# Get all stories from the database
curl http://localhost:8080/stories
```

Example Response:
```json
[
  {
    "id": 1,
    "title": "'The Path of Our Lives'",
    "url": "'https://steveblank.com/2014/07/08/the-path-of-our-lives/'",
    "points": 19,
    "posted_at": "2025-01-18 19:05:30"
  }
]
```

### WebSocket API

1. **Browser Usage**
```javascript
// Connect to WebSocket server
const ws = new WebSocket('ws://localhost:8080');

// Handle initial data load
ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    
    if (data.type === 'initial') {
        // Handle initial stories
        console.log('Initial stories:', data.stories);
        console.log('Story count:', data.count);
    } else if (data.type === 'update') {
        // Handle new stories
        console.log('New stories:', data.stories);
    }
};

// Handle connection errors
ws.onerror = function(error) {
    console.error('WebSocket error:', error);
};

// Handle disconnection
ws.onclose = function() {
    console.log('Connection closed');
};
```


## Data Format

### Story Object Structure
```javascript
{
    "id": Number,          
    "title": String,       
    "url": String,        
    "points": Number,     
    "posted_at": String  
}
```

## WebSocket Events

1. **Initial Load (`type: 'initial'`)**
```javascript
{
    type: 'initial',
    count: Number,        
    stories: Story[]     
}
```

2. **Updates (`type: 'update'`)**
```javascript
{
    type: 'update',
    stories: Story[]    
}
```

## Development Setup

1. **Run with Nodemon (auto-reload)**
```bash
npm run dev
```

2. **Access the Frontend**
- Open `test.html` in a browser
- Or serve it using a local server:

![image](https://github.com/user-attachments/assets/6465976a-d89d-43e9-be03-cfa95ebd97fb)


