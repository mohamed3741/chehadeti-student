import React, { useEffect, useRef } from 'react';

/***
 * hook to run if 'deps' changes, but not on initial render
 * ****/
const useDidMountEffect = (func, deps) => {
    const didMount = useRef(false);

    useEffect(() => {
        if (didMount.current) func();
        else didMount.current = true;
    }, deps);
}

export default useDidMountEffect;
