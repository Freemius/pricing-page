import React from 'react';

const FSPricingContext = React.createContext({});

export const FSPricingProvider = FSPricingContext.Provider;
export const FSPricingConsumer = FSPricingContext.Consumer;

export default FSPricingContext;