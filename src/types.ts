import { Timestamp } from "firebase/firestore";

export interface IRestaurant {
  id: string;
  name: string;
  cuisine: string;
  notes?: string;
  createdAt?: Timestamp;
  isFavorite?: boolean;
}
