module Routes

open Microsoft.AspNetCore.Http

open Giraffe
open Giraffe.HttpHandlers
open Giraffe.Middleware
open Giraffe.Razor.HttpHandlers
open Giraffe.Razor.Middleware

open DataAccess
open Logic




let webApp: HttpFunc -> HttpContext -> HttpFuncResult =
    choose [
        route "/" >=> htmlFile "/wwwroot/public/index.html"
        setStatusCode 404 >=> text "Not Found" ]