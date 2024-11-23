import CloseIcon from "@mui/icons-material/Close";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ToggleButton,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuthContext } from "./auth-context";
import commonCuisines from "./common-cuisines.json";

interface IRestaurant {
  id: string;
  name: string;
  cuisine: string;
  notes?: string;
  dateVisited?: Date;
  isFavorite?: boolean;
}

const colDefs: GridColDef[] = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "cuisine", headerName: "Cuisine", width: 200 },
  {
    field: "isFavorite",
    headerName: "Favorite",
    width: 200,
    valueFormatter: (value: boolean) => (value ? "Yes" : "No"),
  },
  {
    field: "dateVisited",
    headerName: "Date Visited",
    width: 200,
    valueFormatter: (value: Date) => dayjs(value).format("MMMM YYYY"),
  },
];

const GridToolbar = ({
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
    <div className="flex flex-row gap-2 p-2">
      <TextField
        disabled={queryDisabled}
        className="w-64"
        onChange={(e) => onQueryChanged(e.target.value)}
        size="small"
        label="Search"
        variant="outlined"
        value={initialQuery}
      />
      <Button size="small" variant="contained" onClick={openDialog}>
        Add
      </Button>
    </div>
  );
};

const RestaurantDialog = ({
  onRestaurantAdded,
  onRestaurantChanged,
  closeDialog,
  selectedRestaurant,
}: {
  onRestaurantAdded: (restaurant: IRestaurant) => void;
  onRestaurantChanged: (restaurant: IRestaurant) => void;
  closeDialog: () => void;
  selectedRestaurant?: IRestaurant;
}) => {
  const inAddMode = !!!selectedRestaurant;
  const [name, setName] = useState(selectedRestaurant?.name ?? "");
  const [cuisine, setCuisine] = useState(selectedRestaurant?.cuisine ?? "");
  const [dateVisited, setDateVisited] = useState<Dayjs | undefined>(
    dayjs(selectedRestaurant?.dateVisited ?? new Date())
  );
  const [notes, setNotes] = useState(selectedRestaurant?.notes ?? "");
  const [isFav, setIsFav] = useState(selectedRestaurant?.isFavorite ?? false);

  const canSave = name?.length && cuisine?.length;

  const handleSave = useCallback(() => {
    if (inAddMode) {
      const restaurant: IRestaurant = {
        id: crypto.randomUUID(),
        name,
        cuisine,
        dateVisited: dateVisited?.toDate(),
        isFavorite: isFav,
        notes,
      };
      onRestaurantAdded(restaurant);
    } else {
      onRestaurantChanged({
        ...selectedRestaurant,
        name,
        cuisine,
        dateVisited: dateVisited?.toDate(),
        isFavorite: isFav,
        notes,
      });
    }
    closeDialog();
  }, [
    name,
    cuisine,
    notes,
    dateVisited,
    isFav,
    onRestaurantAdded,
    onRestaurantChanged,
    closeDialog,
    inAddMode,
  ]);
  return (
    <Dialog onClose={closeDialog} open={true} fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        {inAddMode ? "Add new restaurant" : selectedRestaurant.name}
      </DialogTitle>
      <IconButton
        onClick={closeDialog}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <div className="flex flex-col gap-3">
          <TextField
            size="small"
            label="Name"
            required
            value={name}
            fullWidth
            onChange={(e) => setName(e.target.value)}
          />
          <Autocomplete
            disablePortal
            autoHighlight
            autoSelect
            options={commonCuisines}
            value={cuisine}
            ListboxProps={{ style: { maxHeight: 150 } }}
            freeSolo
            onChange={(_, newValue) => setCuisine(newValue ?? "")}
            renderInput={(params) => <TextField {...params} label="Cuisine" />}
          />
          <DatePicker
            views={["year", "month"]}
            label="Date Visited"
            value={dateVisited}
            onChange={(d) => setDateVisited(d ?? undefined)}
          />
          <TextField
            size="small"
            multiline
            value={notes}
            rows={5}
            label="Notes"
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
          />
          <ToggleButton
            value={isFav}
            selected={isFav}
            className="w-32"
            onChange={() => setIsFav((prev) => !prev)}
          >
            <span className="pr-1">
              {isFav ? <Favorite /> : <FavoriteBorder />}
            </span>
            Favorite
          </ToggleButton>
        </div>
      </DialogContent>
      <DialogActions>
        <Button disabled={!canSave} autoFocus onClick={handleSave}>
          {inAddMode ? "Add" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const { user } = useAuthContext();

  const [restaurants, setRestaurants] = useState<IRestaurant[]>(() => {
    const restored = localStorage.getItem(user.uid);
    if (!restored) return [];
    const parsed: any[] = JSON.parse(restored);
    return parsed.map((p) => ({
      ...p,
      dateVisited: new Date(p.dateVisited),
    })) as IRestaurant[];
  });

  const [selectedRestaurant, setSelectedRestaurant] = useState<IRestaurant>();

  const onRestaurantAdded = useCallback((restaurant: IRestaurant) => {
    setRestaurants((prev) => [...prev, restaurant]);
  }, []);

  const onRestaurantChanged = useCallback((restaurant: IRestaurant) => {
    setRestaurants((prev) => {
      const cloned = [...prev];
      const index = cloned.findIndex((r) => r.id === restaurant.id);
      cloned.splice(index, 1, restaurant);
      return cloned;
    });
  }, []);

  const filteredRestaurants = useMemo(() => {
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

  useEffect(() => {
    localStorage.setItem(user?.uid!, JSON.stringify(restaurants));
  }, [restaurants]);

  return (
    <div className="flex flex-col flex-grow">
      <GridToolbar
        queryDisabled={!!!restaurants.length}
        onQueryChanged={setQuery}
        openDialog={() => setIsDialogOpen(true)}
      />
      {restaurants.length ? (
        <DataGrid
          onRowClick={(params) => {
            setSelectedRestaurant(params.row);
            setIsDialogOpen(true);
          }}
          rows={filteredRestaurants}
          columns={colDefs}
          disableRowSelectionOnClick={true}
          disableMultipleRowSelection={true}
        />
      ) : (
        <Alert severity="info">
          There are no restaurants in your list. Start by clicking Add above.
        </Alert>
      )}
      {isDialogOpen && (
        <RestaurantDialog
          closeDialog={() => setIsDialogOpen(false)}
          onRestaurantAdded={onRestaurantAdded}
          onRestaurantChanged={onRestaurantChanged}
          selectedRestaurant={selectedRestaurant}
        />
      )}
    </div>
  );
}

export default App;
