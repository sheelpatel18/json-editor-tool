import { CircularProgress } from "@mui/material";
import "./main.css"


function Loading() {
    return (
        <div className="loading" >
        <CircularProgress />
        </div>
    )
}

export default Loading