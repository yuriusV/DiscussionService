
module DataAccess

open System.IO
open Npgsql
open Microsoft.Data.Sqlite

open System
open System.Data
open System.Configuration
open System.Text

open Constants

open Models
open DataAccessBase
open Tx
open Tx
open Sql
open Tx
open LinqToDB.Linq
open Tx
open System.Reflection.Metadata.Ecma335
open Tx
open Sql
open Tx

let createConnectionString user pass db = 
    sprintf @"User ID=%s;Password=%s;Host=localhost;Port=5432;Database=%s" user pass db
let connectionString = createConnectionString "admin" "admin" "disscuss"

let openConnection() =
    let connection = new NpgsqlConnection(connectionString)
    connection.Open()
    connection :> IDbConnection

let connectionManager = Sql.withNewConnection(openConnection)
let sql = SqlWrapper(connectionManager)
let exec sqlCommand = sql.ExecNonQuery sqlCommand [] |> ignore
let param = Sql.Parameter.make
let execReader (qry : StringBuilder) = 
    Console.WriteLine(qry.ToString())
    sql.ExecReader (qry.ToString())
let execReaderString qry = sql.ExecReader qry
let execNonQueryString s = sql.ExecNonQuery s
let execNonQuery (qry : StringBuilder) = sql.ExecNonQuery (qry.ToString())
let escaper = new NpgsqlCommandBuilder()
let escape = escaper.QuoteIdentifier

type Paging =
    | All
    | Range of int * int

let Query (str : string) = StringBuilder(str)
let (@~) (qry : StringBuilder) (str : string) = qry.Append(" ").Append(str)


let readMapFromDataRecord (dataRecord: #IDataRecord) = 
    Map.ofList [
        for i = 0 to dataRecord.FieldCount - 1 do
            yield (dataRecord.GetName(i), dataRecord.GetValue(i))
    ]

let sqlRead sql parameters = 
    use reader = execReaderString sql parameters
    reader |> Seq.ofDataReader |> Seq.map readMapFromDataRecord  |> Seq.toArray
        
let sqlToMap sql parameters = 
    use reader = execReader sql parameters
    reader |> Seq.ofDataReader |>  Seq.map readMapFromDataRecord |> Seq.toArray

let getSingleRowValue<'t> (a: Map<string, obj>[]) key =
    Map.find key (Array.head a) :?> 't

type N<'a when 'a: (new: unit -> 'a) and 'a: struct and 'a :> ValueType> = Nullable<'a>

//deletet this
let uncastDbNull (a: obj) =
    match a with
    | :? System.DBNull as x -> null
    | _ -> a

let (?) m key = 
    Map.find key m


module CommonQueries =

    let getByFilters entityName (filters: Map<string, obj>) = 
        let filtersSql = 
            filters |> Map.toList 
            |> List.map (fun (key, value) -> 
                sprintf """ "%s" = @%s """ ( key) ( key))
            |> String.concat " and "

        let parameters = 
            filters |> Map.toList
            |> List.map (fun (k, v) -> param(k, v))

        let qry = Query (sprintf """ select * from "%s" where %s """ (entityName) filtersSql)
        sqlToMap qry parameters

    let getById entityName id = 
        getByFilters entityName (Map.ofList [("Id", (id :> obj) )])

    // with columns, including join like 'ColumnName.LinkedTable.ColumnName'
    let fullGetByFilters entityName (filters: seq<string * obj>) (columns: string seq) =
        let mutable columnList = []
        let mutable joinList = []
        let mutable filterList = []
        let mutable paramList = []
        let mutable joinedTables = [entityName]

        for (k, v) in filters do
            let joinType = if k.StartsWith("=") then "inner join " else "left join "
            let parts = k.Replace("=", "").Split(".")

            let column, linkedTable, linkedColumn = 
                if parts.Length = 3 then parts.[0], parts.[1], parts.[2]
                else k, entityName, k

            if not (List.exists (fun x -> x = linkedTable) joinedTables) then
                let joiner = (sprintf """%s "%s" on "%s"."%s" = "%s"."%s" """ 
                    joinType linkedTable linkedTable "Id" entityName column)
                joinList <- joiner :: joinList
                joinedTables <- linkedTable :: joinedTables

            let filter = (sprintf """ "%s"."%s" = @%s """ entityName linkedColumn (linkedTable + linkedColumn))
            filterList <- filter :: filterList

            paramList <- param(linkedTable + linkedColumn, v) :: paramList

        for c in columns do
            let parts = c.Replace("=", "").Split(".")

            let column, linkedTable, linkedColumn = 
                if parts.Length = 3 then parts.[0], parts.[1], parts.[2]
                else c, entityName, c
            
            columnList <- (sprintf """ "%s"."%s" """ linkedTable linkedColumn) :: columnList
        
        let qry = Query( sprintf """select %s 
        from "%s"
        %s
        %s
        """ (String.concat ", " columnList) 
            entityName 
            (String.concat "\n" joinList) 
            (if List.isEmpty filterList then "" else " where " + (String.concat " and " filterList)))

        sqlToMap qry paramList
    
    let fullGetById entityName id (columns: string list) = 
        fullGetByFilters entityName (Seq.singleton ("Id", id)) columns

    let removeById entityName id = 
        let qry = Query(sprintf """ delete from "%s" where "Id" = @id """ (escape entityName))
        execNonQuery qry [param("Id", id)]

    let updateById entityName id (values: Map<string, obj>) = 
        let columns = 
            values |> Map.toSeq
            |> Seq.map(fun(k, v) -> sprintf """ "%s" = @%s """ (escape k) (escape k))
            |> String.concat ", "
        let parameters = 
            values |> Map.toSeq
            |> Seq.map(fun(k, v) -> param(escape k, v))

        let qry = Query(sprintf """ update "%s" set %s where "Id" = @id; """ (escape entityName) columns)
        execNonQuery qry parameters

module LogicQueries =
    let getUserProfile id =
        sqlToMap (Query """
            select 
                "Id" as id, 
                "FullName" as "name", 
                "Name" as "nick",
                "UrlPhoto" as "urlPhoto"
            from "User"
            where "Id" = @id""") [param("id", id)]

    let searchInSite searchText = 
        sqlToMap (Query """
            select
                "Id" as id,
                "Title" as title,
                '/posts/' || "UrlName" as url,
                'post' as "type"
            from "Post"
            where "Title" = @searchText
            union all
            select
                "Id" as id,
                "FullName" as title,
                '/users/' || "Name" as url,
                'user' as "type"
            from "User"
            where "FullName" = @searchText or "Name" = @searchText
            union all
            select
                "Id" as id,
                "Name" as title,
                '/communities/' || "UrlName" as url,
                'community' as "type"
            from "Community"
            where "Name" = @searchText
            """) [param("searchText", searchText)]


    let getUserFeed userId = 
        sqlToMap (Query """
            select
            	"Post"."Id" as id,
            	"Post"."Title" as title,
            	"Post"."UrlName" as url,
            	author."Id" as "author.id",
            	author."Name" as "author.url",
            	author."FullName" as "author.name",
            	author."UrlPhoto" as "author.urlPhoto",
            	c."UrlName" as "community.url",
            	c."Name" as "community.name",
            	c."UrlPhoto" as "community.urlPhoto",
            	"Post"."CreatedOn" as "time",
            	"Post"."Content" as "content",
            	(select count(1) from "Comment" where "PostId" = "Post"."Id") as "countComments",
            	(select count(1) from "PostVote" where "Post"."Id" = "PostVote"."PostId" and "Vote" > 0) as likes,
            	(select count(1) from "PostVote" where "Post"."Id" = "PostVote"."PostId" and "Vote" < 0) as dislikes
            from "Post"
            inner join "Community" c on "Post"."CommunityId" = c."Id"
            inner join "UserInCommunity" on c."Id" = "UserInCommunity"."CommunityId" and "UserInCommunity"."UserId" = @userId
            inner join "User" author on author."Id" = "Post"."AuthorId"
           """) [param("userId", userId)]

    let getUserCardInfo (userName: string) = 
        sqlToMap (Query """
                   select
            	u."Id" as id,
            	u."FullName" as "name",
            	u."UrlPhoto" as "urlPhoto",
            	(select count(1) from "Comment" where "AuthorId" = 1) as "countComments",
            	(select count(1) from "PostVote" where "PostVote"."UserId" = u."Id" and "Vote" > 0) as pluses,
            	(select count(1) from "PostVote" where "PostVote"."UserId" = u."Id" and "Vote" < 0) as minuses,
            	u."Name" as nick
            from "User" u
            where u."Name" = @user
                """) [param("user", userName)]

    let getUserCardInfoById userId = 
        sqlToMap (Query """
                   select
            	u."Id" as id,
            	u."FullName" as "name",
            	u."UrlPhoto" as "urlPhoto",
                u."Name" as "login",
            	(select count(1) from "Comment" where "AuthorId" = 1) as "countComments",
            	(select count(1) from "PostVote" where "PostVote"."UserId" = u."Id" and "Vote" > 0) as pluses,
            	(select count(1) from "PostVote" where "PostVote"."UserId" = u."Id" and "Vote" < 0) as minuses,
            	u."Name" as nick
            from "User" u
            where u."Id" = @user
                """) [param("user", userId)]


    let getUserPosts userId = 
        sqlToMap (Query """
                    select
	"Post"."Id" as id,
	"Post"."Title" as title,
	"Post"."UrlName" as url,
	author."Id" as "author.id",
	author."Name" as "author.url",
	author."FullName" as "author.name",
	author."UrlPhoto" as "author.urlPhoto",
	c."UrlName" as "community.url",
	c."Name" as "community.name",
	c."UrlPhoto" as "community.urlPhoto",
	"Post"."CreatedOn" as "time",
	"Post"."Content" as "content",
	(select count(1) from "Comment" where "PostId" = "Post"."Id") as "countComments",
	(select count(1) from "PostVote" where "Post"."Id" = "PostVote"."PostId" and "Vote" > 0) as likes,
	(select count(1) from "PostVote" where "Post"."Id" = "PostVote"."PostId" and "Vote" < 0) as dislikes
    from "Post"
    inner join "Community" c on "Post"."CommunityId" = c."Id"
    inner join "User" author on author."Id" = "Post"."AuthorId"
    where author."Id" = @userId
                """) [param("userId", userId)]

    let getPostData postId =
        sqlToMap (Query """
                   select
	"Post"."Id" as id,
	"Post"."Title" as title,
	"Post"."UrlName" as url,
	author."Id" as "author.id",
	author."Name" as "author.url",
	author."FullName" as "author.name",
	author."UrlPhoto" as "author.urlPhoto",
	c."UrlName" as "community.url",
	c."Name" as "community.name",
	c."UrlPhoto" as "community.urlPhoto",
	"Post"."CreatedOn" as "time",
	"Post"."Content" as "content",
	(select count(1) from "Comment" where "PostId" = "Post"."Id") as "countComments",
	(select count(1) from "PostVote" where "Post"."Id" = "PostVote"."PostId" and "Vote" > 0) as likes,
	(select count(1) from "PostVote" where "Post"."Id" = "PostVote"."PostId" and "Vote" < 0) as dislikes
    from "Post"
    inner join "Community" c on "Post"."CommunityId" = c."Id"
    inner join "User" author on author."Id" = "Post"."AuthorId"
    where "Post"."UrlName" = @post
                """) [param("post", postId)]


    let getPostComments postId = 
        sqlToMap (Query """
                    select
	c."Id" as id,
    @postId as "postId",
	c."Content" as "content",
	c."ParentId" as "parentId",
	author."Id" as "author.id",
	author."Name" as "author.url",
	author."FullName" as "author.name",
	author."UrlPhoto" as "author.urlPhoto",
	case when c."ModifiedOn" is not null then c."ModifiedOn" else c."CreatedOn" end as "time",
	case when c."ModifiedOn" is not null then 1 else 0 end as "isModified",
	(select count(1) from "CommentVote" where "CommentVote"."CommentId" = c."Id" and "Vote" > 0) as likes,
	(select count(1) from "CommentVote" where "CommentVote"."CommentId" = c."Id" and "Vote" < 0) as dislikes
from "Comment" c
inner join "User" author on author."Id" = c."AuthorId"
where c."PostId" = @postId
                """) [param("postId", postId)]


    let getListUsers isByPosts offset limit = 
        sqlToMap (Query """
            with "S" as (
             select
            	u."Id" as id,
            	u."Name" as "url",
            	u."FullName" as "name",
            	u."UrlPhoto" as "urlPhoto",
                (select count(1) from "UserInCommunity" where "UserId" = u."Id") as "countCommunities",
                (select count(1) from "Post" where "AuthorId" = u."Id") as "countPosts"
                from "User" u
            )
            select * from "S" order by "S"."countPosts" desc
        """) []

    module Posts =
        let createPost currentUserId communityId urlName title time content =
            execNonQuery (Query """
                insert into "Post" ("AuthorId", "CommunityId", "UrlName", "Title", "CreatedOn", "Content")
                values ( @currentUserId, @communityId, @urlName, @title, @createdOn, @postContent)
            """) [param("currentUserId", currentUserId); 
                param("communityId", communityId); param("urlName", urlName); 
                param("title", title); param("createdOn", time); param("postContent", content)]

        let deletePost currentUserId postId = 
            execNonQuery (Query """delete from "Post" where "Id" = @id""") [param("id", postId)]

        let getCanVotePost currentUserId postId = 
            let result = (sqlToMap (Query """ 
            select count(1) as "Can" from "UserInCommunity"
                inner join "Post" p on p."CommunityId" = "UserInCommunity"."CommunityId"
                where "UserId" = @userId
                and p."Id" = @postId
            """) [param("postId", postId); param("userId", currentUserId)])
            (getSingleRowValue<int64> result "Can") > 0L

        let votePost currentUserId postId vote =
            let success = getCanVotePost currentUserId postId

            if success then
                execNonQuery (Query """ delete from "PostVote" where "UserId" = @userId and "PostId" = @postId""") [param("userId", currentUserId);
                    param("postId", postId)] |> ignore
                execNonQuery (Query """ insert into "PostVote" ("UserId", "PostId", "Vote") values (@userId, @postId, @vote)  """) [param("userId", currentUserId);
                    param("postId", postId); param("vote", vote)] |> ignore
            else ()

            sqlToMap (Query """
                select
                    (select count(*) from "PostVote" where "PostId" = @postId and "Vote" > 0) "likes",
                    (select count(*) from "PostVote" where "PostId" = @postId and "Vote" < 0) "dislikes",
                    (select sum("Vote") from "PostVote" where "PostId" = @postId and "UserId" = @userId) "user"
            """) [param("postId", postId); param("userId", currentUserId)]


    module Comments = 
        let getCanVoteComment currentUserId commentId = 
            let result = (sqlToMap (Query """ select count(c."Id") as "Can"
                from "Comment" c
                inner join "Post" pic on pic."Id" = c."PostId"
                where c."Id" = @commentId
                and pic."CommunityId" in (select "Id" from "UserInCommunity" where "UserId" = @userId)
                 """) [param("commentId", commentId); param("userId", currentUserId)])
            (getSingleRowValue<int64> result "Can") > 0L

        let voteComment currentUserId commentId vote =
            let canComment = getCanVoteComment currentUserId commentId
            let success = canComment
            if canComment then
                execNonQuery (Query """ delete from "CommentVote" where "UserId" = @userId and "CommentId" = @commentId""") [param("userId", currentUserId);
                    param("commentId", commentId)] |> ignore
                execNonQuery (Query """ insert into "CommentVote" ("UserId", "CommentId", "Vote") values (@userId, @commentId, @vote)  """) [param("userId", currentUserId);
                    param("commentId", commentId); param("vote", vote)] |> ignore
            else ()

            sqlToMap (Query """
                select
                    (select count(*) from "CommentVote" where "CommentId" = @commentId and "Vote" > 0) "likes",
                    (select count(*) from "CommentVote" where "CommentId" = @commentId and "Vote" < 0) "dislikes",
                    (select sum("Vote") from "CommentVote" where "CommentId" = @commentId and "UserId" = @userId) "user"
            """) [param("commentId", commentId); param("userId", currentUserId)]


        let makeComment userId postId parentCommentId content time =
            execNonQuery (Query """
                insert into "Comment" ("ParentId", "PostId", "Content", "AuthorId", "CreatedOn")
    values (@parentId, @postId, @dataContent, @authorId, @createdOn)
            """) [param("parentId", parentCommentId);
                param("postId", postId);
                param("authorId", userId); 
                param("dataContent", content); 
                param("createdOn", time)]


    module Communities = 
        let getListCommunities forUserId offset limit =
            sqlToMap (Query """
            select
            	c."Id" as id,
            	c."UrlName" as "url",
            	c."Name" as "name",
            	c."UrlPhoto" as "urlPhoto",
                c."Description" as "description",
            	(select count(1) from "Post" where "CommunityId" = c."Id") as "countPosts",
            	(select count(1) from "UserInCommunity" uc where uc."CommunityId" = c."Id") as "countUsers",
                (select count(1) from "UserInCommunity" uc where uc."CommunityId" = c."Id" and uc."UserId" = @user) as "isMember"
            from "Community" c
            """) [param("user", forUserId)]


        let getCurrentUserCommunities userId =
            sqlToMap (Query """
            select
            	c."Id" as id,
            	c."UrlName" as "url",
            	c."Name" as "name",
            	c."UrlPhoto" as "urlPhoto",
                c."Description" as "description"
            from "Community" c
            where exists (select 1 from "UserInCommunity" uc where uc."UserId" = @user and uc."CommunityId" = c."Id")
            """) [param("user", userId)]

        let getCommuintyPageCardInfo communityId forUserId = 
            sqlToMap (Query """
                select
                c."Id" as id,
                c."Name" as "name",
                c."UrlName" as url,
                c."UrlPhoto" as "urlPhoto",
                (select count(1) from "UserInCommunity" where "CommunityId" = c."Id") as "countUsers",
                (select count(1) from "Post" where "CommunityId" = c."Id") as "countPosts",
                (select count(1) from "UserInCommunity" uc where uc."CommunityId" = c."Id" and uc."UserId" = @user) as "isMember"
                from "Community" c
                where c."UrlName" = @community
                """) [param("community", communityId); param("user", forUserId)]

        let getCommunityPosts communityId = 
            sqlToMap (Query """
                        select
    	"Post"."Id" as id,
    	"Post"."Title" as title,
    	"Post"."UrlName" as url,
    	author."Id" as "author.id",
    	author."Name" as "author.url",
    	author."FullName" as "author.name",
    	author."UrlPhoto" as "author.urlPhoto",
    	c."UrlName" as "community.url",
    	c."Name" as "community.name",
    	c."UrlPhoto" as "community.urlPhoto",
    	"Post"."CreatedOn" as "time",
    	"Post"."Content" as "content",
    	(select count(1) from "Comment" where "PostId" = "Post"."Id") as "countComments",
    	(select count(1) from "PostVote" where "Post"."Id" = "PostVote"."PostId" and "Vote" > 0) as likes,
    	(select count(1) from "PostVote" where "Post"."Id" = "PostVote"."PostId" and "Vote" < 0) as dislikes
        from "Post"
        inner join "Community" c on "Post"."CommunityId" = c."Id"
        inner join "User" author on author."Id" = "Post"."AuthorId"
        where c."Id" = @communityId
                    """) [param("communityId", communityId)]


        let enterCommunity userId communityId =
            let isInCommunity = ((sqlRead """ 
                select count(1) as "Count" from "UserInCommunity" 
                where "UserId" = @user 
                    and "CommunityId" = @community """ 
                    [param("user", userId); 
                        param("community", communityId)]).[0]?Count :?> int64) > 0L
            
            if not isInCommunity then (
                execNonQueryString """
                    insert into "UserInCommunity" ("UserId", "CommunityId") values
                    (@user, @community)
                """ [param("user", userId); 
                        param("community", communityId)] |> ignore
                true
            )
            else false

        let exitCommunity userId communityId =
             execNonQueryString """
                    delete from "UserInCommunity" where
                    "UserId" = @user and "CommunityId" = @community
                """ [
                        param("user", userId); 
                        param("community", communityId)] |> ignore

        let createCommunity creatorId name url description =
            let isExists = (((sqlRead """ 
                select count(1) as "Count" from "Community"
                where "UrlName" = @community""" 
                    [param("community", url)]).[0]?Count :?> int64) > 0L)

            if isExists then 0L
            else
                let id = (sqlRead """
                    insert into "Community" ("Name", "UrlName", "Description") values
                    (@name, @url, @desc) returning "Id"
                """ [param("name", name); param("url", url); param("desc", description)]).[0]?Id :?> int64

                execNonQueryString """
                    insert into "UserInCommunity" ("UserId", "CommunityId", "RoleId") values
                    (@user, @community, @role)
                """ [
                    param("user", creatorId); 
                    param("community", id); 
                    param("role", Constants.communityAdmin)] |> ignore
                id

        let deleteCommunity userId communityId =
            let isCreator = (((sqlRead """ 
                select count(1) as "Count" from "UserInCommunity" 
                where "CommunityId" = @community
                    and "UserId" = @user
                    and "RoleId" = @adminRole
                """ 
                    [param("community", communityId); 
                        param("user", userId);
                        param("adminRole", Constants.communityAdmin)]).[0]?Count :?> int32) > 0)
            
            if not isCreator then false
            else
                execNonQueryString """
                    delete from "Community" where "Id" = @community
                """ [param("community", communityId)] |> ignore

                true

            
    
    module Polls = 

        type PollData = {
            id: int64 N;
            title: obj;
            votes: PollVote list;
            isVoted: int64 N
        }
        and PollVote = {
            id: int32;
            name: string;
        }

        let loadPollsData currentUserId postId =
            let parseResultConfig (s: obj) = 
                match s with
                | :? System.String as x -> (
                        let parts = x.Split(';')
                        if parts.Length > 1 then
                            (parts.[0], parts.[1].Split(',') 
                            |> Seq.mapi (fun i x -> {PollVote.id = i; name = x})
                            |> List.ofSeq)
                        else ("", [])
                        
                    ) 
                    
                | _ -> ("", [])
             
            

            let polls = (sqlRead ("""
                    select 
                    	p."Id",
                    	p."PollConfig",
                        (select count(1) from "PollResult" pv where pv."UserId" = @user and pv."PollId" = p."Id") "isVoted"
                    from "Poll" p
                    where p."PostId" = @postId
                """) [param("postId", postId); param("user", currentUserId)])
            if polls.Length = 0 then [||]
            else
                polls
                |> Array.map (fun x -> (
                    let pollConfig = x?PollConfig
                    let title, results = parseResultConfig pollConfig
                    {
                        id = x?Id |> uncastDbNull :?> N<int64>;
                        title = title;
                        votes = results;
                        isVoted = x?isVoted |> uncastDbNull :?> N<int64>;
                    }
                ))

        type PollAnswer = {
            date: DateTime N;
            userId: int32 N;
            vote: int32;
        }

        let loadPollData pollId = 
            let polls = (sqlRead ("""
                select
                	pr."ResultConfig",
                	pr."UserId",
                	pr."CreatedDate"
                from "Poll" p
                inner join "PollResult" pr on pr."PollId" = p."Id"
                where pr."PollId" = @pollId
                """) [param("pollId", pollId)])
            if polls.Length = 0 then [||]
            else
                polls
                |> Array.map (fun x -> {
                    date = x?CreatedDate |> uncastDbNull :?> DateTime N
                    userId = x?UserId |> uncastDbNull :?> int32 N
                    vote = System.Int32.Parse(x?ResultConfig :?> string)
                })

        let makePollChoice pollId userId choiceId =
            let isExists = ((sqlRead """ 
                select count(1) as "Count" from "PollResult" 
                where "UserId" = @user 
                    and "PollId" = @poll """ [param("user", userId); param("poll", pollId)]).[0]?Count :?> int64) > 0L
            
            if isExists then
                execNonQueryString ("""
                    update "PollResult" set "ResultConfig" = @result where "UserId" = @user and "PollId" = @poll
                """) [param("date", DateTime.Now); 
                    param("user", userId); 
                    param("poll", pollId); 
                    param("result", choiceId.ToString())] |> ignore
            else
                execNonQueryString ("""
                    INSERT INTO "PollResult" ("CreatedDate", "UserId", "PollId", "ResultConfig")
VALUES (@date, @user, @poll, @result)
                """) [param("date", DateTime.Now); 
                    param("user", userId); 
                    param("poll", pollId); 
                    param("result", choiceId.ToString())] |> ignore
                
            loadPollData pollId
    (*
        [
  {
"date": "2019-05-15T10:23:54",
"userId": 1,
"vote": 0
},
  {
"date": "2019-05-15T10:23:54",
"userId": 1,
"vote": 1
},
  {
"date": "2019-06-15T19:32:53.245324",
"userId": 1,
"vote": 1
}
],
    *)

module AuthQueries =

    let register fullName login hashedPassword token registerTime =
        execNonQuery (Query """
            insert into "User" ("Name", "FullName", "Login", "PasswordHash", "RegistrationDate", "SessionStartDate", "SessionToken")
values (@login, @fullName, @login, @hashedPassword, @registerTime, @registerTime, @token)
        """) [param("fullName", fullName); 
            param("login", login); 
            param("hashedPassword", hashedPassword);
            param("token", token);
            param("registerTime", registerTime)] |> ignore
        
        sqlToMap (Query """
            select
	            "Id" as id
            from "User"
            where "SessionToken" = @token
        """) [param("token", token)]

    let getLoginData token =
        sqlToMap (Query """
            select
    MAX("Id") as "Id",
	MAX("Name") as "Name",
	MAX("FullName") as "FullName",
	MAX("Login") as "Login",
	CASE WHEN MAX("Login") IS NULL THEN 0 ELSE 1 END AS "Exists"
from "User"
where "SessionToken" = @token
        """) [param("token", token)]

    let logout token =
        execNonQuery (Query """
            update "User" set "SessionToken" = NULL, "SessionStartDate" = NULL
            where "SessionToken" = @token
        """) [param("token", token)]

    let getAlreadyExistsLogin login =
        sqlToMap (Query """
            select count(1) as "Count" from "User" where "Login" = @login
        """) [param("login", login)]

    let checkCredentials login passwordHash = 
        sqlToMap (Query """
            select
	MAX("Name") as "Name",
    MAX("FullName") as "FullName",
	MAX("Id") as "Id",
	MAX("Login") as "Login",
	CASE WHEN MAX("Login") IS NULL THEN 0 ELSE 1 END AS "Exists"
from "User"
where "Login" = @login
    and "PasswordHash" = @password
        """) [param("login", login); param("password", passwordHash)]
    
    let setTokenToUser userId token =
        sqlToMap (Query """
            update "User" set "SessionToken" = @token
            where "Id" = @userId
        """) [param("userId", userId); param("token", token)]

