const axios = require('axios');

class API {
    server
    port
    schema

    constructor(server, port=null) { 
        this.server = server;
        this.port = port;
    }

    addSchema(schema) {
        this.schema = schema
    }

    async get(route, options=null) {
        const url = this.port ? `${this.server}:${this.port}` : `${this.server}`
        // validate with routes
        const call = {
            method: "get",
            url: options ? `${url}${route}${options}` : `${url}${route}`,
            headers: {
                "Content-type" : "application/json",
                "Authorization" : `Bearer ${this.access_token}`
            }
        }
        const res = await axios(call)
        return res
    }

    async post(route, options=null, data) {
        const url = this.port ? `${this.server}:${this.port}` : `${this.server}`
        const call = {
            method: "post",
            url: options ? `${url}${route}${options}` : `${url}${route}`,
            headers: {
                "Content-type" : "application/json",
                "Authorization" : `Bearer ${this.access_token}`
            },
            data : data
        }
        const res = await axios(call)
        return res
    }

    async put(route, options, data=null) {
        const url = this.port ? `${this.server}:${this.port}` : `${this.server}`
        const call = {
            method: "put",
            url: options ? `${url}${route}${options}` : `${url}${route}`,
            headers: {
                "Content-type" : "application/json",
                "Authorization" : `Bearer ${this.access_token}`
            },
            data : data ? data : this.schema
        }
        const res = await axios(call)
        return res
    }

    async delete(route, options,) {
        const url = this.port ? `${this.server}:${this.port}` : `${this.server}`
        const call = {
            method: "delete",
            url: options ? `${url}${route}${options}` : `${url}${route}`,
            headers: {
                "Content-type" : "application/json",
                "Authorization" : `Bearer ${this.access_token}`
            },
        }
        const res = await axios(call)
        return res
    }

    getServerURL() {
        return this.server
    }

    getServerPort() {
        return this.port
    }

}

export default API