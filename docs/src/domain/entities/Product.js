"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
class Product {
    constructor(id, title, description, price, stock, sellerId, createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.sellerId = sellerId;
        this.createdAt = createdAt;
    }
}
exports.Product = Product;
