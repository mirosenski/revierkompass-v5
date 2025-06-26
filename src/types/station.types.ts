/**
 * Represents a police station within the application.
 */
export interface Station {
  /** Unique identifier of the station */
  id: string;
  /** Display name of the station */
  name: string;
  /** Type of the station: either police headquarters (Präsidium) or precinct (Revier) */
  type: 'praesidium' | 'revier';
  /** Optional: ID of the parent headquarters if this station is a precinct */
  parentId?: string;
  /** City in which the station is located */
  city: string;
  /** Postal address of the station */
  address: string;
  /** Geographic coordinates as [latitude, longitude] */
  coordinates: [number, number];
  /** Contact phone number */
  telefon: string;
  /** Indicates whether the station offers a 24/7 emergency service */
  notdienst24h: boolean;
  /** Controls visibility of the station in frontend/admin */
  isActive: boolean;
  /** Timestamp of the last modification (used for audit logging) */
  lastModified: Date;
}

