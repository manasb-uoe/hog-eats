import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  List,
  Typography,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { useCallback } from "react";
import { IRestaurant } from "./types";

export const RestaurantsList = ({
  restaurants,
  onRestaurantSelected,
}: {
  restaurants: IRestaurant[];
  onRestaurantSelected: (restaurant: IRestaurant) => void;
}) => {
  const guideLookup = useCallback((restaurant: IRestaurant) => {
    window.open(
      `https://guide.michelin.com/en/restaurants?q=${encodeURIComponent(
        `${restaurant.name} ${restaurant.cuisine}`
      )}`
    );
  }, []);

  if (!restaurants.length) {
    return <Typography>No restaurants found</Typography>;
  }

  return (
    <List dense={true}>
      {restaurants.map((item) => (
        <Card key={item.id} className="mb-2">
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: red[500] }}>
                {item.name.charAt(0).toUpperCase()}
              </Avatar>
            }
            title={item.name}
            subheader={item.cuisine}
          />
          <CardContent>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {item.notes}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => onRestaurantSelected(item)}>
              Edit
            </Button>
            <Button size="small" onClick={() => guideLookup(item)}>
              Find on Michelin Guide
            </Button>
          </CardActions>
        </Card>
      ))}
    </List>
  );
};
