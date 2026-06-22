import { MarketplaceTypeDto } from "../../dto/MarketplaceDto";
import { AvitoMockConnector } from "./AvitoMockConnector";
import { MarketplaceConnector } from "./MarketplaceConnectorTypes";
import { WildberriesMockConnector } from "./WildberriesMockConnector";
import { YandexMarketMockConnector } from "./YandexMarketMockConnector";

export class MarketplaceConnectorFactory {
  createConnector(type: MarketplaceTypeDto): MarketplaceConnector | null {
    if (type === "YANDEX_MARKET") {
      return new YandexMarketMockConnector();
    }

    if (type === "WILDBERRIES") {
      return new WildberriesMockConnector();
    }

    if (type === "AVITO") {
      return new AvitoMockConnector();
    }

    return null;
  }
}