import { Request, Response } from "express";
import { ProductListQueryDto } from "../dto/ProductDto";
import { ProductService } from "../services/ProductService";

type ProductParams = {
  id: string;
};

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  getProducts = async (req: Request, res: Response) => {
    const filters: ProductListQueryDto = {
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      marketplaceId:
        typeof req.query.marketplaceId === "string"
          ? req.query.marketplaceId
          : undefined,
      isActive: this.parseBooleanQuery(req.query.isActive),
    };

    const products = await this.productService.getProducts(filters);

    return res.status(200).json({
      data: products,
      total: products.length,
    });
  };

  getProductById = async (req: Request<ProductParams>, res: Response) => {
    const { id } = req.params;

    const product = await this.productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      data: product,
    });
  };

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