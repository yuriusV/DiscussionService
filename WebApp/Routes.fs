module Routes

open Microsoft.AspNetCore.Http

open Giraffe
open Giraffe.HttpHandlers
open Giraffe.Middleware
open Giraffe.Razor.HttpHandlers
open Giraffe.Razor.Middleware
open Newtonsoft.Json

open DataAccess
open Logic
open Newtonsoft.Json
open System
open Models
open FsSql
open Newtonsoft.Json.Linq
open System.Threading

let jsonResponse dataGiver mapper next context =
    let data = dataGiver (mapper context)
    json data next context

let createEntityHandler<'entity> () =
    let entityName = typeof<'entity>.Name

    let selectHandler (id: int) = 
        (DataAccess.CommonQueries.getById entityName id) |> json

    let advancedSelectHandler next (context: HttpContext) = 
        task {
            let! body = context.ReadBodyFromRequest()
            let jsonBody = JObject.Parse(body)
            let filters =
                jsonBody.SelectToken("filters").Children()
                |> Seq.map(fun x -> (
                    x.SelectToken("key").ToObject<string>(), 
                    x.SelectToken("value").ToObject()))

            let columns =
                jsonBody.SelectToken("columns").Children()
                |> Seq.map(fun x -> x.ToObject<string>())

            let resultDb = DataAccess.CommonQueries.fullGetByFilters entityName filters columns
            let result = JsonConvert.SerializeObject resultDb
            context.Response.ContentType <- "application/json"
            let! _ = context.Response.WriteAsync(result, CancellationToken.None)
            return! next context
        }

    let removeHandler id = 
        DataAccess.CommonQueries.removeById id |> ignore
        json "ok"
    let updateHandler id next context =
        json 1 next context

    choose [
        subRoute ("/" + entityName.ToLower()) (
            choose [
                GET >=> routef "/%i" selectHandler
                POST >=> route "/" >=> advancedSelectHandler
                GET >=> routef "/remove/%i" removeHandler
                POST >=> routef "/update/%i" updateHandler
            ]
        )
    ]

let entityHandlers = choose [
    createEntityHandler<User>()
    createEntityHandler<Community>()
    createEntityHandler<Poll>()
    createEntityHandler<User>()
]

let apiHandler: HttpHandler = 
    choose [
        entityHandlers
    ]
let indexHtmlPath = "/public/build/index.html"
    //"/wwwroot/public/index.html"

let webApp: HttpHandler =
    choose [
        route "/" >=> htmlFile indexHtmlPath
        route "/profile" >=> htmlFile indexHtmlPath
        route "/user" >=> htmlFile indexHtmlPath
        route "/community" >=> htmlFile indexHtmlPath
        route "/post" >=> htmlFile indexHtmlPath
        subRoute "/api" apiHandler
        setStatusCode 404 >=> text "Not Found" ]