import React from "react";
import {Provider} from "react-redux";
import {store} from "./ReduxStore";
import RenderLoading from "../components/RenderLoading";

const Store = ({children}) => {

    return (
        <Provider store={store}>
            {children}
            <RenderLoading/>
        </Provider>
    )
};

export default Store;
