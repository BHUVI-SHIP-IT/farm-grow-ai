import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketPrice {
  crop: string;
  price: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  market: string;
  lastUpdated: string;
}

interface MarketData {
  location: string;
  prices: MarketPrice[];
  marketTrends: {
    crop: string;
    prediction: string;
    confidence: number;
  }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, crops } = await req.json();
    
    // Mock market data (in production, this would connect to real market APIs)
    const mockMarketData: MarketData = {
      location: location || "Local Market",
      prices: [
        {
          crop: "Rice",
          price: 45,
          unit: "₹/kg",
          change: 2.5,
          trend: "up",
          market: "Mandi",
          lastUpdated: new Date().toISOString()
        },
        {
          crop: "Wheat",
          price: 28,
          unit: "₹/kg",
          change: -1.2,
          trend: "down",
          market: "Wholesale",
          lastUpdated: new Date().toISOString()
        },
        {
          crop: "Cotton",
          price: 120,
          unit: "₹/kg",
          change: 0.5,
          trend: "stable",
          market: "Cotton Market",
          lastUpdated: new Date().toISOString()
        },
        {
          crop: "Sugarcane",
          price: 3.2,
          unit: "₹/kg",
          change: 1.8,
          trend: "up",
          market: "Sugar Mill",
          lastUpdated: new Date().toISOString()
        },
        {
          crop: "Maize",
          price: 22,
          unit: "₹/kg",
          change: -0.8,
          trend: "down",
          market: "Local Market",
          lastUpdated: new Date().toISOString()
        },
        {
          crop: "Tomato",
          price: 15,
          unit: "₹/kg",
          change: 3.2,
          trend: "up",
          market: "Vegetable Market",
          lastUpdated: new Date().toISOString()
        }
      ],
      marketTrends: [
        {
          crop: "Rice",
          prediction: "Prices expected to rise due to increased demand",
          confidence: 85
        },
        {
          crop: "Wheat",
          prediction: "Seasonal decline, consider holding stock",
          confidence: 78
        },
        {
          crop: "Cotton",
          prediction: "Stable market, good time to sell",
          confidence: 92
        }
      ]
    };

    // Filter prices based on user's crops if provided
    if (crops && crops.length > 0) {
      mockMarketData.prices = mockMarketData.prices.filter(price => 
        crops.includes(price.crop.toLowerCase())
      );
      mockMarketData.marketTrends = mockMarketData.marketTrends.filter(trend => 
        crops.includes(trend.crop.toLowerCase())
      );
    }

    return new Response(JSON.stringify(mockMarketData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in market-prices function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      location: "Demo Market",
      prices: [],
      marketTrends: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});