# Domain Model

## Entities

### User
- id
- email
- password
- role

### Product
- id
- title
- price
- stock
- sellerId

### Order
- id
- userId
- items
- totalPrice
- status

### OrderItem
- productId
- quantity
- price

## Relations
User 1 → N Orders  
Order 1 → N OrderItems  
Product 1 → N OrderItems

## Diagram

User → Order → OrderItem → Product