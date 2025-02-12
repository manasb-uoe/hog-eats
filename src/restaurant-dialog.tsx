import CloseIcon from "@mui/icons-material/Close";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import {
  AppBar,
  Dialog,
  DialogContent,
  IconButton,
  Slide,
  ToggleButton,
  Toolbar,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { TransitionProps } from "@mui/material/transitions";
import { Timestamp } from "firebase/firestore";
import { forwardRef, useCallback, useState } from "react";
import commonCuisines from "./common-cuisines.json";
import { IRestaurant } from "./types";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const RestaurantDialog = ({
  open,
  onRestaurantAdded,
  onRestaurantChanged,
  closeDialog,
  selectedRestaurant,
}: {
  open: boolean;
  onRestaurantAdded: (restaurant: IRestaurant) => void;
  onRestaurantChanged: (restaurant: IRestaurant) => void;
  closeDialog: () => void;
  selectedRestaurant?: IRestaurant;
}) => {
  const inAddMode = !!!selectedRestaurant;
  const [name, setName] = useState(selectedRestaurant?.name ?? "");
  const [cuisine, setCuisine] = useState(selectedRestaurant?.cuisine ?? "");
  const [notes, setNotes] = useState(selectedRestaurant?.notes ?? "");
  const [isFav, setIsFav] = useState(selectedRestaurant?.isFavorite ?? false);

  const canSave = name?.length && cuisine?.length;

  const handleSave = useCallback(() => {
    if (inAddMode) {
      const restaurant: IRestaurant = {
        id: crypto.randomUUID(),
        name,
        cuisine,
        isFavorite: isFav,
        notes,
        createdAt: Timestamp.now(),
      };
      onRestaurantAdded(restaurant);
    } else {
      onRestaurantChanged({
        ...selectedRestaurant,
        name,
        cuisine,
        isFavorite: isFav,
        notes,
      });
    }
    closeDialog();
  }, [
    name,
    cuisine,
    notes,
    isFav,
    onRestaurantAdded,
    onRestaurantChanged,
    closeDialog,
    inAddMode,
  ]);
  return (
    <Dialog
      fullScreen
      onClose={closeDialog}
      open={open}
      fullWidth
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={closeDialog}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {inAddMode ? "Add new restaurant" : selectedRestaurant.name}
          </Typography>
          <Button
            disabled={!canSave}
            autoFocus
            color="inherit"
            onClick={handleSave}
          >
            {inAddMode ? "Add" : "Save"}
          </Button>
        </Toolbar>
      </AppBar>
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
            margin="dense"
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
            renderInput={(params) => (
              <TextField margin="dense" {...params} label="Cuisine" />
            )}
          />
          <TextField
            size="small"
            margin="dense"
            multiline
            value={notes}
            rows={5}
            label="Notes"
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
          />
          <ToggleButton
            value={isFav}
            size="small"
            selected={isFav}
            className="w-32"
            onChange={() => setIsFav((prev) => !prev)}
          >
            <span className="pr-1">
              {isFav ? (
                <Favorite fontSize="small" />
              ) : (
                <FavoriteBorder fontSize="small" />
              )}
            </span>
            Favorite
          </ToggleButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
