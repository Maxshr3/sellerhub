import { Request, Response } from "express";
import {
  CreateProductRequestDto,
  ProductListQueryDto,
  UpdateProductRequestDto,
} from "../dto/ProductDto";
import { ProductService } from "../services/ProductService";

type ProductParams = {
  id: string;
};

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  getProducts = async (req: Request, res: Response) => {
    const filters: ProductListQueryDto = {
      search:
        typeof req.query.search === "string" ? req.query.search : undefined,
      marketplaceId:
        typeof req.query.marketplaceId === "string"
          ? req.query.marketplaceId
          : undefined,
      isActive: this.parseBooleanQuery(req.query.isActive),
      lowStock: this.parseBooleanQuery(req.query.lowStock),
    };

    const products = await this.productService.getProducts(filters);

    return res.status(200).json({
      data: products,
      total: products.length,
    });
  };

  getProductById = async (req: Request<ProductParams>, res: Response) => {
    const product = await this.productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      data: product,
    });
  };

  createProduct = async (
    req: Request<unknown, unknown, CreateProductRequestDto>,
    res: Response,
  ) => {
    const validationError = this.validateCreateProductBody(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    try {
      const product = await this.productService.createProduct({
        marketplaceId: req.body.marketplaceId,
        title: req.body.title.trim(),
        sku: req.body.sku.trim(),
        price: req.body.price,
        stock: req.body.stock,
        rating: req.body.rating ?? null,
        isActive: req.body.isActive ?? true,
      });

      if (!product) {
        return res.status(404).json({
          message: "Marketplace not found",
        });
      }

      return res.status(201).json({
        data: product,
      });
    } catch {
      return res.status(400).json({
        message: "Product with this SKU already exists for marketplace",
      });
    }
  };

  updateProduct = async (
    req: Request<ProductParams, unknown, UpdateProductRequestDto>,
    res: Response,
  ) => {
    const validationError = this.validateUpdateProductBody(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    try {
      const product = await this.productService.updateProduct(req.params.id, {
        title:
          typeof req.body.title === "string" ? req.body.title.trim() : undefined,
        sku: typeof req.body.sku === "string" ? req.body.sku.trim() : undefined,
        price: req.body.price,
        stock: req.body.stock,
        rating: req.body.rating,
        isActive: req.body.isActive,
      });

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      return res.status(200).json({
        data: product,
      });
    } catch {
      return res.status(400).json({
        message: "Product update failed",
      });
    }
  };

  private validateCreateProductBody(
    body: CreateProductRequestDto,
  ): string | null {
    if (typeof body.marketplaceId !== "string" || body.marketplaceId.length < 1) {
      return "marketplaceId is required";
    }

    if (typeof body.title !== "string" || body.title.trim().length < 2) {
      return "title is required and must contain at least 2 characters";
    }

    if (typeof body.sku !== "string" || body.sku.trim().length < 2) {
      return "sku is required and must contain at least 2 characters";
    }

    if (typeof body.price !== "string" || Number(body.price) <= 0) {
      return "price is required and must be greater than 0";
    }

    if (typeof body.stock !== "number" || body.stock < 0) {
      return "stock is required and must be 0 or greater";
    }

    if (
      body.rating !== undefined &&
      body.rating !== null &&
      (typeof body.rating !== "string" ||
        Number(body.rating) < 0 ||
        Number(body.rating) > 5)
    ) {
      return "rating must be between 0 and 5";
    }

    if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
      return "isActive must be boolean";
    }

    return null;
  }

  private validateUpdateProductBody(
    body: UpdateProductRequestDto,
  ): string | null {
    if (
      body.title !== undefined &&
      (typeof body.title !== "string" || body.title.trim().length < 2)
    ) {
      return "title must contain at least 2 characters";
    }

    if (
      body.sku !== undefined &&
      (typeof body.sku !== "string" || body.sku.trim().length < 2)
    ) {
      return "sku must contain at least 2 characters";
    }

    if (
      body.price !== undefined &&
      (typeof body.price !== "string" || Number(body.price) <= 0)
    ) {
      return "price must be greater than 0";
    }

    if (
      body.stock !== undefined &&
      (typeof body.stock !== "number" || body.stock < 0)
    ) {
      return "stock must be 0 or greater";
    }

    if (
      body.rating !== undefined &&
      body.rating !== null &&
      (typeof body.rating !== "string" ||
        Number(body.rating) < 0 ||
        Number(body.rating) > 5)
    ) {
      return "rating must be between 0 and 5";
    }

    if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
      return "isActive must be boolean";
    }

    return null;
  }

  private parseBooleanQuery(value: unknown): boolean | undefined {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return undefined;
  }
}