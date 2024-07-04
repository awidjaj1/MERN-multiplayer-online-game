import { useLocation, Navigate } from "react-router-dom";
import { GamePage } from "../scenes/game";
export const GameRoute = () => {
    const loc = useLocation();

    if(loc.state === "/home")
        return <GamePage />
    //can redirect to "/home" safely since GameRoute is only accessible if authenticated
    return <Navigate to="/home" />
}