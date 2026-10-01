export class ProviderRegistry {
  constructor() { this.providers = new Map(); }

  register(provider) {
    if (!provider?.id || typeof provider.fetch !== 'function') {
      throw new Error('Provider must have id and fetch()');
    }
    this.providers.set(provider.id, provider);
    return this;
  }

  list() {
    return [...this.providers.values()].map(p => ({
      id: p.id,
      name: p.name ?? p.id,
      capabilities: p.capabilities ?? []
    }));
  }

  async fetch(providerId, request) {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error(`Unknown provider: ${providerId}`);
    return provider.fetch(request);
  }
}

export function createManualQuoteProvider(store = []) {
  return {
    id: 'manual-quotes',
    name: 'Manual / forwarder quotes',
    capabilities: ['road_freight','ocean_freight','air_freight','brokerage','port_fees'],
    async fetch(request) {
      const matches = store.filter(q =>
        (!request.originCountry || q.originCountry === request.originCountry) &&
        (!request.destinationCountry || q.destinationCountry === request.destinationCountry) &&
        (!request.mode || q.mode === request.mode)
      );
      return matches;
    }
  };
}

export function createPlaceholderProvider(id, name, capabilities = []) {
  return {
    id, name, capabilities,
    async fetch() {
      return {
        status: 'NOT_CONFIGURED',
        provider: id,
        message: 'Provider adapter exists but credentials/source configuration is not connected yet.'
      };
    }
  };
}


export { createWtoTariffProvider, fetchWtoIndicators, fetchWtoTimeseries } from "./wto.js";
