module Models

open System

open LinqToDB
open LinqToDB.Mapping
open System.ComponentModel.DataAnnotations.Schema

[<CLIMutable>]
type User = {
    [<PrimaryKey>]
    Id: Guid;
    Name: string;
    FullName: string;
    Login: string;
    PasswordHash: string;
    PasswordSecret: string;
    Avatar: Guid;
    RegistrationDate: DateTime;
}

[<CLIMutable>]
type Ban = {
    [<PrimaryKey>]
    Id: Guid;
    [<ForeignKey(name = "sa")>]
    UserId: Guid;
    Period: int;
}

[<CLIMutable>]
type Community = {
    [<PrimaryKey>]
    Id: Guid;
    Name: string;
    UrlName: string;
    Avatar: Guid;
    Description: string;
    Rating: int;
}

[<CLIMutable>]
type UserInCommunity = {
    [<PrimaryKey>]
    Id: Guid;
    UserId: Guid;
    CommunityId: Guid;
    RoleId: Guid;
}

[<CLIMutable>]
type ProofLookup = {
    [<PrimaryKey>]
    Id: Guid;
    Name: string;
}

[<CLIMutable>]
type UserInCommunityProof = {
    [<PrimaryKey>]
    Id: Guid;
    UserId: Guid;
    CommunityId: Guid;
    ProofId: Guid;
}

[<CLIMutable>]
type Post = {
    [<PrimaryKey>]
    Id: Guid;
    Title: string;
    UrlName: string;
    AutorId: Guid;
    CommunityId: Guid;
    Content: string;
}

[<CLIMutable>]
type PostVote = {
    [<PrimaryKey>]
    Id: Guid;
    PostId: Guid;
    UserId: Guid;
    Vote: int;
}

[<CLIMutable>]
type Tag = {
    Id: Guid;
    Name: string;
}

[<CLIMutable>]
type PostTag = {
    [<PrimaryKey>]
    Id: Guid;
    PostId: Guid;
    TagId: Guid;
}

[<CLIMutable>]
type Comment = {
    [<PrimaryKey>]
    Id: Guid;
    CreatedDate: DateTime;
    ModifiedDate: DateTime;
    ParentId: Guid;
    PostId: Guid;
    AutorId: Guid;
    Content: string;
}

[<CLIMutable>]
type CommentVote = {
    [<PrimaryKey>]
    Id: Guid;
    CommentId: Guid;
    UserId: Guid;
    Vote: int;
}

[<CLIMutable>]
type Poll = {
    [<PrimaryKey>]
    Id: Guid;
    PostId: Guid;
    PollConfig: string;
}

[<CLIMutable>]
type PollResult = {
    [<PrimaryKey>]
    Id: Guid;
    CreatedDate: Guid;
    PollId: Guid;
    UserId: Guid;
    ResultConfig: string;
}