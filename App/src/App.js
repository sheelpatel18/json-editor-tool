import { createContext, useEffect, useState } from 'react';
import API from './api';
import Editor from './Editor';
import Tree from './Tree';
const axios = require('axios');

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
  
  useEffect(() => {
    if (selectedNode && jsonRefNode) {
      const test = schemas[jsonRefNode[selectedNode]]
      setJson(schemas[jsonRefNode[selectedNode]].data); 
      setMetaData(schemas[jsonRefNode[selectedNode]]);
    }
  }, [selectedNode])


  useEffect(() => {
    setApi(new API("http://74.208.178.82", "8092"))
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
      ...metaData,
      data : {
        ...edits
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
      route : route,
      request_type, request_type,
      data : {}
    }
    api.post("/schemas", null, data).then(res => {
      console.log(res)
      getHierarchy();
      getSchemas();
      setSuccessAlert(true)
      setTimeout(() => {setSuccessAlert(false)}, 2000)
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
      <Tree data={hierarchyData} selectedNode={selectedNode} setSelectedNode={setSelectedNode} setJsonRefNode={setJsonRefNode} handleNewRoute={handleNewRoute} handleNewJSON={handleNewJSON} metaData={metaData} setMetaData={setMetaData}/>
      <Editor metaData={metaData} json={json} handleChange={handleChange} handleSave={handleSave} handleDelete={handleDelete} loadingSave={loadingSave} loadingDelete={loadingDelete} successAlert={successAlert} api={api}/>
    </div>
  );
}

export default App;
