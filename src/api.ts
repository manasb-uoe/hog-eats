import { doc, getDoc, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "./auth-context";
import { useDbContext } from "./db-context";
import { IRestaurant } from "./types";

export const useGetRestaurants = () => {
  const { user } = useAuthContext();
  const db = useDbContext();

  const [data, setData] = useState<IRestaurant[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const docRef = doc(db, "users", user.uid);
    getDoc(docRef)
      .then((snapshot) => {
        if (!snapshot.exists()) {
          console.log(
            `No data found for user ${user.uid}, returning empty list...`
          );
          setData([]);
          return;
        }

        setData(snapshot.data().restaurants as IRestaurant[]);
      })
      .catch((err: unknown) => {
        setError(err as Error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [db, user]);

  return { data, error, loading };
};

export const useSetRestaurants = () => {
  const { user } = useAuthContext();
  const db = useDbContext();

  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const set = useCallback(
    async (data: IRestaurant[]) => {
      setLoading(true);
      setError(null);

      console.log("Saving restaurants data for", user.uid, "...", data);
      const docRef = doc(db, "users", user.uid);
      try {
        await setDoc(docRef, {
          restaurants: data,
        });
        console.log("Saved restaurants data for", user.uid);
      } catch (err: unknown) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [db, user]
  );

  return { set, error, loading };
};
