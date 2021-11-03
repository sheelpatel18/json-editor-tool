import { TextField } from "@mui/material"


function DescriptionBox(props) {
    const handleDescriptionChange = props.handleDescriptionChange
    const description = props.description
    return (
        <TextField 
            id="description"
            label="Description"
            multiline
            fullWidth
            autoFocus
            minRows={12}
            value={description || ""}
            onChange={handleDescriptionChange}
        />
    )   
}

export default DescriptionBox