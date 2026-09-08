export type FoodType = 'veg' | 'non-veg' | 'vegan' | 'jain' | 'eggetarian';

export type QuantityUnit = 'meals' | 'kg' | 'litres' | 'packets' | 'pieces';

export type DonationStatus = 'available' | 'claimed' | 'completed' | 'cancelled' | 'expired';

export interface Donation {
  id: string;
  donor: string;
  foodName: string;
  description: string;
  foodType: FoodType;
  quantity: number;
  quantityUnit: QuantityUnit;
  preparedAt: string;
  expiryAt: string;
  pickupDate: string;
  pickupStartTime: string;
  pickupEndTime: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  specialInstructions: string;
  status: DonationStatus;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationListResponse {
  data: Donation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateDonationPayload {
  foodName: string;
  description: string;
  foodType: FoodType;
  quantity: number;
  quantityUnit: QuantityUnit;
  date: string;
  phone: string;
  address: string;
  city: string;
  specialInstructions?: string;
}
