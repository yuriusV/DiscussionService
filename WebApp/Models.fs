module Models

open System

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
    UrlPhoto: string;
    RegistrationDate: DateTime;
    SessionStartDate: DateTime;
    SessionToken: string;
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
    UrlPhoto: string;
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
    AuthorId: int32;
    [<ForeignKey(name = "Community")>]
    CommunityId: int32;
    Content: string;
    CreatedOn: DateTime;
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
    CreatedOn: DateTime;
    ModifiedOn: DateTime;
    [<ForeignKey(name = "Comment")>]
    ParentId: int32;
    [<ForeignKey(name = "Post")>]
    PostId: int32;
    [<ForeignKey(name = "User")>]
    AuthorId: int32;
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