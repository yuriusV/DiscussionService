
module DataAccess

open System.IO
open Npgsql
open Microsoft.Data.Sqlite

open System
open System.Data
open System.Configuration
open System.Text

open Models
open DataAccessBase
open Tx
open Tx
open Sql

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
let execReader (qry : StringBuilder) = sql.ExecReader (qry.ToString())
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
        
let sqlToOutput sql parameters = 
    use reader = execReader sql parameters
    reader |> Seq.ofDataReader |>  Seq.map readMapFromDataRecord |> Seq.toArray

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
        sqlToOutput qry parameters

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

        sqlToOutput qry paramList
    
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
        sqlToOutput (Query """
            select 
                "Id" as id, 
                "FullName" as "name", 
                "Name" as "nick",
                "UrlPhoto" as "urlPhoto"
            from "User"
            where "Id" = @id""") [param("id", id)]

    let searchInSite searchText = 
        sqlToOutput (Query """
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
                '/coomunities/' || "UrlName" as url,
                'community' as "type"
            from "Community"
            where "Name" = @searchText
            """) [param("searchText", searchText)]


    let getUserFeed userId = 
        sqlToOutput (Query """
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

    let getCommuintyPageCardInfo communityId = 
        sqlToOutput (Query """
            select
            c."Id" as id,
            c."Name" as "name",
            c."UrlName" as url,
            c."UrlPhoto" as "urlPhoto",
            (select count(1) from "UserInCommunity" where "CommunityId" = c."Id") as "countUsers",
            (select count(1) from "Post" where "CommunityId" = c."Id") as "countPosts"
            from "Community" c
            where c."UrlName" = @community
            """) [param("community", communityId)]

    let getCommunityPosts communityId = 
        sqlToOutput (Query """
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

    let getUserCardInfo userId = 
        sqlToOutput (Query """
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
                """) [param("user", userId)]


    let getUserPosts userId = 
        sqlToOutput (Query """
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
        sqlToOutput (Query """
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
        sqlToOutput (Query """
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

    let getListCommunities offset limit = 
        sqlToOutput (Query """
        select
        	c."Id" as id,
        	c."UrlName" as "url",
        	c."Name" as "name",
        	c."UrlPhoto" as "urlPhoto",
        	(select count(1) from "Post" where "CommunityId" = c."Id") as "countPosts",
        	(select count(1) from "UserInCommunity" uc where uc."CommunityId" = c."Id") as "countUsers"
        from "Community" c
        """) []

    let getListUsers offset limit = 
        sqlToOutput (Query """
             select
            	u."Id" as id,
            	u."Name" as "url",
            	u."FullName" as "name",
            	u."UrlPhoto" as "urlPhoto"
            from "User" u
        """) []

    let createPost currentUserId communityId urlName title time content =
        execNonQuery (Query """
            insert into "Post" ("AuthorId", "CommunityId", "UrlName", "Title", "CreatedOn", "Content")
            values ( @currentUserId, @communityId, @urlName, @title, @createdOn, @postContent)
        """) [param("currentUserId", currentUserId); 
            param("communityId", communityId); param("urlName", urlName); 
            param("title", title); param("createdOn", time); param("postContent", content)]

    let deletePost currentUserId postId = 
        execNonQuery (Query """delete from "Post" where "Id" = @id""") [param("id", postId)]


    let votePost currentUserId postId vote =
        execNonQuery (Query """ delete from "PostVote" where "UserId" = @userId and "PostId" = @postId""") [param("userId", currentUserId);
            param("postId", postId)] |> ignore
        execNonQuery (Query """ insert into "PostVote" ("UserId", "PostId", "Vote") values (@userId, @postId, @vote)  """) [param("userId", currentUserId);
            param("postId", postId); param("vote", vote)]

    let voteComment currentUserId commentId vote =
        execNonQuery (Query """ delete from "CommentVote" where "UserId" = @userId and "CommentId" = @commentId""") [param("userId", currentUserId);
            param("commentId", commentId)] |> ignore
        execNonQuery (Query """ insert into "CommentVote" ("UserId", "CommentId", "Vote") values (@userId, @commentId, @vote)  """) [param("userId", currentUserId);
            param("commentId", commentId); param("vote", vote)]


    let makeComment userId postId parentCommentId content time =
        execNonQuery (Query """
            insert into "Comment" ("ParentId", "PostId", "Content", "AuthorId", "CreatedOn")
values (@parentId, @postId, @dataContent, @authorId, @createdOn)
        """) [param("parentId", parentCommentId);
            param("postId", postId);
            param("authorId", userId); 
            param("dataContent", content); 
            param("createdOn", time)]

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
        
        sqlToOutput (Query """
            select
	            "Id" as id
            from "User"
            where "SessionToken" = @token
        """) [param("token", token)]

    let getLoginData token =
        sqlToOutput (Query """
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
        sqlToOutput (Query """
            select count(1) as "Count" from "User" where "Login" = @login
        """) [param("login", login)]

    let checkCredentials login passwordHash = 
        sqlToOutput (Query """
            select
	MAX("Name") as "Name",
	MAX("Id") as "Id",
	MAX("Login") as "Login",
	CASE WHEN MAX("Login") IS NULL THEN 0 ELSE 1 END AS "Exists"
from "User"
where "Login" = @login
    and "PasswordHash" = @password
        """) [param("login", login); param("password", passwordHash)]
    
    let setTokenToUser userId token =
        sqlToOutput (Query """
            update "User" set "SessionToken" = @token
            where "Id" = @userId
        """) [param("userId", userId); param("token", token)]

let getSingleRowValue<'t> (a: Map<string, obj>[]) key =
    Map.find key (Array.head a) :?> 't