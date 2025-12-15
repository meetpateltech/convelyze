// utils/pricing.ts

export interface ModelPricing {
    inputCost: number;
    outputCost: number;
  }
  
  export const modelPricing: { [key: string]: ModelPricing } = {
    'gpt-5-2-pro': { inputCost: 21.00, outputCost: 168.00 },
    'gpt-5-2-thinking': { inputCost: 1.75, outputCost: 14.00 },
    'gpt-5-2-instant': { inputCost: 1.75, outputCost: 14.00 },
    'gpt-5-2-chat': { inputCost: 1.75, outputCost: 14.00 },
    'gpt-5-2': { inputCost: 1.75, outputCost: 14.00 },
    'gpt-5-1-pro': { inputCost: 15.00, outputCost: 120.00 },
    'gpt-5-1-thinking': { inputCost: 1.25, outputCost: 10.00 },
    'gpt-5-1-instant': { inputCost: 1.25, outputCost: 10.00 },
    'gpt-5-1': { inputCost: 1.25, outputCost: 10.00 },
    'gpt-5-instant': { inputCost: 1.25, outputCost: 10.00 },
    'gpt-5-pro': { inputCost: 15.00, outputCost: 120.00 },
    'gpt-5-a-t-mini': { inputCost: 0.25, outputCost: 2.00 },
    'gpt-5-t-mini': { inputCost: 0.25, outputCost: 2.00 }, 
    'gpt-5-thinking': { inputCost: 1.25, outputCost: 10.00 },
    'gpt-5-mini': { inputCost: 0.25, outputCost: 2.00 },
    'gpt-5': { inputCost: 1.25, outputCost: 10.00 },
    'o3-pro': { inputCost: 20.00, outputCost: 80.00 },
    'gpt-4-1-mini': { inputCost: 0.40, outputCost: 1.60 },
    'gpt-4-1': { inputCost: 2.00, outputCost: 8.00 },
    'gpt-4-5': { inputCost: 75.00, outputCost: 150.00 },
    'o3': { inputCost: 2.00, outputCost: 8.00 },
    'o4-mini-high': { inputCost: 1.10, outputCost: 4.40 },
    'o4-mini': { inputCost: 1.10, outputCost: 4.40 },
    'research': { inputCost: 10.00, outputCost: 40.00 }, // deep research uses o3 model
    'o1-pro': { inputCost: 150.00, outputCost: 600.00 },
    'o3-mini-high': { inputCost: 1.10, outputCost: 4.40 },
    'o3-mini': {inputCost: 1.10, outputCost: 4.40 },
    'o1': {inputCost: 15.00, outputCost: 60.00 },
    'o1-preview': {inputCost: 15.00, outputCost: 60.00 },
    'o1-mini': {inputCost: 1.10, outputCost: 4.40 },
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