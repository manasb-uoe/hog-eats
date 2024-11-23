export interface IRestaurant {
  id: string;
  name: string;
  cuisine: string;
  notes?: string;
  dateVisited?: number;
  isFavorite?: boolean;
}
