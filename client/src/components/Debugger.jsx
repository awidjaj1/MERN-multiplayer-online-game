import { useRef } from "react";


export const Debugger = props => {
    const renderCounter  = useRef(0);
    renderCounter.current = renderCounter.current + 1;
    return <h1>Renders: {renderCounter.current}, {props.message}</h1>;
};