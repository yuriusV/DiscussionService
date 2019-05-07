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

let jsonResponse dataGiver mapper next context =
        let data = dataGiver (mapper context)
        json data next context

let apiHandler: HttpHandler = 
        choose [
                routef "/users/%i" (fun id -> jsonResponse Logic.Users.getUsers (fun ctx -> id))
        ]

let webApp: HttpHandler =
    choose [
        route "/" >=> htmlFile "/wwwroot/public/index.html"
        subRoute "/api" apiHandler
        setStatusCode 404 >=> text "Not Found" ]