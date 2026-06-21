"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductUseCase = void 0;
const Product_1 = require("../../domain/entities/Product");
class CreateProductUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async execute(dto) {
        const product = new Product_1.Product(crypto.randomUUID(), dto.title, dto.description, dto.price, dto.stock, dto.sellerId, new Date());
        await this.productRepository.save(product);
        return product;
    }
}
exports.CreateProductUseCase = CreateProductUseCase;
