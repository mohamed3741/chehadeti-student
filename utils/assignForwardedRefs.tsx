/*
 * @param {Object|Function} forwardedRef callback ref function  or ref object that `refToAssign` will be assigned to
 * @param {Object} refToAssign React ref object
 */
export function assignForwardedRefs(forwardedRef, refToAssign) {
    if (forwardedRef) {
        if (typeof forwardedRef === 'function') {
            forwardedRef(refToAssign)
        } else {
            forwardedRef.current = refToAssign
        }
    }
}
