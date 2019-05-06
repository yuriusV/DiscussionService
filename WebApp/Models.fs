module Models
open System

type User = {
    Id: Guid;
    Name: string;
    FullName: string;
    Login: string;
    PasswordHash: string;
    PasswordSecret: string;
    Avatar: Guid;
    RegistrationDate: DateTime;
}

type Ban = {
    Id: Guid;
    UserId: Guid;
    Period: int;
}

type Community = {
    Id: Guid;
    Name: string;
    UrlName: string;
    Avatar: Guid;
    Description: string;
    Rating: int;
}

type UserInCommunity = {
    Id: Guid;
    UserId: Guid;
    CommunityId: Guid;
    RoleId: Guid;
}

type ProofLookup = {
    Id: Guid;
    Name: string;
}

type UserInCommunityProof = {
    Id: Guid;
    UserId: Guid;
    CommunityId: Guid;
    ProofId: Guid;
}

type Post = {
    Id: Guid;
    Title: string;
    UrlName: string;
    AutorId: Guid;
    CommunityId: Guid;
    Content: string;
}

type PostVote = {
    Id: Guid;
    PostId: Guid;
    UserId: Guid;
    Vote: int;
}

type Tag = {
    Id: Guid;
    Name: string;
}

type PostTag = {
    Id: Guid;
    PostId: Guid;
    TagId: Guid;
}

type Comment = {
    Id: Guid;
    CreatedDate: DateTime;
    ModifiedDate: DateTime;
    ParentId: Guid;
    PostId: Guid;
    AutorId: Guid;
    Content: string;
}

type CommentVote = {
    Id: Guid;
    CommentId: Guid;
    UserId: Guid;
    Vote: int;
}

type Poll = {
    Id: Guid;
    PostId: Guid;
    PollConfig: string;
}

type PollResult = {
    Id: Guid;
    CreatedDate: Guid;
    PollId: Guid;
    UserId: Guid;
    ResultConfig: string;
}