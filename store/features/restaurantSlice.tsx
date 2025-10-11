import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState = {
    selectedRestaurant: null,
};

const restaurantSlice = createSlice({
    name: 'restaurant',
    initialState,
    reducers: {
        setSelectedRestaurant: (state, action : PayloadAction<boolean>) => {
            state.selectedRestaurant = action.payload;
        },
    },
});

export const { setSelectedRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;
