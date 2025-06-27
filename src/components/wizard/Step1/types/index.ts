export interface AddressData {
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  fullAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  accuracy: number;
}

export interface DemoAddress {
  id: string;
  address: string;
  city: string;
} 