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
open System

let jsonResponse dataGiver mapper next context =
    let data = dataGiver (mapper context)
    json data next context

let getJValue<'t> (jo: JObject) path = 
    jo.SelectToken(path).ToObject<'t>()

let getJArray (jo: JObject) path = 
    jo.SelectToken(path).Children()

let getJObject (jo: JObject) path =
    jo.SelectToken(path)

let outputJson obj next (context: HttpContext) =
    let result = JsonConvert.SerializeObject obj
    context.Response.ContentType <- "application/json"
    context.Response.WriteAsync(result, CancellationToken.None) |> ignore
    next context

let ofJson (context: HttpContext) keys =
    let body = context.ReadBodyFromRequest().GetAwaiter().GetResult()
    let jo = JObject.Parse(body)
    Map.ofSeq (seq {
        for x in keys do
            yield (x, getJValue<Object> jo x)
    })

module Handlers = 
    let createPostHandler next (context: HttpContext) = 
        task {
            let! body = context.ReadBodyFromRequest()
            let jo = JObject.Parse(body)

            let communityId = getJValue<int> jo "communityId"
            let title = getJValue<string> jo "title"
            let time = DateTime.Now
            let content = getJValue<string> jo "content"
            //let pollData = getJValue<>
            LogicQueries.createPost (getCurrentUserId context) communityId "temp" title time content |> ignore
            return! next context
        }

    let votePostHanler next (context: HttpContext) =
        task {
            let! body = context.ReadBodyFromRequest()
            let jo = JObject.Parse(body)

            let postId = getJValue<int> jo "postId"
            let vote = getJValue<int> jo "vote"
            let userId = getCurrentUserId context
            LogicQueries.votePost userId postId vote |> ignore
            return! next context
        }

    let voteCommentHanler next (context: HttpContext) = 
        task {
            let! body = context.ReadBodyFromRequest()
            let jo = JObject.Parse(body)

            let commentId = getJValue<int> jo "commentId"
            let vote = getJValue<int> jo "vote"
            let userId = getCurrentUserId context
            LogicQueries.voteComment userId commentId vote |> ignore
            return! next context
        }


    let makeCommentHandler next (context: HttpContext) =
        task {
            let! body = context.ReadBodyFromRequest()
            let jo = JObject.Parse(body)

            let parentCommentId = getJValue<int> jo "parentCommentId"
            let content = getJValue<string> jo "content"
            let postId = getJValue<int> jo "postId"
            let userId = getCurrentUserId context
            LogicQueries.makeComment userId postId parentCommentId content DateTime.Now |> ignore
            return! next context
        }

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
        route "/currentUserHeader" >=> Handlers.getUserHeader
        routef "/searchInSite/%s" Handlers.searchOnSite
        route "/getUserFeed" >=> Handlers.getUserFeed
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
        route "/getListCommunities" >=> 
            jsonResponse (fun x -> LogicQueries.getListCommunities 0 100) (ignore)
        route "/getListUsers" >=> 
            jsonResponse (fun x -> LogicQueries.getListUsers 0 100) ignore
    
        route "/getPollInfo/%i"

        // Mofify
        POST >=> route "/createPost" >=> Handlers.createPostHandler >=> outputJson {|ok = true|}
        routef "/deletePost/%i" (fun i -> 
            jsonResponse LogicQueries.deletePost (fun s -> i)) >=> outputJson {|ok = true|}
        POST >=> route "/votePost" >=> Handlers.votePostHanler >=> outputJson {|ok = true|}
        POST >=> route "/voteComment" >=> Handlers.voteCommentHanler >=> outputJson {|ok = true|}
        POST >=> route "/votePoll" // TODO
        POST >=> route "/makeComment" >=> Handlers.makeCommentHandler >=> outputJson {|ok = true|}


        // Auth
        route "/login"
        route "/register"
        route "/logout"

        // Communities
        route "/enterCommunity"
        route "/exitCommunity"
        route "/createCommunity"
        route "/banUser"
        route "/deleteCommunity"
        route "/updateCommunity"
    ]