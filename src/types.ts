import { Timestamp } from "firebase/firestore";

export interface IRestaurant {
  id: string;
  name: string;
  cuisine: string;
  createdAt: Timestamp;
  isFavorite?: boolean;
  notes?: string;
  rating?: number;
}
