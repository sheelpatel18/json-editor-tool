import { Document } from "./Database"

const validTypes = [
    "GET",
    "POST",
    "PUT",
    "DELETE"
]

export const updateHierarchy = async (
    route: string,
    type: string = null,
    id: string = null,
    remove: boolean = false
): Promise<Document> => {
    if (!route) throw new Error("Route cannot be null")
    if (!validTypes.includes(type)) throw new Error("Not a valid type")
    let hierarchy: Document = await Document.getHierarchyDocument()
    let hierarchyJSON: object = hierarchy.json
    const routeArrayConversion: string[] = route.split("/").slice(1)
    routeArrayConversion.forEach(path => {
        if (!hierarchyJSON[path]) {
            hierarchyJSON[path] = {}
        }
        if (path == routeArrayConversion[routeArrayConversion.length - 1] && type == "ROUTE" && remove) delete hierarchyJSON[path]
        hierarchyJSON = hierarchyJSON[path]
    })
    if (type == "ROUTE" && remove) // delete hierarchyJSON finish
        if (remove && type != "ROUTE") delete hierarchyJSON[type]
    if (!remove && type && id) hierarchyJSON[type] = id
    hierarchy = await hierarchy.update()
    return hierarchy
}

export const getJSONFromPath = async (
    route: string,
    type: string
): Promise<object> => {
    if (!(route && type)) throw "Route and type cannot be null"
        if (!validTypes.includes(type)) throw new Error("Not a valid type")
        const hierarchy : Document = await Document.getHierarchyDocument()
        const routeArrayConversion : string[] = route.split("/").slice(2)
        var response = hierarchy.json
        routeArrayConversion.forEach(path => {
            if (!response[path]) return null
            response = response[path]
        })
        const _id : string = response[type]
        const targetDocument = await Document.get(_id)
        return targetDocument.json
}