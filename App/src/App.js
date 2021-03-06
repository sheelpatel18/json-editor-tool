import { createContext, useEffect, useState } from 'react';
import API from './api';
import Editor from './Editor';
import Tree from './Tree';
const axios = require('axios');
const { SERVER_PORT, SSL, HOST } = require("../../config.js")

/*
TODO's:
- Add global states 
*/

function App() {
  const [hierarchyData, setHierarchyData] = useState(null);
  const [schemas, setSchemas] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [jsonRefNode, setJsonRefNode] = useState(null);
  const [json, setJson] = useState(null)
  const [metaData, setMetaData] = useState(null);
  const [newEdits, setNewEdits] = useState({})
  const [api, setApi] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const [description, setDescription] = useState(null);
  if (api) console.log(api.schema)
  //const route = metaData.route.copy()

  
  useEffect(() => {
    if (selectedNode && jsonRefNode) {
      const test = schemas[jsonRefNode[selectedNode]]
      setJson(schemas[jsonRefNode[selectedNode]].data ? schemas[jsonRefNode[selectedNode]].data : {}); 
      setMetaData(schemas[jsonRefNode[selectedNode]].metaData);
      api.addSchema(schemas[jsonRefNode[selectedNode]]);
    }
  }, [selectedNode])


  useEffect(() => {
    setApi(new API(`${SSL ? "https" : "http"}://${HOST}`, SERVER_PORT))
    if (api) api.addSchema(metaData)
  }, [])

  const getHierarchy = async () => {
    api.get('/hierarchy').then(res => {
      console.log(res)
      setHierarchyData(res.data.data);
    }).catch(err => console.log(err))
  }

  const getSchemas = async () => {
    api.get('/schemas').then(res => {
      setSchemas(res.data);
    }).catch(err => console.log(err))
  }

  useEffect(() => {
    if (api) {
      getHierarchy();
      getSchemas();
    }
  }, [api])

  const handleChange = (edits) => {
    api.addSchema({
      metaData : {
        ...api.schema.metaData
      },
      data : {
        ...edits
      }
    })
  }

  const handleDescriptionChange = desc => {
    setDescription(desc.target.value)
    api.addSchema({
      ...api.schema,
      metaData : {
        ...api.schema.metaData,
        description : desc.target.value
      }
    })
  }

  const handleNewRoute = (event) => {
    const route = window.prompt("enter a route", "")
    api.post("/hierarchy", `?route=${route}`).then(res => {
      console.log(res)
      getHierarchy();
      setSuccessAlert(true)
      setTimeout(() => {setSuccessAlert(false)}, 2000)
    }).catch(err => {
      console.log(err)
    })
  }

  const handleNewJSON = (event) => {
    const route = window.prompt("enter a route", "")
    const request_type = window.prompt("request type?", "")
    const data  = {
      metaData : {
        route : route,
        request_type : request_type
      },
      data : {}
    }
    api.post("/schemas", null, data).then(res => {
      console.log(res)
      getHierarchy();
      getSchemas();
      setSuccessAlert(true)
      setTimeout(() => {setSuccessAlert(false)}, 1000)
    }).catch(err => {
      console.log(err)
    })
    }

  const handleSave = (event) => {
    setLoadingSave(true)
    api.put(`/schemas`, `/${jsonRefNode[selectedNode]}`).then(res => {
      setLoadingSave(false)
      getSchemas();
      setSuccessAlert(true)
      setTimeout(() => {setSuccessAlert(false)}, 2000)
      console.log(res)
    }).catch(err => { 
      console.log(err)
    })
}

  const handleDelete = (event) => {
    setLoadingDelete(true)
    const id = jsonRefNode[selectedNode]
    api.delete("/schemas", `/${id}`).then(res => {
      getSchemas();
      getHierarchy();
      setLoadingDelete(false)
      setSuccessAlert(true)
      setTimeout(() => {setSuccessAlert(false)}, 2000)
      console.log(res)
    }).catch(err => console.log(err))
  }

  return (
    <div>
      <Tree data={hierarchyData} selectedNode={selectedNode} setSelectedNode={setSelectedNode} setJsonRefNode={setJsonRefNode} handleNewRoute={handleNewRoute} handleNewJSON={handleNewJSON} handleDescriptionChange={handleDescriptionChange} api={api} description={description}/>
      <Editor json={json} handleChange={handleChange} handleSave={handleSave} handleDelete={handleDelete} loadingSave={loadingSave} loadingDelete={loadingDelete} successAlert={successAlert} metaData={metaData} api={api} />
    </div>
  );
}

export default App;
