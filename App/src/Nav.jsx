import { Paper } from "@mui/material"
import DescriptionBox from "./DescriptionBox"
import Tree from "./Tree"


function Nav(props) {
    return (
        <Paper>
            <Tree data={props.hierarchyData} selectedNode={props.selectedNode} setSelectedNode={props.setSelectedNode} setJsonRefNode={props.setJsonRefNode} handleNewRoute={props.handleNewRoute} handleNewJSON={props.handleNewJSON} />
            <DescriptionBox description={props.description} setDescription={props.setDescription}/>
        </Paper>
    )
}

export default Nav