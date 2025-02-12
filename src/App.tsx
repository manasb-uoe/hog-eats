import AddIcon from "@mui/icons-material/Add";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import {
  Alert,
  AppBar,
  CircularProgress,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useGetRestaurants, useSetRestaurants } from "./api";
import { RestaurantDialog } from "./restaurant-dialog";
import { RestaurantsList } from "./restaurants-list";
import { IRestaurant } from "./types";
import { useEffectAfterMount } from "./use-effect-after-mount";

const SearchToolbar = ({
  onQueryChanged,
  initialQuery,
  queryDisabled,
  openDialog,
}: {
  queryDisabled?: boolean;
  initialQuery?: string;
  onQueryChanged: (query: string) => void;
  openDialog: () => void;
}) => {
  return (
    <div className="flex flex-row gap-2 mb-2">
      <TextField
        disabled={queryDisabled}
        className="flex-grow"
        onChange={(e) => onQueryChanged(e.target.value)}
        size="small"
        placeholder="Search"
        variant="outlined"
        value={initialQuery}
      />
      <Button
        classes={{ startIcon: "!mr-1" }}
        startIcon={<AddIcon fontSize="small" />}
        size="small"
        variant="contained"
        onClick={openDialog}
      >
        Add
      </Button>
    </div>
  );
};

const AppContent = ({
  restaurants: restaurantsInitiallyLoadedFromDb,
}: {
  restaurants: IRestaurant[];
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const setRestaurantsMutation = useSetRestaurants();

  const [restaurants, setRestaurants] = useState<IRestaurant[]>(
    restaurantsInitiallyLoadedFromDb
  );
  const [selectedRestaurant, setSelectedRestaurant] = useState<IRestaurant>();

  const onRestaurantAdded = useCallback((restaurant: IRestaurant) => {
    setRestaurants((prev) => {
      return [...prev, restaurant];
    });
  }, []);

  const onRestaurantChanged = useCallback((restaurant: IRestaurant) => {
    setRestaurants((prev) => {
      const cloned = [...(prev ?? [])];
      const index = cloned.findIndex((r) => r.id === restaurant.id);
      cloned.splice(index, 1, restaurant);
      return cloned;
    });
  }, []);

  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];
    if (!query.length) return [...restaurants];

    return restaurants.filter((r) => {
      const queryLowered = query.toLowerCase();
      return (
        r.name.toLowerCase().includes(queryLowered) ||
        r.cuisine.toLowerCase().includes(queryLowered) ||
        r.notes?.toLowerCase().includes(queryLowered)
      );
    });
  }, [deferredQuery, restaurants]);

  useEffectAfterMount(() => {
    setRestaurantsMutation.set(restaurants);
  }, [restaurants]);

  const onRestaurantSelected = useCallback((restaurant: IRestaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDialogOpen(true);
  }, []);

  return (
    <div className="flex flex-col flex-grow px-4">
      <SearchToolbar
        onQueryChanged={(value) => setQuery(value)}
        initialQuery={query}
        openDialog={() => {
          setSelectedRestaurant(undefined);
          setIsDialogOpen(true);
        }}
        queryDisabled={!!!restaurants.length}
      />

      {restaurants.length ? (
        <RestaurantsList
          restaurants={filteredRestaurants}
          onRestaurantSelected={onRestaurantSelected}
        />
      ) : (
        <Alert severity="info">
          There are no restaurants in your list. Start by clicking Add above.
        </Alert>
      )}

      {isDialogOpen && (
        <RestaurantDialog
          closeDialog={() => setIsDialogOpen(false)}
          selectedRestaurant={selectedRestaurant}
          onRestaurantAdded={onRestaurantAdded}
          onRestaurantChanged={onRestaurantChanged}
        />
      )}
    </div>
  );
};

const App = () => {
  const getRestaurantsQuery = useGetRestaurants();

  if (getRestaurantsQuery.loading) {
    return <CircularProgress />;
  }

  if (getRestaurantsQuery.error) {
    return <Alert severity="error">{getRestaurantsQuery.error.message}</Alert>;
  }

  return <AppContent restaurants={getRestaurantsQuery.data!} />;
};

const AppWrapper = () => {
  return (
    <div className="flex flex-col h-screen gap-2 bg-gray-100">
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters variant="dense">
            <RestaurantIcon className="pr-2" />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Favourite Restaurants
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
      <App />
    </div>
  );
};

export default AppWrapper;
