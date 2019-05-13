module DefaultApiHandler

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

open AuthUtil
open DataAccessBase
open DataAccess
open DataAccess

let jsonResponse dataGiver mapper next context =
    let data = dataGiver (mapper context)
    json data next context

let getUserHeader next context =
    let id = getCurrentUserId context
    let profile = LogicQueries.getUserProfile id
    json profile next context

let getUserFeed next context =
    let id = getCurrentUserId context
    let feed = LogicQueries.getUserFeed id
    json feed next context

let searchOnSite (text: string) next context =
    let profile = LogicQueries.searchInSite text
    json profile next context

let defaultApiHandler: HttpHandler = 
    choose [
        route "/currentUserHeader" >=> getUserHeader
        routef "/searchInSite/%s" searchOnSite
        route "/getUserFeed" >=> getUserFeed
        routef "/getCommuintyPageCardInfo/%s" (fun (communityUrl:string) ->
            jsonResponse LogicQueries.getCommuintyPageCardInfo (fun s -> communityUrl))
        routef "/getCommunityPosts/%i" (fun (communityId:int) ->
            jsonResponse LogicQueries.getCommunityPosts (fun s -> communityId))
        routef "/getUserCardInfo/%s" (fun (user: string) ->
            jsonResponse LogicQueries.getUserCardInfo (fun s -> user))
        routef "/getUserPosts/%i" (fun (post:int) ->
            jsonResponse LogicQueries.getUserPosts (fun s -> post))
        routef "/getPostData/%s" (fun (post:string) ->
            jsonResponse LogicQueries.getPostData (fun x -> post))
        routef "/getPostComments/%i" (fun (post:int) ->
            jsonResponse LogicQueries.getPostComments (fun s -> post))
        route "/getListCommunities" >=> jsonResponse (fun x -> LogicQueries.getListCommunities 0 100) (ignore)
        route "/getListUsers" >=> jsonResponse (fun x -> LogicQueries.getListUsers 0 100) ignore
    ]