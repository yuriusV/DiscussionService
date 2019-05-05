module GiraffeSample.App

open System
open System.IO
open System.Collections.Generic
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.Logging
open Microsoft.Extensions.DependencyInjection
open Giraffe.HttpHandlers
open Giraffe.Middleware
open Giraffe.Razor.HttpHandlers
open Giraffe.Razor.Middleware
open GiraffeSample.Models

open Giraffe.HttpContextExtensions
open LunchTypes
open DataAccess

// ---------------------------------
// Web app
// ---------------------------------

let handleLunchFilter (next: HttpFunc) (ctx: HttpContext) =
    let filter = ctx.BindQueryString<LunchFilter>()
    let lunchSpots = LunchAccess.getLunches filter
    json lunchSpots next ctx

let handleAddLunch (next: HttpFunc) (ctx: HttpContext) =
    Giraffe.Tasks.task {
        let! lunch = ctx.BindJson<LunchSpot>()
        LunchAccess.addLunch lunch
        return! text (sprintf "Added %s to the dinner spots." lunch.Name) next ctx
    }

let webApp =
    choose [
        route "/" >=> razorHtmlView "Index" { Text = "Hello world, from F#, dotnetcore2, and... Giraffe!" }
        GET >=> route "/lunch" >=> handleLunchFilter
        POST >=> route "/lunch/add" >=> handleAddLunch
        setStatusCode 404 >=> text "Not Found" ]

// ---------------------------------
// Error handler
// ---------------------------------

let errorHandler (ex : Exception) (logger : ILogger) =
    logger.LogError(EventId(), ex, "An unhandled exception occurred while executing the request.")
    clearResponse >=> setStatusCode 500 >=> text ex.Message

// ---------------------------------
// Config and Main
// ---------------------------------

let configureApp (app : IApplicationBuilder) =
    app.UseGiraffeErrorHandler errorHandler
    app.UseStaticFiles() |> ignore
    app.UseGiraffe webApp

let configureServices (services : IServiceCollection) =
    let sp  = services.BuildServiceProvider()
    let env = sp.GetService<IHostingEnvironment>()
    let viewsFolderPath = Path.Combine(env.ContentRootPath, "Views")
    services.AddRazorEngine viewsFolderPath |> ignore

let configureLogging (builder : ILoggingBuilder) =
    let filter (l : LogLevel) = l.Equals LogLevel.Error
    builder.AddFilter(filter).AddConsole().AddDebug() |> ignore

[<EntryPoint>]
let main argv =
    let contentRoot = Directory.GetCurrentDirectory()
    let webRoot     = Path.Combine(contentRoot, "WebRoot")
    WebHostBuilder()
        .UseKestrel()
        .UseContentRoot(contentRoot)
        .UseIISIntegration()
        .UseWebRoot(webRoot)
        .UseUrls("http://*:5000")
        .Configure(Action<IApplicationBuilder> configureApp)
        .ConfigureServices(configureServices)
        .ConfigureLogging(configureLogging)
        .Build()
        .Run()
    0
