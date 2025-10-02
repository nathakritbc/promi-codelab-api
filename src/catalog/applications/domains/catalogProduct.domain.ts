import {
  type DiscountType,
  type IPromotion,
  Promotion,
  type PromotionId,
} from 'src/promotions/applications/domains/promotion.domain';
import {
  type IPromotionRule,
  PromotionRule,
} from 'src/promotion-rules/applications/domains/promotionRule.domain';
import {
  Product,
  type IProduct,
  type ProductPrice,
} from 'src/products/applications/domains/product.domain';
import type { CategoryId } from 'src/product-categories/applications/domains/productCategory.domain';

export enum EPromotionOfferSource {
  PRODUCT = 'product',
  CATEGORY = 'category',
}

export type PromotionOfferSource = `${EPromotionOfferSource}`;

export interface PromotionOfferMetadata {
  associationId?: string;
  appliedCategoryId?: CategoryId;
  includeChildren?: boolean;
}

export interface PromotionOfferSnapshot {
  promotionId: PromotionId;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  priority: number;
  discountAmount: number;
  finalPrice: number;
  source: PromotionOfferSource;
  metadata?: PromotionOfferMetadata;
}

export interface CatalogProductSnapshot {
  product: {
    uuid: IProduct['uuid'];
    code: IProduct['code'];
    name: IProduct['name'];
    description?: IProduct['description'];
    price: number;
    status: IProduct['status'];
  };
  basePrice: number;
  finalPrice: number;
  discountAmount: number;
  appliedPromotion?: PromotionOfferSnapshot;
  promotions: PromotionOfferSnapshot[];
}

interface PromotionOfferInternal {
  promotion: Promotion;
  source: PromotionOfferSource;
  metadata?: PromotionOfferMetadata;
  discountAmount: number;
  finalPrice: number;
}

export interface PromotionEvaluationPayload {
  promotion: IPromotion;
  rules?: IPromotionRule[];
  source: PromotionOfferSource;
  metadata?: PromotionOfferMetadata;
  quantity?: number;
  amountOverride?: number;
}

export class CatalogProduct {
  private readonly product: Product;
  private readonly offers: PromotionOfferInternal[] = [];

  constructor(product: IProduct | Product) {
    this.product = CatalogProduct.instantiateProduct(product);
  }

  static from(product: IProduct | Product): CatalogProduct {
    return new CatalogProduct(product);
  }

  getProduct(): Product {
    return this.product;
  }

  evaluatePromotion(payload: PromotionEvaluationPayload): void {
    const promotion = CatalogProduct.instantiatePromotion(payload.promotion);
    const quantity = payload.quantity ?? 1;
    const unitPrice = Number(this.product.price as ProductPrice);
    const amount = payload.amountOverride ?? unitPrice;

    if (!promotion.isActive()) {
      return;
    }

    if (!CatalogProduct.areRulesApplicable(payload.rules || [], quantity, amount)) {
      return;
    }

    const discountAmount = promotion.calculateDiscount(amount);
    if (discountAmount <= 0) {
      return;
    }

    const finalPrice = Math.max(amount - discountAmount, 0);

    const offer: PromotionOfferInternal = {
      promotion,
      source: payload.source,
      metadata: payload.metadata,
      discountAmount,
      finalPrice,
    };

    const existingIndex = this.offers.findIndex((item) => item.promotion.uuid === promotion.uuid);

    if (existingIndex >= 0) {
      const existingOffer = this.offers[existingIndex];
      if (existingOffer.discountAmount >= offer.discountAmount) {
        return;
      }
      this.offers[existingIndex] = offer;
      return;
    }

    this.offers.push(offer);
  }

  getApplicablePromotions(): PromotionOfferSnapshot[] {
    return this.offers
      .slice()
      .sort((a, b) => {
        if (b.discountAmount !== a.discountAmount) {
          return b.discountAmount - a.discountAmount;
        }

        const priorityA = Number(a.promotion.priority ?? 0);
        const priorityB = Number(b.promotion.priority ?? 0);
        return priorityB - priorityA;
      })
      .map((offer) => CatalogProduct.offerToSnapshot(offer));
  }

  getBestPromotion(): PromotionOfferSnapshot | undefined {
    return this.getApplicablePromotions()[0];
  }

  getBasePrice(): number {
    return Number(this.product.price as ProductPrice);
  }

  getFinalPrice(): number {
    return this.getBestPromotion()?.finalPrice ?? this.getBasePrice();
  }

  getDiscountAmount(): number {
    return this.getBestPromotion()?.discountAmount ?? 0;
  }

  toSnapshot(): CatalogProductSnapshot {
    return {
      product: {
        uuid: this.product.uuid,
        code: this.product.code,
        name: this.product.name,
        description: this.product.description,
        price: this.getBasePrice(),
        status: this.product.status,
      },
      basePrice: this.getBasePrice(),
      finalPrice: this.getFinalPrice(),
      discountAmount: this.getDiscountAmount(),
      appliedPromotion: this.getBestPromotion(),
      promotions: this.getApplicablePromotions(),
    };
  }

  private static instantiateProduct(product: IProduct | Product): Product {
    if (product instanceof Product) {
      return product;
    }

    return Object.assign(new Product(), product);
  }

  private static instantiatePromotion(promotion: IPromotion | Promotion): Promotion {
    if (promotion instanceof Promotion) {
      return promotion;
    }

    return Object.assign(new Promotion(), promotion);
  }

  private static instantiatePromotionRule(rule: IPromotionRule | PromotionRule): PromotionRule {
    if (rule instanceof PromotionRule) {
      return rule;
    }

    return Object.assign(new PromotionRule(), rule);
  }

  private static areRulesApplicable(rules: IPromotionRule[], quantity: number, amount: number): boolean {
    if (!rules.length) {
      return true;
    }

    return rules.every((rule) => CatalogProduct.instantiatePromotionRule(rule).isApplicable(quantity, amount));
  }

  private static offerToSnapshot(offer: PromotionOfferInternal): PromotionOfferSnapshot {
    return {
      promotionId: offer.promotion.uuid,
      name: offer.promotion.name,
      discountType: offer.promotion.discountType,
      discountValue: Number(offer.promotion.discountValue),
      maxDiscountAmount: offer.promotion.maxDiscountAmount
        ? Number(offer.promotion.maxDiscountAmount)
        : undefined,
      priority: Number(offer.promotion.priority ?? 0),
      discountAmount: offer.discountAmount,
      finalPrice: offer.finalPrice,
      source: offer.source,
      metadata: offer.metadata,
    };
  }
}
