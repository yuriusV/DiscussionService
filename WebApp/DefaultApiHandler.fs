module DefaultApiHandler

open Microsoft.AspNetCore.Http

open Giraffe
open Giraffe.HttpHandlers
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

module Res =
    type Response = {
        success: bool;
        message: string
    }

    let success = {success = true; message = ""}
    let fail = {success = false; message = ""}
    let failMessage message = {success = false; message = message}

module Json =
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
    let makePollChoice  next (context: HttpContext) =
        task {
            let! body = context.ReadBodyFromRequest()
            let jo = JObject.Parse(body)
            let pollId = Json.getJValue<int32> jo "pollId"
            let vote = Json.getJValue<int32> jo "choice"
            let userId = AuthUtil.getCurrentUserId context
            let voteNewData = LogicQueries.Polls.makePollChoice pollId userId vote
            return! json voteNewData next context
        }    

    let createPostHandler next (context: HttpContext) = 
        task {
            let! body = context.ReadBodyFromRequest()
            let jo = JObject.Parse(body)

            let communityId = Json.getJValue<int> jo "communityId"
            let title = Json.getJValue<string> jo "title"
            let time = DateTime.Now
            let content = Json.getJValue<string> jo "content"
            //let pollData = getJValue<>
            LogicQueries.Posts.createPost (getCurrentUserId context) communityId "temp" title time content |> ignore
            return! next context
        }

    let votePostHanler next (context: HttpContext) =
        task {
            let! body = context.ReadBodyFromRequest()
            let jo = JObject.Parse(body)

            let postId = Json.getJValue<int> jo "postId"
            let vote = Json.getJValue<int> jo "vote"
            let userId = getCurrentUserId context
            let voteStats = Array.head (LogicQueries.Posts.votePost userId postId vote)
            return! json voteStats next context
        }

    let voteCommentHanler next (context: HttpContext) = 
        task {
            let! body = context.ReadBodyFromRequest()
            let jo = JObject.Parse(body)

            let commentId = Json.getJValue<int> jo "commentId"
            let vote = Json.getJValue<int> jo "vote"
            let userId = getCurrentUserId context
            let voteStats = Array.head (LogicQueries.Comments.voteComment userId commentId vote)
            return! json voteStats next context
        }


    let makeCommentHandler next (context: HttpContext) =
        task {
            let! body = context.ReadBodyFromRequest()
            let jo = JObject.Parse(body)

            let parentCommentId = Json.getJValue<int> jo "parentCommentId"
            let content = Json.getJValue<string> jo "content"
            let postId = Json.getJValue<int> jo "postId"
            let userId = getCurrentUserId context
            LogicQueries.Comments.makeComment userId postId parentCommentId content DateTime.Now |> ignore
            return! next context
        }
    
    let getCurrentUserInfo next (context: HttpContext) = 
        (getCurrentUserId context
        |> LogicQueries.getUserCardInfoById
        |> json) next context

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

    module Communities =
        let enterCommunity (id: int32) next context = 
            let userId = AuthUtil.getCurrentUserId context
            let result = LogicQueries.Communities.enterCommunity userId id
            json result next context

        let exitCommunity (id: int32) next context = 
            let userId = AuthUtil.getCurrentUserId context
            LogicQueries.Communities.exitCommunity userId id
            json true next context

        let createCommunity next context = 
            let userId = AuthUtil.getCurrentUserId context
            if userId = 0 then json false next context
            else
                let body = context.ReadBodyFromRequest().GetAwaiter().GetResult()
                let jo = JObject.Parse(body)
                let name = Json.getJValue<string> jo "name"
                let description = Json.getJValue<string> jo "name"
                let url = name // todo
                let succeed = LogicQueries.Communities.createCommunity userId name url description
                json succeed next context


        let deleteCommunity (communityId: int32) next context =
            let userId = AuthUtil.getCurrentUserId context
            if userId = 0 then json false next context
            else
                let success = LogicQueries.Communities.deleteCommunity userId communityId
                json success next context


        let updateCommunity next context = 
            json true next context

let defaultApiHandler: HttpHandler = 
    choose [
        route "/currentUserHeader" >=> Handlers.getUserHeader
        routef "/searchInSite/%s" Handlers.searchOnSite
        route "/getUserFeed" >=> Handlers.getUserFeed
        routef "/getCommuintyPageCardInfo/%s" (fun (communityUrl:string) ->
            Json.jsonResponse (LogicQueries.Communities.getCommuintyPageCardInfo communityUrl) (AuthUtil.getCurrentUserId))
        routef "/getCommunityPosts/%i" (fun (communityId:int) ->
            Json.jsonResponse LogicQueries.Communities.getCommunityPosts (fun s -> communityId))
        routef "/getUserCardInfo/%s" (fun (user: string) ->
            Json.jsonResponse LogicQueries.getUserCardInfo (fun s -> user))
        routef "/getUserPosts/%i" (fun (post:int) ->
            Json.jsonResponse LogicQueries.getUserPosts (fun s -> post))
        routef "/getPostData/%s" (fun (post:string) ->
            Json.jsonResponse LogicQueries.getPostData (fun x -> post))
        routef "/getPostComments/%i" (fun (post:int) ->
            Json.jsonResponse LogicQueries.getPostComments (fun s -> post))
        route "/getListCommunities" >=> 
            Json.jsonResponse (fun userId -> LogicQueries.Communities.getListCommunities userId 0 100) (AuthUtil.getCurrentUserId)
        routef "/getListUsers/%i" 
            (fun (byPosts: int32) -> Json.jsonResponse (fun x -> LogicQueries.getListUsers (byPosts = 1) 0 100) ignore)
        route "/getCurrentUserInfo" >=> Handlers.getCurrentUserInfo
        route "/getPollInfo/%i"

        // Mofify
        POST >=> route "/createPost" >=> Handlers.createPostHandler >=> Json.outputJson Res.success
        routef "/deletePost/%i" (fun i -> 
            Json.jsonResponse LogicQueries.Posts.deletePost (fun s -> i)) >=> Json.outputJson Res.success
        POST >=> route "/votePost" >=> Handlers.votePostHanler >=> Json.outputJson Res.success
        POST >=> route "/voteComment" >=> Handlers.voteCommentHanler >=> Json.outputJson Res.success
        POST >=> route "/makeComment" >=> Handlers.makeCommentHandler >=> Json.outputJson Res.success

        // Polls
        GET >=> routef "/loadPollsData/%i" (fun (postId: int32) -> 
            Json.jsonResponse LogicQueries.Polls.loadPollsData (fun x -> postId))
        GET >=> routef "/loadPollData/%i" (fun (pollId: int32) -> 
            Json.jsonResponse LogicQueries.Polls.loadPollData (fun x -> pollId))
        POST >=> route "/makePollChoice" >=> Handlers.makePollChoice


        // Communities
        GET >=> routef "/enterCommunity/%i" Handlers.Communities.enterCommunity
        GET >=> routef "/exitCommunity/%i" Handlers.Communities.exitCommunity
        POST >=> route "/createCommunity" >=> Handlers.Communities.createCommunity
        route "/banUser"
        GET >=> routef "/deleteCommunity/%i" Handlers.Communities.deleteCommunity
        POST >=> route "/updateCommunity" >=> Handlers.Communities.updateCommunity
    ]