import { Paper, Typography, Button, Alert, Collapse } from '@mui/material';
import { JsonEditor } from 'jsoneditor-react';
import "./main.css"
import 'jsoneditor-react/es/editor.min.css';
import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/github';
import { useContext, useState } from 'react';

//const ajv = new Ajv({ allErrors: true, verbose: true });

const schema = {
    type: 'object',
    properties: {
        some: {
            type: 'integer'
        }
    },
    required: ['some']
};

function Editor(props) {
    const json = props.json
    const metaData = props.metaData
    const handleChange = props.handleChange
    const handleSave = props.handleSave
    const handleDelete = props.handleDelete
    const loadingSave = props.loadingSave
    const loadingDelete = props.loadingDelete
    const successAlert = props.successAlert
    const [showDescription, setShowDescription] = useState(false)
    const api = props.api

    const JSONEditor = (props) => {
        return (
        <JsonEditor 
            value={props.json}
            onChange={handleChange}
            scehma={schema}
            mode="code"
            theme="ace/theme/github"
            ace={ace}
            htmlElementProps={{style: {height: 600}}}
        />
        )
    }

    return json ? (
        <Paper sx={{ float: "right", width: "80%", maxHeight: "600px" }}>
            <Paper sx={{ margin: "5px", height: "45px" }}>
                <Collapse in={successAlert}>
                    <Alert severity="success">Success</Alert>
                </Collapse>
                <Button loading={loadingSave} variant="contained" sx={{ float: "right", margin: "5px"}} onClick={handleSave} >Save</Button>
                <Button loading={loadingDelete} variant="contained" sx={{ float: "right", margin: "5px"}} onClick={handleDelete} >Delete</Button>
                <Typography variant="h6" sx={{ textAlign: "center" }}>
                    {metaData ? `${metaData.request_type} ${metaData.route}` : null}
                </Typography>
            </Paper>
            <JSONEditor json={json}/>
            <Typography variant="h6" sx={{ textAlign: "center" }}>
                    {metaData ? `${api.getServerURL()}:${api.getServerPort()}/mock${metaData.route}` : null}
                </Typography>
    </Paper>
    ) : null
}

export default Editor;