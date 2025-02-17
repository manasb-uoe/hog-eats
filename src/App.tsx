import AddIcon from "@mui/icons-material/Add";
import SavingsIcon from "@mui/icons-material/Savings";
import {
  Alert,
  AppBar,
  CircularProgress,
  Container,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import OutlinedInput from "@mui/material/OutlinedInput";
import TextField from "@mui/material/TextField";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useGetRestaurants, useSetRestaurants } from "./api";
import { useAuthContext } from "./auth-context";
import { RestaurantDialog } from "./restaurant-dialog";
import { RestaurantsList } from "./restaurants-list";
import { IRestaurant } from "./types";
import { useEffectAfterMount } from "./use-effect-after-mount";

type TSortMode = "Name" | "Recent" | "Cuisine" | "Rating";

const SearchToolbar = ({
  onQueryChanged,
  initialQuery,
  queryDisabled,
  openDialog,
  sortMode,
  onSortModeChanged,
}: {
  queryDisabled?: boolean;
  initialQuery?: string;
  onQueryChanged: (query: string) => void;
  openDialog: () => void;
  sortMode: TSortMode;
  onSortModeChanged: (mode: TSortMode) => void;
}) => {
  return (
    <div className="flex flex-row gap-2 mb-2 px-4">
      <Select
        size="small"
        margin="dense"
        displayEmpty
        onChange={(e) => onSortModeChanged(e.target.value as TSortMode)}
        value={sortMode}
        input={<OutlinedInput />}
        renderValue={(selected: string) => {
          if (selected?.length === 0) {
            return <em>Placeholder</em>;
          }

          return selected;
        }}
      >
        <MenuItem disabled value="">
          <em>Sort by</em>
        </MenuItem>
        <MenuItem value="Name">Name</MenuItem>
        <MenuItem value="Cuisine">Cuisine</MenuItem>
        <MenuItem value="Recent">Recent</MenuItem>
        <MenuItem value="Rating">Rating</MenuItem>
      </Select>
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
  const [sortMode, setSortMode] = useState<TSortMode>("Recent");
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

  const onRestaurantDeleted = useCallback((deleted: IRestaurant) => {
    setRestaurants((prev) => {
      return prev.filter((item) => item.id !== deleted.id);
    });
    setIsDialogOpen(false);
  }, []);

  const onRestaurantChanged = useCallback((restaurant: IRestaurant) => {
    setRestaurants((prev) => {
      const cloned = [...(prev ?? [])];
      const index = cloned.findIndex((r) => r.id === restaurant.id);
      cloned.splice(index, 1, restaurant);
      return cloned;
    });
  }, []);

  const filteredAndSortedRestaurants = useMemo(() => {
    const sorted = (items: IRestaurant[]) => {
      items.sort((a, b) => {
        if (sortMode === "Name") {
          return a.name.localeCompare(b.name);
        } else if (sortMode === "Cuisine") {
          return a.cuisine.localeCompare(b.cuisine);
        } else if (sortMode === "Rating") {
          return (b.rating ?? 0) - (a.rating ?? 0);
        } else {
          return b.createdAt?.toMillis() - a.createdAt?.toMillis();
        }
      });
      return items;
    };

    if (!restaurants) return [];
    if (!query.length) return sorted([...restaurants]);

    return sorted(
      restaurants.filter((r) => {
        const queryLowered = query.toLowerCase();
        return (
          r.name.toLowerCase().includes(queryLowered) ||
          r.cuisine.toLowerCase().includes(queryLowered) ||
          r.notes?.toLowerCase().includes(queryLowered)
        );
      })
    );
  }, [deferredQuery, restaurants, sortMode]);

  useEffectAfterMount(() => {
    setRestaurantsMutation.set(restaurants);
  }, [restaurants]);

  const onRestaurantSelected = useCallback((restaurant: IRestaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDialogOpen(true);
  }, []);

  return (
    <div className="flex flex-col flex-grow overflow-y-hidden">
      <SearchToolbar
        onQueryChanged={(value) => setQuery(value)}
        initialQuery={query}
        openDialog={() => {
          setSelectedRestaurant(undefined);
          setIsDialogOpen(true);
        }}
        queryDisabled={!!!restaurants.length}
        sortMode={sortMode}
        onSortModeChanged={setSortMode}
      />

      {restaurants.length ? (
        <RestaurantsList
          restaurants={filteredAndSortedRestaurants}
          onRestaurantSelected={onRestaurantSelected}
        />
      ) : (
        <Alert severity="info" className="mx-4">
          There are no restaurants in your list. Start by clicking Add above.
        </Alert>
      )}

      <RestaurantDialog
        key={selectedRestaurant?.id}
        open={isDialogOpen}
        closeDialog={() => setIsDialogOpen(false)}
        selectedRestaurant={selectedRestaurant}
        onRestaurantAdded={onRestaurantAdded}
        onRestaurantChanged={onRestaurantChanged}
        onRestaurantDeleted={onRestaurantDeleted}
      />

      <div className="bg-opacity-80 p-2 bg-white border-solid border-t-2 border-gray-100 absolute bottom-0 text-center w-full pb-4">
        {filteredAndSortedRestaurants.length === restaurants.length ? (
          <Typography variant="body2">
            Showing <strong>{filteredAndSortedRestaurants.length}</strong>{" "}
            restaurants
          </Typography>
        ) : (
          <Typography variant="body2">
            Showing <strong>{filteredAndSortedRestaurants.length}</strong> of{" "}
            <strong>{restaurants.length}</strong> restaurants
          </Typography>
        )}
      </div>
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
  const authContext = useAuthContext();

  return (
    <div className="flex flex-col h-screen gap-2 bg-gray-100">
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters variant="dense">
            <SavingsIcon className="pr-2" />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Hog Eats
            </Typography>
            <Button onClick={authContext.logout} color="inherit" size="small">
              Logout
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <App />
    </div>
  );
};

export default AppWrapper;
