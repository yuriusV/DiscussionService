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
open DefaultApiHandler


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

module AuthHandlers =
    let makeLogin next (context: HttpContext)=
        let body = context.ReadBodyFromRequest().GetAwaiter().GetResult()
        let jo = JObject.Parse(body)

        let login = Json.getJValue<string> jo "login"
        let password = Json.getJValue<string> jo "password"
        let checkRes = AuthUtil.loginWithCredentials context login password
        if checkRes then
            Json.outputJson Res.success next context
        else
            Json.outputJson Res.fail next context

    let makeLogout next context = 
        let res = AuthUtil.logout context
        if res then Json.outputJson Res.success next context
        else Json.outputJson Res.fail next context

    let makeRegister next (context: HttpContext) =
        let body = context.ReadBodyFromRequest().GetAwaiter().GetResult()
        let jo = JObject.Parse(body)

        let login = Json.getJValue<string> jo "login"
        let password = Json.getJValue<string> jo "password"
        let fullName = Json.getJValue<string> jo "fullName"
        let checkRes = AuthUtil.register context fullName login password
        if checkRes then
            Json.outputJson Res.success next context
        else
            Json.outputJson Res.fail next context

let apiHandler: HttpHandler = 
    choose [
        entityHandlers
        subRoute "/v1" defaultApiHandler
    ]
let indexHtmlPath = "/public/build/index.html"
    //"/wwwroot/public/index.html"

let webApp: HttpHandler =
    choose [
        route "/" >=> htmlFile indexHtmlPath
        route "/profile" >=> htmlFile indexHtmlPath
        GET >=> route "/login" >=> htmlFile indexHtmlPath

        routef "/user/%s" (fun s -> htmlFile indexHtmlPath)
        routef "/community/%s" (fun s -> htmlFile indexHtmlPath)
        routef "/post/%s" (fun s -> htmlFile indexHtmlPath)
        route "/users" >=> htmlFile indexHtmlPath
        route "/newPost" >=> htmlFile indexHtmlPath
        route "/communities" >=> htmlFile indexHtmlPath
        
        POST >=> route "/login" >=> AuthHandlers.makeLogin
        POST >=> route "/register" >=> AuthHandlers.makeRegister
        GET >=> route "/logout" >=> AuthHandlers.makeLogout

        subRoute "/api" apiHandler
        setStatusCode 404 >=> text "Not Found" ]