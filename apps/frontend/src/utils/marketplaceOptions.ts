type MarketplaceOption = {
  id: string;
  name: string;
  type: string;
};

export function getUniqueMarketplaceOptions<T extends MarketplaceOption>(
  marketplaces: T[],
): T[] {
  const uniqueMarketplaces = new Map<string, T>();

  for (const marketplace of marketplaces) {
    const key = `${marketplace.name.trim().toLowerCase()}-${marketplace.type}`;

    if (!uniqueMarketplaces.has(key)) {
      uniqueMarketplaces.set(key, marketplace);
    }
  }

  return Array.from(uniqueMarketplaces.values());
}