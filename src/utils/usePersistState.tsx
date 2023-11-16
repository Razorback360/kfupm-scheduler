import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import browserStorage from 'store';
import isoWeek from "dayjs/plugin/isoWeek"
dayjs.extend(isoWeek)


const usePersistState = (storageKey, initialState) => {

  // Initiate the internal state.
  const [state, setInternalState] = useState(initialState);

  // Only on our initial load, retrieve the data from the store and set the state to that data.
  useEffect(() => {

    // Retrieve the data from the store.
    const storageInBrowser = browserStorage.get(storageKey);

    // If the store exists, overwrite the state with the store's data.
    // Otherwise if the store doesn't exist then "initialState" remains our default value.
    if (storageInBrowser) {
        if(storageKey === "events"){
            setInternalState(storageInBrowser.map(element => {
                const now = dayjs()
                console.log(dayjs(Date.parse(element.start)).isoWeek() === now.isoWeek())
                if(dayjs(Date.parse(element.start)).isoWeek() === now.isoWeek()){
                  element.start = Date.parse(element.start)
                  element.end = Date.parse(element.end)
                } else {
                  let startDate = new Date(Date.parse(element.start))
                  let currentDate = new Date()

                  const diffWeeks = Math.floor(Math.round(Math.abs((startDate - currentDate))/( 24 * 60 * 60 * 1000))/7)

                  let newStart = dayjs(new Date(Date.parse(element.start)))
                  let newEnd = dayjs(new Date(Date.parse(element.end)))
                  
                  newStart = newStart.add(diffWeeks,"weeks")
                  newEnd = newEnd.add(diffWeeks, "weeks")
                  element.start = newStart.toDate()
                  element.end = newEnd.toDate()
                }

                return element
            }));
        } else{
            setInternalState(storageInBrowser);
        }
      
    }
  }, []);

  // Create a replacement method that will set the state like normal, but that also saves the new state into the store.
  const setState = (newState) => {
    browserStorage.set(storageKey, newState);
    setInternalState(newState);
  };

  return [state, setState];
};

export default usePersistState;