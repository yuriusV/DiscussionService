module Models

open System

open LinqToDB
open LinqToDB.Mapping
open System.ComponentModel.DataAnnotations.Schema
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