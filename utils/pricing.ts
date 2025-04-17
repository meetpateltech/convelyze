// utils/pricing.ts

export interface ModelPricing {
    inputCost: number;
    outputCost: number;
  }
  
  export const modelPricing: { [key: string]: ModelPricing } = {
    'o3': { inputCost: 10.00, outputCost: 40.00 },
    'o4-mini-high': { inputCost: 1.10, outputCost: 4.40 },
    'o4-mini': { inputCost: 1.10, outputCost: 4.40 },
    'research': { inputCost: 10.00, outputCost: 40.00 }, // deep research uses o3 model
    'o1-pro': { inputCost: 150.00, outputCost: 600.00 },
    'o3-mini-high': { inputCost: 1.10, outputCost: 4.40 },
    'o3-mini': {inputCost: 1.10, outputCost: 4.40 },
    'o1': {inputCost: 15.00, outputCost: 60.00 },
    'o1-preview': {inputCost: 15.00, outputCost: 60.00 },
    'o1-mini': {inputCost: 3.00, outputCost: 12.00 },
    'gpt-4o-canmore': { inputCost: 2.50, outputCost: 10.00 }, // gpt 4o with canvas mode model
    'gpt-4o-mini': { inputCost: 0.15, outputCost: 0.60 },
    'gpt-4o': { inputCost: 2.50, outputCost: 10.00 },
    'gpt-4-turbo': { inputCost: 10.00, outputCost: 30.00 },
    'gpt-4': { inputCost: 30.00, outputCost: 60.00 },
    'gpt-4-vision-preview': { inputCost: 10.00, outputCost: 30.00 },
    'gpt-3.5-turbo': {inputCost: 0.50, outputCost: 1.50 },
    'text-davinci-002': {inputCost: 20.00, outputCost: 20.00},
  };
  
  export const calculateCost = (tokens: number, costPerMillion: number) => {
    return (tokens / 1000000) * costPerMillion;
  };
  
  export const getPricing = (model: string): ModelPricing => {
    if (model.startsWith('text-davinci-002-render')) {
      return modelPricing['text-davinci-002'];
    }
    return modelPricing[model] || { inputCost: 0, outputCost: 0 };
  };