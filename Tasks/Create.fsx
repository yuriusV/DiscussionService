open System.Reflection
open System
open System.Web.UI.WebControls.WebParts
module Types = 
    open System

    type PrimaryKeyAttribute() =
        inherit System.Attribute()

    type ForeignKeyAttribute(name: string) =
        inherit System.Attribute()
        member x.Name = name

    [<CLIMutable>]
    type User = {
        [<PrimaryKey>]
        Id: int32;
        Name: string;
        FullName: string;
        Login: string;
        PasswordHash: string;
        PasswordSecret: string;
        Avatar: int32;
        RegistrationDate: DateTime;
    }

    [<CLIMutable>]
    type Ban = {
        [<PrimaryKey>]
        Id: int32;
        [<ForeignKey(name = "User")>]
        UserId: int32;
        Period: int;
    }

    [<CLIMutable>]
    type Community = {
        [<PrimaryKey>]
        Id: int32;
        Name: string;
        UrlName: string;
        Avatar: int32;
        Description: string;
        Rating: int;
    }

    [<CLIMutable>]
    type Role = {
        Id: int32;
    }

    [<CLIMutable>]
    type UserInCommunity = {
        [<PrimaryKey>]
        Id: int32;
        [<ForeignKey(name = "User")>]
        UserId: int32;
        [<ForeignKey(name = "Community")>]
        CommunityId: int32;
        [<ForeignKey(name = "User")>]
        RoleId: int32;
    }

    [<CLIMutable>]
    type ProofLookup = {
        [<PrimaryKey>]
        Id: int32;
        Name: string;
    }

    [<CLIMutable>]
    type UserInCommunityProof = {
        [<PrimaryKey>]
        Id: int32;
        [<ForeignKey(name = "User")>]
        UserId: int32;
        [<ForeignKey(name = "Community")>]
        CommunityId: int32;
        [<ForeignKey(name = "ProofLookup")>]
        ProofId: int32;
    }

    [<CLIMutable>]
    type Post = {
        [<PrimaryKey>]
        Id: int32;
        Title: string;
        UrlName: string;
        AutorId: int32;
        [<ForeignKey(name = "Community")>]
        CommunityId: int32;
        Content: string;
    }

    [<CLIMutable>]
    type PostVote = {
        [<PrimaryKey>]
        Id: int32;
        [<ForeignKey(name = "Post")>]
        PostId: int32;
        [<ForeignKey(name = "User")>]
        UserId: int32;
        Vote: int;
    }

    [<CLIMutable>]
    type Tag = {
        Id: int32;
        Name: string;
    }

    [<CLIMutable>]
    type PostTag = {
        [<PrimaryKey>]
        Id: int32;
        [<ForeignKey(name = "Post")>]
        PostId: int32;
        [<ForeignKey(name = "Tag")>]
        TagId: int32;
    }

    [<CLIMutable>]
    type Comment = {
        [<PrimaryKey>]
        Id: int32;
        CreatedDate: DateTime;
        ModifiedDate: DateTime;
        [<ForeignKey(name = "Comment")>]
        ParentId: int32;
        [<ForeignKey(name = "Post")>]
        PostId: int32;
        [<ForeignKey(name = "User")>]
        AutorId: int32;
        Content: string;
    }

    [<CLIMutable>]
    type CommentVote = {
        [<PrimaryKey>]
        Id: int32;
        [<ForeignKey(name = "Comment")>]
        CommentId: int32;
        [<ForeignKey(name = "User")>]
        UserId: int32;
        Vote: int;
    }

    [<CLIMutable>]
    type Poll = {
        [<PrimaryKey>]
        Id: int32;
        [<ForeignKey(name = "Post")>]
        PostId: int32;
        PollConfig: string;
    }

    [<CLIMutable>]
    type PollResult = {
        [<PrimaryKey>]
        Id: int32;
        CreatedDate: int32;
        [<ForeignKey(name = "Poll")>]
        PollId: int32;
        [<ForeignKey(name = "User")>]
        UserId: int32;
        ResultConfig: string;
    }

module Generator =
    open Types
    open Microsoft.FSharp.Reflection


    type ColumnDesc = {
        Name: string;
        Type: string;
        LinkedTable: string option
    }

    type TableDesc = {
        Name: string;
        Columns: ColumnDesc list
    }

    let getFieldForeignKey (f: PropertyInfo) =
        let foreignKeys =
            f.GetCustomAttributes()
            |> Seq.filter (fun x -> (x.GetType() = typeof<ForeignKeyAttribute>))
            |> Seq.map (fun x -> (x :?> ForeignKeyAttribute).Name)

        if (Seq.exists (fun x -> true) foreignKeys)
        then Some(Seq.head foreignKeys)
        else None

    // Postgre
    let mapTypeToDatabaseType (t: Type) =
        match t.Name with
        | "int32" | "int" | "Int32" -> "integer"
        | "string" -> "text"
        | "DateTime" -> "timestamp"
        | _ -> "text"

    let getTypeDesc (clrType: System.Type) = 
        let tableName = clrType.Name
        let columns = 
            FSharpType.GetRecordFields(clrType)
            |> Array.map 
                (fun x -> {
                    Name = x.Name; 
                    LinkedTable = getFieldForeignKey x;
                    Type = mapTypeToDatabaseType x.PropertyType
                })
            |> List.ofArray

        {
            Name = tableName;
            Columns = columns
        }


    let columnDescToSql (desc: ColumnDesc) = 
        match desc.Name with
        | "Id" -> """ "Id" BIGSERIAL PRIMARY KEY"""
        | _ -> sprintf """ "%s" %s""" (desc.Name) (desc.Type)

    let generateSql (declarations: TableDesc list) =
        let getColumns (cdescs: ColumnDesc list) =
            let sqls = cdescs |> List.map columnDescToSql
            String.concat ",\n" sqls 

        let tables = 
            declarations
            |> List.map
                (fun x -> 
                    sprintf """create table "%s" (%s);
                    """ (x.Name) (getColumns x.Columns)
                )

        let getForeginSql (sourceTable: TableDesc) (c: ColumnDesc) =  
            sprintf """alter table "%s" add foreign key ("%s") references "%s"("Id");
            """
                sourceTable.Name c.Name (Option.defaultValue sourceTable.Name c.LinkedTable)

        let foreignKeys =
            declarations
            |> List.map (
                fun x -> 
                    x.Columns
                    |> List.filter (fun x -> x.LinkedTable <> None)
                    |> List.map (getForeginSql x)
            )
            |> List.collect id
            |> String.concat " "

        ((String.concat " " tables) + " " + foreignKeys)



    
    let types = [
        typeof<User>;
        typeof<Ban>;
        typeof<Community>;
        typeof<UserInCommunity>;
        typeof<ProofLookup>;
        typeof<UserInCommunityProof>;
        typeof<Comment>;
        typeof<CommentVote>;
        typeof<Post>;
        typeof<PostVote>;
        typeof<Tag>;
        typeof<PostTag>;
        typeof<Poll>;
        typeof<PollResult>
    ]

    printf "%s" (generateSql (types |> List.map getTypeDesc))